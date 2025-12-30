
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Course } from './models/course.model.js';
import { Module } from './models/module.model.js';
import Lecture from './models/lecture.model.js';

dotenv.config();

const checkCourse = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const courseId = "694a2edf48393a64ed8d1629";
        const course = await Course.findById(courseId).populate({
            path: 'modules',
            populate: { path: 'lectures' }
        });

        if (!course) {
            console.log("Course not found");
            return;
        }

        console.log(`Course: ${course.courseTitle}`);
        console.log(`Published: ${course.ispublished}`);

        if (!course.modules || course.modules.length === 0) {
            console.log("NO MODULES FOUND");
        }

        course.modules.forEach(mod => {
            console.log(`\nModule: ${mod.moduleTitle}`);
            if (!mod.lectures || mod.lectures.length === 0) {
                console.log("  -> NO LECTURES");
            }
            mod.lectures.forEach(lec => {
                console.log(`  -> Lecture: ${lec.lectureTitle} | Video: ${lec.videoUrl ? 'YES' : 'NO'} (${lec.videoUrl})`);
            });
        });

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

checkCourse();
