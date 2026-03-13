import React from 'react';
import VideoTile from './VideoTile';

function VideoGrid({
  localStream,
  remoteStreams,
  userId,
  userName,
  isInstructor,
  isCameraOn,
  isMicOn,
  participants,
  raisedHands,
  pinnedUserId,
  onPin,
}) {
  // Build tiles array: local user + remote streams
  const tiles = [];

  // Add local tile if user has media
  if (localStream) {
    const localParticipant = participants.find(p => String(p.userId) === String(userId));
    tiles.push({
      id: userId,
      stream: localStream,
      name: userName || 'You',
      isInstructor,
      isLocal: true,
      hasVideo: isCameraOn,
      hasAudio: isMicOn,
      handRaised: false,
    });
  }

  // Add remote tiles
  remoteStreams.forEach((data, peerId) => {
    const participant = participants.find(p => String(p.userId) === String(peerId));
    const isHandRaised = raisedHands.some(h => String(h.userId) === String(peerId));
    tiles.push({
      id: peerId,
      stream: data.stream,
      name: participant?.name || data.name || 'User',
      isInstructor: participant?.isInstructor || data.isInstructor || false,
      isLocal: false,
      hasVideo: participant?.hasVideo !== false,
      hasAudio: participant?.hasAudio !== false,
      handRaised: isHandRaised,
    });
  });

  // Sort: pinned first, then instructor, then others
  tiles.sort((a, b) => {
    if (String(a.id) === String(pinnedUserId)) return -1;
    if (String(b.id) === String(pinnedUserId)) return 1;
    if (a.isInstructor && !b.isInstructor) return -1;
    if (!a.isInstructor && b.isInstructor) return 1;
    return 0;
  });

  const count = tiles.length;
  const hasPinned = pinnedUserId && tiles.some(t => String(t.id) === String(pinnedUserId));

  // If a video is pinned, use featured + filmstrip layout
  if (hasPinned && count > 1) {
    const pinnedTile = tiles.find(t => String(t.id) === String(pinnedUserId));
    const others = tiles.filter(t => String(t.id) !== String(pinnedUserId));

    return (
      <div className="w-full h-full flex flex-col gap-2 p-2">
        {/* Featured video */}
        <div className="flex-1 min-h-0">
          <VideoTile
            key={pinnedTile.id}
            stream={pinnedTile.stream}
            name={pinnedTile.name}
            isInstructor={pinnedTile.isInstructor}
            hasVideo={pinnedTile.hasVideo}
            hasAudio={pinnedTile.hasAudio}
            handRaised={pinnedTile.handRaised}
            isLocal={pinnedTile.isLocal}
            isPinned={true}
            onPin={() => onPin(pinnedTile.id)}
          />
        </div>
        {/* Filmstrip */}
        <div className="h-28 flex gap-2 overflow-x-auto pb-1">
          {others.map(tile => (
            <div key={tile.id} className="h-full aspect-video flex-shrink-0">
              <VideoTile
                stream={tile.stream}
                name={tile.name}
                isInstructor={tile.isInstructor}
                hasVideo={tile.hasVideo}
                hasAudio={tile.hasAudio}
                handRaised={tile.handRaised}
                isLocal={tile.isLocal}
                isPinned={false}
                onPin={() => onPin(tile.id)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Grid layout based on count
  let gridClass = 'grid-cols-1';
  if (count === 2) gridClass = 'grid-cols-2';
  else if (count === 3 || count === 4) gridClass = 'grid-cols-2';
  else if (count >= 5 && count <= 6) gridClass = 'grid-cols-3';
  else if (count >= 7) gridClass = 'grid-cols-3 lg:grid-cols-4';

  // For 0 participants with streams — show a waiting state
  if (count === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center">
            <svg className="w-10 h-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm text-slate-400 font-medium">Waiting for video streams...</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full grid ${gridClass} gap-2 p-2 auto-rows-fr`}>
      {tiles.map(tile => (
        <VideoTile
          key={tile.id}
          stream={tile.stream}
          name={tile.name}
          isInstructor={tile.isInstructor}
          hasVideo={tile.hasVideo}
          hasAudio={tile.hasAudio}
          handRaised={tile.handRaised}
          isLocal={tile.isLocal}
          isPinned={String(tile.id) === String(pinnedUserId)}
          onPin={() => onPin(tile.id)}
        />
      ))}
    </div>
  );
}

export default VideoGrid;
