import React, { useEffect, useRef } from 'react';
import { FiMicOff, FiVideoOff } from 'react-icons/fi';
import { Hand } from 'lucide-react';

function VideoTile({
  stream,
  name,
  isInstructor: tileIsInstructor,
  isMuted,
  hasVideo,
  hasAudio,
  handRaised,
  isLocal,
  isPinned,
  onPin,
}) {
  const videoRef = useRef(null);

  // Set srcObject whenever stream changes OR when the ref element exists
  useEffect(() => {
    if (videoRef.current) {
      if (stream) {
        videoRef.current.srcObject = stream;
      } else {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream]);

  const initial = (name || 'U')[0].toUpperCase();
  const showVideo = stream && hasVideo !== false;

  return (
    <div
      onClick={onPin}
      className={`relative w-full h-full rounded-xl overflow-hidden bg-slate-900 group cursor-pointer border-2 transition-colors ${
        isPinned ? 'border-indigo-500' : 'border-transparent hover:border-slate-600'
      }`}
    >
      {/* Single always-mounted video element — visibility toggled via CSS */}
      {stream && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal || isMuted}
          className={`absolute inset-0 w-full h-full object-cover ${showVideo ? '' : 'hidden'}`}
        />
      )}

      {/* Avatar fallback when no video */}
      {!showVideo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white ${
            tileIsInstructor
              ? 'bg-gradient-to-br from-indigo-500 to-violet-600'
              : 'bg-gradient-to-br from-slate-600 to-slate-700'
          }`}>
            {initial}
          </div>
          <p className="text-xs text-slate-400 mt-2">{isLocal ? 'Camera off' : name || 'User'}</p>
        </div>
      )}

      {/* Hand raised indicator (top-left) */}
      {handRaised && (
        <div className="absolute top-2 left-2 z-20 flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/90 backdrop-blur-sm">
          <Hand className="w-3.5 h-3.5 text-white animate-bounce" />
          <span className="text-[10px] font-bold text-white">Hand</span>
        </div>
      )}

      {/* Mic-off indicator (top-right) */}
      {hasAudio === false && (
        <div className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-red-500/90 backdrop-blur-sm flex items-center justify-center">
          <FiMicOff className="w-3.5 h-3.5 text-white" />
        </div>
      )}

      {/* Camera-off small icon */}
      {hasVideo === false && stream && (
        <div className="absolute top-2 right-11 z-20 w-7 h-7 rounded-full bg-slate-600/90 backdrop-blur-sm flex items-center justify-center">
          <FiVideoOff className="w-3.5 h-3.5 text-white" />
        </div>
      )}

      {/* Name overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-white truncate">
            {isLocal ? `${name || 'You'} (You)` : name || 'User'}
          </span>
          {tileIsInstructor && (
            <span className="text-[9px] font-bold bg-indigo-500/80 text-white px-1.5 py-0.5 rounded-full">
              Instructor
            </span>
          )}
        </div>
      </div>

      {/* Pin hover overlay */}
      <div className="absolute inset-0 z-10 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
        <span className="text-[11px] font-bold text-white bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
          {isPinned ? 'Unpin' : 'Click to pin'}
        </span>
      </div>
    </div>
  );
}

export default VideoTile;
