import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Course } from "../models/course.model.js";
import Message from "../models/ChatMessage.js";
import { PurchaseCourse } from "../models/purchaseCourse.model.js";
import CourseProgress from "../models/courseProgress.model.js";

/**
 * Calculates and updates the reputation score and level for an instructor.
 * @param {string} instructorId 
 */
export const calculateInstructorReputation = async (instructorId) => {
    try {
        const objectId = new mongoose.Types.ObjectId(instructorId);

        // 1. Fetch Instructor's Courses
        const courses = await Course.find({ creator: objectId });
        const courseIds = courses.map(c => c._id);

        if (courses.length === 0) {
            return { score: 0, level: 'New Instructor' };
        }

        // --- FACTOR 1: Average Rating (40%) ---
        // Aggregate ratings across all courses
        const totalRatingSum = courses.reduce((acc, curr) => acc + (curr.averageRating || 0) * (curr.totalRatings || 0), 0);
        const totalRatingsCount = courses.reduce((acc, curr) => acc + (curr.totalRatings || 0), 0);

        let avgRating = 0;
        if (totalRatingsCount > 0) {
            avgRating = totalRatingSum / totalRatingsCount;
        }

        // Normalize Rating Score (0-100)
        // 5 stars = 100, 1 star = 20
        const ratingScore = (avgRating / 5) * 100;


        // --- FACTOR 2: Completion Rate (30%) ---
        // Get all enrollments for these courses
        const totalEnrollments = await PurchaseCourse.countDocuments({
            courseId: { $in: courseIds },
            status: 'completed' // Assuming 'completed' means purchased/valid enrollment
        });

        // Get completed progress records
        // Note: CourseProgress 'completed: true' means user finished course
        const completedProgressCount = await CourseProgress.countDocuments({
            courseId: { $in: courseIds },
            completed: true
        });

        let completionRate = 0;
        if (totalEnrollments > 0) {
            completionRate = (completedProgressCount / totalEnrollments);
        }

        // Normalize (0-100)
        const completionScore = completionRate * 100;


        // --- FACTOR 3: Response Time (20%) ---
        // Find messages in instructor's courses where they replied
        // We look for messages from Instructor in their Course Chats that are replies
        // NOTE: This is an estimation. Real extraction might be complex depending on schema.
        // Simplified: Find messages where `userId` is instructor and `replyTo` is NOT null

        const instructorReplies = await Message.find({
            userId: objectId,
            replyTo: { $ne: null },
            courseId: { $in: courseIds }
        }).populate('replyTo');

        let totalResponseHours = 0;
        let validReplyCount = 0;

        instructorReplies.forEach(reply => {
            if (reply.replyTo && reply.replyTo.timestamp) {
                const askedTime = new Date(reply.replyTo.timestamp).getTime();
                const repliedTime = new Date(reply.timestamp).getTime();
                const diffHours = (repliedTime - askedTime) / (1000 * 60 * 60);

                if (diffHours > 0) { // sanity check
                    totalResponseHours += diffHours;
                    validReplyCount++;
                }
            }
        });

        let avgResponseHours = 24; // Default penalty if no data
        if (validReplyCount > 0) {
            avgResponseHours = totalResponseHours / validReplyCount;
        }

        // Normalize: Faster is better. 
        // 0-2 hours = 100
        // 24 hours = 50
        // 48+ hours = 0
        let responseScore = 0;
        if (avgResponseHours <= 2) {
            responseScore = 100;
        } else if (avgResponseHours >= 48) {
            responseScore = 0;
        } else {
            // Linear decay between 2h and 48h
            // Slope = (0 - 100) / (48 - 2) = -100 / 46 = -2.17
            responseScore = 100 - ((avgResponseHours - 2) * (100 / 46));
        }


        // --- FACTOR 4: Total Students (10%) ---
        // Use totalEnrollments from above
        // Cap at 100 students for max score (MVP)
        const studentScore = Math.min(100, totalEnrollments);


        // --- FINAL CALCULATION ---
        const finalScore = (ratingScore * 0.40) +
            (completionScore * 0.30) +
            (responseScore * 0.20) +
            (studentScore * 0.10);

        // --- LEVEL ASSIGNMENT ---
        let level = 'New Instructor';
        if (finalScore >= 80) level = 'Top Instructor';
        else if (finalScore >= 60) level = 'Level 2';
        else if (finalScore >= 40) level = 'Level 1';


        // Update User
        await User.findByIdAndUpdate(instructorId, {
            instructorLevel: level,
            reputationScore: Math.round(finalScore),
            reputationMetrics: {
                avgRating: parseFloat(avgRating.toFixed(1)),
                completionRate: parseFloat((completionRate * 100).toFixed(1)),
                responseRate: parseFloat(avgResponseHours.toFixed(1)), // Storing hours actually
                totalStudents: totalEnrollments
            }
        });

        return {
            level,
            score: Math.round(finalScore),
            metrics: {
                avgRating,
                completionRate,
                avgResponseHours,
                totalStudents: totalEnrollments
            }
        };

    } catch (error) {
        console.error("Error calculating reputation:", error);
        throw error;
    }
};
