import express from 'express';
import { register, login, getUserProfile, logout, updateUserProfile, revertToStudent, switchToInstructor, getWishlistCourses, addToWishlist, removeFromWishlist, getInstructorReputation, getInstructors } from '../controllers/user.controller.js';
import isAuthenticated from '../middleware/isAuthenticated.js';
import upload from '../utils/multer.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js'
// server/routes/user.routes.js
import { setInstructorOnboarded, getInstructorOnboarded } from '../controllers/user.controller.js';
import { getNotificationPreferences, updateNotificationPreferences } from '../controllers/user.controller.js';
import { User } from '../models/user.model.js';
const router = express.Router();


router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(isAuthenticated, logout);
router.route("/profile").get(isAuthenticated, getUserProfile);
router.route("/profile/update").put(isAuthenticated, upload.single('profilephoto'), updateUserProfile);
router.get('/instructors', getInstructors);
router.post('/instructor-onboard', isAuthenticated, setInstructorOnboarded);
router.get('/instructor-onboard', isAuthenticated, getInstructorOnboarded);
router.patch('/become-student', isAuthenticated, revertToStudent);
router.patch('/switch-to-instructor', isAuthenticated, switchToInstructor);

router.get("/me", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Keep client compatibility: `user.role` represents the active role.
    if (user.activeRole) {
      user.role = user.activeRole;
    } else if (user.role && !user.activeRole) {
      user.activeRole = user.role;
    }

    if (!Array.isArray(user.roles) || user.roles.length === 0) {
      user.roles = [user.activeRole || user.role].filter(Boolean);
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Notification preferences
router.get('/notifications', isAuthenticated, getNotificationPreferences);
router.put('/notifications', isAuthenticated, updateNotificationPreferences);

// Wishlist endpoints
router.get('/wishlist', isAuthenticated, getWishlistCourses);
router.post('/wishlist/:courseId', isAuthenticated, addToWishlist);
router.delete('/wishlist/:courseId', isAuthenticated, removeFromWishlist);



// Reputation
router.get('/instructor/reputation', isAuthenticated, getInstructorReputation);

export default router;
