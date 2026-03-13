import { LiveSession } from "../models/liveSession.model.js";
import { Course } from "../models/course.model.js";
import { Module } from "../models/module.model.js";
import Lecture from "../models/lecture.model.js";
import LiveChatMessage from "../models/liveChatMessage.model.js";

export const createLiveSession = async (req, res) => {
    try {
        const { title, description, courseId, scheduledAt, duration } = req.body;

        if (!title || !courseId || !scheduledAt || !duration) {
            return res.status(400).json({ message: "Title, course, scheduled time, and duration are required." });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found." });
        }

        if (course.creator.toString() !== req.id) {
            return res.status(403).json({ message: "You can only create sessions for your own courses." });
        }

        if (new Date(scheduledAt) <= new Date()) {
            return res.status(400).json({ message: "Scheduled time must be in the future." });
        }

        const session = await LiveSession.create({
            title,
            description: description || '',
            courseId,
            instructorId: req.id,
            scheduledAt: new Date(scheduledAt),
            duration: Number(duration),
        });

        return res.status(201).json({ session, message: "Live session scheduled successfully." });
    } catch (error) {
        console.error("Error creating live session:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

export const getSessionsByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const sessions = await LiveSession.find({
            courseId,
            status: { $ne: 'cancelled' }
        })
            .sort({ scheduledAt: 1 })
            .populate('instructorId', 'name photoUrl');

        return res.status(200).json({ sessions });
    } catch (error) {
        console.error("Error getting sessions by course:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

export const getUpcomingSessionsForStudent = async (req, res) => {
    try {
        // Find courses where user is enrolled
        const enrolledCourses = await Course.find({ enrolledStudents: req.id }).select('_id');
        const enrolledCourseIds = enrolledCourses.map(c => c._id);

        const sessions = await LiveSession.find({
            courseId: { $in: enrolledCourseIds },
            status: { $in: ['scheduled', 'live'] },
            scheduledAt: { $gte: new Date(Date.now() - 3600000) }
        })
            .sort({ scheduledAt: 1 })
            .populate('courseId', 'courseTitle courseThumbnail')
            .populate('instructorId', 'name photoUrl');

        return res.status(200).json({ sessions });
    } catch (error) {
        console.error("Error getting upcoming sessions for student:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

export const getUpcomingSessionsForInstructor = async (req, res) => {
    try {
        const sessions = await LiveSession.find({
            instructorId: req.id,
            status: { $in: ['scheduled', 'live'] }
        })
            .sort({ scheduledAt: 1 })
            .populate('courseId', 'courseTitle courseThumbnail');

        return res.status(200).json({ sessions });
    } catch (error) {
        console.error("Error getting upcoming sessions for instructor:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

export const getSessionById = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await LiveSession.findById(sessionId)
            .populate('courseId', 'courseTitle courseThumbnail enrolledStudents creator')
            .populate('instructorId', 'name photoUrl');

        if (!session) {
            return res.status(404).json({ message: "Session not found." });
        }

        return res.status(200).json({ session });
    } catch (error) {
        console.error("Error getting session by ID:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

export const updateLiveSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { title, description, scheduledAt, duration } = req.body;

        const session = await LiveSession.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: "Session not found." });
        }

        if (session.instructorId.toString() !== req.id) {
            return res.status(403).json({ message: "Not authorized." });
        }

        if (session.status !== 'scheduled') {
            return res.status(400).json({ message: "Can only edit scheduled sessions." });
        }

        if (title) session.title = title;
        if (description !== undefined) session.description = description;
        if (scheduledAt) {
            if (new Date(scheduledAt) <= new Date()) {
                return res.status(400).json({ message: "Scheduled time must be in the future." });
            }
            session.scheduledAt = new Date(scheduledAt);
        }
        if (duration) session.duration = Number(duration);

        await session.save();

        return res.status(200).json({ session, message: "Session updated successfully." });
    } catch (error) {
        console.error("Error updating live session:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

export const cancelLiveSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await LiveSession.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: "Session not found." });
        }

        if (session.instructorId.toString() !== req.id) {
            return res.status(403).json({ message: "Not authorized." });
        }

        if (session.status === 'ended' || session.status === 'cancelled') {
            return res.status(400).json({ message: "Session is already ended or cancelled." });
        }

        session.status = 'cancelled';
        await session.save();

        const io = req.app.get("io");
        io.to(session.courseId.toString()).emit("live_session_cancelled", {
            sessionId: session._id,
            title: session.title
        });

        return res.status(200).json({ session, message: "Session cancelled." });
    } catch (error) {
        console.error("Error cancelling live session:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

export const startLiveSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await LiveSession.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: "Session not found." });
        }

        if (session.instructorId.toString() !== req.id) {
            return res.status(403).json({ message: "Not authorized." });
        }

        if (session.status !== 'scheduled') {
            return res.status(400).json({ message: "Can only start scheduled sessions." });
        }

        session.status = 'live';
        session.startedAt = new Date();
        await session.save();

        const io = req.app.get("io");
        io.to(session.courseId.toString()).emit("live_session_started", {
            sessionId: session._id,
            title: session.title,
            roomId: session.roomId,
            courseId: session.courseId
        });

        return res.status(200).json({ session, message: "Session is now live!" });
    } catch (error) {
        console.error("Error starting live session:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

export const endLiveSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await LiveSession.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: "Session not found." });
        }

        if (session.instructorId.toString() !== req.id) {
            return res.status(403).json({ message: "Not authorized." });
        }

        if (session.status !== 'live') {
            return res.status(400).json({ message: "Can only end live sessions." });
        }

        session.status = 'ended';
        session.endedAt = new Date();
        await session.save();

        const io = req.app.get("io");
        io.to(`live_${session.roomId}`).emit("live_session_ended", {
            sessionId: session._id,
            title: session.title
        });

        return res.status(200).json({ session, message: "Session ended." });
    } catch (error) {
        console.error("Error ending live session:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

export const uploadRecording = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { recordingUrl, recordingPublicId } = req.body;

        if (!recordingUrl) {
            return res.status(400).json({ message: "Recording URL is required." });
        }

        const session = await LiveSession.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: "Session not found." });
        }

        if (session.instructorId.toString() !== req.id) {
            return res.status(403).json({ message: "Not authorized." });
        }

        session.recordingUrl = recordingUrl;
        session.recordingPublicId = recordingPublicId || null;

        // Find or create "Live Recordings" module for the course
        let recordingsModule = await Module.findOne({
            courseId: session.courseId,
            moduleTitle: "Live Recordings"
        });

        if (!recordingsModule) {
            recordingsModule = await Module.create({
                moduleTitle: "Live Recordings",
                description: "Recordings from live sessions",
                courseId: session.courseId,
                isPublished: true
            });
            const course = await Course.findById(session.courseId);
            course.modules.push(recordingsModule._id);
            await course.save();
        } else if (!recordingsModule.isPublished) {
            recordingsModule.isPublished = true;
            await recordingsModule.save();
        }

        // Create lecture from recording
        const dateStr = new Date(session.scheduledAt).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
        const lecture = await Lecture.create({
            lectureTitle: `[Recording] ${session.title} - ${dateStr}`,
            videoUrl: recordingUrl,
            publicID: recordingPublicId || null,
            isPreviewFree: false,
            moduleId: recordingsModule._id
        });

        recordingsModule.lectures.push(lecture._id);
        await recordingsModule.save();

        session.recordingLectureId = lecture._id;
        await session.save();

        return res.status(200).json({
            session,
            lecture,
            message: "Recording uploaded and lecture created successfully."
        });
    } catch (error) {
        console.error("Error uploading recording:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

export const getSessionChatHistory = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const messages = await LiveChatMessage.find({ sessionId })
            .populate('userId', 'name photoUrl')
            .sort({ timestamp: 1 })
            .limit(500);

        return res.status(200).json({ messages });
    } catch (error) {
        console.error("Error getting session chat history:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

export const getSessionHistoryForInstructor = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const filter = {
            instructorId: req.id,
            status: { $in: ['ended', 'cancelled'] }
        };

        const [sessions, total] = await Promise.all([
            LiveSession.find(filter)
                .sort({ scheduledAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('courseId', 'courseTitle courseThumbnail'),
            LiveSession.countDocuments(filter)
        ]);

        const enriched = sessions.map(s => {
            const obj = s.toObject();
            obj.participantCount = s.participants ? s.participants.length : 0;
            if (s.startedAt && s.endedAt) {
                obj.actualDurationMinutes = Math.round((new Date(s.endedAt) - new Date(s.startedAt)) / 60000);
            }
            return obj;
        });

        return res.status(200).json({
            sessions: enriched,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error("Error getting session history for instructor:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};
