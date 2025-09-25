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
        <img
          src={file}
          alt={fileName}
          className="mt-2 rounded-md max-h-48 border border-blue-400 cursor-pointer hover:opacity-80"
          onClick={() => window.open(file, "_blank")}
        />
      );
    } else {
      return (
        <div className="mt-2 flex items-center gap-2 p-3 bg-gray-700 rounded-md border border-blue-400">
          <File className="w-5 h-5 text-blue-400" />
          <span className="text-sm">{fileName}</span>
          <button
            onClick={() => window.open(file, "_blank")}
            className="ml-auto text-blue-400 hover:text-blue-300"
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
      <div className="flex gap-2 mt-2">
        {["👍", "❤️", "😂", "😮", "😢", "😡"].map((emoji) => {
          const count = reactionCounts[emoji] || 0;
          const userReacted = hasReacted(emoji);

          return (
            <button
              key={emoji}
              onClick={() => (userReacted ? removeReaction(message._id, emoji) : addReaction(message._id, emoji))}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition ${
                userReacted
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 hover:bg-gray-600 text-gray-300"
              }`}
              title={`React with ${emoji}`}
            >
              {emoji} {count > 0 && <span>{count}</span>}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 text-white">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-800 flex flex-col bg-gray-950/80 backdrop-blur-lg">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Book className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold tracking-wide">{currentCourse?.title || 'Courses'}</h2>
          </div>
          <button className="p-2 hover:bg-gray-800 rounded-full">
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Course List */}
        <div className="flex-1 overflow-y-auto">
          {courses.map((course) => (
            <Link
              to={`/chat/${course._id}`}
              key={course._id}
              className={`px-6 py-4 hover:bg-blue-900/30 transition cursor-pointer border-l-4 block ${
                courseId === course._id
                  ? "bg-blue-900/50 border-blue-400"
                  : "border-transparent"
              }`}
            >
              <div className="font-semibold">{course?.courseTitle}</div>
            </Link>
          ))}
        </div>

        {/* Online Users */}
        <div className="p-6 border-t border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-green-400" />
            <span className="text-sm font-semibold">
              Online ({onlineUsers.length + 1})
            </span>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {/* Current user */}
            <div className="flex items-center gap-2 bg-green-900/20 px-3 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <img
                src={`https://api.dicebear.com/8.x/avataaars/svg?seed=${user?.name}`}
                alt="avatar"
                className="w-6 h-6 rounded-full"
              />
              <span className="text-sm">You</span>
            </div>
            {/* Other users */}
            {onlineUsers.map((u) => (
              <div
                key={u._id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50"
              >
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <img
                  src={`https://api.dicebear.com/8.x/avataaars/svg?seed=${
                    u.name || u._id
                  }`}
                  alt="avatar"
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm">{u.name || "Anonymous"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-950/80">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-200">
              ←
            </button>
            <h2 className="text-2xl font-bold">
              {currentCourse?.title || "Course Chat"}
            </h2>
            <div className="flex gap-2">
              <span className="text-xs bg-blue-700/60 px-3 py-1 rounded-full">
                {messages.length} messages
              </span>
              <span className="text-xs bg-green-700/60 px-3 py-1 rounded-full">
                {onlineUsers.length + 1} online
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Button */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`p-2 rounded-full transition ${
                showSearch
                  ? "bg-blue-700 text-white"
                  : "hover:bg-gray-800 text-gray-400"
              }`}
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Big Notification Toggles (clear and accessible) */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-start">
                <span className="text-xs text-gray-400">Course Notifications</span>
                <button
                  onClick={toggleCourseNotifications}
                  className={`mt-1 px-4 py-2 rounded-lg font-semibold transition ${
                    notificationPrefs === null
                      ? 'bg-gray-700 text-gray-300 cursor-wait'
                      : (notificationPrefs.courses?.find((c)=>String(c.courseId)===String(courseId)) ? notificationPrefs.courses.some((c)=>String(c.courseId)===String(courseId) && c.enabled) : true)
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                  }`}
                >
                  {notificationPrefs === null ? 'Loading...' : (notificationPrefs.courses?.find((c)=>String(c.courseId)===String(courseId)) ? (notificationPrefs.courses.some((c)=>String(c.courseId)===String(courseId) && c.enabled) ? 'ON' : 'OFF') : 'ON')}
                </button>
              </div>

              <div className="flex flex-col items-start">
                <span className="text-xs text-gray-400">Global Notifications</span>
                <button
                  onClick={toggleGlobalNotifications}
                  className={`mt-1 px-4 py-2 rounded-lg font-semibold transition ${
                    notificationPrefs === null
                      ? 'bg-gray-700 text-gray-300 cursor-wait'
                      : notificationPrefs.global
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                  }`}
                >
                  {notificationPrefs === null ? 'Loading...' : (notificationPrefs.global ? 'ON' : 'OFF')}
                </button>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-xs text-gray-400">Test</span>
                <button onClick={testNotification} className="mt-1 px-3 py-2 rounded-lg bg-blue-600 text-white font-semibold">Notify</button>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="px-6 py-3 border-b border-gray-800 bg-gray-900/50">
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Pinned Messages */}
        {pinnedMessages.length > 0 && (
          <div className="px-6 py-3 border-b border-gray-800 bg-yellow-900/20">
            <div className="flex items-center gap-2 mb-2">
              <Pin className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-semibold text-yellow-400">
                Pinned Messages
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {pinnedMessages.map((msg) => (
                <div
                  key={msg._id}
                  onClick={() => handlePinnedClick(msg)}
                  className="cursor-pointer bg-yellow-600/20 border border-yellow-600/40 px-3 py-2 rounded-lg text-sm flex items-center gap-2 min-w-max"
                >
                  <span className="font-semibold">
                    {msg.userId?.name || "Anonymous"}:
                  </span>
                  <span className="max-w-xs truncate">{msg.text}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePinMessage(msg);
                    }}
                    className="text-yellow-400 hover:text-yellow-300 ml-2"
                  >
                    <PinOff className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-gradient-to-br from-gray-950/80 to-blue-950/40">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Book className="w-16 h-16 mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">
                Welcome to {currentCourse?.title || "Course"} Chat!
              </h3>
              <p className="text-center max-w-md">
                This is the beginning of your course conversation. Say hello to
                your classmates and start discussing!
              </p>
            </div>
          ) : (
            (searchTerm ? filteredMessages : messages).map((msg) => {
              const msgUserId =
                typeof msg.userId === "object" ? msg.userId._id : msg.userId;
              const msgUserName =
                typeof msg.userId === "object"
                  ? msg.userId.name
                  : msg.userName || "Anonymous";
              const isOwn = msgUserId === userId;
              const replyMsg = msg.replyTo
                ? messages.find((m) => m._id === msg.replyTo)
                : null;
              const isPinned = pinnedMessages.some((p) => p._id === msg._id);

              return (
                <div
                  key={msg._id || msg.tempId}
                  ref={(el) => {
                    const key = msg._id || msg.tempId;
                    if (el) messageRefs.current[key] = el;
                  }}
                  className={`flex items-end gap-3 ${
                    isOwn ? "justify-end" : "justify-start"
                  } group ${msg.sending ? "opacity-70" : ""} ${
                    highlightedMessageId === msg._id ? "ring-4 ring-yellow-400/40 rounded-md" : ""
                  }`}
                >
                  {!isOwn && (
                    <img
                      src={`https://api.dicebear.com/8.x/avataaars/svg?seed=${msgUserName}`}
                      alt="avatar"
                      className="w-10 h-10 rounded-full border-2 border-blue-700 shadow-lg"
                    />
                  )}

                  <div
                    className={`max-w-2xl px-6 py-4 rounded-2xl shadow-lg relative ${
                      isOwn
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none border border-blue-500"
                        : "bg-gradient-to-r from-gray-800 to-gray-700 text-gray-100 rounded-bl-none border border-gray-600"
                    } ${isPinned ? "ring-2 ring-yellow-400/50" : ""} ${
                      msg.sending ? "border-dashed" : ""
                    }`}
                  >
                    {/* Message Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">
                          {isOwn ? "You" : msgUserName}
                        </span>
                        <span className="text-xs text-gray-400">
                          {msg.timestamp
                            ? new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </span>
                        {isPinned && <Pin className="w-3 h-3 text-yellow-400" />}
                        {msg.sending && (
                          <span className="text-xs text-gray-400">
                            Sending...
                          </span>
                        )}
                      </div>

                      {/* Message Menu */}
                      {!msg.sending && (
                        <div className={`${showMessageMenu === (msg._id || msg.tempId) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowMessageMenu(
                                showMessageMenu === (msg._id || msg.tempId)
                                  ? null
                                  : msg._id || msg.tempId
                              );
                            }}
                            className="p-1 hover:bg-gray-600/50 rounded"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {showMessageMenu === (msg._id || msg.tempId) && (
                            <div data-menu-id={msg._id || msg.tempId} onClick={(e) => e.stopPropagation()} className="absolute right-0 top-8 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 min-w-48">
                              <button
                                onClick={() => handleReply(msg)}
                                className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-700 text-left"
                              >
                                <Reply className="w-4 h-4" />
                                Reply
                              </button>
                              <button
                                onClick={() => copyMessage(msg.text)}
                                className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-700 text-left"
                              >
                                <Copy className="w-4 h-4" />
                                Copy
                              </button>
                              <button
                                onClick={() => togglePinMessage(msg)}
                                className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-700 text-left"
                              >
                                {isPinned ? (
                                  <PinOff className="w-4 h-4" />
                                ) : (
                                  <Pin className="w-4 h-4" />
                                )}
                                {isPinned ? "Unpin" : "Pin"}
                              </button>
                              {isOwn && (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingMessage(msg._id);
                                      setText(msg.text);
                                      setShowMessageMenu(null);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-700 text-left"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => deleteMessage(msg._id)}
                                    className="flex items-center gap-2 w-full px-4 py-2 hover:bg-red-600 text-left text-red-400"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Reply Context */}
                    {replyMsg && (
                      <div className="mb-3 px-4 py-2 rounded-lg bg-blue-900/40 border-l-4 border-blue-400 text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <Reply className="w-3 h-3" />
                          <span className="font-semibold text-blue-300">
                            {replyMsg.userId?.name ||
                              replyMsg.userName ||
                              "Anonymous"}
                          </span>
                        </div>
                        <p className="text-blue-200 truncate">{replyMsg.text}</p>
                      </div>
                    )}

                    {/* Message Content */}
                    {editingMessage === msg._id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              editMessage(msg._id, text);
                            } else if (e.key === "Escape") {
                              setEditingMessage(null);
                              setText("");
                            }
                          }}
                          className="flex-1 bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <button
                          onClick={() => editMessage(msg._id, text)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingMessage(null);
                            setText("");
                          }}
                          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="text-base leading-relaxed break-words mb-2">
                          {msg.isCode ? (
                            <div className="bg-gray-900 text-green-200 p-3 rounded-md font-mono text-sm overflow-auto">
                              <pre className="whitespace-pre-wrap">{msg.code}</pre>
                              <div className="mt-2 flex gap-2">
                                <button onClick={() => copyCodeToClipboard(msg.code)} className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs">Copy</button>
                                <a href={`data:text/plain;charset=utf-8,${encodeURIComponent(msg.code)}`} download={`code.${msg.codeLang || 'txt'}`} className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs">Download</a>
                              </div>
                            </div>
                          ) : (
                            // render mentions highlighted
                            msg.text ? (
                              msg.text.split(/(\@[a-zA-Z0-9_\-\.]+)/g).map((part, i) =>
                                part.startsWith("@") ? (
                                  <span key={i} className="text-blue-300 font-semibold">{part}</span>
                                ) : (
                                  <span key={i}>{part}</span>
                                )
                              )
                            ) : null
                          )}
                          {msg.edited && (
                            <span className="text-xs text-gray-400 ml-2">
                              (edited)
                            </span>
                          )}
                        </div>

                        {/* File Attachment */}
                        {msg.file && renderFilePreview(msg.file, msg.fileType, msg.fileName)}

                        {/* Reaction Buttons */}
                        {!msg.sending && renderReactionButtons(msg)}
                      </>
                    )}
                  </div>

                  {isOwn && (
                    <img
                      src={`https://api.dicebear.com/8.x/avataaars/svg?seed=${user?.name}`}
                      alt="avatar"
                      className="w-10 h-10 rounded-full border-2 border-blue-700 shadow-lg"
                    />
                  )}
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>
        {/* Typo fix: The extra `div` was a syntax error. Removing it. */}

        {/* Typing Indicators */}
        {typing.length > 0 && (
          <div className="px-6 py-2 text-sm text-blue-400 italic animate-pulse">
            {typing.length === 1
              ? `${typing[0]} is typing...`
              : `${typing.slice(0, -1).join(", ")} and ${
                  typing[typing.length - 1]
                } are typing...`}
          </div>
        )}

        {/* Message Input */}
        <div className="p-6 border-t border-gray-800 bg-gray-950/80">
          {/* Reply Context */}
          {replyTo && (
            <div className="flex items-center gap-3 bg-blue-900/30 px-4 py-3 rounded-lg mb-4 border-l-4 border-blue-400">
              <Reply className="w-4 h-4 text-blue-400" />
              <div className="flex-1">
                <span className="font-semibold text-blue-200">
                  Replying to{" "}
                  {replyTo.userId?.name || replyTo.userName || "Anonymous"}:
                </span>
                <p className="text-blue-100 text-sm truncate">{replyTo.text}</p>
              </div>
              <button
                onClick={cancelReply}
                className="text-red-400 hover:text-red-300 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* File Preview */}
          {file && (
            <div className="flex items-center gap-3 bg-gray-800 px-4 py-3 rounded-lg mb-4">
              {file.type?.startsWith("image/") ? (
                <Image className="w-5 h-5 text-blue-400" />
              ) : (
                <File className="w-5 h-5 text-blue-400" />
              )}
              <span className="text-sm">{file.name}</span>
              <button
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="ml-auto text-red-400 hover:text-red-300 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Input Bar */}
          <div className="flex items-center gap-3">
            {/* Emoji Picker */}
            <div className="relative">
              <button
                onClick={() => setShowEmoji(!showEmoji)}
                className="p-3 hover:bg-blue-900/40 rounded-full border border-blue-700 transition"
              >
                <Smile className="w-6 h-6 text-blue-400" />
              </button>

              {showEmoji && (
                <div className="absolute bottom-16 left-0 bg-gray-900 rounded-lg shadow-2xl border border-blue-700 z-50">
                  <EmojiPicker
                    onEmojiClick={(e) => {
                      setText((prev) => prev + e.emoji);
                      setShowEmoji(false);
                    }}
                    theme="dark"
                    width={300}
                    height={400}
                  />
                </div>
              )}
            </div>

            {/* File Upload */}
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
                id="fileUpload"
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
              />
              <label
                htmlFor="fileUpload"
                className="p-3 hover:bg-blue-900/40 rounded-full cursor-pointer border border-blue-700 transition flex items-center justify-center"
                title="Attach file"
              >
                <Paperclip className="w-6 h-6 text-blue-400" />
              </label>
            </div>

            {/* Camera (for future implementation) */}
            <button
              className="p-3 hover:bg-blue-900/40 rounded-full border border-blue-700 transition opacity-50 cursor-not-allowed"
              title="Camera (Coming Soon)"
              disabled
            >
              <Camera className="w-6 h-6 text-blue-400" />
            </button>

            {/* Code snippet button */}
            <div className="relative">
              <button
                onClick={() => openCodeModal(true)}
                className="p-3 hover:bg-blue-900/40 rounded-full border border-blue-700 transition"
                title="Send code snippet"
              >
                <Code className="w-6 h-6 text-blue-400" />
              </button>
            </div>

            {/* Message Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={text}
                onChange={handleTyping}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={
                  editingMessage
                    ? "Edit your message..."
                    : replyTo
                    ? "Reply to message..."
                    : "Type your message..."
                }
                className="w-full bg-gray-800 text-white px-6 py-4 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 border border-blue-700 text-lg pr-12"
                disabled={isUploading}
              />
              {/* Character count (optional) */}
              {text.length > 0 && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                  {text.length}/2000
                </div>
              )}
            </div>

            {/* Send Button */}
            <button
              onClick={sendMessage}
              disabled={isUploading || (text.trim() === "" && !file)}
              className={`p-4 rounded-full shadow-lg border transition ${
                isUploading || (text.trim() === "" && !file)
                  ? "bg-gray-700 border-gray-600 cursor-not-allowed opacity-50"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-blue-500"
              }`}
              title={editingMessage ? "Save changes" : "Send message"}
            >
              {isUploading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-6 h-6 text-white" />
              )}
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
            <div className="flex items-center gap-4">
              <span>Press Enter to send, Shift+Enter for new line</span>
              {file && <span>• File selected: {file.name}</span>}
              {replyTo && <span>• Replying to message</span>}
            </div>
            <div className="flex items-center gap-2">
              <span>Shortcuts:</span>
              <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">
                Ctrl+K
              </kbd>
              <span>Search</span>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside handlers */}
      {showEmoji && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowEmoji(false);
          }}
        />
      )}

      {/* Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeCodeModal} />
          <div className="relative z-60 w-full max-w-2xl bg-gray-900 rounded-lg p-6 shadow-xl border border-gray-700">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold">Send Code Snippet</h3>
              <button onClick={closeCodeModal} className="text-gray-400 hover:text-white">Close</button>
            </div>
            <div className="mt-4">
              <label className="text-sm text-gray-300">Language</label>
              <select value={codeLang} onChange={(e) => setCodeLang(e.target.value)} className="w-full mt-1 p-2 bg-gray-800 border border-gray-700 rounded text-sm">
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="c">C</option>
                <option value="cpp">C++</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="bash">Bash</option>
                <option value="text">Plain Text</option>
              </select>
            </div>
            <div className="mt-4">
              <label className="text-sm text-gray-300">Code</label>
              <textarea
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
                rows={10}
                className="w-full mt-1 p-3 bg-black text-green-200 font-mono text-sm rounded border border-gray-700 resize-y"
                placeholder="Paste your code here..."
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={closeCodeModal} className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm">Cancel</button>
              <button onClick={sendCodeMessage} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white">Send Code</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseChat;