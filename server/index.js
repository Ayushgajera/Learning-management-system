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
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http';
import { Server } from 'socket.io';

// Models
import Message from "./models/ChatMessage.js";
import { Course } from "./models/course.model.js";
import { User } from "./models/user.model.js";

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

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // When a socket disconnects, update online users for each joined course
    (async () => {
      try {
        for (const courseId of socket.joinedCourses) {
          const socketsInRoom = await io.in(courseId).fetchSockets();
          const users = socketsInRoom.map((s) => s.userInfo).filter(Boolean);
          console.log(`Broadcasting online_users for course ${courseId} on disconnect:`, users);
          io.to(courseId).emit("online_users", users);
        }
      } catch (err) {
        console.error("Error updating online users on disconnect:", err);
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

// Start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
