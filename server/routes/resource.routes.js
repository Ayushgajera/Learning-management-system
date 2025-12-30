import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js';
import { createResource, deleteResource, downloadResource } from '../controllers/resource.controller.js';
import upload from "../utils/multer.js";
import { authorizeRoles } from '../middleware/authorizeRoles.js';

const router = express.Router();

router.route("/:lectureId").post(isAuthenticated, authorizeRoles("instructor"), upload.single("file"), createResource);
router.route("/:resourceId").delete(isAuthenticated, authorizeRoles("instructor"), deleteResource);
router.route("/download/:resourceId").get(isAuthenticated, downloadResource);

export default router;
