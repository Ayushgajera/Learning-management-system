import { User } from "../models/user.model.js";
import { Course } from "../models/course.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { deleteMedia, uploadMedia } from "../utils/cloudinary.js";




export const register = async (req, res) => {

    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashpassword = await bcrypt.hash(password, 10);
        await User.create({ name, email, password: hashpassword });

        return res.status(201).json(
            {
                success: true,
                message: "Account created successfully",

            }
        )

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "failed to register"
        })
    }
};

export const login = async (req, res) => {

    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Incorrect email or password"
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect email or password"
            })
        }
        generateToken(res, user, `Welcome ${user.name}`)

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "failed to register"
        })
    }


}
export const logout = async (_, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
        });
        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to logout"
        });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.log(error); ``
        return res.status(500).json({
            success: false,
            message: "failed to logout"
        })
    }
}
export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.id;
        const { name, email } = req.body;
        const profilephoto = req.file;
        console.log(req.file); // make sure file is received
        console.log(req.body);

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Initialize update object with basic fields
        const updatedUser = { name, email };


        // Handle photo update only if a new file is uploaded
        if (profilephoto) {
            try {
                // Delete old photo if it exists
                if (user.photoUrl) {
                    const publicId = user.photoUrl.split("/").pop().split(".")[0];
                    await deleteMedia(publicId);
                }

                // Upload new photo
                const cloudResponse = await uploadMedia(profilephoto.path);

                updatedUser.photoUrl = cloudResponse.secure_url;

            } catch (uploadError) {
                return res.status(400).json({
                    success: false,
                    message: "Failed to update profile photo"
                });
            }
        }

        // Update user in database
        const updatedUserData = await User.findByIdAndUpdate(
            userId,
            updatedUser,
            { new: true }
        ).select("-password");

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUserData
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to update profile"
        });
    }
};

export const setInstructorOnboarded = async (req, res) => {
    try {
        const userId = req.id; // from auth middleware
        const { answers } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.onboardedAsInstructor = true;
        user.instructorOnboardingAnswers = answers;

        // 🔥 Promote to instructor role
        user.role = 'instructor';

        await user.save();

        const sanitizedUser = user.toObject();
        delete sanitizedUser.password;

        res.json({ success: true, user: sanitizedUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to save onboarding answers" });
    }
};


export const getInstructorOnboarded = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ onboarded: !!user.onboardedAsInstructor });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch onboarding status" });
    }
};

export const revertToStudent = async (req, res) => {
    try {
      const userId = req.id; // from auth middleware
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      // Revert role
      user.role = 'student';
      user.onboardedAsInstructor = false;
      user.instructorOnboardingAnswers = [];
  
      await user.save();
  
      res.json({ success: true, role: user.role });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to revert to student role" });
    }
  };

export const getNotificationPreferences = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId).select('notificationPreferences');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        return res.json({ success: true, notificationPreferences: user.notificationPreferences });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Failed to fetch notification preferences' });
    }
};

export const updateNotificationPreferences = async (req, res) => {
    try {
        const userId = req.id;
        const { global, courses } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (typeof global === 'boolean') user.notificationPreferences.global = global;

        if (Array.isArray(courses)) {
            // Replace per-course preferences; simple approach
            user.notificationPreferences.courses = courses.map((c) => ({ courseId: c.courseId, enabled: !!c.enabled }));
        }

        await user.save();
        return res.json({ success: true, notificationPreferences: user.notificationPreferences });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Failed to update notification preferences' });
    }
};

export const getWishlistCourses = async (req, res) => {
    try {
        const user = await User.findById(req.id).populate({
            path: 'wishlist',
            select: 'courseTitle courseThumbnail courseLevel coursePrice category duration creator enrolledStudents createdAt',
            populate: {
                path: 'creator',
                select: 'name photoUrl'
            }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        return res.status(200).json({
            success: true,
            wishlist: user.wishlist || []
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Failed to fetch wishlist' });
    }
};

export const addToWishlist = async (req, res) => {
    try {
        const { courseId } = req.params;

        if (!courseId) {
            return res.status(400).json({ success: false, message: 'Course ID is required' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        const user = await User.findById(req.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const exists = user.wishlist.some((id) => id.toString() === courseId);
        if (exists) {
            return res.status(200).json({ success: true, message: 'Course already in wishlist' });
        }

        user.wishlist.push(courseId);
        await user.save();

        const populatedCourse = await Course.findById(courseId)
            .select('courseTitle courseThumbnail courseLevel coursePrice category duration creator enrolledStudents createdAt')
            .populate('creator', 'name photoUrl');

        return res.status(201).json({
            success: true,
            message: 'Course added to wishlist',
            course: populatedCourse
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Failed to update wishlist' });
    }
};

export const removeFromWishlist = async (req, res) => {
    try {
        const { courseId } = req.params;

        if (!courseId) {
            return res.status(400).json({ success: false, message: 'Course ID is required' });
        }

        const user = await User.findById(req.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const initialCount = user.wishlist.length;
        user.wishlist = user.wishlist.filter((id) => id.toString() !== courseId);

        if (user.wishlist.length === initialCount) {
            return res.status(404).json({ success: false, message: 'Course not found in wishlist' });
        }

        await user.save();

        return res.status(200).json({ success: true, message: 'Course removed from wishlist' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Failed to update wishlist' });
    }
};


  