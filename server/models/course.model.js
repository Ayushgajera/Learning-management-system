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
    category: {
        type: String,
        required: true,
        trim: true
    },
    courseLevel: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced','Expert']
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
    lectures: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lecture',
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
},{timestamps: true});
export const Course = mongoose.model('Course', courseSchema);
