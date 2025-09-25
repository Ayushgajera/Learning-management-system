import mongoose from 'mongoose';   

const purchaseCourseSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,   
        ref: 'User',                
        required: true 
    },
    instructorId: { // NEW
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false // existing entries may not have it yet
  },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    purchaseDate: {
        type: Date,
        default: Date.now
    },
    paymentId: {
        type: String,
        required: true
    }

}, { timestamps: true });

export const PurchaseCourse = mongoose.model('PurchaseCourse', purchaseCourseSchema);