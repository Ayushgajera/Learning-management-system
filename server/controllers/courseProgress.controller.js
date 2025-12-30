import CourseProgress from "../models/courseProgress.model.js";
import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js"
import { Resource } from "../models/resource.model.js";

export const getCourseProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.id;

        console.log(`[getCourseProgress] Request received. CourseId: ${courseId}, UserId: ${userId}`);

        if (!userId) {
            console.error("[getCourseProgress] User ID missing from request.");
            return res.status(400).json({ message: "User not authenticated or ID missing" });
        }

        // 🔐 Check if user is enrolled in the course or is the creator
        console.log("[getCourseProgress] Fetching user...");
        const user = await User.findById(userId);
        if (!user) {
            console.error(`[getCourseProgress] User not found: ${userId}`);
            return res.status(404).json({ message: "User not found" });
        }

        console.log("[getCourseProgress] Fetching course (basic info)...");
        const course = await Course.findById(courseId);
        if (!course) {
            console.error(`[getCourseProgress] Course not found: ${courseId}`);
            return res.status(404).json({ message: "Course not found" });
        }

        const isCreator = course.creator?.toString() === userId;
        const hasEnrolled = user.enrolledCourses?.some(
            (enrolledId) => enrolledId?.toString() === courseId
        );

        console.log(`[getCourseProgress] isCreator: ${isCreator}, hasEnrolled: ${hasEnrolled}`);

        if (!hasEnrolled && !isCreator) {
            // Check if course is actually an array of objectIds or strings
            return res.status(403).json({ message: "Access denied. Please enroll in the course." });
        }

        // ✅ Fetch course progress
        console.log("[getCourseProgress] Fetching CourseProgress...");
        let courseProgress = await CourseProgress.findOne({ userId, courseId });
        console.log("[getCourseProgress] CourseProgress found:", !!courseProgress);

        console.log("[getCourseProgress] Fetching full CourseDetails with generic populate...");
        // Use a simpler populate first to isolate issues
        const courseDetails = await Course.findById(courseId)
            .populate({
                path: "modules",
                populate: {
                    path: "lectures",
                    populate: {
                        path: "resources"
                    }
                }
            })
            .populate("creator");

        if (!courseDetails) {
            console.error("[getCourseProgress] Detailed Course not found.");
            return res.status(404).json({ message: "Course not found" });
        }

        console.log("[getCourseProgress] CourseDetails fetched successfully.");

        if (!courseProgress) {
            return res.status(200).json({
                data: {
                    courseDetails,
                    progress: [],
                    completed: false,
                },
            });
        }

        return res.status(200).json({
            data: {
                courseDetails,
                progress: courseProgress.lectureProgress,
                completed: courseProgress.completed,
            },
        });
    } catch (error) {
        console.error("[getCourseProgress] FATAL ERROR:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const updateCourseProgress = async (req, res) => {
    try {
        const { courseId, lectureId } = req.params;
        const userId = req.id;

        // 1. Fetch the course to get the total number of lectures
        const course = await Course.findById(courseId).populate({
            path: 'modules',
            populate: { path: 'lectures' }
        });
        if (!course) {
            return res.status(404).json({ message: "Course not found." });
        }

        // Find or create course progress for the user
        let courseProgress = await CourseProgress.findOne({ userId, courseId });

        if (!courseProgress) {
            // If no progress exists, create a new record
            courseProgress = new CourseProgress({
                userId,
                courseId,
                lectureProgress: [],
                completed: false
            });
        }

        // Find the lecture progress in the course progress
        const lectureIndex = courseProgress.lectureProgress.findIndex(lp => lp.lectureId.toString() === lectureId);

        if (lectureIndex !== -1) {
            // Update an existing lecture progress record
            courseProgress.lectureProgress[lectureIndex].viewed = true;
        } else {
            // Add a new lecture progress record
            courseProgress.lectureProgress.push({ lectureId, viewed: true });
        }

        // 2. Fix the bug: Only mark as complete if ALL lectures have been viewed
        // Flatten lectures from all modules
        const totalLectures = course.modules.reduce((acc, module) => {
            return acc + (module.lectures ? module.lectures.length : 0);
        }, 0);

        const allLecturesViewed =
            totalLectures > 0 && // Ensure the course has at least one lecture
            courseProgress.lectureProgress.length === totalLectures;

        // Final check to make sure all lectures in the progress array are viewed
        const allMarkedViewed = courseProgress.lectureProgress.every(lp => lp.viewed);

        if (allLecturesViewed && allMarkedViewed) {
            courseProgress.completed = true;
        }

        await courseProgress.save();

        res.status(200).json({
            message: "Course progress updated successfully",
            data: {
                completed: courseProgress.completed,
                progress: courseProgress.lectureProgress
            }
        });
    } catch (error) {
        console.error("Error updating course progress:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const markAsCompleted = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.id;

        // Find the course progress for the user
        let courseProgress = await CourseProgress.findOne({ userId, courseId });

        if (!courseProgress) {
            // Create new progress if not found
            // First verify user is enrolled (optional but good practice, though usually middleware handles access)
            courseProgress = new CourseProgress({
                userId,
                courseId,
                lectureProgress: [],
                completed: false
            });
        }

        // Fetch course lectures to ensure we populate all lectures as viewed
        const course = await Course.findById(courseId).populate({
            path: 'modules',
            populate: { path: 'lectures' }
        });
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Mark all lectures as viewed
        // If lectureProgress is empty or partial, we need to ensure ALL lectures are in there marked true
        // Better approach: rebuild lectureProgress based on course.lectures
        const allLectures = course.modules.flatMap(m => m.lectures || []);

        if (allLectures.length > 0) {
            const allLecturesProgress = allLectures.map(lecture => ({
                lectureId: lecture._id,
                viewed: true
            }));
            courseProgress.lectureProgress = allLecturesProgress;
        }

        // Mark the course as completed
        courseProgress.completed = true;
        await courseProgress.save();

        res.status(200).json({
            message: "Course marked as completed",
            data: {
                completed: courseProgress.completed,
                progress: courseProgress.lectureProgress
            }
        });
    } catch (error) {
        console.error("Error marking course as completed:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const markAsInCompleted = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.id;

        // Find the course progress for the user
        let courseProgress = await CourseProgress.findOne({ userId, courseId });

        if (!courseProgress) {
            // If really not found, it's effectively incomplete already, but let's create it for consistency
            courseProgress = new CourseProgress({
                userId,
                courseId,
                lectureProgress: [],
                completed: false
            });
        }

        courseProgress.lectureProgress.forEach(lp => {
            lp.viewed = false;
        });

        // Mark the course as incomplete
        courseProgress.completed = false;
        await courseProgress.save();

        res.status(200).json({
            message: "Course marked as incomplete",
            data: {
                completed: courseProgress.completed,
                progress: courseProgress.lectureProgress
            }
        });
    } catch (error) {
        console.error("Error marking course as incomplete:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};