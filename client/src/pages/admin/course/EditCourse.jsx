import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import { Listbox } from "@headlessui/react";
import {
    FiSave, FiX, FiDollarSign, FiBook, FiGrid, FiImage, FiUpload, FiTarget, FiInfo,
    FiBold, FiItalic, FiUnderline, FiAlignLeft, FiAlignCenter, FiAlignRight, FiList,
    FiCheck, FiUploadCloud, FiZap, FiEye, FiEyeOff, FiTrendingUp, FiUsers, FiClock,
    FiStar, FiTag, FiCalendar, FiArrowLeft, FiSettings, FiActivity, FiChevronDown,
    FiPlay, FiPause, FiRefreshCw, FiLayers
} from 'react-icons/fi';
import {
    useEditCourseMutation,
    useGetCourseByIdQuery,
    usePublishCourseMutation,
} from '@/features/api/courseApi';
import RichTextEditor from '@/extensions/RichTextEditor';

import axios from 'axios';
import { ThemeContext } from '@/extensions/ThemeProvider';


// Futuristic Form Input Component
const FormInput = ({ label, icon: Icon, error, ...props }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
    >
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 tracking-wide">
            {label} <span className="text-rose-500">*</span>
        </label>
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors duration-300" />
            </div>
            <input
                {...props}
                className={`block w-full pl-12 pr-4 py-3.5 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md 
          border border-gray-200/50 dark:border-gray-700/50 rounded-2xl
          focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 dark:focus:ring-blue-400/50
          transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500
          text-gray-800 dark:text-gray-100 shadow-sm hover:shadow-md
          ${error ? "border-rose-300 bg-rose-50/80 dark:bg-rose-900/20" : ""}`}
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
        <AnimatePresence>
            {error && (
                <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-sm text-rose-500 dark:text-rose-400 flex items-center"
                >
                    <FiX className="w-4 h-4 mr-1" />
                    {error}
                </motion.p>
            )}
        </AnimatePresence>
    </motion.div>
);

// Futuristic Form Select Component
const FormSelect = ({ label, name = 'category', icon: Icon, options, error, value, onChange, placeholder }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
    >
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 tracking-wide">
            {label} <span className="text-rose-500">*</span>
        </label>
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors duration-300" />
            </div>
            <Listbox value={value} onChange={(val) => onChange({ target: { name, value: val } })}>
                <Listbox.Button
                    className={`block w-full pl-12 pr-12 py-3.5 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md 
          border border-gray-200/50 dark:border-gray-700/50 rounded-2xl text-left
          focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 dark:focus:ring-blue-400/50
          transition-all duration-300 text-gray-800 dark:text-gray-100 shadow-sm hover:shadow-md
          ${error ? "border-rose-300 bg-rose-50/80 dark:bg-rose-900/20" : ""}`}
                >
                    <span className={value ? "text-gray-800 dark:text-gray-100" : "text-gray-400 dark:text-gray-500"}>
                        {value || placeholder || `Select ${label.toLowerCase()}`}
                    </span>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        <FiChevronDown className="h-5 w-5 text-gray-400 dark:text-gray-500 transition-transform group-focus-within:rotate-180 duration-300" />
                    </span>
                </Listbox.Button>

                <AnimatePresence>
                    <Listbox.Options
                        as={motion.div}
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute mt-2 max-h-60 w-full overflow-auto rounded-2xl 
            bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 
            shadow-2xl shadow-blue-500/10 z-20"
                    >
                        {options.map((opt, index) => (
                            <Listbox.Option
                                key={opt}
                                value={opt}
                                as={motion.div}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{
                                    opacity: 1,
                                    x: 0,
                                    transition: { delay: index * 0.05 },
                                }}
                                className={({ active, selected }) =>
                                    `cursor-pointer select-none py-3 pl-4 pr-4 flex items-center justify-between 
      transition-colors duration-200 ${active
                                        ? "bg-blue-50/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                        : "text-gray-700 dark:text-gray-200"
                                    } ${selected ? "bg-blue-100/50 dark:bg-blue-800/30" : ""}`
                                }
                            >
                                {({ selected }) => (
                                    <>
                                        <span>{opt}</span>
                                        {selected && (
                                            <FiCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        )}
                                    </>
                                )}
                            </Listbox.Option>
                        ))}


                    </Listbox.Options>
                </AnimatePresence>
            </Listbox>
        </div>
        <AnimatePresence>
            {error && (
                <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-sm text-rose-500 dark:text-rose-400 flex items-center"
                >
                    <FiX className="w-4 h-4 mr-1" />
                    {error}
                </motion.p>
            )}
        </AnimatePresence>
    </motion.div>
);

function EditCourse() {
    const params = useParams();
    const courseId = params.courseId;
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('details');
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        courseTitle: '',
        subTitle: '',
        courseDescription: '',
        category: '',
        courseLevel: 'Beginner',
        coursePrice: '',
        courseThumbnail: null,
        isPublished: false,
        requirements: [],
        learningGoals: []
    });
    const [previewUrl, setPreviewUrl] = useState('');
    const [isDescriptionLoading, setIsDescriptionLoading] = useState(false);
    const [isSubtitleLoading, setIsSubtitleLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [autoSave, setAutoSave] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [thumbnailRemoved, setThumbnailRemoved] = useState(false);

    // API calls
    const { data: courseData, isLoading: isCourseLoading, error, refetch } = useGetCourseByIdQuery(courseId);
    const [editCourse, { isLoading: isEditing }] = useEditCourseMutation(courseId);
    const [publishCourse, { isLoading: isPublishLoading }] = usePublishCourseMutation();
    const { isDarkMode } = useContext(ThemeContext);

    const course = courseData?.course;
    console.log('Course Data:', course?.ispublished);

    const publishStatusHandler = async (action) => {
        try {
            await publishCourse({ courseId, query: action }).unwrap();
            refetch();
            toast.success("Course status updated successfully!");
        } catch (error) {
            const backendMsg = error?.data?.message || "Failed to update course status. Please try again.";
            toast.error(backendMsg);
            console.error("Edit Course Error:", error);
        }
    };

    // This is the fix. The useEffect now runs whenever the `course` object from the API changes.
    // This correctly updates your local formData state.
    useEffect(() => {
        if (course) {
            setFormData({
                courseTitle: course.courseTitle || '',
                subTitle: course.subTitle || '',
                courseDescription: course.courseDescription || '',
                category: course.category || '',
                courseLevel: course.courseLevel || 'Beginner',
                coursePrice: course.coursePrice || '',
                courseThumbnail: null, // Clear file input
                // This is the bug fix: `ispublished` is now correctly pulled from the server data.
                isPublished: course.ispublished,
                requirements: course.requirements || [],
                learningGoals: course.learningGoals || [],
            });
            if (course.courseThumbnail) {
                setPreviewUrl(course.courseThumbnail);
                setThumbnailRemoved(false);
            } else {
                setPreviewUrl('');
                setThumbnailRemoved(false);
            }
        }
    }, [course]);

    const courseLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
    const categories = [
        'Web Development', 'Mobile Development', 'Design', 'Marketing', 'Data Science',
        'Business', 'AI & Machine Learning', 'Cybersecurity', 'Cloud Computing',
        'DevOps', 'Game Development', 'Digital Marketing', 'UI/UX Design'
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, courseThumbnail: file }));
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setThumbnailRemoved(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { courseTitle, subTitle, courseDescription, category, courseLevel, coursePrice, courseThumbnail, isPublished } = formData;

        const formDataToSubmit = new FormData();
        formDataToSubmit.append('courseTitle', courseTitle);
        formDataToSubmit.append('subTitle', subTitle);
        formDataToSubmit.append('courseDescription', courseDescription);
        formDataToSubmit.append('category', category);
        formDataToSubmit.append('courseLevel', courseLevel);
        formDataToSubmit.append('coursePrice', coursePrice);
        if (courseThumbnail) {
            formDataToSubmit.append('courseThumbnail', courseThumbnail);
        }
        formDataToSubmit.append('isPublished', isPublished);
        formDataToSubmit.append('removeThumbnail', thumbnailRemoved);
        formDataToSubmit.append('requirements', JSON.stringify(formData.requirements));
        formDataToSubmit.append('learningGoals', JSON.stringify(formData.learningGoals));

        try {
            await editCourse({ formData: formDataToSubmit, courseId }).unwrap();
            toast.success("Course updated successfully!");
            navigate('/admin/courses');
        } catch (error) {
            toast.error("Failed to update course. Please try again.");
            console.error("Edit Course Error:", error);
        }
    };

    const handleGenerateDescription = async () => {
        if (!formData.courseTitle) {
            toast.error("Please enter a course title before generating a description.");
            return;
        }
        setIsDescriptionLoading(true);
        try {
            const response = await axios.post("http://localhost:8000/api/v1/ai/description", {
                courseTitle: formData.courseTitle,
            });
            const description = response.data?.description;
            if (description) {
                setFormData(prev => ({ ...prev, courseDescription: description }));
                toast.success("📝 Description generated successfully!");
            } else {
                toast.error("Description generation failed. Please try again.");
            }
        } catch (error) {
            console.error("Generate Description Error:", error);
            const errMsg = error.response?.data?.details || error.response?.data?.error || "Failed to generate description.";
            toast.error(`Error: ${errMsg}.`);
        }
        setIsDescriptionLoading(false);
    };

    const handleGenerateSubtitle = async () => {
        if (!formData.courseTitle) {
            toast.error("Please enter a course title before generating a subtitle.");
            return;
        }
        setIsSubtitleLoading(true);
        try {
            const response = await axios.post("http://localhost:8000/api/v1/ai/subtitle", {
                courseTitle: formData.courseTitle,
            });
            const subtitle = response.data?.subtitle;
            if (subtitle) {
                setFormData(prev => ({ ...prev, subTitle: subtitle }));
                toast.success("✨ Subtitle generated successfully!");
            } else {
                toast.error("Subtitle generation failed. Please try again.");
            }
        } catch (error) {
            console.error("Generate Subtitle Error:", error);
            const errMsg = error.response?.data?.details || error.response?.data?.error || "Failed to generate subtitle.";
            toast.error(`Error: ${errMsg}.`);
        }
        setIsSubtitleLoading(false);
    };

    const calculateCompletion = () => {
        const fields = ['courseTitle', 'subTitle', 'courseDescription', 'category', 'courseLevel', 'coursePrice'];
        const completed = fields.filter(field => formData[field] && formData[field].toString().trim() !== '').length;
        return Math.round((completed / fields.length) * 100);
    };
    const completionPercentage = calculateCompletion();

    const handleAutoSave = async () => {
        try {
            const formDataToSubmit = new FormData();
            formDataToSubmit.append('courseTitle', formData.courseTitle);
            formDataToSubmit.append('subTitle', formData.subTitle);
            formDataToSubmit.append('courseDescription', formData.courseDescription);
            formDataToSubmit.append('category', formData.category);
            formDataToSubmit.append('courseLevel', formData.courseLevel);
            formDataToSubmit.append('coursePrice', formData.coursePrice);
            formDataToSubmit.append('isPublished', formData.isPublished);
            formDataToSubmit.append('removeThumbnail', thumbnailRemoved);
            formDataToSubmit.append('requirements', JSON.stringify(formData.requirements));
            formDataToSubmit.append('learningGoals', JSON.stringify(formData.learningGoals));

            await editCourse({ formData: formDataToSubmit, courseId }).unwrap();
            setLastSaved(new Date());
            toast.success("Auto-saved successfully!");
        } catch (error) {
            console.error("Auto-save failed:", error);
        }
    };

    useEffect(() => {
        if (autoSave && formData.courseTitle) {
            const timer = setTimeout(() => {
                handleAutoSave();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [formData, autoSave]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        handleSubmit(e);
                        break;
                    case 'p':
                        e.preventDefault();
                        setShowPreview(!showPreview);
                        break;
                    default:
                        break;
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [showPreview]);

    if (isCourseLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 
                            dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 
                            flex items-center justify-center transition-colors duration-300">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl 
                              border border-gray-200/50 dark:border-gray-700/50 shadow-2xl"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 
                                  rounded-2xl flex items-center justify-center shadow-lg"
                    >
                        <FiLayers className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                        Loading Course...
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">Fetching your course details</p>
                </motion.div>
            </div>
        );
    }

    if (isEditing) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 
                            dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 
                            flex items-center justify-center transition-colors duration-300">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl 
                              border border-gray-200/50 dark:border-gray-700/50 shadow-2xl"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-green-500 to-blue-600 
                                  rounded-2xl flex items-center justify-center shadow-lg"
                    >
                        <FiRefreshCw className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                        Updating Course...
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">Saving your changes</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-4 sm:p-6 lg:p-8 transition-colors duration-300">

            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, 0],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, -5, 0],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 5 }}
                    className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr from-green-400/20 to-blue-400/20 blur-3xl"
                />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-6 sm:p-8 
                              border border-gray-200/50 dark:border-gray-700/50 shadow-2xl overflow-hidden"
                    style={{
                        boxShadow: isDarkMode
                            ? '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                            : '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                    }}
                >
                    {/* Header Content */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                                <motion.button
                                    onClick={() => navigate('/admin/courses')}
                                    className="p-3 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 
                                              bg-white/60 dark:bg-gray-700/60 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-600/50
                                              hover:shadow-md transition-all duration-200"
                                    whileHover={{ scale: 1.05, x: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <FiArrowLeft className="w-5 h-5" />
                                </motion.button>
                                <div>
                                    <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 
                                                  dark:from-gray-100 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                                        Edit Course
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                                        Transform your content into an engaging learning experience
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Auto-save Toggle */}
                            <motion.div
                                className="flex items-center gap-3 px-4 py-2 bg-white/60 dark:bg-gray-700/60 backdrop-blur-md 
                                          rounded-2xl border border-gray-200/50 dark:border-gray-600/50"
                                whileHover={{ scale: 1.02 }}
                            >
                                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={autoSave}
                                        onChange={(e) => setAutoSave(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                                    />
                                    Auto-save
                                </label>
                                {lastSaved && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
                                        {lastSaved.toLocaleTimeString()}
                                    </span>
                                )}
                            </motion.div>

                            <motion.button
                                onClick={() => setShowPreview(!showPreview)}
                                className="px-4 py-2.5 bg-white/60 dark:bg-gray-700/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-600/50
                                          text-gray-700 dark:text-gray-200 rounded-2xl hover:shadow-md transition-all duration-200 
                                          font-medium text-sm flex items-center gap-2"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {showPreview ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                                <span className="hidden sm:inline">
                                    {showPreview ? 'Hide Preview' : 'Preview'}
                                </span>
                            </motion.button>

                            <motion.button
                                onClick={() => publishStatusHandler(course?.ispublished ? "false" : "true")}
                                className={`px-4 py-2.5 rounded-2xl font-semibold text-white text-sm flex items-center gap-2
                                          transition-all duration-300 shadow-lg
                                          ${course?.ispublished
                                        ? 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700'
                                        : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                                    }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={isPublishLoading}
                            >
                                {isPublishLoading ? (
                                    <FiRefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        {course?.ispublished ? <FiPause className="w-4 h-4" /> : <FiPlay className="w-4 h-4" />}
                                        <span className="hidden sm:inline">
                                            {course?.ispublished ? "Unpublish" : "Publish"}
                                        </span>
                                    </>
                                )}
                            </motion.button>

                            <Link
                                to={`/admin/courses/edit/${courseId}/lectures`}
                                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl 
                                          hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold 
                                          shadow-lg text-sm flex items-center gap-2"
                            >
                                <FiLayers className="w-4 h-4" />
                                <span className="hidden sm:inline">
                                    Manage Content
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* Enhanced Progress Bar */}
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <FiActivity className="w-5 h-5 text-blue-500" />
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Course Completion</span>
                            </div>
                            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {completionPercentage}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-full h-3 overflow-hidden">
                            <motion.div
                                className="bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 h-3 rounded-full 
                                          shadow-lg relative overflow-hidden"
                                initial={{ width: 0 }}
                                animate={{ width: `${completionPercentage}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                                              animate-shimmer" />
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Form Section */}
                    <div className="xl:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl 
                                      border border-gray-200/50 dark:border-gray-700/50 shadow-2xl overflow-hidden"
                            style={{
                                boxShadow: isDarkMode
                                    ? '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                                    : '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            {/* Futuristic Tabs */}
                            <div className="flex bg-gradient-to-r from-gray-50/50 via-blue-50/30 to-purple-50/30 
                                          dark:from-gray-800/50 dark:via-blue-900/20 dark:to-purple-900/20 
                                          border-b border-gray-200/30 dark:border-gray-700/30 overflow-x-auto">
                                {[
                                    { id: 'details', label: 'Course Details', icon: <FiInfo className="w-4 h-4" /> },
                                    { id: 'pricing', label: 'Pricing & Settings', icon: <FiDollarSign className="w-4 h-4" /> },
                                    { id: 'media', label: 'Media & Assets', icon: <FiImage className="w-4 h-4" /> }
                                ].map((tab, index) => (
                                    <motion.button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center flex-shrink-0 gap-3 px-6 py-4 text-sm font-semibold 
                                                  transition-all duration-300 relative ${activeTab === tab.id
                                                ? 'text-blue-600 dark:text-blue-400 bg-white/60 dark:bg-gray-700/60 backdrop-blur-md'
                                                : 'text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-white/30 dark:hover:bg-gray-700/30'
                                            }`}
                                        whileHover={{ y: -1 }}
                                        whileTap={{ y: 0 }}
                                    >
                                        <span className={`p-2 rounded-xl transition-colors duration-300 ${activeTab === tab.id
                                            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                                            : 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                                            }`}>
                                            {tab.icon}
                                        </span>
                                        {tab.label}
                                        {activeTab === tab.id && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                                transition={{ duration: 0.3 }}
                                            />
                                        )}
                                    </motion.button>
                                ))}
                            </div>

                            {/* Form Content */}
                            <form onSubmit={handleSubmit} className="p-8 space-y-8">
                                <AnimatePresence mode="wait">
                                    {activeTab === 'details' && (
                                        <motion.div
                                            key="details"
                                            initial={{ opacity: 0, x: 30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -30 }}
                                            transition={{ duration: 0.4 }}
                                            className="space-y-8"
                                        >
                                            {/* Course Title */}
                                            <FormInput
                                                label="Course Title"
                                                name="courseTitle"
                                                value={formData.courseTitle}
                                                onChange={handleChange}
                                                placeholder="Enter an engaging course title..."
                                                icon={FiBook}
                                                error={errors.courseTitle}
                                            />

                                            {/* Subtitle with AI Generation */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="block text-sm font-semibold  dark:text-gray-200 tracking-wide">
                                                        Subtitle
                                                    </label>
                                                    <motion.button
                                                        type="button"
                                                        onClick={handleGenerateSubtitle}
                                                        className="inline-flex items-center gap-2 px-4 py-2 
                                                                  bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-semibold 
                                                                  rounded-2xl shadow-lg hover:from-emerald-600 hover:to-green-700 
                                                                  transition-all duration-300 transform hover:scale-105 dark:shadow-emerald-500/20"
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        disabled={isSubtitleLoading}
                                                        title="Generate subtitle using AI"
                                                    >
                                                        {isSubtitleLoading ? (
                                                            <>
                                                                <motion.div
                                                                    animate={{ rotate: 360 }}
                                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                                    className="w-4 h-4"
                                                                >
                                                                    <FiRefreshCw className="w-4 h-4" />
                                                                </motion.div>
                                                                Generating...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FiZap className="w-3 h-3" />
                                                                AI Generate
                                                            </>
                                                        )}
                                                    </motion.button>
                                                </div>
                                                <input
                                                    type="text"
                                                    name="subTitle"
                                                    value={formData.subTitle}
                                                    onChange={handleChange}
                                                    className={`block w-full pl-4 pr-4 py-3.5 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md 
                                                                                                                    border border-gray-200/50 dark:border-gray-700/50 rounded-2xl
                                                                                                                    focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50
                                                                                                                    transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500
                                                                                                                    text-gray-800 dark:text-gray-100 shadow-sm hover:shadow-md`}
                                                    placeholder="Add a subtitle to provide more context"
                                                />
                                            </div>

                                            {/* Category and Level */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <FormSelect
                                                        label="Category"
                                                        name="category"
                                                        value={formData.category}
                                                        onChange={handleChange}
                                                        options={categories}
                                                        icon={FiGrid}
                                                        error={errors.category}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <FormSelect
                                                        label="Course Level"
                                                        name="courseLevel"
                                                        value={formData.courseLevel}
                                                        onChange={handleChange}
                                                        options={courseLevels}
                                                        icon={FiTarget}
                                                        placeholder="Select a level"
                                                        error={errors.courseLevel}
                                                    />
                                                </div>
                                            </div>

                                            {/* Description with AI Generation */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="block text-sm font-semibold text-gray-700">
                                                        Course Description
                                                    </label>
                                                    <motion.button
                                                        type="button"
                                                        onClick={handleGenerateDescription}
                                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-400 to-green-500 text-white text-xs font-semibold rounded-lg shadow hover:from-emerald-500 hover:to-green-600 transition-all duration-200"
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        disabled={isDescriptionLoading}
                                                    >
                                                        {isDescriptionLoading ? (
                                                            <>
                                                                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                                                Generating...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FiZap className="w-3 h-3" />
                                                                AI Generate
                                                            </>
                                                        )}
                                                    </motion.button>
                                                </div>
                                                <RichTextEditor
                                                    content={formData.courseDescription || ''}
                                                    onChange={(content) => {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            courseDescription: content
                                                        }));
                                                    }}
                                                />
                                            </div>

                                            {/* Requirements & Learning Goals */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {/* Requirements */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                                                            Requirements
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({ ...prev, requirements: [...prev.requirements, ""] }))}
                                                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                                        >
                                                            + Add Requirement
                                                        </button>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {formData.requirements.map((req, index) => (
                                                            <div key={index} className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={req}
                                                                    onChange={(e) => {
                                                                        const newReqs = [...formData.requirements];
                                                                        newReqs[index] = e.target.value;
                                                                        setFormData(prev => ({ ...prev, requirements: newReqs }));
                                                                    }}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault();
                                                                            setFormData(prev => ({ ...prev, requirements: [...prev.requirements, ""] }));
                                                                        }
                                                                    }}
                                                                    className="flex-1 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md 
                                                                             border border-gray-200/50 dark:border-gray-700/50 rounded-xl text-sm"
                                                                    placeholder={`Requirement ${index + 1}`}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newReqs = formData.requirements.filter((_, i) => i !== index);
                                                                        setFormData(prev => ({ ...prev, requirements: newReqs }));
                                                                    }}
                                                                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                                                >
                                                                    <FiX className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        {formData.requirements.length === 0 && (
                                                            <p className="text-sm text-gray-400 italic">No requirements added yet.</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Learning Goals */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                                                            What You'll Learn
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({ ...prev, learningGoals: [...prev.learningGoals, ""] }))}
                                                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                                        >
                                                            + Add Goal
                                                        </button>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {formData.learningGoals.map((goal, index) => (
                                                            <div key={index} className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={goal}
                                                                    onChange={(e) => {
                                                                        const newGoals = [...formData.learningGoals];
                                                                        newGoals[index] = e.target.value;
                                                                        setFormData(prev => ({ ...prev, learningGoals: newGoals }));
                                                                    }}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault();
                                                                            setFormData(prev => ({ ...prev, learningGoals: [...prev.learningGoals, ""] }));
                                                                        }
                                                                    }}
                                                                    className="flex-1 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md 
                                                                             border border-gray-200/50 dark:border-gray-700/50 rounded-xl text-sm"
                                                                    placeholder={`Learning Goal ${index + 1}`}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newGoals = formData.learningGoals.filter((_, i) => i !== index);
                                                                        setFormData(prev => ({ ...prev, learningGoals: newGoals }));
                                                                    }}
                                                                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                                                >
                                                                    <FiX className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        {formData.learningGoals.length === 0 && (
                                                            <p className="text-sm text-gray-400 italic">No learning goals added yet.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'pricing' && (
                                        <motion.div
                                            key="pricing"
                                            initial={{ opacity: 0, x: 30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -30 }}
                                            transition={{ duration: 0.4 }}
                                            className="space-y-8"
                                        >
                                            {/* Course Price */}
                                            <FormInput
                                                label="Course Price"
                                                name="coursePrice"
                                                type="number"
                                                value={formData.coursePrice}
                                                onChange={handleChange}
                                                placeholder="Set your course price (USD)"
                                                icon={FiDollarSign}
                                                min="0"
                                                step="0.01"
                                            />

                                            {/* Course Level */}
                                            <FormSelect
                                                label="Course Level"
                                                name="courseLevel"
                                                value={formData.courseLevel}
                                                onChange={handleChange}
                                                options={courseLevels}
                                                icon={FiTarget}
                                                error={errors.courseLevel}
                                            />


                                        </motion.div>
                                    )}

                                    {activeTab === 'media' && (
                                        <motion.div
                                            key="media"
                                            initial={{ opacity: 0, x: 30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -30 }}
                                            transition={{ duration: 0.4 }}
                                            className="space-y-8"
                                        >
                                            {/* Thumbnail Upload */}
                                            <div className="space-y-3">
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 tracking-wide">
                                                    Course Thumbnail
                                                </label>
                                                <div className="mt-3">
                                                    {previewUrl ? (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            className="relative w-full aspect-video rounded-3xl overflow-hidden 
                                                                          bg-white/60 dark:bg-gray-800/60 backdrop-blur-md shadow-2xl 
                                                                          border border-gray-200/50 dark:border-gray-700/50"
                                                        >
                                                            <img
                                                                src={previewUrl}
                                                                alt="Course thumbnail preview"
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <motion.button
                                                                type="button"
                                                                onClick={() => {
                                                                    setPreviewUrl('');
                                                                    setFormData(prev => ({ ...prev, courseThumbnail: null }));
                                                                    setThumbnailRemoved(true);
                                                                }}
                                                                className="absolute top-4 right-4 p-3 bg-rose-500/90 backdrop-blur-md 
                                                                              text-white rounded-2xl hover:bg-rose-600 transition-all duration-200 
                                                                              shadow-lg hover:shadow-xl"
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                            >
                                                                <FiX className="w-5 h-5" />
                                                            </motion.button>
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                                                        </motion.div>
                                                    ) : (
                                                        <label className="w-full cursor-pointer group">
                                                            <motion.div
                                                                className="w-full aspect-video border-2 border-dashed border-gray-300/60 dark:border-gray-600/60 
                                                                              rounded-3xl flex flex-col items-center justify-center 
                                                                              hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 
                                                                              bg-white/40 dark:bg-gray-800/40 backdrop-blur-md
                                                                              group-hover:bg-white/60 dark:group-hover:bg-gray-800/60"
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                            >
                                                                <motion.div
                                                                    className="p-6 bg-blue-100 dark:bg-blue-900/40 rounded-2xl mb-4 
                                                                                  group-hover:bg-blue-200 dark:group-hover:bg-blue-800/60 transition-colors duration-300"
                                                                    animate={{ y: [0, -5, 0] }}
                                                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                                                >
                                                                    <FiImage className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                                                                </motion.div>
                                                                <div className="text-center">
                                                                    <motion.span
                                                                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 
                                                                                      text-white rounded-2xl text-sm font-semibold shadow-lg"
                                                                        whileHover={{ scale: 1.05 }}
                                                                    >
                                                                        <FiUploadCloud className="w-5 h-5 mr-2" />
                                                                        Upload Thumbnail
                                                                    </motion.span>
                                                                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                                                                        PNG, JPG, GIF up to 10MB • Recommended: 1920x1080px
                                                                    </p>
                                                                </div>
                                                            </motion.div>
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={handleFileChange}
                                                            />
                                                        </label>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Action Buttons */}
                                <motion.div
                                    className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-8 
                                              border-t border-gray-200/30 dark:border-gray-700/30"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <motion.button
                                        type="button"
                                        onClick={() => navigate('/admin/courses')}
                                        className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300 
                                                  hover:text-gray-800 dark:hover:text-gray-100 bg-white/60 dark:bg-gray-700/60 
                                                  backdrop-blur-md border border-gray-200/50 dark:border-gray-600/50 rounded-2xl
                                                  hover:shadow-md transition-all duration-200"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        onClick={handleSubmit}
                                        disabled={isEditing}
                                        type="submit"
                                        className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 
                                                  bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-size-200 bg-pos-0
                                                  hover:bg-pos-100 text-white font-semibold rounded-2xl shadow-lg 
                                                  hover:shadow-xl transform hover:scale-105 active:scale-95 
                                                  focus:outline-none focus:ring-4 focus:ring-blue-500/50 
                                                  disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-500"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        style={{
                                            backgroundSize: '200% 100%',
                                            backgroundPosition: isEditing ? '100% 0' : '0% 0'
                                        }}
                                    >
                                        {isEditing ? (
                                            <>
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    className="mr-2"
                                                >
                                                    <FiRefreshCw className="w-5 h-5" />
                                                </motion.div>
                                                Saving Changes...
                                            </>
                                        ) : (
                                            <>
                                                <FiSave className="w-5 h-5 mr-2" />
                                                Save Changes
                                            </>
                                        )}
                                    </motion.button>
                                </motion.div>
                            </form>
                        </motion.div>
                    </div>

                    {/* Preview Sidebar */}
                    <div className="xl:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl 
                                      border border-gray-200/50 dark:border-gray-700/50 shadow-2xl p-6"
                            style={{
                                boxShadow: isDarkMode
                                    ? '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                                    : '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
                                    <FiEye className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Course Preview</h3>
                            </div>

                            {showPreview ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-4"
                                >
                                    {/* Course Card Preview */}
                                    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                                        {previewUrl && (
                                            <div className="aspect-video bg-gray-200">
                                                <img
                                                    src={previewUrl}
                                                    alt="Course preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="p-4">
                                            <h4 className="font-semibold text-gray-900 mb-1">
                                                {formData.courseTitle || 'Course Title'}
                                            </h4>
                                            <p className="text-sm text-gray-600 mb-3">
                                                {formData.subTitle || 'Course subtitle will appear here'}
                                            </p>
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                                                <span className="text-lg font-bold text-emerald-600">
                                                    {formData.coursePrice ? `$${formData.coursePrice}` : 'Free'}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {formData.category || 'Category'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Course Stats */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                                            <FiUsers className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                                            <p className="text-xs text-gray-500">Students</p>
                                            <p className="text-sm font-semibold text-gray-900">0</p>
                                        </div>
                                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                                            <FiStar className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                                            <p className="text-xs text-gray-500">Rating</p>
                                            <p className="text-sm font-semibold text-gray-900">0.0</p>
                                        </div>
                                    </div>

                                    {/* Course Details */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                                            <span className="text-sm text-gray-600">Level</span>
                                            <span className="text-sm font-medium text-emerald-700">{formData.courseLevel}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                            <span className="text-sm text-gray-600">Category</span>
                                            <span className="text-sm font-medium text-blue-700">{formData.category || 'Not set'}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                            <span className="text-sm text-gray-600">Status</span>
                                            <span className={`text-sm font-medium px-2 py-1 rounded-full ${course?.isPublished
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {course?.isPublished ? 'Published' : 'Draft'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Form Validation Status */}
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Form Validation</h4>
                                        <div className="space-y-2">
                                            {[
                                                { field: 'courseTitle', label: 'Course Title', value: formData.courseTitle },
                                                { field: 'category', label: 'Category', value: formData.category },
                                                { field: 'courseLevel', label: 'Level', value: formData.courseLevel },
                                                { field: 'courseDescription', label: 'Description', value: formData.courseDescription }
                                            ].map((item) => (
                                                <div key={item.field} className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${item.value && item.value.toString().trim() !== ''
                                                        ? 'bg-green-500'
                                                        : 'bg-red-500'
                                                        }`} />
                                                    <span className="text-xs text-gray-600">{item.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <FiEye className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p className="text-sm">Click "Preview" to see how your course will appear</p>
                                </div>
                            )}


                        </motion.div>
                    </div>
                </div>
            </div>

            <Toaster position="top-right" />
        </div>
    );
}

export default EditCourse;