import { Module } from "../models/module.model.js";
import { Course } from "../models/course.model.js";
import Lecture from "../models/lecture.model.js";

// Create a new module
export const createModule = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { moduleTitle, description } = req.body;

        if (!courseId || !moduleTitle) {
            return res.status(400).json({ message: "Course ID and Module Title are required." });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found." });
        }

        const newModule = await Module.create({
            moduleTitle,
            description,
            courseId
        });

        course.modules.push(newModule._id);
        await course.save();

        return res.status(201).json({
            module: newModule,
            message: "Module created successfully"
        });
    } catch (error) {
        console.error("Error creating module:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get all modules for a course
export const getCourseModules = async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findById(courseId).populate({
            path: 'modules',
            populate: {
                path: 'lectures'
            }
        });

        if (!course) {
            return res.status(404).json({ message: "Course not found." });
        }

        return res.status(200).json({
            modules: course.modules,
            message: "Modules fetched successfully"
        });
    } catch (error) {
        console.error("Error fetching modules:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update a module
export const updateModule = async (req, res) => {
    try {
        const { moduleId } = req.params;
        const { moduleTitle, description, order, isPublished } = req.body;

        const module = await Module.findById(moduleId);
        if (!module) {
            return res.status(404).json({ message: "Module not found." });
        }

        if (moduleTitle) module.moduleTitle = moduleTitle;
        if (description) module.description = description;
        if (order !== undefined) module.order = order;
        if (isPublished !== undefined) module.isPublished = isPublished;

        await module.save();

        return res.status(200).json({
            module,
            message: "Module updated successfully"
        });
    } catch (error) {
        console.error("Error updating module:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Delete a module
export const deleteModule = async (req, res) => {
    try {
        const { moduleId } = req.params;

        const module = await Module.findById(moduleId);
        if (!module) {
            return res.status(404).json({ message: "Module not found." });
        }

        // Remove module reference from course
        await Course.findByIdAndUpdate(module.courseId, {
            $pull: { modules: moduleId }
        });

        // Delete associated lectures (optional: could act recursively)
        if (module.lectures && module.lectures.length > 0) {
            await Lecture.deleteMany({ _id: { $in: module.lectures } });
        }

        await Module.findByIdAndDelete(moduleId);

        return res.status(200).json({
            message: "Module deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting module:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
