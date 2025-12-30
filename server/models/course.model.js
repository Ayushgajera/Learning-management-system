import mongoose from 'mongoose';
const courseSchema = new mongoose.Schema({
    courseTitle: {
        type: String,
        required: true,
        trim: true
    },
    subTitle: {
        type: String,
    },
    courseDescription: {
        type: String,
    },
    requirements: {
        type: [String],
        default: []
    },
    learningGoals: {
        type: [String],
        default: []
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    courseLevel: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
    },
    coursePrice: {
        type: Number,
        min: 0,
        default: 0
    },
    courseThumbnail: {
        type: String,

    },
    enrolledStudents: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
    modules: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Module',
        }
    ],
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    ispublished: {
        type: Boolean,
        default: false
    },
    averageRating: {
        type: Number,
        default: 0
    },
    totalRatings: {
        type: Number,
        default: 0
    },
    ratingDistribution: {
        type: Map,
        of: Number,
        default: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    },
    rankingScore: {
        type: Number,
        default: 0,
        index: true // Add index for sorting performance
    }
}, { timestamps: true });
export const Course = mongoose.model('Course', courseSchema);
