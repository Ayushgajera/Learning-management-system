import express from 'express';
import dotenv from 'dotenv';
import connectDB from "./db/db.js";
import userRouter from "./routes/user.routes.js";
import courseRouter from "./routes/course.routes.js";
import aiRoutes from "./routes/aiRoutes.routes.js";
import paymentRoutes from "./routes/paymentRoutes.routes.js";
import mediaroute from "./routes/media.routes.js";
import CourseProgressRoute from "./routes/courseProgress.routes.js";
import userManagementRoutes from "./routes/userManagement.routes.js";
import moduleRouter from "./routes/module.routes.js";
import resourceRouter from "./routes/resource.routes.js";
import adminRouter from "./routes/admin.routes.js";
import liveSessionRouter from "./routes/liveSession.routes.js";
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import multer from 'multer';
import http from 'http';
import { Server } from 'socket.io';

// Models
import Message from "./models/ChatMessage.js";
import { Course } from "./models/course.model.js";
import { User } from "./models/user.model.js";
import { LiveSession } from "./models/liveSession.model.js";
import LiveChatMessage from "./models/liveChatMessage.model.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://learngpt.vercel.app",
  process.env.CLIENT_URL
].filter(Boolean); // remove undefined if CLIENT_URL is not set

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

// Store `io` globally
app.set("io", io);

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// WebSocket events
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // track which courses this socket joined
  socket.joinedCourses = new Set();

  // User joins course chat
  socket.on("join_course_chat", async ({ courseId, userId }) => {
    try {
      const course = await Course.findById(courseId);

      if (!course) {
        socket.emit("error", "Course not found.");
        return;
      }

      // check if instructor or enrolled student
      const isInstructor = course.creator.toString() === userId;
      const isStudent = course.enrolledStudents.some(
        (studentId) => studentId.toString() === userId
      );

      if (!isInstructor && !isStudent) {
        socket.emit("error", "Access denied. Not enrolled in this course.");
        return;
      }

      socket.join(courseId);
      socket.joinedCourses.add(courseId);
      // attach user info to socket so online_users list includes name
      try {
        const dbUser = await User.findById(userId).select("name");
        socket.userInfo = { _id: userId, name: dbUser?.name || "Anonymous" };
      } catch (err) {
        socket.userInfo = { _id: userId, name: "Anonymous" };
      }
      console.log(`✅ User ${userId} joined course chat ${courseId}`);

      // Send chat history as object with pinned messages and course info
      const messages = await Message.find({ courseId }).populate("userId", "name");
      const pinnedMessages = messages.filter((m) => m.pinned);
      const courseInfo = await Course.findById(courseId).select("title");
      socket.emit("chat_history", { messages, pinnedMessages, courseInfo });

      // broadcast current online users for that course
      const socketsInRoom = await io.in(courseId).fetchSockets();
      const users = socketsInRoom.map((s) => s.userInfo).filter(Boolean);
      console.log(`Broadcasting online_users for course ${courseId}:`, users);
      io.to(courseId).emit("online_users", users);

    } catch (err) {
      console.error("Error joining chat:", err);
      socket.emit("error", "Failed to join chat.");
    }
  });

  // Save new messages (supports file, replyTo, tempId, etc.)
  socket.on("send_message", async (msg) => {
    try {
      const { courseId, userId, text, file, fileType, fileName, replyTo, timestamp, tempId, isCode, code, codeLang } = msg;

      // extract mentions from text (simple @word regex) and from code comments if needed
      const mentionRegex = /@([a-zA-Z0-9_\-\.]+)/g;
      const mentions = [];
      if (text) {
        let m;
        while ((m = mentionRegex.exec(text)) !== null) {
          mentions.push(m[1]);
        }
      }

      const newMessage = await Message.create({
        courseId,
        userId,
        text: text || (isCode ? `` : null),
        file,
        fileType,
        fileName,
        replyTo: replyTo || null,
        timestamp: timestamp || new Date(),
        isCode: !!isCode,
        code: code || null,
        codeLang: codeLang || null,
        mentions,
      });

      const populatedMessage = await newMessage.populate("userId", "name");

      // broadcast to all users in course room and echo tempId so clients can reconcile optimistic UI
      io.to(courseId).emit("receive_message", { ...populatedMessage.toObject(), tempId });
    } catch (err) {
      console.error("Error sending message:", err);
      socket.emit("error", "Failed to send message.");
    }
  });

  // Add reaction
  socket.on("add_reaction", async ({ messageId, emoji, userId, userName }) => {
    try {
      const msg = await Message.findById(messageId);
      if (!msg) return;
      msg.reactions.push({ emoji, userId, userName });

      // Leave course chat explicitly
      socket.on("leave_course_chat", async ({ courseId }) => {
        try {
          if (socket.joinedCourses && socket.joinedCourses.has(courseId)) {
            socket.leave(courseId);
            socket.joinedCourses.delete(courseId);
          }
          // broadcast updated online users for that course
          const socketsInRoom = await io.in(courseId).fetchSockets();
          const users = socketsInRoom.map((s) => s.userInfo).filter(Boolean);
          console.log(`Broadcasting online_users for course ${courseId}:`, users);
          io.to(courseId).emit("online_users", users);
        } catch (err) {
          console.error('Error leaving course chat', err);
        }
      });
      await msg.save();
      io.to(msg.courseId.toString()).emit("message_reaction", { messageId, reactions: msg.reactions });
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("remove_reaction", async ({ messageId, emoji, userId }) => {
    try {
      const msg = await Message.findById(messageId);
      if (!msg) return;
      msg.reactions = msg.reactions.filter((r) => !(r.emoji === emoji && r.userId?.toString() === userId?.toString()));
      await msg.save();
      io.to(msg.courseId.toString()).emit("message_reaction", { messageId, reactions: msg.reactions });
    } catch (err) {
      console.error(err);
    }
  });

  // Pin/unpin
  socket.on("pin_message", async (message) => {
    try {
      const msg = await Message.findById(message._id);
      if (!msg) return;
      msg.pinned = true;
      await msg.save();
      io.to(msg.courseId.toString()).emit("message_pinned", msg);
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("unpin_message", async (messageId) => {
    try {
      const msg = await Message.findById(messageId);
      if (!msg) return;
      msg.pinned = false;
      await msg.save();
      io.to(msg.courseId.toString()).emit("message_unpinned", messageId);
    } catch (err) {
      console.error(err);
    }
  });

  // Edit
  socket.on("edit_message", async ({ messageId, newText }) => {
    try {
      const msg = await Message.findById(messageId);
      if (!msg) return;
      msg.text = newText;
      msg.edited = true;
      await msg.save();
      const populated = await msg.populate("userId", "name");
      io.to(msg.courseId.toString()).emit("message_updated", populated);
    } catch (err) {
      console.error(err);
    }
  });

  // Delete
  socket.on("delete_message", async (messageId) => {
    try {
      const msg = await Message.findById(messageId);
      if (!msg) return;
      await Message.deleteOne({ _id: messageId });
      io.to(msg.courseId.toString()).emit("message_deleted", messageId);
    } catch (err) {
      console.error(err);
    }
  });

  // Typing
  socket.on("typing", ({ courseId, userId, userName, isTyping }) => {
    // attach user info to socket for online tracking
    socket.userInfo = { _id: userId, name: userName };
    io.to(courseId).emit("user_typing", { userId, userName, isTyping });
  });

  // Optional: explicit leave event
  socket.on("leave_course_chat", async ({ courseId }) => {
    try {
      socket.leave(courseId);
      socket.joinedCourses.delete(courseId);
      // broadcast updated online users for that course
      const socketsInRoom = await io.in(courseId).fetchSockets();
      const users = socketsInRoom.map((s) => s.userInfo).filter(Boolean);
      io.to(courseId).emit("online_users", users);
    } catch (err) {
      console.error("Error leaving course chat:", err);
    }
  });

  // Provide user courses
  socket.on("get_user_courses", async (userId) => {
    try {
      const userCourses = await Course.find({ enrolledStudents: userId }).select("courseTitle studentsCount");
      socket.emit("user_courses", userCourses);
    } catch (err) {
      console.error(err);
    }
  });

  // ============ LIVE SESSION EVENTS ============

  // Helper: build enriched participant list from sockets in a room
  async function buildParticipantList(roomName) {
    const socketsInRoom = await io.in(roomName).fetchSockets();
    return socketsInRoom.map(s => ({
      userId: s.liveUserId,
      isInstructor: s.isLiveInstructor || false,
      name: s.liveUserName || 'User',
      photoUrl: s.livePhotoUrl || '',
      hasVideo: s.liveHasVideo || false,
      hasAudio: s.liveHasAudio || false,
      handRaised: s.liveHandRaised || false,
    })).filter(p => p.userId);
  }

  // Join live session room
  socket.on("join_live_session", async ({ sessionId, userId }) => {
    try {
      const session = await LiveSession.findById(sessionId).populate('courseId');
      if (!session || session.status !== 'live') {
        socket.emit("live_error", { message: "Session not found or not live." });
        return;
      }

      const course = session.courseId;
      const isInstructor = String(course.creator) === String(userId);
      const isStudent = course.enrolledStudents.some(
        (sid) => String(sid) === String(userId)
      );

      if (!isInstructor && !isStudent) {
        socket.emit("live_error", { message: "Access denied." });
        return;
      }

      // Fetch user info for display
      let userDoc;
      try {
        userDoc = await User.findById(userId).select("name photoUrl");
      } catch (e) { /* ignore */ }

      const roomName = `live_${session.roomId}`;
      socket.join(roomName);
      socket.liveRoom = roomName;
      socket.liveSessionId = sessionId;
      socket.liveUserId = String(userId);
      socket.isLiveInstructor = isInstructor;
      socket.liveMediaReady = false;
      socket.liveUserName = userDoc?.name || 'User';
      socket.livePhotoUrl = userDoc?.photoUrl || '';
      socket.liveHasVideo = false;
      socket.liveHasAudio = false;
      socket.liveHandRaised = false;

      // Record participant in DB
      if (!session.participants.some(p => String(p.userId) === String(userId))) {
        session.participants.push({ userId, joinedAt: new Date() });
        await session.save();
      }

      // Broadcast enriched participant list
      const participantList = await buildParticipantList(roomName);
      io.to(roomName).emit("live_participants", participantList);

      // Notify late-joining participant about ALL media-ready peers (not just instructor)
      const socketsInRoom = await io.in(roomName).fetchSockets();
      const mediaReadySockets = socketsInRoom.filter(
        s => s.liveMediaReady && String(s.liveUserId) !== String(userId)
      );
      mediaReadySockets.forEach(readySocket => {
        socket.emit("live_peer_media_ready", {
          userId: readySocket.liveUserId,
          name: readySocket.liveUserName,
          hasVideo: readySocket.liveHasVideo,
          hasAudio: readySocket.liveHasAudio,
          isInstructor: readySocket.isLiveInstructor,
        });
      });

      // Send chat history
      const chatHistory = await LiveChatMessage.find({ sessionId })
        .populate('userId', 'name photoUrl')
        .sort({ timestamp: 1 })
        .limit(200);
      socket.emit("live_chat_history", chatHistory);

      console.log(`[LIVE] ${socket.liveUserName} (${userId}) joined session ${sessionId} (${isInstructor ? 'instructor' : 'student'})`);
    } catch (err) {
      console.error("Error joining live session:", err);
      socket.emit("live_error", { message: "Failed to join session." });
    }
  });

  // Leave live session
  socket.on("leave_live_session", async ({ sessionId, userId }) => {
    try {
      const session = await LiveSession.findById(sessionId);
      if (session) {
        const participant = session.participants.find(
          p => String(p.userId) === String(userId) && !p.leftAt
        );
        if (participant) {
          participant.leftAt = new Date();
          await session.save();
        }

        const roomName = `live_${session.roomId}`;

        // Notify others to tear down peers if this user had media
        if (socket.liveMediaReady) {
          socket.to(roomName).emit("live_peer_media_stopped", {
            userId: socket.liveUserId,
          });
        }

        socket.leave(roomName);
        socket.liveRoom = null;
        socket.liveSessionId = null;
        socket.liveMediaReady = false;
        socket.liveHasVideo = false;
        socket.liveHasAudio = false;
        socket.liveHandRaised = false;

        const participantList = await buildParticipantList(roomName);
        io.to(roomName).emit("live_participants", participantList);
      }
    } catch (err) {
      console.error("Error leaving live session:", err);
    }
  });

  // WebRTC Signaling: Offer
  socket.on("live_offer", ({ targetUserId, offer, sessionRoomId }) => {
    const roomName = `live_${sessionRoomId}`;
    const fromId = socket.liveUserId;
    io.in(roomName).fetchSockets().then(sockets => {
      const targetSocket = sockets.find(s => String(s.liveUserId) === String(targetUserId));
      if (targetSocket) {
        targetSocket.emit("live_offer", {
          offer,
          fromUserId: fromId,
          isInstructor: socket.isLiveInstructor,
        });
      }
    });
  });

  // WebRTC Signaling: Answer
  socket.on("live_answer", ({ targetUserId, answer, sessionRoomId }) => {
    const roomName = `live_${sessionRoomId}`;
    const fromId = socket.liveUserId;
    io.in(roomName).fetchSockets().then(sockets => {
      const targetSocket = sockets.find(s => String(s.liveUserId) === String(targetUserId));
      if (targetSocket) {
        targetSocket.emit("live_answer", {
          answer,
          fromUserId: fromId,
        });
      }
    });
  });

  // WebRTC Signaling: ICE Candidate
  socket.on("live_ice_candidate", ({ targetUserId, candidate, sessionRoomId }) => {
    const roomName = `live_${sessionRoomId}`;
    io.in(roomName).fetchSockets().then(sockets => {
      const targetSocket = sockets.find(s => String(s.liveUserId) === String(targetUserId));
      if (targetSocket) {
        targetSocket.emit("live_ice_candidate", {
          candidate,
          fromUserId: socket.liveUserId,
        });
      }
    });
  });

  // Instructor signals media readiness
  socket.on("live_instructor_ready", async ({ sessionRoomId }) => {
    socket.liveMediaReady = true;
    socket.liveHasVideo = true;
    socket.liveHasAudio = true;
    const roomName = `live_${sessionRoomId}`;
    console.log(`[LIVE] Instructor ${socket.liveUserName} media ready`);
    socket.to(roomName).emit("live_peer_media_ready", {
      userId: socket.liveUserId,
      name: socket.liveUserName,
      hasVideo: true,
      hasAudio: true,
      isInstructor: true,
    });
    const participantList = await buildParticipantList(roomName);
    io.to(roomName).emit("live_participants", participantList);
  });

  // Student signals media readiness (camera/mic turned on)
  socket.on("live_student_media_ready", async ({ sessionRoomId, hasVideo, hasAudio }) => {
    socket.liveMediaReady = true;
    socket.liveHasVideo = hasVideo;
    socket.liveHasAudio = hasAudio;
    const roomName = `live_${sessionRoomId}`;
    console.log(`[LIVE] Student ${socket.liveUserName} media ready (video:${hasVideo} audio:${hasAudio})`);
    socket.to(roomName).emit("live_peer_media_ready", {
      userId: socket.liveUserId,
      name: socket.liveUserName,
      hasVideo,
      hasAudio,
      isInstructor: false,
    });
    const participantList = await buildParticipantList(roomName);
    io.to(roomName).emit("live_participants", participantList);
  });

  // Student stopped all media (camera + mic off)
  socket.on("live_student_media_stopped", async ({ sessionRoomId }) => {
    socket.liveMediaReady = false;
    socket.liveHasVideo = false;
    socket.liveHasAudio = false;
    const roomName = `live_${sessionRoomId}`;
    console.log(`[LIVE] Student ${socket.liveUserName} stopped media`);
    socket.to(roomName).emit("live_peer_media_stopped", {
      userId: socket.liveUserId,
    });
    const participantList = await buildParticipantList(roomName);
    io.to(roomName).emit("live_participants", participantList);
  });

  // Media state change (toggle without creating/destroying peers)
  socket.on("live_media_state_changed", async ({ sessionRoomId, hasVideo, hasAudio }) => {
    socket.liveHasVideo = hasVideo;
    socket.liveHasAudio = hasAudio;
    const roomName = `live_${sessionRoomId}`;
    io.to(roomName).emit("live_media_state_update", {
      userId: socket.liveUserId,
      hasVideo,
      hasAudio,
    });
    const participantList = await buildParticipantList(roomName);
    io.to(roomName).emit("live_participants", participantList);
  });

  // Peer connection request relay (generic — works for instructor AND students)
  socket.on("live_request_connection", ({ targetUserId, sessionRoomId }) => {
    const roomName = `live_${sessionRoomId}`;
    const fromId = socket.liveUserId;
    io.in(roomName).fetchSockets().then(sockets => {
      const targetSocket = sockets.find(s => String(s.liveUserId) === String(targetUserId));
      if (targetSocket) {
        targetSocket.emit("live_request_connection", { fromUserId: fromId });
      }
    });
  });

  // Raise hand
  socket.on("live_raise_hand", async ({ sessionRoomId }) => {
    socket.liveHandRaised = true;
    const roomName = `live_${sessionRoomId}`;
    io.to(roomName).emit("live_hand_raised", {
      userId: socket.liveUserId,
      name: socket.liveUserName,
      timestamp: Date.now(),
    });
    const participantList = await buildParticipantList(roomName);
    io.to(roomName).emit("live_participants", participantList);
  });

  // Lower hand
  socket.on("live_lower_hand", async ({ sessionRoomId }) => {
    socket.liveHandRaised = false;
    const roomName = `live_${sessionRoomId}`;
    io.to(roomName).emit("live_hand_lowered", {
      userId: socket.liveUserId,
    });
    const participantList = await buildParticipantList(roomName);
    io.to(roomName).emit("live_participants", participantList);
  });

  // Emoji reaction
  socket.on("live_reaction", ({ sessionRoomId, emoji }) => {
    const roomName = `live_${sessionRoomId}`;
    io.to(roomName).emit("live_reaction", {
      userId: socket.liveUserId,
      name: socket.liveUserName,
      emoji,
      id: `${socket.liveUserId}-${Date.now()}`,
    });
  });

  // Instructor: mute all students
  socket.on("live_mute_all", ({ sessionRoomId }) => {
    if (!socket.isLiveInstructor) return;
    const roomName = `live_${sessionRoomId}`;
    console.log(`[LIVE] Instructor muted all students`);
    socket.to(roomName).emit("live_force_mute");
  });

  // Instructor: remove a participant
  socket.on("live_remove_participant", async ({ sessionRoomId, targetUserId }) => {
    if (!socket.isLiveInstructor) return;
    const roomName = `live_${sessionRoomId}`;
    console.log(`[LIVE] Instructor removing participant ${targetUserId}`);
    const socketsInRoom = await io.in(roomName).fetchSockets();
    const target = socketsInRoom.find(s => String(s.liveUserId) === String(targetUserId));
    if (target) {
      // Notify the user they're being removed
      target.emit("live_removed_from_session");
      // Notify others to tear down peers
      if (target.liveMediaReady) {
        socket.to(roomName).emit("live_peer_media_stopped", {
          userId: target.liveUserId,
        });
      }
      target.leave(roomName);
      target.liveRoom = null;
      target.liveSessionId = null;
      target.liveMediaReady = false;
      // Update participant list
      const participantList = await buildParticipantList(roomName);
      io.to(roomName).emit("live_participants", participantList);
    }
  });

  // Screen share state change
  socket.on("live_screen_share", ({ sessionRoomId, isSharing }) => {
    const roomName = `live_${sessionRoomId}`;
    io.to(roomName).emit("live_screen_share_status", {
      userId: socket.liveUserId,
      isSharing,
    });
  });

  // Live session chat message
  socket.on("live_chat_message", async ({ sessionId, userId, text }) => {
    try {
      const newMsg = await LiveChatMessage.create({ sessionId, userId, text });
      const populated = await newMsg.populate('userId', 'name photoUrl');

      const session = await LiveSession.findById(sessionId);
      const roomName = `live_${session.roomId}`;
      io.to(roomName).emit("live_chat_message", populated);
    } catch (err) {
      console.error("Error sending live chat:", err);
    }
  });

  // Live session typing indicator
  socket.on("live_typing", ({ sessionRoomId, userId, userName, isTyping }) => {
    const roomName = `live_${sessionRoomId}`;
    socket.to(roomName).emit("live_user_typing", { userId, userName, isTyping });
  });

  // ============ END LIVE SESSION EVENTS ============

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    (async () => {
      try {
        // Update online users for each joined course chat
        for (const courseId of socket.joinedCourses) {
          const socketsInRoom = await io.in(courseId).fetchSockets();
          const users = socketsInRoom.map((s) => s.userInfo).filter(Boolean);
          io.to(courseId).emit("online_users", users);
        }
        // Update live session participant list if in a live room
        if (socket.liveRoom) {
          // Notify others to tear down peers for this disconnected user
          if (socket.liveMediaReady) {
            io.to(socket.liveRoom).emit("live_peer_media_stopped", {
              userId: socket.liveUserId,
            });
          }
          const participantList = await buildParticipantList(socket.liveRoom);
          io.to(socket.liveRoom).emit("live_participants", participantList);
        }
      } catch (err) {
        console.error("Error on disconnect cleanup:", err);
      }
    })();
  });
});

// Database connection
connectDB();

// Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/media", mediaroute);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/course", courseRouter);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/progress", CourseProgressRoute);
app.use("/api/v1/userManagement", userManagementRoutes);
app.use("/api/v1/module", moduleRouter);
app.use("/api/v1/resource", resourceRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/live-sessions", liveSessionRouter);
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is alive 🚀",
    time: new Date().toISOString(),
  });
});


// Global error handler (catches Multer errors, etc.)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ message: 'File too large. Maximum size is 100MB.' });
    }
    return res.status(400).json({ message: err.message });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
