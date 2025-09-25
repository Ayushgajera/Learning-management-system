import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
  type: String,
  trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
  ,
  file: {
    type: String,
  },
  fileType: {
    type: String,
  },
  fileName: {
    type: String,
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null,
  },
  reactions: [
    {
      emoji: String,
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      userName: String,
    }
  ],
  pinned: {
    type: Boolean,
    default: false,
  },
  edited: {
    type: Boolean,
    default: false,
  }
  ,
  // Code snippet support
  isCode: {
    type: Boolean,
    default: false,
  },
  code: {
    type: String,
  },
  codeLang: {
    type: String,
  }
  ,
  // Mentions (store usernames or identifiers found in message)
  mentions: [
    {
      type: String,
    }
  ]
});

const Message = mongoose.model("Message", messageSchema);
export default Message;
