import mongoose from "mongoose";    
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    }
    ,
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["instructor","student"],
        default:'student'
    },
    enrolledCourses:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Course",

        }
    ],
    photoUrl:{
        type:String,
        default:"",

    },
    onboardedAsInstructor: {
      type: Boolean,
      default: false,
    },
    instructorOnboardingAnswers: {
      type: [String], // or [{question: String, answer: String}] for more detail
      default: [],
    },
    walletBalance: {
        type: Number,
        default: 0
    },
    walletTransactions: [
        {
            type: {
                type: String,
                enum: ['credit','payout'], // only credit since no withdraw
                default: "credit"
            },
            amount: Number,
            courseId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course"
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
    ]
    ,
    // Notification preferences: global toggle + per-course overrides
    notificationPreferences: {
        global: {
            type: Boolean,
            default: true
        },
        courses: [
            {
                courseId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Course"
                },
                enabled: {
                    type: Boolean,
                    default: true
                }
            }
        ]
    }
},{timestamps: true},);


export const User = mongoose.model("User", userSchema);
