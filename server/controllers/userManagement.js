import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";


// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const { instructorId } = req.params; 
    
    // frontend se bhejo
    console.log(instructorId)
    // 1. Find all courses of this instructor
    const instructorCourses = await Course.find({ creator: instructorId }).populate("enrolledStudents", "-password");
    console.log(instructorCourses)

    if (!instructorCourses.length) {
      return res.status(404).json({ message: "No courses found for this instructor" });
    }

    // 2. Collect all enrolled students
    const enrolledUsersMap = new Map();

    instructorCourses.forEach(course => {
      course.enrolledStudents.forEach(user => {
        enrolledUsersMap.set(user._id.toString(), user); // duplicates hatane ke liye
      });
    });

    // 3. Convert map to array
    const enrolledUsers = Array.from(enrolledUsersMap.values());

    res.status(200).json({
      success: true,
      instructorId,
      totalUsers: enrolledUsers.length,
      users: enrolledUsers
    });

  } catch (error) {
    console.error("Error fetching instructor users:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};



// Update a user's role
export const updateUserRole = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  try {
    if (!role || !['student', 'instructor', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role provided.' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      message: 'User role updated successfully.',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// Delete a user
export const deleteUser = async (req, res) => {
  const { instructorId, userId } = req.params;

  try {
    // Step 1: Find all courses by this instructor
    const instructorCourses = await Course.find({ creator: instructorId });
    if (!instructorCourses.length) {
      return res.status(404).json({ message: "No courses found for this instructor" });
    }

    const instructorCourseIds = instructorCourses.map(course => course._id);

    // Step 2: Remove user from enrolledStudents of these courses
    await Course.updateMany(
      { creator: instructorId },
      { $pull: { enrolledStudents: userId } }
    );

    // Step 3: Remove those courses from user's enrolledCourses array
    await User.findByIdAndUpdate(
      userId,
      { $pull: { enrolledCourses: { $in: instructorCourseIds } } },
      { new: true }
    );

    res.status(200).json({
      message: "User removed from all courses of this instructor",
      coursesRemoved: instructorCourseIds.length
    });
  } catch (error) {
    console.error("Error removing user from instructor's courses:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// Remove a course from a user's list
export const removeCourseFromUser = async (req, res) => {
  const { instructorId, userId, courseId } = req.params;

  try {
    // Step 1: Verify course belongs to this instructor
    const course = await Course.findOne({ _id: courseId, creator: instructorId });
    if (!course) {
      return res.status(404).json({ message: "Course not found or does not belong to this instructor" });
    }

    // Step 2: Remove user from this course's enrolledStudents
    await Course.findByIdAndUpdate(
      courseId,
      { $pull: { enrolledStudents: userId } },
      { new: true }
    );

    // Step 3: Remove this course from user's enrolledCourses array
    await User.findByIdAndUpdate(
      userId,
      { $pull: { enrolledCourses: courseId } },
      { new: true }
    );

    res.status(200).json({
      message: "User removed from this course successfully",
      courseId,
      userId
    });
  } catch (error) {
    console.error("Error removing user from course:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};