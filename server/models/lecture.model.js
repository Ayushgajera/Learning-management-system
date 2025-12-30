import mongoose from 'mongoose';
const lectureSchema = new mongoose.Schema({
    lectureTitle: {
        type: String,
        required: true,
        trim: true,
    },
    videoUrl: {
        type: String,
        trim: true,
        default: null,
    },
    publicID: {
        type: String,
    },
    isPreviewFree: {
        type: Boolean,
        default: false,
    },
    moduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module'
    },
    resources: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource'
    }],
    duration: {
        type: Number, // Duration in seconds
        default: 0
    },
}, { timestamps: true });
const Lecture = mongoose.model('Lecture', lectureSchema);
export default Lecture;