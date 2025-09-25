import express from 'express';
import { getCourseProgress, markAsCompleted, markAsInCompleted, updateCourseProgress } from '../controllers/courseProgress.controller.js';
import isAuthenticated from '../middleware/isAuthenticated.js';

const router = express.Router();

router.route('/:courseId').get(isAuthenticated,getCourseProgress);
router.route('/:courseId/lecture/:lectureId/view').post(isAuthenticated,updateCourseProgress);
router.route('/:courseId/complete').post(isAuthenticated,markAsCompleted);
router.route('/:courseId/incomplete').post(isAuthenticated,markAsInCompleted);


export default router;