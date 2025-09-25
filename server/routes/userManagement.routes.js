import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js';
import { deleteUser, getAllUsers, removeCourseFromUser, updateUserRole } from '../controllers/userManagement.js';

const router = express.Router();


// Define API routes and link them to controller functions
router.get('/users/:instructorId',  getAllUsers);
router.put('/users/:userId/role',  updateUserRole);
router.delete('/users/:userId/:instructorId',  deleteUser);
router.delete('/users/:userId/courses/:courseId/remove/:instructorId', removeCourseFromUser);

export default router;
