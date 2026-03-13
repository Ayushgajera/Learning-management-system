import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import {
    createLiveSession,
    getSessionsByCourse,
    getUpcomingSessionsForStudent,
    getUpcomingSessionsForInstructor,
    getSessionHistoryForInstructor,
    getSessionById,
    updateLiveSession,
    cancelLiveSession,
    startLiveSession,
    endLiveSession,
    uploadRecording,
    getSessionChatHistory
} from '../controllers/liveSession.controller.js';

const router = express.Router();

// Instructor-only routes
router.post('/', isAuthenticated, authorizeRoles("instructor"), createLiveSession);
router.get('/instructor/upcoming', isAuthenticated, authorizeRoles("instructor"), getUpcomingSessionsForInstructor);
router.get('/instructor/history', isAuthenticated, authorizeRoles("instructor"), getSessionHistoryForInstructor);
router.put('/:sessionId', isAuthenticated, authorizeRoles("instructor"), updateLiveSession);
router.patch('/:sessionId/cancel', isAuthenticated, authorizeRoles("instructor"), cancelLiveSession);
router.patch('/:sessionId/start', isAuthenticated, authorizeRoles("instructor"), startLiveSession);
router.patch('/:sessionId/end', isAuthenticated, authorizeRoles("instructor"), endLiveSession);
router.post('/:sessionId/recording', isAuthenticated, authorizeRoles("instructor"), uploadRecording);

// Shared routes
router.get('/student/upcoming', isAuthenticated, getUpcomingSessionsForStudent);
router.get('/course/:courseId', isAuthenticated, getSessionsByCourse);
router.get('/:sessionId', isAuthenticated, getSessionById);
router.get('/:sessionId/chat', isAuthenticated, getSessionChatHistory);

export default router;
