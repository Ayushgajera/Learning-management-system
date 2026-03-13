import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiVideo, FiArrowLeft } from 'react-icons/fi';
import { format } from 'date-fns';
import useLiveSession from './hooks/useLiveSession';
import VideoGrid from './components/VideoGrid';
import ControlBar from './components/ControlBar';
import ChatPanel from './components/ChatPanel';
import ParticipantsPanel from './components/ParticipantsPanel';
import ReactionsOverlay from './components/ReactionsOverlay';

function LiveSessionRoom() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const {
    session, isLoading, isInstructor, sessionEnded, userId, user,
    localStream, remoteStreams, participants, raisedHands, reactions,
    isMicOn, isCameraOn, isScreenSharing, isRecording,
    isHandRaised, pinnedUserId,
    showChat, showParticipants,
    chatMessages, chatInput, typingNames,
    chatEndRef,
    toggleMic, toggleCamera, toggleScreenShare, toggleRecording,
    toggleHandRaise, sendReaction, muteAllStudents, removeParticipant,
    pinParticipant, handleEndSession, handleLeave,
    setShowChat, setShowParticipants,
    sendChatMessage, handleChatTyping,
  } = useLiveSession(sessionId);

  // ─── Loading ───
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-950 z-[9999]">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ─── Session not found ───
  if (!session) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-950 text-white z-[9999]">
        <FiVideo className="w-16 h-16 text-slate-600 mb-4" />
        <p className="text-lg font-semibold">Session not found</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-sm text-indigo-400 hover:underline">Go back</button>
      </div>
    );
  }

  // ─── Not yet live ───
  if (session.status !== 'live' && !sessionEnded) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-950 text-white z-[9999]">
        <FiVideo className="w-16 h-16 text-slate-600 mb-4" />
        <p className="text-lg font-semibold">Session is not live yet</p>
        <p className="text-sm text-slate-400 mt-2">
          Scheduled for {format(new Date(session.scheduledAt), 'MMM d, yyyy h:mm a')}
        </p>
        <button onClick={() => navigate(-1)} className="mt-4 text-sm text-indigo-400 hover:underline flex items-center gap-1">
          <FiArrowLeft className="w-4 h-4" /> Go back
        </button>
      </div>
    );
  }

  // ─── Session ended ───
  if (sessionEnded) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-950 text-white z-[9999]">
        <FiVideo className="w-16 h-16 text-slate-600 mb-4" />
        <p className="text-lg font-semibold">Session has ended</p>
        <p className="text-sm text-slate-400 mt-2">Thank you for attending!</p>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-indigo-500 rounded-xl text-sm font-semibold hover:bg-indigo-600 transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  const sidebarOpen = showChat || showParticipants;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-slate-950 text-white">
      {/* TOP HEADER */}
      <div className="h-14 min-h-[56px] px-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm font-bold truncate">{session.title}</h1>
            <p className="text-[11px] text-slate-400 truncate">{session.courseId?.courseTitle}</p>
          </div>
          <div className="ml-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/25">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[11px] font-bold text-red-400 uppercase tracking-wide">Live</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isRecording && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 border border-red-500/30 rounded-full">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[11px] font-bold text-red-400">REC</span>
            </div>
          )}
          {isScreenSharing && (
            <div className="px-3 py-1.5 bg-blue-600/20 border border-blue-500/30 rounded-full">
              <span className="text-[11px] font-bold text-blue-400">Screen Sharing</span>
            </div>
          )}
        </div>
      </div>

      {/* MIDDLE: VIDEO GRID + SIDEBAR */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Video area */}
        <div className="flex-1 relative bg-black min-w-0">
          <VideoGrid
            localStream={localStream}
            remoteStreams={remoteStreams}
            userId={userId}
            userName={user?.name}
            isInstructor={isInstructor}
            isCameraOn={isCameraOn}
            isMicOn={isMicOn}
            participants={participants}
            raisedHands={raisedHands}
            pinnedUserId={pinnedUserId}
            onPin={pinParticipant}
          />
          {/* Floating reactions */}
          <ReactionsOverlay reactions={reactions} />
        </div>

        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 360, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 border-l border-slate-800 bg-slate-900 flex flex-col overflow-hidden"
              style={{ minWidth: 0 }}
            >
              {showChat && (
                <ChatPanel
                  chatMessages={chatMessages}
                  chatInput={chatInput}
                  typingNames={typingNames}
                  userId={userId}
                  chatEndRef={chatEndRef}
                  onClose={() => setShowChat(false)}
                  onSendMessage={sendChatMessage}
                  onTyping={handleChatTyping}
                />
              )}
              {showParticipants && (
                <ParticipantsPanel
                  participants={participants}
                  raisedHands={raisedHands}
                  userId={userId}
                  isInstructor={isInstructor}
                  onClose={() => setShowParticipants(false)}
                  onMuteAll={muteAllStudents}
                  onRemoveParticipant={removeParticipant}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* BOTTOM CONTROL BAR */}
      <ControlBar
        isInstructor={isInstructor}
        isMicOn={isMicOn}
        isCameraOn={isCameraOn}
        isScreenSharing={isScreenSharing}
        isRecording={isRecording}
        isHandRaised={isHandRaised}
        showChat={showChat}
        showParticipants={showParticipants}
        raisedHandsCount={raisedHands.length}
        participantCount={participants.length}
        onToggleMic={toggleMic}
        onToggleCamera={toggleCamera}
        onToggleScreenShare={toggleScreenShare}
        onToggleRecording={toggleRecording}
        onToggleHandRaise={toggleHandRaise}
        onSendReaction={sendReaction}
        onMuteAll={muteAllStudents}
        onToggleChat={() => { setShowChat(v => !v); setShowParticipants(false); }}
        onToggleParticipants={() => { setShowParticipants(v => !v); setShowChat(false); }}
        onEndSession={handleEndSession}
        onLeave={handleLeave}
      />
    </div>
  );
}

export default LiveSessionRoom;
