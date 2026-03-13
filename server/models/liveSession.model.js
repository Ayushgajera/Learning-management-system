import mongoose from 'mongoose';
import crypto from 'crypto';

const liveSessionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    instructorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    scheduledAt: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true,
        min: 5,
        max: 480
    },
    status: {
        type: String,
        enum: ['scheduled', 'live', 'ended', 'cancelled'],
        default: 'scheduled'
    },
    roomId: {
        type: String,
        unique: true,
        default: () => crypto.randomBytes(16).toString('hex')
    },
    recordingUrl: {
        type: String,
        default: null
    },
    recordingPublicId: {
        type: String,
        default: null
    },
    recordingLectureId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lecture',
        default: null
    },
    participants: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        leftAt: {
            type: Date,
            default: null
        }
    }],
    startedAt: {
        type: Date,
        default: null
    },
    endedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

liveSessionSchema.index({ courseId: 1, scheduledAt: 1 });
liveSessionSchema.index({ instructorId: 1, scheduledAt: 1 });
liveSessionSchema.index({ status: 1, scheduledAt: 1 });
liveSessionSchema.index({ roomId: 1 });

export const LiveSession = mongoose.model('LiveSession', liveSessionSchema);
