import React from 'react';
import { FiMessageSquare, FiX, FiSend } from 'react-icons/fi';
import { format } from 'date-fns';

function ChatPanel({
  chatMessages,
  chatInput,
  typingNames,
  userId,
  chatEndRef,
  onClose,
  onSendMessage,
  onTyping,
}) {
  return (
    <>
      {/* Header */}
      <div className="h-12 min-h-[48px] px-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <FiMessageSquare className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold">Live Chat</h3>
          <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{chatMessages.length}</span>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
          <FiX className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full opacity-50">
            <FiMessageSquare className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-xs text-slate-500">No messages yet</p>
            <p className="text-[10px] text-slate-600 mt-0.5">Start the conversation!</p>
          </div>
        )}
        {chatMessages.map((msg, i) => {
          const isOwn = String(msg.userId?._id || msg.userId) === String(userId);
          return (
            <div key={msg._id || i} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[85%]">
                {!isOwn && (
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    {msg.userId?.photoUrl ? (
                      <img src={msg.userId.photoUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-indigo-600/50 flex items-center justify-center">
                        <span className="text-[8px] font-bold text-white">{msg.userId?.name?.[0]}</span>
                      </div>
                    )}
                    <span className="text-[10px] font-semibold text-slate-400">{msg.userId?.name || 'User'}</span>
                  </div>
                )}
                <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  isOwn ? 'bg-indigo-500 text-white rounded-br-md' : 'bg-slate-800 text-slate-200 rounded-bl-md'
                }`}>
                  {msg.text}
                </div>
                <p className={`text-[10px] text-slate-500 mt-0.5 px-1 ${isOwn ? 'text-right' : ''}`}>
                  {msg.timestamp ? format(new Date(msg.timestamp), 'h:mm a') : ''}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Typing indicator */}
      {typingNames.length > 0 && (
        <div className="px-4 py-1.5 border-t border-slate-800/50">
          <p className="text-[11px] text-slate-400 italic">
            {typingNames.join(', ')} {typingNames.length === 1 ? 'is' : 'are'} typing...
          </p>
        </div>
      )}

      {/* Input */}
      <form onSubmit={onSendMessage} className="p-3 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          value={chatInput}
          onChange={onTyping}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!chatInput.trim()}
          className="w-10 h-10 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <FiSend className="w-4 h-4" />
        </button>
      </form>
    </>
  );
}

export default ChatPanel;
