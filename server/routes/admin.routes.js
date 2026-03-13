import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import {
    getAdminStats,
    getAllPlatformUsers,
    updateUserRole,
    deleteUserAdmin,
    getAllPlatformCourses,
    toggleCoursePublish,
    deleteCourseAdmin,
    getPlatformRevenue,
    getAllPurchases,
    seedAdmin,
    getPendingInstructors,
    approveInstructor,
    rejectInstructor
} from '../controllers/admin.controller.js';

const router = express.Router();

// Public seed route (protected by secret in body)
router.post('/seed', seedAdmin);

// All routes below require admin authentication
router.use(isAuthenticated, authorizeRoles('admin'));

// Dashboard stats
router.get('/stats', getAdminStats);

// User management
router.get('/users', getAllPlatformUsers);
router.put('/users/:userId/role', updateUserRole);
router.delete('/users/:userId', deleteUserAdmin);

// Course management
router.get('/courses', getAllPlatformCourses);
router.patch('/courses/:courseId/toggle-publish', toggleCoursePublish);
router.delete('/courses/:courseId', deleteCourseAdmin);

// Revenue analytics
router.get('/revenue', getPlatformRevenue);

// Purchase history
router.get('/purchases', getAllPurchases);

// Instructor approval management
router.get('/instructor-applications', getPendingInstructors);
router.put('/instructor-applications/:userId/approve', approveInstructor);
router.put('/instructor-applications/:userId/reject', rejectInstructor);

export default router;
