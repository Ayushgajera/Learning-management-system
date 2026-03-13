import { User } from "../models/user.model.js";
import { Course } from "../models/course.model.js";
import { PurchaseCourse } from "../models/purchaseCourse.model.js";
import { deleteMedia, deletevideo } from "../utils/cloudinary.js";
import Lecture from "../models/lecture.model.js";
import bcrypt from "bcryptjs";

// GET /api/v1/admin/stats
export const getAdminStats = async (req, res) => {
    try {
        const [totalUsers, totalCourses, totalPurchases, usersByRole] = await Promise.all([
            User.countDocuments(),
            Course.countDocuments(),
            PurchaseCourse.aggregate([
                { $match: { status: "completed" } },
                { $group: { _id: null, totalRevenue: { $sum: "$amount" }, count: { $sum: 1 } } }
            ]),
            User.aggregate([
                { $group: { _id: "$role", count: { $sum: 1 } } }
            ])
        ]);

        const totalEnrollments = await Course.aggregate([
            { $project: { enrolled: { $size: { $ifNull: ["$enrolledStudents", []] } } } },
            { $group: { _id: null, total: { $sum: "$enrolled" } } }
        ]);

        const publishedCourses = await Course.countDocuments({ ispublished: true });

        const roleMap = {};
        usersByRole.forEach(r => { roleMap[r._id] = r.count; });

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalStudents: roleMap.student || 0,
                totalInstructors: roleMap.instructor || 0,
                totalAdmins: roleMap.admin || 0,
                totalCourses,
                publishedCourses,
                draftCourses: totalCourses - publishedCourses,
                totalRevenue: totalPurchases[0]?.totalRevenue || 0,
                totalPurchases: totalPurchases[0]?.count || 0,
                totalEnrollments: totalEnrollments[0]?.total || 0
            }
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// GET /api/v1/admin/users
export const getAllPlatformUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = "", role = "" } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }
        if (role && role !== "all") {
            query.role = role;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [users, total] = await Promise.all([
            User.find(query)
                .select("-password")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            User.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            users,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        console.error("Error fetching platform users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// PUT /api/v1/admin/users/:userId/role
export const updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { newRole } = req.body;

        if (!["student", "instructor", "admin"].includes(newRole)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.role = newRole;
        user.activeRole = newRole;
        if (!user.roles.includes(newRole)) {
            user.roles.push(newRole);
        }
        await user.save();

        res.status(200).json({
            success: true,
            message: `User role updated to ${newRole}`,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// DELETE /api/v1/admin/users/:userId
export const deleteUserAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Prevent deleting yourself
        if (userId === req.id) {
            return res.status(400).json({ message: "Cannot delete your own account" });
        }

        // Remove user from all enrolled courses
        await Course.updateMany(
            { enrolledStudents: userId },
            { $pull: { enrolledStudents: userId } }
        );

        await User.findByIdAndDelete(userId);

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// GET /api/v1/admin/courses
export const getAllPlatformCourses = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = "", status = "" } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { courseTitle: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } }
            ];
        }
        if (status === "published") query.ispublished = true;
        if (status === "draft") query.ispublished = false;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [courses, total] = await Promise.all([
            Course.find(query)
                .populate("creator", "name email photoUrl")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Course.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            courses,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        console.error("Error fetching platform courses:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// PATCH /api/v1/admin/courses/:courseId/toggle-publish
export const toggleCoursePublish = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        course.ispublished = !course.ispublished;
        await course.save();

        res.status(200).json({
            success: true,
            message: `Course ${course.ispublished ? "published" : "unpublished"} successfully`,
            course
        });
    } catch (error) {
        console.error("Error toggling course publish:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// DELETE /api/v1/admin/courses/:courseId
export const deleteCourseAdmin = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Delete thumbnail from cloudinary
        if (course.courseThumbnail) {
            try {
                const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
                await deleteMedia(publicId);
            } catch (e) {
                console.error("Error deleting thumbnail:", e);
            }
        }

        // Delete lectures
        await Lecture.deleteMany({ _id: { $in: course.lectures || [] } });

        // Remove course from enrolled users
        await User.updateMany(
            { enrolledCourses: courseId },
            { $pull: { enrolledCourses: courseId } }
        );

        await Course.findByIdAndDelete(courseId);

        res.status(200).json({
            success: true,
            message: "Course deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting course:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// GET /api/v1/admin/revenue
export const getPlatformRevenue = async (req, res) => {
    try {
        // Monthly revenue
        const monthlyRevenue = await PurchaseCourse.aggregate([
            { $match: { status: "completed" } },
            {
                $group: {
                    _id: {
                        year: { $year: "$purchaseDate" },
                        month: { $month: "$purchaseDate" }
                    },
                    revenue: { $sum: "$amount" },
                    enrollments: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const formattedMonthly = monthlyRevenue.map(item => ({
            month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
            revenue: item.revenue,
            enrollments: item.enrollments
        }));

        // Revenue by instructor
        const revenueByInstructor = await PurchaseCourse.aggregate([
            { $match: { status: "completed" } },
            {
                $group: {
                    _id: "$instructorId",
                    totalRevenue: { $sum: "$amount" },
                    totalSales: { $sum: 1 }
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "instructor"
                }
            },
            { $unwind: { path: "$instructor", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    totalRevenue: 1,
                    totalSales: 1,
                    instructorName: "$instructor.name",
                    instructorEmail: "$instructor.email"
                }
            }
        ]);

        // Top courses by revenue
        const topCourses = await PurchaseCourse.aggregate([
            { $match: { status: "completed" } },
            {
                $group: {
                    _id: "$courseId",
                    totalRevenue: { $sum: "$amount" },
                    totalSales: { $sum: 1 }
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "courses",
                    localField: "_id",
                    foreignField: "_id",
                    as: "course"
                }
            },
            { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    totalRevenue: 1,
                    totalSales: 1,
                    courseTitle: "$course.courseTitle",
                    coursePrice: "$course.coursePrice"
                }
            }
        ]);

        res.status(200).json({
            success: true,
            monthlyRevenue: formattedMonthly,
            revenueByInstructor,
            topCourses
        });
    } catch (error) {
        console.error("Error fetching platform revenue:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// GET /api/v1/admin/purchases
export const getAllPurchases = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = "" } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const matchStage = {};
        if (search) {
            // We'll filter after populate since we need to search by user/course name
        }

        const [purchases, total] = await Promise.all([
            PurchaseCourse.find(matchStage)
                .populate("userId", "name email")
                .populate("courseId", "courseTitle coursePrice")
                .populate("instructorId", "name email")
                .sort({ purchaseDate: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            PurchaseCourse.countDocuments(matchStage)
        ]);

        let filteredPurchases = purchases;
        if (search) {
            const term = search.toLowerCase();
            filteredPurchases = purchases.filter(p =>
                p.userId?.name?.toLowerCase().includes(term) ||
                p.userId?.email?.toLowerCase().includes(term) ||
                p.courseId?.courseTitle?.toLowerCase().includes(term)
            );
        }

        res.status(200).json({
            success: true,
            purchases: filteredPurchases,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        console.error("Error fetching purchases:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// POST /api/v1/admin/seed
export const seedAdmin = async (req, res) => {
    try {
        const { secret, name, email, password } = req.body;

        if (secret !== process.env.ADMIN_SEED_SECRET) {
            return res.status(403).json({ message: "Invalid seed secret" });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "admin",
            activeRole: "admin",
            roles: ["admin"]
        });

        res.status(201).json({
            success: true,
            message: "Admin user created successfully",
            admin: { _id: admin._id, name: admin.name, email: admin.email, role: admin.role }
        });
    } catch (error) {
        console.error("Error seeding admin:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// GET /api/v1/admin/instructor-applications
export const getPendingInstructors = async (req, res) => {
    try {
        const { status = 'pending' } = req.query;
        const query = {};
        if (status === 'all') {
            query.instructorApplicationStatus = { $in: ['pending', 'approved', 'rejected'] };
        } else {
            query.instructorApplicationStatus = status;
        }

        const users = await User.find(query)
            .select('-password')
            .sort({ instructorApplicationDate: -1 });

        res.status(200).json({
            success: true,
            applications: users,
            total: users.length
        });
    } catch (error) {
        console.error("Error fetching instructor applications:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// PUT /api/v1/admin/instructor-applications/:userId/approve
export const approveInstructor = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.instructorApplicationStatus !== 'pending') {
            return res.status(400).json({ message: "This application is not in pending status" });
        }

        user.instructorApplicationStatus = 'approved';
        user.onboardedAsInstructor = true;
        user.instructorOnboardingCompleted = true;
        user.roles = [...new Set([...(user.roles || []), 'instructor'])];
        if (!user.instructorProfile) user.instructorProfile = {};
        user.instructorProfile.approved = true;
        user.instructorRejectionReason = '';

        await user.save();

        res.status(200).json({
            success: true,
            message: `${user.name} has been approved as an instructor`,
            user: { _id: user._id, name: user.name, email: user.email, instructorApplicationStatus: user.instructorApplicationStatus }
        });
    } catch (error) {
        console.error("Error approving instructor:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// PUT /api/v1/admin/instructor-applications/:userId/reject
export const rejectInstructor = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.instructorApplicationStatus !== 'pending') {
            return res.status(400).json({ message: "This application is not in pending status" });
        }

        user.instructorApplicationStatus = 'rejected';
        user.instructorRejectionReason = reason || 'Your application did not meet our requirements.';

        await user.save();

        res.status(200).json({
            success: true,
            message: `${user.name}'s instructor application has been rejected`,
            user: { _id: user._id, name: user.name, email: user.email, instructorApplicationStatus: user.instructorApplicationStatus }
        });
    } catch (error) {
        console.error("Error rejecting instructor:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
