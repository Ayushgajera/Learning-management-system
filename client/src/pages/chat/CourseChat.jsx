import React, { useEffect, useRef, useState, useCallback } from "react";
import { socket } from "../../extensions/socket";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Send,
  Smile,
  Paperclip,
  Code,
  ThumbsUp,
  Heart,
  Laugh,
  Pin,
  Users,
  Book,
  Reply,
  X,
  Edit3,
  Trash2,
  MoreVertical,
  Search,
  Settings,
  PinOff,
  Copy,
  Download,
  Image,
  File,
  Camera,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";

const CourseChat = () => {
  const { courseId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeLang, setCodeLang] = useState("javascript");
  const [codeContent, setCodeContent] = useState("");
  // start as null until we fetch real preferences from the server
  const [notificationPrefs, setNotificationPrefs] = useState(null);
  // ref to hold the latest prefs so socket listeners always read current value
  const notificationPrefsRef = useRef(notificationPrefs);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [file, setFile] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showMessageMenu, setShowMessageMenu] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [currentCourse, setCurrentCourse] = useState(null);
  const messageRefs = useRef({});
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  

  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const userId = user?._id?.toString();
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const windowFocusedRef = useRef(true);

  // Auto scroll to bottom
  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Track window focus for notifications
  useEffect(() => {
    const onFocus = () => (windowFocusedRef.current = true);
    const onBlur = () => (windowFocusedRef.current = false);
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  // Request notification permission once on mount (if supported)
  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      try {
        Notification.requestPermission().then((perm) => {
          // noop - permission stored by browser
        });
      } catch (e) {
        // older browsers may not return a promise
        try {
          Notification.requestPermission();
        } catch (err) {
          // ignore
        }
      }
    }
  }, []);

  // Fetch user notification preferences
  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/v1/user/notifications', { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.notificationPreferences) setNotificationPrefs(data.notificationPreferences);
      } catch (err) {
        // ignore
      }
    };
    fetchPrefs();
  }, []);

  // keep ref in sync whenever state changes
  useEffect(() => {
    notificationPrefsRef.current = notificationPrefs;
  }, [notificationPrefs]);

  // Socket event handlers
  useEffect(() => {
  if (!courseId || !userId) return;

  // Clear any leftover typing or online users when switching courses
  setTyping([]);
  setOnlineUsers([]);

  // Join course chat
  socket.emit("join_course_chat", { courseId, userId });

    // Listen for chat history (server may send either an array or an object)
    socket.on("chat_history", (data) => {
      if (Array.isArray(data)) {
        // server sent messages array directly
        setMessages(data || []);
        setPinnedMessages([]);
        setCurrentCourse(null);
      } else {
        setMessages(data.messages || []);
        setPinnedMessages(data.pinnedMessages || []);
        setCurrentCourse(data.courseInfo || null);
      }
    });

    // Listen for new messages
    socket.on("receive_message", (message) => {
      setMessages((prev) => {
        // 1) If server returns a tempId that matches an optimistic message, replace it
        if (message.tempId) {
          const idx = prev.findIndex((m) => m.tempId === message.tempId);
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = message;
            return next;
          }
        }

        // Determine incoming user id
        const incomingUserId = typeof message.userId === "object" ? message.userId._id : message.userId;

        // 2) If incoming is a code message, try to match an optimistic code message by code content + user
        if (message.isCode) {
          const idx = prev.findIndex((m) => {
            const mUserId = typeof m.userId === "object" ? m.userId._id : m.userId;
            return m.sending && m.isCode && m.code === message.code && mUserId && incomingUserId && mUserId.toString() === incomingUserId.toString();
          });
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = message;
            return next;
          }
        }

        // 3) For regular text messages, try to match optimistic message by text + user
        const tempMatchIdx = prev.findIndex((m) => {
          const mUserId = typeof m.userId === "object" ? m.userId._id : m.userId;
          return m.sending && !m.isCode && !message.isCode && m.text === message.text && mUserId && incomingUserId && mUserId.toString() === incomingUserId.toString();
        });
        if (tempMatchIdx !== -1) {
          const next = [...prev];
          next[tempMatchIdx] = message;
          return next;
        }

        // 4) Prevent exact duplicate by _id
        if (message._id && prev.some((msg) => msg._id === message._id)) {
          return prev;
        }

        return [...prev, message];
      });

      // Browser/Desktop notifications for new messages when window not focused
      try {
        const senderId = message.userId && (typeof message.userId === "object" ? message.userId._id : message.userId);
        // don't notify for our own messages
        if (String(senderId) === String(userId)) return;

    // Respect user preferences using the ref (always up-to-date):
    // - Do not show any real notifications until preferences are loaded (strict enforcement)
    // - If prefs are loaded, require both global and per-course to be enabled
  const prefs = notificationPrefsRef.current;
  const coursePref = prefs?.courses?.find((c) => String(c.courseId) === String(courseId));
  const perCourseEnabled = coursePref ? coursePref.enabled : false; // default to false when missing
  const prefsLoaded = prefs !== null;
  const allowedByPrefs = prefsLoaded && !!prefs?.global && !!perCourseEnabled;

  // Debug: log decision so we can trace why a notification was/wasn't shown
  try {
    console.debug('CourseChat: notification decision', {
      prefsLoaded,
      global: notificationPrefs?.global,
      perCourseEnabled,
      allowedByPrefs,
      windowFocused: windowFocusedRef.current,
      permission: typeof Notification !== 'undefined' ? Notification.permission : 'unsupported',
      senderId: message.userId && (typeof message.userId === 'object' ? message.userId._id : message.userId),
      courseId,
      messageId: message._id || message.tempId,
    });
  } catch (e) {
    // ignore logging errors
  }

  if (
    !windowFocusedRef.current &&
    typeof Notification !== "undefined" &&
    Notification.permission === "granted" &&
    allowedByPrefs
  ) {
          const title = message.isCode ? `Code snippet from ${message.userId?.name || 'Someone'}` : `New message from ${message.userId?.name || 'Someone'}`;
          const body = message.isCode ? (message.code?.slice(0, 100) + (message.code?.length > 100 ? '...' : '')) : (message.text?.slice(0, 150) || '');
          const notif = new Notification(title, { body });
          notif.onclick = () => {
            try {
              window.focus();
              notif.close();
            } catch (e) {}
          };
        }
      } catch (err) {
        // ignore notification errors
      }
    });

    // Listen for message updates (edits)
    socket.on("message_updated", (updatedMessage) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === updatedMessage._id ? updatedMessage : msg))
      );
    });

    // Listen for message deletions
    socket.on("message_deleted", (messageId) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      setPinnedMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    });

    // Listen for typing indicators
    socket.on("user_typing", ({ userId: typingUserId, userName, isTyping }) => {
      if (typingUserId !== userId) {
        setTyping((prev) => {
          if (isTyping) {
            return prev.includes(userName) ? prev : [...prev, userName];
          } else {
            return prev.filter((name) => name !== userName);
          }
        });
      }
    });

    // Listen for reactions
    socket.on("message_reaction", ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? { ...msg, reactions } : msg))
      );
    });

    // Listen for pinned messages
    socket.on("message_pinned", (pinnedMessage) => {
      setPinnedMessages((prev) => {
        if (!prev.find((p) => p._id === pinnedMessage._id)) {
          return [...prev, pinnedMessage];
        }
        return prev;
      });
    });

    // Listen for unpinned messages
    socket.on("message_unpinned", (messageId) => {
      setPinnedMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    });

    // Listen for online users
    socket.on("online_users", (users) => {
      setOnlineUsers(users.filter((u) => u._id !== userId));
    });

    // Listen for course list
    socket.on("user_courses", (userCourses) => {
      setCourses(userCourses);
    });

    // Request user courses
    socket.emit("get_user_courses", userId);

    // Cleanup: leave previous course room and remove listeners
    return () => {
      try {
        socket.emit("leave_course_chat", { courseId, userId });
      } catch (e) {
        // ignore
      }
      socket.off("chat_history");
      socket.off("receive_message");
      socket.off("message_updated");
      socket.off("message_deleted");
      socket.off("user_typing");
      socket.off("message_reaction");
      socket.off("message_pinned");
      socket.off("message_unpinned");
      socket.off("online_users");
      socket.off("user_courses");
    };
  }, [courseId, userId]);

  // Close message menu when clicking outside
  useEffect(() => {
    if (!showMessageMenu) return;

    const handleOutsideClick = (e) => {
      const menuEl = document.querySelector(`[data-menu-id="${showMessageMenu}"]`);
      if (menuEl && menuEl.contains(e.target)) return;
      setShowMessageMenu(null);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showMessageMenu]);

  // Scroll to and highlight a message (used by pinned messages)
  const handlePinnedClick = (msg) => {
    const key = msg._id || msg.tempId;
    const el = messageRefs.current[key];
    if (el && el.scrollIntoView) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedMessageId(msg._id);
      // clear highlight after 3s
      setTimeout(() => setHighlightedMessageId(null), 3000);
    }
  };

  // Handle file upload
  const handleFileUpload = async (selectedFile) => {
    if (!selectedFile) return null;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("courseId", courseId);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("File upload error:", error);
      alert("Failed to upload file");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Insert code block into the text input (quick wrap) or open modal
  const openCodeModal = (useModal = true, lang = "javascript") => {
  if (useModal) {
    setShowCodeModal(true);
  } else {
    const block = `\n\`\`\`${lang}\n// paste your code here\n\`\`\`\n`;
    setText((t) => (t ? t + block : block));
  }
};


  const closeCodeModal = () => {
    setShowCodeModal(false);
    setCodeContent("");
    setCodeLang("javascript");
  };

  // Send code message as a special message object
  const sendCodeMessage = async () => {
    if (!codeContent.trim()) return;

    const tempId = Date.now().toString();

    // optimistic UI
    setMessages((prev) => [
      ...prev,
      {
        tempId,
        isCode: true,
        code: codeContent,
        codeLang,
        userId: user,
        timestamp: new Date().toISOString(),
        sending: true,
      },
    ]);

    // detect mentions in code (simple regex)
    const mentionRegex = /@([a-zA-Z0-9_\-\.]+)/g;
    const mentions = [];
    let m;
    while ((m = mentionRegex.exec(codeContent)) !== null) mentions.push(m[1]);

    const messageData = {
      courseId,
      userId,
      isCode: true,
      code: codeContent,
      codeLang,
      tempId,
      mentions,
      timestamp: new Date().toISOString(),
    };

    socket.emit("send_message", messageData);
    closeCodeModal();
  };

  // Toggle notification for current course
  const toggleCourseNotifications = async () => {
    if (notificationPrefsRef.current === null) return; // still loading

    const prev = notificationPrefsRef.current;
    try {
      const existing = prev?.courses?.find((c) => String(c.courseId) === String(courseId));
      const newEnabled = existing ? !existing.enabled : false;
      const updatedCourses = prev?.courses ? [...prev.courses.filter((c) => String(c.courseId) !== String(courseId))] : [];
      updatedCourses.push({ courseId, enabled: newEnabled });

      const optimistic = { ...prev, courses: updatedCourses };
      // optimistic update
      setNotificationPrefs(optimistic);
      notificationPrefsRef.current = optimistic;

      const res = await fetch('http://localhost:8000/api/v1/user/notifications', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courses: updatedCourses }),
      });

      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      if (data && data.notificationPreferences) {
        setNotificationPrefs(data.notificationPreferences);
        notificationPrefsRef.current = data.notificationPreferences;
      }
    } catch (err) {
      console.error(err);
      // revert to previous state on failure
      setNotificationPrefs(prev);
      notificationPrefsRef.current = prev;
    }
  };

  // Toggle global notifications
  const toggleGlobalNotifications = async () => {
    if (notificationPrefsRef.current === null) return; // still loading

    const prev = notificationPrefsRef.current;
    try {
      const optimistic = { ...prev, global: !prev.global };
      setNotificationPrefs(optimistic);
      notificationPrefsRef.current = optimistic;

      const res = await fetch('http://localhost:8000/api/v1/user/notifications', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ global: optimistic.global }),
      });

      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      if (data && data.notificationPreferences) {
        setNotificationPrefs(data.notificationPreferences);
        notificationPrefsRef.current = data.notificationPreferences;
      }
    } catch (err) {
      console.error(err);
      setNotificationPrefs(prev);
      notificationPrefsRef.current = prev;
    }
  };

  // Trigger a test notification (bypasses window focus check so user can verify)
  const testNotification = () => {
    // determine prefs
    const coursePref = notificationPrefs?.courses?.find((c) => String(c.courseId) === String(courseId));
    const perCourseEnabled = coursePref ? coursePref.enabled : true;
    const prefsLoaded = notificationPrefs !== null;
    const allowedByPrefs = prefsLoaded ? (notificationPrefs.global && perCourseEnabled) : true;

    if (typeof Notification === 'undefined') {
      alert('Browser notifications are not supported in this environment.');
      return;
    }

    if (Notification.permission !== 'granted') {
      alert('Notification permission is not granted. Please allow notifications in your browser settings.');
      return;
    }

    if (!allowedByPrefs) {
      alert('Notifications are currently disabled by your preferences (global or course).');
      return;
    }

    try {
      const n = new Notification('Test: LMS Chat', { body: `This is a test notification for course ${currentCourse?.title || courseId}` });
      n.onclick = () => { try { window.focus(); n.close(); } catch (e) {} };
    } catch (err) {
      console.error('Test notification failed', err);
      alert('Failed to show notification. Check console for details.');
    }
  };

  const copyCodeToClipboard = (code) => {
    navigator.clipboard.writeText(code);
  };

  // Send message
  const sendMessage = async () => {
    if (text.trim() === "" && !file) return;

    let fileUrl = null;
    let fileType = null;
    let fileName = null;

    if (file) {
      fileUrl = await handleFileUpload(file);
      if (!fileUrl) return;
      fileType = file.type;
      fileName = file.name;
    }

    // Temporary ID for optimistic UI
    const tempId = Date.now().toString();

    // Optimistic UI update
    setMessages((prev) => [
      ...prev,
      {
        tempId,
        text: text.trim(),
        userId: user,
        file: fileUrl,
        fileType,
        fileName,
        replyTo: replyTo?._id || null,
        timestamp: new Date().toISOString(),
        sending: true,
      },
    ]);

    const messageData = {
      courseId,
      userId,
      text: text.trim(),
      file: fileUrl,
      fileType,
      fileName,
      replyTo: replyTo?._id || null,
      timestamp: new Date().toISOString(),
      tempId,
    };

  // detect mentions in text
  const mentionRegex = /@([a-zA-Z0-9_\-\.]+)/g;
  const mentions = [];
  let mm;
  while ((mm = mentionRegex.exec(text.trim())) !== null) mentions.push(mm[1]);
  if (mentions.length) messageData.mentions = mentions;

    socket.emit("send_message", messageData);
    setText("");
    setFile(null);
    setReplyTo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle typing
  const handleTyping = (e) => {
    setText(e.target.value);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Emit typing start
    socket.emit("typing", {
      courseId,
      userId,
      userName: user?.name || "Anonymous",
      isTyping: true,
    });

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", {
        courseId,
        userId,
        userName: user?.name || "Anonymous",
        isTyping: false,
      });
    }, 2000);
  };

  // Add reaction
  const addReaction = (messageId, emoji) => {
    socket.emit("add_reaction", {
      messageId,
      emoji,
      userId,
      userName: user?.name || "Anonymous",
    });
  };

  // Remove reaction
  const removeReaction = (messageId, emoji) => {
    socket.emit("remove_reaction", {
      messageId,
      emoji,
      userId,
    });
  };

  // Pin/Unpin message
  const togglePinMessage = (message) => {
    const isPinned = pinnedMessages.some((p) => p._id === message._id);

    if (isPinned) {
      socket.emit("unpin_message", message._id);
    } else {
      socket.emit("pin_message", message);
    }
    setShowMessageMenu(null);
  };

  // Edit message
  const editMessage = (messageId, newText) => {
    socket.emit("edit_message", { messageId, newText });
    setEditingMessage(null);
    setText("");
  };

  // Delete message
  const deleteMessage = (messageId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      socket.emit("delete_message", messageId);
    }
    setShowMessageMenu(null);
  };

  // Copy message
  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
    setShowMessageMenu(null);
  };

  // Handle reply
  const handleReply = (message) => {
    setReplyTo(message);
    setShowMessageMenu(null);
  };

  // Cancel reply
  const cancelReply = () => {
    setReplyTo(null);
  };

  // Filter messages based on search
  const filteredMessages = messages.filter(
    (msg) =>
      msg.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render file preview
  const renderFilePreview = (file, fileType, fileName) => {
    if (!file) return null;

    if (fileType?.startsWith("image/")) {
      return (
        <div className="mt-2 relative group inline-block">
          <img
            src={file}
            alt={fileName}
            className="rounded-lg max-h-64 border border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-90 transition shadow-sm"
            onClick={() => window.open(file, "_blank")}
          />
        </div>
      );
    } else {
      return (
        <div className="mt-2 flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 max-w-sm">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <File className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{fileName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Attachment</p>
          </div>
          <button
            onClick={() => window.open(file, "_blank")}
            className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      );
    }
  };

  // Render reaction buttons
  const renderReactionButtons = (message) => {
    const reactions = message.reactions || [];
    const reactionCounts = reactions.reduce((acc, r) => {
      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
      return acc;
    }, {});

    const hasReacted = (emoji) => reactions.some((r) => r.emoji === emoji && r.userId === userId);

    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {["👍", "❤️", "😂", "😮", "😢", "😡"].map((emoji) => {
          const count = reactionCounts[emoji] || 0;
          const userReacted = hasReacted(emoji);

          if (count === 0 && !userReacted) return null; // Only show active reactions or if user reacted

          return (
            <button
              key={emoji}
              onClick={() => (userReacted ? removeReaction(message._id, emoji) : addReaction(message._id, emoji))}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition border ${
                userReacted
                  ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400"
                  : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
              title={`React with ${emoji}`}
            >
              <span>{emoji}</span>
              {count > 0 && <span>{count}</span>}
            </button>
          );
        })}
        
        <button 
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          title="Add reaction"
        >
          <Smile className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Left Sidebar - Course List */}
      <div className="w-20 lg:w-72 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900 flex-shrink-0 z-20">
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 flex-shrink-0">
            <Book className="w-5 h-5" />
          </div>
          <h2 className="hidden lg:block ml-3 text-lg font-bold text-slate-900 dark:text-white tracking-tight">My Courses</h2>
        </div>

        {/* Course List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-1 custom-scrollbar">
          {courses.map((course) => (
            <Link
              to={`/chat/${course._id}`}
              key={course._id}
              className={`relative flex items-center gap-3 px-3 lg:px-4 py-3 mx-2 rounded-xl transition-all group ${
                courseId === course._id
                  ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
              title={course.courseTitle}
            >
              {courseId === course._id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-r-full" />
              )}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold flex-shrink-0 ${
                courseId === course._id 
                  ? "bg-white dark:bg-slate-800 shadow-sm" 
                  : "bg-slate-100 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700"
              }`}>
                {course.courseTitle.charAt(0)}
              </div>
              <div className="hidden lg:block flex-1 min-w-0">
                <div className="font-semibold truncate text-sm">{course.courseTitle}</div>
                <div className="text-xs opacity-70 truncate">General Channel</div>
              </div>
            </Link>
          ))}
        </div>

        {/* User Profile Mini */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer">
            <div className="relative">
              <img
                src={user?.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                alt="Profile"
                className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 object-cover"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
            </div>
            <div className="hidden lg:block flex-1 min-w-0">
              <div className="font-bold text-sm text-slate-900 dark:text-white truncate">{user?.name}</div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Online</div>
            </div>
            <Settings className="hidden lg:block w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 relative">
        {/* Chat Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="lg:hidden p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400">
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <Link 
              to={`/course-progress/${courseId}`} 
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition text-sm font-medium"
            >
               <ArrowLeft className="w-4 h-4" />
               <span>Back to Class</span>
            </Link>

            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {currentCourse?.title || "Course Chat"}
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium">
                  #general
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Users className="w-3 h-3" /> {onlineUsers.length + 1} online
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                {messages.length} messages
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-3 py-1.5 border border-slate-200 dark:border-slate-700">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-sm ml-2 w-32 lg:w-48 text-slate-700 dark:text-slate-200 placeholder-slate-400"
              />
            </div>
            
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

            <button 
              onClick={toggleCourseNotifications}
              className={`p-2 rounded-full transition ${
                notificationPrefs?.courses?.find(c => String(c.courseId) === String(courseId))?.enabled
                  ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              }`}
              title="Course Notifications"
            >
              <div className="relative">
                <Users className="w-5 h-5" />
                {notificationPrefs?.courses?.find(c => String(c.courseId) === String(courseId))?.enabled && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white dark:border-slate-900"></span>
                )}
              </div>
            </button>
            
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className="md:hidden p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Pinned Messages Bar */}
        {pinnedMessages.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/10 border-b border-amber-100 dark:border-amber-900/20 px-6 py-2 flex items-center gap-3 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-500 font-bold text-xs uppercase tracking-wider flex-shrink-0">
              <Pin className="w-3 h-3" /> Pinned
            </div>
            <div className="flex gap-3">
              {pinnedMessages.map((msg) => (
                <div
                  key={msg._id}
                  onClick={() => handlePinnedClick(msg)}
                  className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800/30 px-3 py-1.5 rounded-lg cursor-pointer hover:shadow-sm transition flex-shrink-0 max-w-xs"
                >
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.userId?.name || "User"}`} 
                    className="w-4 h-4 rounded-full" 
                    alt="" 
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                    {msg.userId?.name}:
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                    {msg.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 scroll-smooth">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-60">
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <MessageSquare className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Welcome to {currentCourse?.title || "Class"}!
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md">
                This is the start of the conversation. Be kind, helpful, and respectful to your fellow students.
              </p>
            </div>
          ) : (
            (searchTerm ? filteredMessages : messages).map((msg, index) => {
              const msgUserId = typeof msg.userId === "object" ? msg.userId._id : msg.userId;
              const msgUserName = typeof msg.userId === "object" ? msg.userId.name : msg.userName || "Anonymous";
              const isOwn = msgUserId === userId;
              const replyMsg = msg.replyTo ? messages.find((m) => m._id === msg.replyTo) : null;
              const isPinned = pinnedMessages.some((p) => p._id === msg._id);
              
              // Check if previous message was from same user to group them
              const isSequence = index > 0 && (
                (typeof messages[index-1].userId === "object" ? messages[index-1].userId._id : messages[index-1].userId) === msgUserId
              );

              return (
                <div
                  key={msg._id || msg.tempId}
                  ref={(el) => {
                    const key = msg._id || msg.tempId;
                    if (el) messageRefs.current[key] = el;
                  }}
                  className={`group flex gap-4 ${isOwn ? "flex-row-reverse" : ""} ${isSequence ? "mt-1" : "mt-6"} ${
                    highlightedMessageId === msg._id ? "bg-yellow-50 dark:bg-yellow-900/10 -mx-4 px-4 py-2 rounded-xl transition-colors duration-1000" : ""
                  }`}
                >
                  {/* Avatar */}
                  {!isSequence ? (
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msgUserName}`}
                      alt="avatar"
                      className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 shadow-sm object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 flex-shrink-0" />
                  )}

                  <div className={`flex flex-col max-w-[85%] lg:max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
                    {/* Header (Name & Time) */}
                    {!isSequence && (
                      <div className={`flex items-center gap-2 mb-1 ${isOwn ? "flex-row-reverse" : ""}`}>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {isOwn ? "You" : msgUserName}
                        </span>
                        <span className="text-xs text-slate-400">
                          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                        </span>
                        {isPinned && <Pin className="w-3 h-3 text-amber-500 fill-current" />}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div className={`relative px-5 py-3 shadow-sm text-[15px] leading-relaxed ${
                      isOwn
                        ? "bg-indigo-600 text-white rounded-2xl rounded-tr-sm"
                        : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-sm border border-slate-200 dark:border-slate-700"
                    } ${msg.sending ? "opacity-70" : ""}`}>
                      
                      {/* Reply Context */}
                      {replyMsg && (
                        <div className={`mb-2 px-3 py-2 rounded-lg text-xs border-l-2 ${
                          isOwn 
                            ? "bg-indigo-700/50 border-indigo-300 text-indigo-100" 
                            : "bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400"
                        }`}>
                          <div className="font-bold mb-0.5 opacity-80">
                            {replyMsg.userId?.name || "User"}
                          </div>
                          <div className="truncate opacity-70">{replyMsg.text}</div>
                        </div>
                      )}

                      {/* Content */}
                      {editingMessage === msg._id ? (
                        <div className="min-w-[200px]">
                          <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") editMessage(msg._id, text);
                              if (e.key === "Escape") setEditingMessage(null);
                            }}
                            className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-inherit placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white/50"
                            autoFocus
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button onClick={() => setEditingMessage(null)} className="text-xs opacity-70 hover:opacity-100">Cancel</button>
                            <button onClick={() => editMessage(msg._id, text)} className="text-xs font-bold hover:underline">Save</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {msg.isCode ? (
                            <div className="my-1 rounded-lg overflow-hidden bg-slate-950 border border-slate-800">
                              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800">
                                <span className="text-xs text-slate-400 font-mono">{msg.codeLang || 'code'}</span>
                                <div className="flex gap-2">
                                  <button onClick={() => copyCodeToClipboard(msg.code)} className="text-slate-400 hover:text-white" title="Copy">
                                    <Copy className="w-3 h-3" />
                                  </button>
                                  <button onClick={() => {
                                    const blob = new Blob([msg.code], { type: 'text/plain' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `snippet.${msg.codeLang || 'txt'}`;
                                    a.click();
                                  }} className="text-slate-400 hover:text-white" title="Download">
                                    <Download className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <pre className="p-3 text-sm font-mono text-emerald-400 overflow-x-auto custom-scrollbar">
                                <code>{msg.code}</code>
                              </pre>
                            </div>
                          ) : (
                            <div className="whitespace-pre-wrap break-words">
                              {msg.text?.split(/(\@[a-zA-Z0-9_\-\.]+)/g).map((part, i) =>
                                part.startsWith("@") ? (
                                  <span key={i} className={`font-bold ${isOwn ? "text-indigo-200" : "text-indigo-600 dark:text-indigo-400"}`}>{part}</span>
                                ) : (
                                  <span key={i}>{part}</span>
                                )
                              )}
                              {msg.edited && <span className="text-[10px] opacity-60 ml-1">(edited)</span>}
                            </div>
                          )}

                          {renderFilePreview(msg.file, msg.fileType, msg.fileName)}
                        </>
                      )}

                      {/* Hover Actions (Absolute) */}
                      {!msg.sending && !editingMessage && (
                        <div className={`absolute top-0 ${isOwn ? "-left-10" : "-right-10"} opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1`}>
                          <button
                            onClick={() => setShowMessageMenu(showMessageMenu === msg._id ? null : msg._id)}
                            className="p-1.5 rounded-full bg-white dark:bg-slate-800 shadow-md text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReply(msg)}
                            className="p-1.5 rounded-full bg-white dark:bg-slate-800 shadow-md text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700"
                          >
                            <Reply className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Context Menu */}
                      {showMessageMenu === msg._id && (
                        <div className={`absolute top-8 ${isOwn ? "right-0" : "left-0"} z-50 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100`}>
                          <button onClick={() => handleReply(msg)} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200">
                            <Reply className="w-4 h-4" /> Reply
                          </button>
                          <button onClick={() => copyMessage(msg.text)} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200">
                            <Copy className="w-4 h-4" /> Copy Text
                          </button>
                          <button onClick={() => togglePinMessage(msg)} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200">
                            {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />} {isPinned ? "Unpin" : "Pin"}
                          </button>
                          {isOwn && (
                            <>
                              <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />
                              <button onClick={() => { setEditingMessage(msg._id); setText(msg.text); setShowMessageMenu(null); }} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                <Edit3 className="w-4 h-4" /> Edit
                              </button>
                              <button onClick={() => deleteMessage(msg._id)} className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-red-600 dark:text-red-400">
                                <Trash2 className="w-4 h-4" /> Delete
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Reactions Display */}
                    {!msg.sending && renderReactionButtons(msg)}
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Typing Indicator */}
        {typing.length > 0 && (
          <div className="absolute bottom-24 left-6 z-10 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 flex items-center gap-2 animate-in slide-in-from-bottom-2">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {typing.length === 1 ? `${typing[0]} is typing...` : "People are typing..."}
            </span>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 lg:p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-5xl mx-auto">
            {/* Reply Preview */}
            {replyTo && (
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-t-xl border border-b-0 border-slate-200 dark:border-slate-700 mx-4">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Reply className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    Replying to {replyTo.userId?.name || "User"}:
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400 truncate">{replyTo.text}</span>
                </div>
                <button onClick={cancelReply} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            )}

            {/* File Preview */}
            {file && (
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-t-xl border border-b-0 border-slate-200 dark:border-slate-700 mx-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded">
                    {file.type.startsWith('image/') ? <Image className="w-4 h-4 text-indigo-600" /> : <File className="w-4 h-4 text-indigo-600" />}
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{file.name}</span>
                </div>
                <button onClick={() => { setFile(null); if(fileInputRef.current) fileInputRef.current.value = ''; }} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            )}

            {/* Main Input Bar */}
            <div className={`relative flex items-end gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-3xl border transition-all ${
              (replyTo || file) ? "rounded-t-none border-t-0" : ""
            } ${
              text.length > 0 ? "border-indigo-500 ring-1 ring-indigo-500/20" : "border-slate-200 dark:border-slate-700"
            }`}>
              
              {/* Attachment Button */}
              <div className="flex items-center gap-1 pb-2 pl-2">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-indigo-600 transition"
                  title="Attach file"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip"
                />
                
                <button 
                  onClick={() => openCodeModal(true)}
                  className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-indigo-600 transition"
                  title="Insert Code"
                >
                  <Code className="w-5 h-5" />
                </button>

                <div className="relative">
                  <button 
                    onClick={() => setShowEmoji(!showEmoji)}
                    className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-amber-500 transition"
                    title="Emoji"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  {showEmoji && (
                    <div className="absolute bottom-12 left-0 z-50 shadow-2xl rounded-xl overflow-hidden">
                      <div className="fixed inset-0 z-40" onClick={() => setShowEmoji(false)} />
                      <div className="relative z-50">
                        <EmojiPicker
                          onEmojiClick={(e) => { setText(prev => prev + e.emoji); setShowEmoji(false); }}
                          theme="auto"
                          width={300}
                          height={400}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Text Area */}
              <textarea
                value={text}
                onChange={handleTyping}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={editingMessage ? "Edit message..." : "Type a message..."}
                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder-slate-400 resize-none py-3 max-h-32 min-h-[48px] custom-scrollbar"
                rows={1}
                style={{ height: 'auto', minHeight: '48px' }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
              />

              {/* Send Button */}
              <div className="pb-1 pr-1">
                <button
                  onClick={sendMessage}
                  disabled={isUploading || (!text.trim() && !file)}
                  className={`p-3 rounded-full transition-all duration-200 flex items-center justify-center ${
                    isUploading || (!text.trim() && !file)
                      ? "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95"
                  }`}
                >
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5 ml-0.5" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="text-center mt-2 text-xs text-slate-400">
              <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for new line
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Online Users (Desktop) */}
      <div className="hidden xl:flex w-64 border-l border-slate-200 dark:border-slate-800 flex-col bg-white dark:bg-slate-900 flex-shrink-0">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Classmates
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {onlineUsers.length + 1} active in this course
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">You</h4>
            <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30">
              <div className="relative">
                <img
                  src={user?.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                  alt="You"
                  className="w-8 h-8 rounded-full bg-white"
                />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
              </div>
              <div className="font-medium text-sm text-indigo-900 dark:text-indigo-200">You</div>
            </div>
          </div>

          {onlineUsers.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Online — {onlineUsers.length}</h4>
              <div className="space-y-1">
                {onlineUsers.map((u) => (
                  <div key={u._id} className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                    <div className="relative">
                      <img
                        src={u.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                        alt={u.name}
                        className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700"
                      />
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                    </div>
                    <div className="font-medium text-sm text-slate-700 dark:text-slate-300 truncate">{u.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeCodeModal} />
          <div className="relative z-50 w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-indigo-600" /> Share Code Snippet
              </h3>
              <button onClick={closeCodeModal} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Language</label>
                <select 
                  value={codeLang} 
                  onChange={(e) => setCodeLang(e.target.value)} 
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="c">C</option>
                  <option value="cpp">C++</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="sql">SQL</option>
                  <option value="json">JSON</option>
                  <option value="bash">Bash</option>
                  <option value="text">Plain Text</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Code</label>
                <textarea
                  value={codeContent}
                  onChange={(e) => setCodeContent(e.target.value)}
                  className="w-full h-64 p-4 bg-slate-950 text-emerald-400 font-mono text-sm rounded-xl border border-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="// Paste your code here..."
                  spellCheck="false"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3">
              <button onClick={closeCodeModal} className="px-4 py-2 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition">
                Cancel
              </button>
              <button 
                onClick={sendCodeMessage} 
                disabled={!codeContent.trim()}
                className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Share Snippet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseChat;