import mongoose from 'mongoose';

const liveChatMessageSchema = new mongoose.Schema({
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LiveSession',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

liveChatMessageSchema.index({ sessionId: 1, timestamp: 1 });

const LiveChatMessage = mongoose.model('LiveChatMessage', liveChatMessageSchema);
export default LiveChatMessage;
