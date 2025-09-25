import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js';
import { createCourse, createLectures, editCourse, editLecture, getAllCourses, getAllLectures, getCourseById, getLectureById, getMonthlyRevenue, getPublishCourse, publishCourse, removeCourse, removeLecture } from '../controllers/course.controller.js';
import upload from "../utils/multer.js";
import { getUserPurchases } from '../controllers/purchaseCourse.controller.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js'

const router = express.Router();

router.route("/").post(isAuthenticated,authorizeRoles("instructor"), createCourse);
router.route("/publishCourse").get(getPublishCourse);
router.route("/all").get(isAuthenticated, getAllCourses);
router.route("/edit/:courseID").put(isAuthenticated, upload.single("courseThumbnail"), editCourse);
router.route("/monthly-revenue/:instructorId").get(isAuthenticated, getMonthlyRevenue);

// Dynamic routes LAST
router.route("/:courseID").get(getCourseById);
router.route("/:courseID").delete(isAuthenticated, removeCourse);
router.route("/:courseID").patch(isAuthenticated, publishCourse);
router.route("/:courseID/lectures").post(isAuthenticated, createLectures);
router.route("/:courseID/lectures").get(isAuthenticated, getAllLectures);
router.route("/:courseID/lectures/:lectureID").put(isAuthenticated, editLecture);
router.route("/:courseID/lectures/:lectureID").delete(isAuthenticated, removeLecture);
router.route("/:courseID/lectures/:lectureID").get(isAuthenticated, getLectureById);
router.route("/:courseId/purchase").get(getUserPurchases);




export default router;
