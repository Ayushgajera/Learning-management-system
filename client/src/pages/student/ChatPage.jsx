import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  MessageSquareText,
  MessageSquareQuote,
  Users,
  Paperclip,
  Code,
  Send,
  Trash2,
  BookOpen,
  Hash,
  UserCheck,
  Circle,
  X,
  Plus,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast, Toaster } from 'sonner';

// --- MOCK DATA FOR DEMONSTRATION ---
const MOCK_USERS = [
  { id: 'user-1', name: 'You', role: 'instructor', avatar: 'https://placehold.co/40x40/5EEAD4/065F46?text=U', bio: 'Course instructor and admin.' },
  { id: 'user-2', name: 'Alice', role: 'student', avatar: 'https://placehold.co/40x40/94A3B8/F8FAFC?text=A', bio: 'React enthusiast and hobbyist developer.' },
  { id: 'user-3', name: 'Bob', role: 'student', avatar: 'https://placehold.co/40x40/FCA5A5/7F1D1D?text=B', bio: 'Learning Node.js for backend projects.' },
  { id: 'user-4', name: 'Charlie', role: 'student', avatar: 'https://placehold.co/40x40/FDBA74/7C2D12?text=C', bio: 'Enjoys building full-stack applications.' },
];

const MOCK_COURSES = [
  { id: 'course-1', name: 'Introduction to React' },
  { id: 'course-2', name: 'Advanced Node.js' },
  { id: 'course-3', name: 'Database Fundamentals' },
];

let MOCK_MESSAGES = {
  'course-1': [
    { id: 'msg-1', userId: 'user-2', text: "Hello everyone! I'm excited for this course.", timestamp: new Date().getTime() - 100000 },
    { id: 'msg-2', userId: 'user-1', text: "Welcome Alice! Let me know if you have any questions.", timestamp: new Date().getTime() - 90000 },
    { id: 'msg-3', userId: 'user-3', text: "Can anyone help me with a code block? I'm getting a bug. ```console.log('bug');```", timestamp: new Date().getTime() - 80000 },
    { id: 'msg-4', userId: 'user-1', text: "Sure, @Bob. What's the error message you're seeing?", timestamp: new Date().getTime() - 70000, replyTo: 'msg-3' },
  ],
  'course-2': [
    { id: 'msg-5', userId: 'user-4', text: "What's the best practice for API security?", timestamp: new Date().getTime() - 60000 },
  ],
  'course-3': [],
};

const MOCK_ONLINE_USERS = ['user-1', 'user-2', 'user-4'];

// --- UTILITY COMPONENTS ---

// Online status indicator for users
const OnlineStatus = ({ userId }) => {
  const isOnline = MOCK_ONLINE_USERS.includes(userId);
  return (
    <div
      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'} border-2 border-white`}
      title={isOnline ? 'Online' : 'Offline'}
    />
  );
};

// User Profile Popover
const UserProfileModal = ({ user, onClose }) => {
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-end">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col items-center">
          <img src={user.avatar || 'https://placehold.co/80x80/F8FAFC/E2E8F0?text=U'} alt={user.name} className="w-20 h-20 rounded-full mb-4 border-4 border-blue-500" />
          <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${
            user.role === 'instructor' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
          }`}>
            {user.role}
          </span>
          <p className="text-gray-500 text-center text-sm mt-3">{user.bio}</p>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};


// --- MAIN CHAT COMPONENT ---
export default function ChatPage() {
  const [activeChannel, setActiveChannel] = useState(MOCK_COURSES[0].id);
  const [messages, setMessages] = useState(MOCK_MESSAGES[MOCK_COURSES[0].id]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(MOCK_ONLINE_USERS);
  const [allUsers, setAllUsers] = useState(MOCK_USERS);
  const [currentUser] = useState(MOCK_USERS[0]); // Current logged-in user (instructor)
  const [replyingTo, setReplyingTo] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUsersPanelOpen, setIsUsersPanelOpen] = useState(false);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState(null);
  const messagesEndRef = useRef(null);

  const activeChannelName = MOCK_COURSES.find(c => c.id === activeChannel)?.name;

  // Effect to switch chat data when channel changes
  useEffect(() => {
    setMessages(MOCK_MESSAGES[activeChannel] || []);
    setReplyingTo(null);
  }, [activeChannel]);

  // Effect to scroll to the bottom of the chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      userId: currentUser.id,
      text: newMessage,
      timestamp: new Date().getTime(),
      replyTo: replyingTo ? replyingTo.id : null,
    };

    setMessages([...messages, newMsg]);
    setNewMessage('');
    setReplyingTo(null);
  };

  // Handle message deletion (moderator control)
  const handleRemoveMessage = (messageId) => {
    toast.promise(
      new Promise((resolve) => setTimeout(() => {
        setMessages(messages.filter(msg => msg.id !== messageId));
        resolve();
      }, 500)),
      {
        loading: 'Deleting...',
        success: 'Message deleted successfully!',
        error: 'Failed to delete message.',
      }
    );
  };
  
  // Handle kicking a user (moderator control)
  const handleKickUser = (userId) => {
    toast.promise(
      new Promise((resolve) => setTimeout(() => {
        setAllUsers(prevUsers => prevUsers.map(user => 
          user.id === userId ? { ...user, role: 'kicked' } : user
        ));
        setOnlineUsers(prevOnline => prevOnline.filter(id => id !== userId));
        resolve();
      }, 500)),
      {
        loading: 'Kicking user...',
        success: 'User has been kicked!',
        error: 'Failed to kick user.',
      }
    );
  };

  // Get message object by ID for replies
  const getReplyMessage = (replyId) => {
    return messages.find(msg => msg.id === replyId);
  };

  // Get username by user ID
  const getUsername = (userId) => {
    return MOCK_USERS.find(user => user.id === userId)?.name || 'Unknown User';
  };
  
  // Handle user mention in input field
  const handleMention = (username) => {
    setNewMessage(prev => prev + `@${username} `);
  };

  // Insert code block syntax into message
  const handleCodeBlock = () => {
    const textarea = document.getElementById('chat-input');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    const before = currentText.substring(0, start);
    const after = currentText.substring(end, currentText.length);
    const code = currentText.substring(start, end);
    const newText = `${before}\`\`\`\n${code}\n\`\`\`${after}`;
    setNewMessage(newText);
  };

  // Utility function to check for code blocks, now more robust
  const containsCode = (text) => typeof text === 'string' && text.includes('```');

  return (
    <div className="flex font-sans h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 text-gray-800 antialiased">
      <Toaster position="bottom-right" richColors />

      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 p-3 bg-white rounded-full shadow-lg md:hidden"
      >
        <BookOpen className="w-6 h-6 text-gray-600" />
      </button>
      <button
        onClick={() => setIsUsersPanelOpen(true)}
        className="fixed top-4 right-4 z-50 p-3 bg-white rounded-full shadow-lg md:hidden"
      >
        <Users className="w-6 h-6 text-gray-600" />
      </button>

      {/* Sidebar for Channels */}
      <motion.aside
        variants={{ open: { x: 0 }, closed: { x: '-100%' } }}
        initial="closed"
        animate={isSidebarOpen ? "open" : "closed"}
        transition={{ type: "tween" }}
        className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-gray-200 shadow-2xl z-40 flex flex-col md:relative md:translate-x-0"
      >
        <div className="p-6 flex items-center justify-between border-b border-gray-700">
          <h2 className="text-2xl font-bold tracking-tight">LMS Chat</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1.5 rounded-full hover:bg-gray-800 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <h3 className="text-sm font-semibold tracking-wide uppercase text-gray-500 mb-4">Courses</h3>
          <ul className="space-y-3">
            {MOCK_COURSES.map(course => (
              <li key={course.id}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setActiveChannel(course.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`flex items-center w-full p-3 rounded-xl transition-colors duration-200 ${
                    activeChannel === course.id ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700'
                  }`}
                >
                  <Hash className="w-5 h-5 mr-3 opacity-75" />
                  <span className="font-medium text-base truncate">{course.name}</span>
                </motion.button>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-6 flex items-center justify-between border-t border-gray-700">
          <div className="flex items-center">
            <UserCheck className="w-6 h-6 mr-3 text-gray-400" />
            <span className="font-medium text-sm truncate">{currentUser.name}</span>
          </div>
        </div>
      </motion.aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col p-4 md:p-6 md:rounded-l-2xl shadow-inner md:ml-64 md:mr-64 relative">
        <div className="p-4 sm:p-6 flex items-center justify-between border-b border-gray-200 bg-white md:rounded-t-2xl shadow-sm z-10">
          <h2 className="flex items-center text-xl font-bold">
            <Hash className="w-6 h-6 mr-3 text-gray-400" />
            <span className="truncate">{activeChannelName}</span>
          </h2>
        </div>
        
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <AnimatePresence>
            {messages.map((msg) => {
              const user = MOCK_USERS.find(u => u.id === msg.userId);
              const isCurrentUser = msg.userId === currentUser.id;
              const replyMessage = msg.replyTo ? getReplyMessage(msg.replyTo) : null;
              
              const textParts = msg.text.split(/(@\S+)/g).map((part, index) => {
                const mentionedUser = MOCK_USERS.find(u => `@${u.name.toLowerCase()}` === part.toLowerCase());
                if (mentionedUser) {
                  return (
                    <motion.span
                      key={index}
                      className="font-semibold text-blue-600 cursor-pointer hover:underline"
                      onClick={() => mentionedUser && setSelectedUserForProfile(mentionedUser)}
                      whileHover={{ scale: 1.05 }}
                    >
                      {part}
                    </motion.span>
                  );
                }
                return part;
              });

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                  className={`flex items-start gap-4 p-5 rounded-3xl ${isCurrentUser ? 'bg-blue-50/70' : 'bg-white'} shadow-md relative group`}
                >
                  <div className="flex-shrink-0 relative">
                    <img src={user?.avatar || '[https://placehold.co/48x48/F8FAFC/E2E8F0?text=U](https://placehold.co/48x48/F8FAFC/E2E8F0?text=U)'} alt={user?.name} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                    <OnlineStatus userId={msg.userId} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-lg text-gray-900 truncate">
                          {user?.name || 'Unknown User'}
                        </span>
                        {user?.role === 'instructor' && (
                          <span className="text-xs font-medium text-white bg-blue-500 px-2 py-0.5 rounded-full">
                            Instructor
                          </span>
                        )}
                        <span className="text-sm text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2">
                        {(currentUser.role === 'admin' || currentUser.role === 'instructor') && (
                          <motion.button
                            onClick={() => handleRemoveMessage(msg.id)}
                            className="p-2 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-500 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Delete Message"
                          >
                            <Trash2 className="w-5 h-5" />
                          </motion.button>
                        )}
                        <motion.button
                          onClick={() => setReplyingTo(msg)}
                          className="p-2 rounded-full text-gray-400 hover:bg-blue-100 hover:text-blue-500 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Reply to Message"
                        >
                          <MessageSquareQuote className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                    {replyMessage && (
                      <div className="p-3 bg-gray-100 rounded-xl mt-2 text-sm text-gray-600 border-l-4 border-gray-300 transition-all duration-300 hover:bg-gray-200 cursor-pointer">
                        <div className="font-semibold flex items-center gap-2">
                          <MessageSquareQuote className="w-4 h-4" />
                          <span>Replying to {getUsername(replyMessage.userId)}</span>
                        </div>
                        <p className="mt-1 truncate text-gray-500">{replyMessage.text.substring(0, 50)}...</p>
                      </div>
                    )}
                    <p className={`mt-2 text-sm sm:text-base ${containsCode(msg.text) ? 'font-mono' : ''}`}>
                      {textParts.map((part, index) => containsCode(part) ? (
                        <pre key={index} className="bg-gray-800 text-gray-200 p-4 rounded-xl text-xs overflow-x-auto my-3">
                          <code className="whitespace-pre-wrap">{part.replace(/```/g, '').trim()}</code>
                        </pre>
                      ) : (
                        part
                      ))}
                    </p>
                    {/* Placeholder for file sharing */}
                    {msg.file && (
                      <a href="#" className="flex items-center gap-2 text-sm text-blue-600 hover:underline mt-2">
                        <Paperclip className="w-4 h-4" />
                        <span>{msg.file.name}</span>
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Area */}
        <div className="p-4 sm:p-6 border-t border-gray-200 bg-white md:rounded-b-2xl shadow-sm">
          <AnimatePresence>
            {replyingTo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center justify-between p-3 mb-4 rounded-xl bg-blue-100/50"
              >
                <div className="flex items-center space-x-2 text-sm font-medium text-blue-800">
                  <MessageSquareQuote className="w-5 h-5" />
                  <span>Replying to <span className="font-bold">{getUsername(replyingTo.userId)}</span></span>
                </div>
                <button onClick={() => setReplyingTo(null)} className="p-1.5 text-blue-500 hover:text-blue-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <form onSubmit={handleSendMessage} className="flex items-center gap-4">
            <input
              id="file-input"
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const newMsg = {
                    id: `msg-${Date.now()}`,
                    userId: currentUser.id,
                    text: `File shared: ${file.name}`,
                    file: { name: file.name, type: file.type },
                    timestamp: new Date().getTime(),
                  };
                  setMessages([...messages, newMsg]);
                  toast.success(`File "${file.name}" shared!`);
                }
              }}
              className="hidden"
            />
            <motion.button
              type="button"
              onClick={() => document.getElementById('file-input').click()}
              className="p-3 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Attach File"
            >
              <Paperclip className="w-6 h-6" />
            </motion.button>
            <motion.button
              type="button"
              onClick={handleCodeBlock}
              className="p-3 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Insert Code Block"
            >
              <Code className="w-6 h-6" />
            </motion.button>
            <input
              id="chat-input"
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-4 text-base border-2 border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
            <motion.button
              type="submit"
              className="p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send className="w-6 h-6" />
            </motion.button>
          </form>
        </div>
      </main>

      {/* Right-hand side panel for online users */}
      <motion.aside
        variants={{ open: { x: 0 }, closed: { x: '100%' } }}
        initial="closed"
        animate={isUsersPanelOpen ? "open" : "closed"}
        transition={{ type: "tween" }}
        className="fixed inset-y-0 right-0 w-64 bg-white text-gray-800 shadow-2xl z-40 flex flex-col md:relative md:translate-x-0"
      >
        <div className="p-6 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-xl font-bold">Online Users</h2>
          <button onClick={() => setIsUsersPanelOpen(false)} className="md:hidden p-1.5 rounded-full hover:bg-gray-200 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <ul className="space-y-4">
            {allUsers.map(user => (
              <li key={user.id} className="flex items-center p-3 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => setSelectedUserForProfile(user)}>
                <div className="relative">
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                  <div
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ${onlineUsers.includes(user.id) ? 'bg-green-500' : 'bg-gray-400'} border-2 border-white`}
                    title={onlineUsers.includes(user.id) ? 'Online' : 'Offline'}
                  />
                </div>
                <div className="ml-4 flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.role}</p>
                </div>
                {currentUser.role === 'instructor' && user.role !== 'instructor' && user.role !== 'kicked' && (
                  <motion.button
                    onClick={(e) => { e.stopPropagation(); handleKickUser(user.id); }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Kick User"
                  >
                    <ShieldAlert className="w-5 h-5" />
                  </motion.button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </motion.aside>
      
      {/* User Profile Modal */}
      <AnimatePresence>
        {selectedUserForProfile && (
          <UserProfileModal user={selectedUserForProfile} onClose={() => setSelectedUserForProfile(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// Utility function to check for code blocks, now more robust
const containsCode = (text) => typeof text === 'string' && text.includes('```');
