import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { socket } from '@/extensions/socket';
import {
  useGetSessionByIdQuery,
  useEndLiveSessionMutation,
  useUploadRecordingMutation,
} from '@/features/api/liveSessionApi';
import { toast } from 'sonner';
import config from '@/config/index';
import SimplePeer from 'simple-peer';

export default function useLiveSession(sessionId) {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const userId = user?._id;

  const { data: sessionData, isLoading } = useGetSessionByIdQuery(sessionId);
  const [endSessionMutation] = useEndLiveSessionMutation();
  const [uploadRecording] = useUploadRecordingMutation();

  const session = sessionData?.session;
  const isInstructor = !!(session && userId && (
    String(session.instructorId?._id) === String(userId) ||
    String(session.instructorId) === String(userId) ||
    String(session.courseId?.creator) === String(userId)
  ));

  // ─── State ───
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map()); // Map<userId, {stream, name, isInstructor}>
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [typingUsers, setTypingUsers] = useState({});
  const [participants, setParticipants] = useState([]);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [raisedHands, setRaisedHands] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [pinnedUserId, setPinnedUserId] = useState(null);

  // ─── Refs ───
  const peersRef = useRef({});       // Map<userId, SimplePeer>
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordingUploadPromiseRef = useRef(null);
  const chatEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isInstructorRef = useRef(false);
  const roomIdRef = useRef(null);
  const isCameraOnRef = useRef(false);
  const isMicOnRef = useRef(false);
  const togglingCameraRef = useRef(false);
  const togglingMicRef = useRef(false);

  // Keep refs in sync
  useEffect(() => { isInstructorRef.current = isInstructor; }, [isInstructor]);
  useEffect(() => { roomIdRef.current = session?.roomId; }, [session?.roomId]);
  useEffect(() => { isCameraOnRef.current = isCameraOn; }, [isCameraOn]);
  useEffect(() => { isMicOnRef.current = isMicOn; }, [isMicOn]);

  // ─── Media Acquisition ───
  const acquireMedia = useCallback(async ({ video = false, audio = false }) => {
    try {
      const constraints = {};
      if (video) constraints.video = true;
      if (audio) constraints.audio = true;
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error('Failed to get media:', err);
      toast.error('Failed to access camera/microphone. Check permissions.');
      return null;
    }
  }, []);

  // ─── Initialize instructor media automatically ───
  useEffect(() => {
    if (session && isInstructor && session.status === 'live' && !localStreamRef.current) {
      (async () => {
        const stream = await acquireMedia({ video: true, audio: true });
        if (stream) {
          setIsCameraOn(true);
          setIsMicOn(true);
        }
      })();
    }
  }, [session, isInstructor, acquireMedia]);

  // ─── Signal instructor ready after media ───
  useEffect(() => {
    if (isInstructor && localStream && session?.roomId) {
      socket.emit('live_instructor_ready', { sessionRoomId: session.roomId });
    }
  }, [isInstructor, localStream, session?.roomId]);

  // ─── Join socket room ───
  useEffect(() => {
    if (!session || !userId || session.status !== 'live') return;
    socket.emit('join_live_session', { sessionId, userId });
    return () => {
      socket.emit('leave_live_session', { sessionId, userId });
      Object.values(peersRef.current).forEach(p => { try { p.destroy(); } catch (e) {} });
      peersRef.current = {};
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [session?.status, sessionId, userId]);

  // ─── Scroll chat ───
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // ─── Create initiator peer (I have media, they request connection) ───
  const createInitiatorPeer = useCallback((targetUserId) => {
    if (peersRef.current[targetUserId]) return;
    const stream = localStreamRef.current;
    if (!stream) return;

    const peer = new SimplePeer({ initiator: true, trickle: true, stream });

    peer.on('signal', (data) => {
      const roomId = roomIdRef.current;
      if (data.type === 'offer') {
        socket.emit('live_offer', { targetUserId, offer: data, sessionRoomId: roomId });
      } else if (data.type === 'answer') {
        socket.emit('live_answer', { targetUserId, answer: data, sessionRoomId: roomId });
      } else if (data.candidate) {
        socket.emit('live_ice_candidate', { targetUserId, candidate: data, sessionRoomId: roomId });
      }
    });

    peer.on('stream', (remoteStream) => {
      // We might receive their stream too (if they have media)
      setRemoteStreams(prev => {
        const next = new Map(prev);
        const existing = next.get(targetUserId) || {};
        next.set(targetUserId, { ...existing, stream: remoteStream });
        return next;
      });
    });

    peer.on('error', (err) => console.error('[LIVE] Initiator peer error:', err.message));
    peer.on('close', () => {
      delete peersRef.current[targetUserId];
    });

    peersRef.current[targetUserId] = peer;
  }, []);

  // ─── Create receiver peer (they have media, I receive) ───
  const createReceiverPeer = useCallback((fromUserId, fromName, fromIsInstructor) => {
    if (peersRef.current[fromUserId]) return;

    const peerOpts = { initiator: false, trickle: true };
    // If I also have media, pass my stream so it's bidirectional
    if (localStreamRef.current) {
      peerOpts.stream = localStreamRef.current;
    }
    const peer = new SimplePeer(peerOpts);

    peer.on('signal', (data) => {
      const roomId = roomIdRef.current;
      if (data.type === 'answer') {
        socket.emit('live_answer', { targetUserId: fromUserId, answer: data, sessionRoomId: roomId });
      } else if (data.candidate) {
        socket.emit('live_ice_candidate', { targetUserId: fromUserId, candidate: data, sessionRoomId: roomId });
      }
    });

    peer.on('stream', (remoteStream) => {
      setRemoteStreams(prev => {
        const next = new Map(prev);
        next.set(fromUserId, { stream: remoteStream, name: fromName, isInstructor: fromIsInstructor });
        return next;
      });
    });

    peer.on('error', (err) => console.error('[LIVE] Receiver peer error:', err.message));
    peer.on('close', () => {
      delete peersRef.current[fromUserId];
      setRemoteStreams(prev => {
        const next = new Map(prev);
        next.delete(fromUserId);
        return next;
      });
    });

    peersRef.current[fromUserId] = peer;
  }, []);

  // ════════════════════════════════════════════════
  // SOCKET EVENT HANDLERS
  // ════════════════════════════════════════════════
  useEffect(() => {
    if (!session || !userId) return;

    const onChatHistory = (messages) => setChatMessages(messages);
    const onChatMessage = (msg) => setChatMessages(prev => [...prev, msg]);
    const onParticipants = (list) => setParticipants(list);
    const onTyping = ({ userId: uid, userName, isTyping }) => {
      setTypingUsers(prev => {
        const next = { ...prev };
        if (isTyping) next[uid] = userName;
        else delete next[uid];
        return next;
      });
    };
    const onSessionEnded = () => {
      setSessionEnded(true);
      toast.info('Live session has ended.');
      Object.values(peersRef.current).forEach(p => { try { p.destroy(); } catch (e) {} });
      peersRef.current = {};
      setRemoteStreams(new Map());
    };
    const onScreenShare = ({ userId: uid, isSharing }) => {
      if (String(uid) !== String(userId)) setIsScreenSharing(isSharing);
    };
    const onError = ({ message }) => toast.error(message);

    // Another participant turned on media — create a receiver peer and request connection
    const onPeerMediaReady = ({ userId: peerId, name, hasVideo, hasAudio, isInstructor: peerIsInstructor }) => {
      if (String(peerId) === String(userId)) return;
      // Create a non-initiator peer
      createReceiverPeer(peerId, name, peerIsInstructor);
      // Request them to create an initiator peer to us
      socket.emit('live_request_connection', {
        targetUserId: peerId,
        sessionRoomId: roomIdRef.current,
      });
    };

    // Another participant stopped media
    const onPeerMediaStopped = ({ userId: peerId }) => {
      if (String(peerId) === String(userId)) return;
      const peer = peersRef.current[peerId];
      if (peer) {
        try { peer.destroy(); } catch (e) {}
        delete peersRef.current[peerId];
      }
      setRemoteStreams(prev => {
        const next = new Map(prev);
        next.delete(peerId);
        return next;
      });
    };

    // Media state update (no new peers, just visual update)
    const onMediaStateUpdate = ({ userId: peerId, hasVideo, hasAudio }) => {
      // Participant list update handles the visual — nothing extra needed
    };

    // Someone requested a connection from us (we have media, they want it)
    const onConnectionRequest = ({ fromUserId }) => {
      if (!localStreamRef.current) return;
      createInitiatorPeer(fromUserId);
    };

    // Offer received
    const onOffer = ({ offer, fromUserId, isInstructor: fromIsInstructor }) => {
      const peer = peersRef.current[fromUserId];
      if (peer) {
        peer.signal(offer);
      } else {
        // Late offer — create receiver peer on the spot
        createReceiverPeer(fromUserId, '', fromIsInstructor);
        setTimeout(() => {
          const p = peersRef.current[fromUserId];
          if (p) p.signal(offer);
        }, 50);
      }
    };

    const onAnswer = ({ answer, fromUserId }) => {
      const peer = peersRef.current[fromUserId];
      if (peer && !peer.destroyed) peer.signal(answer);
    };

    const onIce = ({ candidate, fromUserId }) => {
      const peer = peersRef.current[fromUserId];
      if (peer && !peer.destroyed) peer.signal(candidate);
    };

    // Hand raise
    const onHandRaised = ({ userId: peerId, name, timestamp }) => {
      setRaisedHands(prev => {
        if (prev.some(h => h.userId === peerId)) return prev;
        return [...prev, { userId: peerId, name, timestamp }].sort((a, b) => a.timestamp - b.timestamp);
      });
      if (isInstructorRef.current && String(peerId) !== String(userId)) {
        toast(`${name} raised their hand`, { duration: 4000 });
      }
    };

    const onHandLowered = ({ userId: peerId }) => {
      setRaisedHands(prev => prev.filter(h => h.userId !== peerId));
    };

    // Reactions
    const onReaction = (reaction) => {
      setReactions(prev => [...prev, reaction]);
      setTimeout(() => {
        setReactions(prev => prev.filter(r => r.id !== reaction.id));
      }, 3000);
    };

    // Force mute (instructor muted all)
    const onForceMute = () => {
      if (isInstructorRef.current) return;
      const stream = localStreamRef.current;
      if (stream) {
        stream.getAudioTracks().forEach(t => { t.enabled = false; });
      }
      setIsMicOn(false);
      toast.info('You have been muted by the instructor.');
      socket.emit('live_media_state_changed', {
        sessionRoomId: roomIdRef.current,
        hasVideo: isCameraOnRef.current,
        hasAudio: false,
      });
    };

    // Removed from session
    const onRemovedFromSession = () => {
      toast.error('You have been removed from this session.');
      Object.values(peersRef.current).forEach(p => { try { p.destroy(); } catch (e) {} });
      peersRef.current = {};
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      navigate(-1);
    };

    socket.on('live_chat_history', onChatHistory);
    socket.on('live_chat_message', onChatMessage);
    socket.on('live_participants', onParticipants);
    socket.on('live_user_typing', onTyping);
    socket.on('live_session_ended', onSessionEnded);
    socket.on('live_screen_share_status', onScreenShare);
    socket.on('live_error', onError);
    socket.on('live_peer_media_ready', onPeerMediaReady);
    socket.on('live_peer_media_stopped', onPeerMediaStopped);
    socket.on('live_media_state_update', onMediaStateUpdate);
    socket.on('live_request_connection', onConnectionRequest);
    socket.on('live_offer', onOffer);
    socket.on('live_answer', onAnswer);
    socket.on('live_ice_candidate', onIce);
    socket.on('live_hand_raised', onHandRaised);
    socket.on('live_hand_lowered', onHandLowered);
    socket.on('live_reaction', onReaction);
    socket.on('live_force_mute', onForceMute);
    socket.on('live_removed_from_session', onRemovedFromSession);

    return () => {
      socket.off('live_chat_history', onChatHistory);
      socket.off('live_chat_message', onChatMessage);
      socket.off('live_participants', onParticipants);
      socket.off('live_user_typing', onTyping);
      socket.off('live_session_ended', onSessionEnded);
      socket.off('live_screen_share_status', onScreenShare);
      socket.off('live_error', onError);
      socket.off('live_peer_media_ready', onPeerMediaReady);
      socket.off('live_peer_media_stopped', onPeerMediaStopped);
      socket.off('live_media_state_update', onMediaStateUpdate);
      socket.off('live_request_connection', onConnectionRequest);
      socket.off('live_offer', onOffer);
      socket.off('live_answer', onAnswer);
      socket.off('live_ice_candidate', onIce);
      socket.off('live_hand_raised', onHandRaised);
      socket.off('live_hand_lowered', onHandLowered);
      socket.off('live_reaction', onReaction);
      socket.off('live_force_mute', onForceMute);
      socket.off('live_removed_from_session', onRemovedFromSession);
    };
  }, [session, userId, navigate, createReceiverPeer, createInitiatorPeer]);

  // ════════════════════════════════════════════════
  // CONTROL FUNCTIONS
  // ════════════════════════════════════════════════

  const toggleCamera = useCallback(async () => {
    if (togglingCameraRef.current) return;
    togglingCameraRef.current = true;
    try {
      const roomId = roomIdRef.current;
      if (isCameraOn) {
        // Turn camera OFF — remove and stop video tracks
        const stream = localStreamRef.current;
        if (stream) {
          stream.getVideoTracks().forEach(t => {
            stream.removeTrack(t);
            t.stop();
          });
        }
        setIsCameraOn(false);
        const stillHasAudio = isMicOnRef.current;
        if (!stillHasAudio) {
          // No media at all — stop stream, destroy outgoing peers
          localStreamRef.current?.getTracks().forEach(t => t.stop());
          localStreamRef.current = null;
          setLocalStream(null);
          Object.values(peersRef.current).forEach(p => { try { p.destroy(); } catch (e) {} });
          peersRef.current = {};
          socket.emit('live_student_media_stopped', { sessionRoomId: roomId });
        } else {
          // Clone stream so React sees a new reference
          const cloned = new MediaStream(localStreamRef.current.getTracks());
          localStreamRef.current = cloned;
          setLocalStream(cloned);
          socket.emit('live_media_state_changed', { sessionRoomId: roomId, hasVideo: false, hasAudio: true });
        }
      } else {
        // Turn camera ON
        if (localStreamRef.current) {
          // Already have a stream (mic is on) — add video track
          try {
            const vidStream = await navigator.mediaDevices.getUserMedia({ video: true });
            const vidTrack = vidStream.getVideoTracks()[0];
            localStreamRef.current.addTrack(vidTrack);
            // Clone stream so React sees a new reference and triggers re-render
            const cloned = new MediaStream(localStreamRef.current.getTracks());
            localStreamRef.current = cloned;
            setLocalStream(cloned);
            setIsCameraOn(true);
            // Replace video track in existing peers
            Object.values(peersRef.current).forEach(peer => {
              try {
                const sender = peer._pc?.getSenders()?.find(s => s.track?.kind === 'video');
                if (sender) sender.replaceTrack(vidTrack);
                else peer._pc?.addTrack(vidTrack, localStreamRef.current);
              } catch (e) {}
            });
            socket.emit('live_media_state_changed', { sessionRoomId: roomId, hasVideo: true, hasAudio: isMicOnRef.current });
          } catch (err) {
            toast.error('Failed to access camera.');
          }
        } else {
          // No stream yet — acquire fresh
          const stream = await acquireMedia({ video: true, audio: false });
          if (stream) {
            setIsCameraOn(true);
            socket.emit('live_student_media_ready', { sessionRoomId: roomId, hasVideo: true, hasAudio: false });
          }
        }
      }
    } finally {
      togglingCameraRef.current = false;
    }
  }, [isCameraOn, acquireMedia]);

  const toggleMic = useCallback(async () => {
    if (togglingMicRef.current) return;
    togglingMicRef.current = true;
    try {
      const roomId = roomIdRef.current;
      if (isMicOn) {
        // Turn mic OFF
        localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = false; });
        setIsMicOn(false);
        const stillHasVideo = isCameraOnRef.current;
        if (!stillHasVideo) {
          localStreamRef.current?.getTracks().forEach(t => t.stop());
          localStreamRef.current = null;
          setLocalStream(null);
          Object.values(peersRef.current).forEach(p => { try { p.destroy(); } catch (e) {} });
          peersRef.current = {};
          socket.emit('live_student_media_stopped', { sessionRoomId: roomId });
        } else {
          socket.emit('live_media_state_changed', { sessionRoomId: roomId, hasVideo: true, hasAudio: false });
        }
      } else {
        // Turn mic ON
        if (localStreamRef.current) {
          // Already have a stream — add/enable audio track
          const audioTracks = localStreamRef.current.getAudioTracks();
          if (audioTracks.length > 0) {
            audioTracks.forEach(t => { t.enabled = true; });
          } else {
            try {
              const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
              const audioTrack = audioStream.getAudioTracks()[0];
              localStreamRef.current.addTrack(audioTrack);
              Object.values(peersRef.current).forEach(peer => {
                try {
                  peer._pc?.addTrack(audioTrack, localStreamRef.current);
                } catch (e) {}
              });
            } catch (err) {
              toast.error('Failed to access microphone.');
              return;
            }
          }
          setIsMicOn(true);
          socket.emit('live_media_state_changed', { sessionRoomId: roomId, hasVideo: isCameraOnRef.current, hasAudio: true });
        } else {
          // No stream yet — acquire fresh
          const stream = await acquireMedia({ video: false, audio: true });
          if (stream) {
            setIsMicOn(true);
            socket.emit('live_student_media_ready', { sessionRoomId: roomId, hasVideo: false, hasAudio: true });
          }
        }
      }
    } finally {
      togglingMicRef.current = false;
    }
  }, [isMicOn, acquireMedia]);

  const toggleScreenShare = useCallback(async () => {
    if (!isInstructor) return;
    if (isScreenSharing) {
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
      const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
      if (cameraTrack) {
        Object.values(peersRef.current).forEach(peer => {
          try {
            const sender = peer._pc?.getSenders()?.find(s => s.track?.kind === 'video');
            if (sender) sender.replaceTrack(cameraTrack);
          } catch (e) {}
        });
      }
      setIsScreenSharing(false);
      socket.emit('live_screen_share', { sessionRoomId: session.roomId, isSharing: false });
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        screenStreamRef.current = screenStream;
        Object.values(peersRef.current).forEach(peer => {
          try {
            const sender = peer._pc?.getSenders()?.find(s => s.track?.kind === 'video');
            if (sender) sender.replaceTrack(screenTrack);
          } catch (e) {}
        });
        setIsScreenSharing(true);
        socket.emit('live_screen_share', { sessionRoomId: session.roomId, isSharing: true });
        screenTrack.onended = () => {
          const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
          if (cameraTrack) {
            Object.values(peersRef.current).forEach(peer => {
              try {
                const sender = peer._pc?.getSenders()?.find(s => s.track?.kind === 'video');
                if (sender) sender.replaceTrack(cameraTrack);
              } catch (e) {}
            });
          }
          screenStreamRef.current = null;
          setIsScreenSharing(false);
          socket.emit('live_screen_share', { sessionRoomId: session.roomId, isSharing: false });
        };
      } catch (err) {
        console.error('Screen share error:', err);
      }
    }
  }, [isInstructor, isScreenSharing, session?.roomId]);

  const toggleRecording = useCallback(() => {
    if (!isInstructor) return;
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      const streamToRecord = screenStreamRef.current || localStreamRef.current;
      if (!streamToRecord) { toast.error('No stream to record.'); return; }
      recordedChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus' : 'video/webm';
      const recorder = new MediaRecorder(streamToRecord, { mimeType });
      recorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        // Store the upload as a Promise so handleEndSession can await it
        recordingUploadPromiseRef.current = (async () => {
          toast.info('Uploading recording...');
          try {
            const formData = new FormData();
            formData.append('video', blob, `recording-${sessionId}.webm`);
            const res = await fetch(`${config.API_BASE_URL}/api/v1/media/upload-video`, {
              method: 'POST', body: formData, credentials: 'include',
            });
            const data = await res.json();
            if (data.success && data.data && data.data.secure_url) {
              await uploadRecording({
                sessionId, recordingUrl: data.data.secure_url, recordingPublicId: data.data.public_id,
              }).unwrap();
              toast.success('Recording saved and added as lecture!');
            } else {
              console.error('Upload response missing data:', JSON.stringify(data));
              toast.error('Upload failed: ' + (data.message || 'No URL returned'));
            }
          } catch (err) {
            console.error('Recording upload error:', err);
            toast.error('Failed to upload recording.');
          }
        })();
      };
      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      toast.success('Recording started.');
    }
  }, [isInstructor, isRecording, sessionId, uploadRecording]);

  const toggleHandRaise = useCallback(() => {
    const roomId = roomIdRef.current;
    if (isHandRaised) {
      setIsHandRaised(false);
      socket.emit('live_lower_hand', { sessionRoomId: roomId });
    } else {
      setIsHandRaised(true);
      socket.emit('live_raise_hand', { sessionRoomId: roomId });
    }
  }, [isHandRaised]);

  const sendReaction = useCallback((emoji) => {
    socket.emit('live_reaction', { sessionRoomId: roomIdRef.current, emoji });
  }, []);

  const muteAllStudents = useCallback(() => {
    if (!isInstructor) return;
    socket.emit('live_mute_all', { sessionRoomId: roomIdRef.current });
    toast.success('All students muted.');
  }, [isInstructor]);

  const removeParticipant = useCallback((targetUserId) => {
    if (!isInstructor) return;
    socket.emit('live_remove_participant', { sessionRoomId: roomIdRef.current, targetUserId });
  }, [isInstructor]);

  const pinParticipant = useCallback((uid) => {
    setPinnedUserId(prev => prev === uid ? null : uid);
  }, []);

  const handleEndSession = useCallback(async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    }
    // Wait for any in-progress recording upload to complete before ending session
    if (recordingUploadPromiseRef.current) {
      toast.info('Saving recording before ending session...');
      await recordingUploadPromiseRef.current;
      recordingUploadPromiseRef.current = null;
    }
    try {
      await endSessionMutation(sessionId).unwrap();
      toast.success('Session ended.');
    } catch (err) { toast.error(err?.data?.message || 'Failed to end session.'); }
  }, [isRecording, sessionId, endSessionMutation]);

  const handleLeave = useCallback(() => {
    socket.emit('leave_live_session', { sessionId, userId });
    Object.values(peersRef.current).forEach(p => { try { p.destroy(); } catch (e) {} });
    peersRef.current = {};
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    navigate(-1);
  }, [sessionId, userId, navigate]);

  const sendChatMessage = useCallback((e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    socket.emit('live_chat_message', { sessionId, userId, text: chatInput.trim() });
    setChatInput('');
    socket.emit('live_typing', { sessionRoomId: session?.roomId, userId, userName: user?.name, isTyping: false });
  }, [chatInput, sessionId, userId, session?.roomId, user?.name]);

  const handleChatTyping = useCallback((e) => {
    setChatInput(e.target.value);
    socket.emit('live_typing', { sessionRoomId: session?.roomId, userId, userName: user?.name, isTyping: true });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('live_typing', { sessionRoomId: session?.roomId, userId, userName: user?.name, isTyping: false });
    }, 2000);
  }, [session?.roomId, userId, user?.name]);

  const typingNames = Object.values(typingUsers).filter(n => n !== user?.name);

  return {
    // Data
    session, isLoading, isInstructor, sessionEnded, userId, user,
    localStream, remoteStreams, participants, raisedHands, reactions,
    isMicOn, isCameraOn, isScreenSharing, isRecording,
    isHandRaised, pinnedUserId,
    showChat, showParticipants,
    chatMessages, chatInput, typingNames,
    // Refs
    chatEndRef,
    // Actions
    toggleMic, toggleCamera, toggleScreenShare, toggleRecording,
    toggleHandRaise, sendReaction, muteAllStudents, removeParticipant,
    pinParticipant, handleEndSession, handleLeave,
    setShowChat, setShowParticipants,
    sendChatMessage, handleChatTyping, setChatInput,
  };
}
