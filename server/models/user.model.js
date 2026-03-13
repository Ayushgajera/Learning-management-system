import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }
    ,
    password: {
        type: String,
        required: true
    },

    // Multi-role identity model (preferred)
    // - roles: permanent capabilities the user has unlocked
    // - activeRole: current UI/permission context
    roles: {
        type: [String],
        enum: ["instructor", "student", "admin"],
        default: ["student"],
    },
    activeRole: {
        type: String,
        enum: ["instructor", "student", "admin"],
        default: "student",
    },

    instructorProfile: {
        approved: { type: Boolean, default: true },
        rating: { type: Number, default: 0 },
        totalStudents: { type: Number, default: 0 },
    },
    instructorOnboardingCompleted: {
        type: Boolean,
        default: false,
    },

    role: {
        type: String,
        enum: ["instructor", "student", "admin"],
        default: 'student'
    },
    enrolledCourses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",

        }
    ],
    wishlist: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course",
            }
        ],
        default: [],
    },
    photoUrl: {
        type: String,
        default: "",

    },
    // Instructor Reputation System
    instructorLevel: {
        type: String,
        enum: ['New Instructor', 'Level 1', 'Level 2', 'Top Instructor'],
        default: 'New Instructor'
    },
    reputationScore: {
        type: Number,
        default: 0
    },
    reputationMetrics: {
        responseRate: { type: Number, default: 0 },
        completionRate: { type: Number, default: 0 },
        avgRating: { type: Number, default: 0 },
        totalStudents: { type: Number, default: 0 }
    },
    onboardedAsInstructor: {
        type: Boolean,
        default: false,
    },
    instructorOnboardingAnswers: {
        type: [String],
        default: [],
    },
    // Admin approval workflow for instructor applications
    instructorApplicationStatus: {
        type: String,
        enum: ['none', 'pending', 'approved', 'rejected'],
        default: 'none',
    },
    instructorApplicationDate: {
        type: Date,
        default: null,
    },
    instructorRejectionReason: {
        type: String,
        default: '',
    },
    walletBalance: {
        type: Number,
        default: 0
    },
    walletTransactions: [
        {
            type: {
                type: String,
                enum: ['credit', 'payout'], // only credit since no withdraw
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
}, { timestamps: true },);


// Keep legacy `role` and new `activeRole` aligned, and ensure `roles` is always present.
userSchema.pre('validate', function (next) {
    if (!Array.isArray(this.roles) || this.roles.length === 0) {
        const fallbackRole = this.activeRole || this.role || 'student';
        this.roles = [fallbackRole];
    }

    // Only force-add 'student' for non-admin users
    if (!this.roles.includes('admin') && !this.roles.includes('student')) {
        this.roles = [...new Set([...this.roles, 'student'])];
    }

    if (this.activeRole) {
        this.role = this.activeRole;
    } else if (this.role) {
        this.activeRole = this.role;
    }

    next();
});


export const User = mongoose.model("User", userSchema);
