import React, { useState } from 'react';
import {
  FiMic, FiMicOff, FiVideo, FiVideoOff, FiMonitor,
  FiMessageSquare, FiUsers, FiPhoneOff,
  FiCircle, FiStopCircle,
} from 'react-icons/fi';
import { Hand } from 'lucide-react';

const REACTION_EMOJIS = ['\u{1F44D}', '\u{1F44F}', '\u{2764}\u{FE0F}', '\u{1F602}', '\u{1F914}', '\u{1F525}'];

function ControlBar({
  isInstructor,
  isMicOn,
  isCameraOn,
  isScreenSharing,
  isRecording,
  isHandRaised,
  showChat,
  showParticipants,
  raisedHandsCount,
  participantCount,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onToggleRecording,
  onToggleHandRaise,
  onSendReaction,
  onMuteAll,
  onToggleChat,
  onToggleParticipants,
  onEndSession,
  onLeave,
}) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  return (
    <div className="h-20 min-h-[80px] bg-slate-900/95 backdrop-blur-sm border-t border-slate-800 flex items-center justify-center px-4 relative">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mic toggle */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={onToggleMic}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isMicOn
                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25'
            }`}
            title={isMicOn ? 'Mute mic' : 'Unmute mic'}
          >
            {isMicOn ? <FiMic className="w-5 h-5" /> : <FiMicOff className="w-5 h-5" />}
          </button>
          <span className="text-[10px] text-slate-400">{isMicOn ? 'Mic' : 'Muted'}</span>
        </div>

        {/* Camera toggle */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={onToggleCamera}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isCameraOn
                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25'
            }`}
            title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {isCameraOn ? <FiVideo className="w-5 h-5" /> : <FiVideoOff className="w-5 h-5" />}
          </button>
          <span className="text-[10px] text-slate-400">{isCameraOn ? 'Camera' : 'Off'}</span>
        </div>

        {/* Student-only: Raise Hand */}
        {!isInstructor && (
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={onToggleHandRaise}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isHandRaised
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25 animate-pulse'
                  : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
              title={isHandRaised ? 'Lower hand' : 'Raise hand'}
            >
              <Hand className="w-5 h-5" />
            </button>
            <span className="text-[10px] text-slate-400">{isHandRaised ? 'Lower' : 'Raise'}</span>
          </div>
        )}

        {/* Emoji reaction */}
        <div className="flex flex-col items-center gap-1 relative">
          <button
            onClick={() => setShowReactionPicker(v => !v)}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all bg-slate-700 hover:bg-slate-600 text-white"
            title="Send reaction"
          >
            <span className="text-lg">{'\u{1F44D}'}</span>
          </button>
          <span className="text-[10px] text-slate-400">React</span>

          {/* Reaction picker popover */}
          {showReactionPicker && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowReactionPicker(false)} />
              <div className="absolute bottom-full mb-2 z-40 flex gap-1 bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 shadow-xl">
                {REACTION_EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onSendReaction(emoji);
                      setShowReactionPicker(false);
                    }}
                    className="w-10 h-10 rounded-lg hover:bg-slate-700 flex items-center justify-center text-xl transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Instructor-only: Screen share + Record + Mute All */}
        {isInstructor && (
          <>
            <div className="w-px h-10 bg-slate-700 mx-1" />

            <div className="flex flex-col items-center gap-1">
              <button
                onClick={onToggleScreenShare}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isScreenSharing
                    ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
                title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
              >
                <FiMonitor className="w-5 h-5" />
              </button>
              <span className="text-[10px] text-slate-400">{isScreenSharing ? 'Sharing' : 'Screen'}</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <button
                onClick={onToggleRecording}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25 animate-pulse'
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
                title={isRecording ? 'Stop recording' : 'Start recording'}
              >
                {isRecording ? <FiStopCircle className="w-5 h-5" /> : <FiCircle className="w-5 h-5" />}
              </button>
              <span className="text-[10px] text-slate-400">{isRecording ? 'Stop' : 'Record'}</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <button
                onClick={onMuteAll}
                className="w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition-all"
                title="Mute all students"
              >
                <FiMicOff className="w-4 h-4" />
                <span className="text-[7px] font-bold ml-0.5">ALL</span>
              </button>
              <span className="text-[10px] text-slate-400">Mute All</span>
            </div>
          </>
        )}

        <div className="w-px h-10 bg-slate-700 mx-1" />

        {/* Chat toggle */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={onToggleChat}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              showChat
                ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
            title="Toggle chat"
          >
            <FiMessageSquare className="w-5 h-5" />
          </button>
          <span className="text-[10px] text-slate-400">Chat</span>
        </div>

        {/* Participants toggle */}
        <div className="flex flex-col items-center gap-1 relative">
          <button
            onClick={onToggleParticipants}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              showParticipants
                ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
            title="Participants"
          >
            <FiUsers className="w-5 h-5" />
          </button>
          <span className="text-[10px] text-slate-400">People ({participantCount})</span>
          {/* Raised hands badge */}
          {raisedHandsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-[10px] font-bold text-white flex items-center justify-center">
              {raisedHandsCount}
            </span>
          )}
        </div>

        <div className="w-px h-10 bg-slate-700 mx-1" />

        {/* End / Leave */}
        <div className="flex flex-col items-center gap-1">
          {isInstructor ? (
            <button
              onClick={onEndSession}
              className="h-12 px-6 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-500/25"
            >
              <FiPhoneOff className="w-5 h-5" /> End
            </button>
          ) : (
            <button
              onClick={onLeave}
              className="h-12 px-6 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-500/25"
            >
              <FiPhoneOff className="w-5 h-5" /> Leave
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ControlBar;
