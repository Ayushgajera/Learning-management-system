import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
    moduleTitle: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    lectures: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lecture'
    }],
    order: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const Module = mongoose.model('Module', moduleSchema);
