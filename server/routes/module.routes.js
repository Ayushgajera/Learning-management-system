import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js';
import { createModule, getCourseModules, updateModule, deleteModule } from '../controllers/module.controller.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';

const router = express.Router();

router.route("/:courseId").post(isAuthenticated, authorizeRoles("instructor"), createModule);
router.route("/:courseId").get(isAuthenticated, getCourseModules);
router.route("/:moduleId").put(isAuthenticated, authorizeRoles("instructor"), updateModule);
router.route("/:moduleId").delete(isAuthenticated, authorizeRoles("instructor"), deleteModule);

export default router;
