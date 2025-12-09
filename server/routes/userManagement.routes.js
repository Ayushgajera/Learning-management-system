import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js';
import { deleteUser, getAllUsers, removeCourseFromUser } from '../controllers/userManagement.js';

const router = express.Router();


// Define API routes and link them to controller functions
router.get('/users/:instructorId',  getAllUsers);
router.delete('/users/:userId/:instructorId',  deleteUser);
router.delete('/users/:userId/courses/:courseId/remove/:instructorId', removeCourseFromUser);

export default router;
