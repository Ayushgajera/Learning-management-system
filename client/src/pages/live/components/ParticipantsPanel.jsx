import React from 'react';
import { FiUsers, FiX, FiMic, FiMicOff, FiVideo, FiVideoOff } from 'react-icons/fi';
import { Hand } from 'lucide-react';

function ParticipantsPanel({
  participants,
  raisedHands,
  userId,
  isInstructor,
  onClose,
  onMuteAll,
  onRemoveParticipant,
}) {
  // Separate raised hands section
  const raisedHandUserIds = new Set(raisedHands.map(h => String(h.userId)));
  const handsUp = participants.filter(p => raisedHandUserIds.has(String(p.userId)));
  const othersRaw = participants.filter(p => !raisedHandUserIds.has(String(p.userId)));

  // Sort: instructors first
  const others = othersRaw.sort((a, b) => {
    if (a.isInstructor && !b.isInstructor) return -1;
    if (!a.isInstructor && b.isInstructor) return 1;
    return 0;
  });

  const renderParticipant = (p) => {
    const isYou = String(p.userId) === String(userId);
    const handRaised = raisedHandUserIds.has(String(p.userId));
    const initial = (p.name || 'U')[0].toUpperCase();

    return (
      <div key={p.userId} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
        {/* Avatar */}
        {p.photoUrl ? (
          <img src={p.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            p.isInstructor
              ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white'
              : 'bg-slate-700 text-slate-300'
          }`}>
            {initial}
          </div>
        )}

        {/* Name and role */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate">
            {p.name || 'User'}{isYou ? ' (You)' : ''}
          </p>
          <p className="text-[10px] text-slate-400">{p.isInstructor ? 'Instructor' : 'Student'}</p>
        </div>

        {/* Status icons */}
        <div className="flex items-center gap-1.5">
          {handRaised && (
            <Hand className="w-4 h-4 text-amber-400 animate-bounce" />
          )}
          {p.hasVideo ? (
            <FiVideo className="w-3.5 h-3.5 text-green-400" />
          ) : (
            <FiVideoOff className="w-3.5 h-3.5 text-slate-500" />
          )}
          {p.hasAudio ? (
            <FiMic className="w-3.5 h-3.5 text-green-400" />
          ) : (
            <FiMicOff className="w-3.5 h-3.5 text-slate-500" />
          )}
        </div>

        {/* Remove button (instructor only, for non-instructor participants, not self) */}
        {isInstructor && !p.isInstructor && !isYou && (
          <button
            onClick={() => onRemoveParticipant(p.userId)}
            className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Remove participant"
          >
            <FiX className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Header */}
      <div className="h-12 min-h-[48px] px-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <FiUsers className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold">Participants</h3>
          <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{participants.length}</span>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
          <FiX className="w-4 h-4" />
        </button>
      </div>

      {/* Mute All button (instructor) */}
      {isInstructor && (
        <div className="px-3 pt-3">
          <button
            onClick={onMuteAll}
            className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center justify-center gap-2 transition-colors border border-slate-700"
          >
            <FiMicOff className="w-3.5 h-3.5" />
            Mute All Students
          </button>
        </div>
      )}

      {/* Raised Hands section */}
      {handsUp.length > 0 && (
        <div className="px-3 pt-3">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-2 space-y-2">
            <div className="flex items-center gap-2 px-1">
              <Hand className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-bold text-amber-400">Raised Hands ({handsUp.length})</span>
            </div>
            {handsUp.map(renderParticipant)}
          </div>
        </div>
      )}

      {/* All participants */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {others.map(renderParticipant)}
      </div>
    </>
  );
}

export default ParticipantsPanel;
