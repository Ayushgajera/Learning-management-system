import React, { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiBook, FiGrid, FiPlus, FiX, FiLoader, FiChevronDown, FiCheck, FiStar, FiZap, FiArrowLeft } from "react-icons/fi";
import { useCreateCourseMutation } from "@/features/api/courseApi";
import { useNavigate } from "react-router-dom";
import { Listbox } from "@headlessui/react";
import { ThemeContext } from "@/extensions/ThemeProvider";


// ✅ Constants for category options
const COURSE_CATEGORIES = [
  "Web Development", "Mobile Development", "Design", "Marketing", "Data Science",
  "Business", "AI & Machine Learning", "Cybersecurity", "Cloud Computing", "DevOps",
  "Game Development", "Digital Marketing", "UI/UX Design"
];

// ✅ Futuristic Input Component with Glassmorphism
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

// ✅ Futuristic Select Component with Glassmorphism
const FormSelect = ({ label, icon: Icon, options, error, value, onChange }) => (
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
      <Listbox value={value} onChange={(val) => onChange({ target: { name: "category", value: val } })}>
        <Listbox.Button
          className={`block w-full pl-12 pr-12 py-3.5 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md 
          border border-gray-200/50 dark:border-gray-700/50 rounded-2xl text-left
          focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 dark:focus:ring-blue-400/50
          transition-all duration-300 text-gray-800 dark:text-gray-100 shadow-sm hover:shadow-md
          ${error ? "border-rose-300 bg-rose-50/80 dark:bg-rose-900/20" : ""}`}
        >
          <span className={value ? "text-gray-800 dark:text-gray-100" : "text-gray-400 dark:text-gray-500"}>
            {value || "Select a category"}
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
                animate={{ opacity: 1, x: 0, transition: { delay: index * 0.05 } }}
                className={({ active, selected }) =>
                  `cursor-pointer select-none py-3 pl-12 pr-4 transition-colors duration-200 ${
                    active ? "bg-blue-50/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : 
                    "text-gray-700 dark:text-gray-200"
                  } ${selected ? "bg-blue-100/50 dark:bg-blue-800/30" : ""}`
                }
              >
                {({ selected }) => (
                  <>
                    {selected && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                        <FiCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </span>
                    )}
                    {opt}
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

function AddCourse() {
  const [formData, setFormData] = useState({ courseTitle: "", category: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isFormFocused, setIsFormFocused] = useState(false);

  const navigate = useNavigate();
  const [createCourse, { isLoading }] = useCreateCourseMutation();
  const { isDarkMode } = useContext(ThemeContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (apiError) setApiError(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.courseTitle.trim()) newErrors.courseTitle = "Course title is required";
    if (!formData.category) newErrors.category = "Please select a category";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    if (!validateForm()) return;

    try {
      await createCourse(formData).unwrap();
      navigate("/admin/courses");
    } catch (error) {
      setApiError(error?.data?.message || "Failed to create course. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 
                    dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 
                    p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0  pointer-events-none">
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

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/admin/courses')}
          className="mb-6 flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 
                     hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200
                     bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-xl border border-gray-200/50 dark:border-gray-700/50
                     hover:shadow-md transform hover:scale-105"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl 
                     border border-gray-200/50 dark:border-gray-700/50 
                     hover:shadow-3xl transition-all duration-500"
          style={{
            boxShadow: isDarkMode 
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
              : '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Header Section */}
          <div className="relative p-8 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10 
                          dark:from-blue-400/20 dark:via-purple-400/20 dark:to-green-400/20">
            <div className="absolute top-0 left-0 w-full h-full bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm" />
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 
                          rounded-2xl flex items-center justify-center shadow-lg"
              >
                <FiZap className="w-8 h-8 text-white" />
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-center bg-gradient-to-r from-gray-800 to-gray-600 
                          dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent"
              >
                Create New Course
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-2 text-center text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
              >
                Transform your expertise into engaging educational content that inspires learners worldwide
              </motion.p>
            </div>
          </div>

          {/* Form Section */}
          <motion.form 
            onSubmit={handleSubmit} 
            className="p-8 space-y-8"
            onFocus={() => setIsFormFocused(true)}
            onBlur={() => setIsFormFocused(false)}
          >
            {/* API Error Alert */}
            <AnimatePresence>
              {apiError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -20 }} 
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  className="flex items-start p-4 bg-rose-50/80 dark:bg-rose-900/30 backdrop-blur-md 
                            border border-rose-200/50 dark:border-rose-800/50 rounded-2xl"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-rose-100 dark:bg-rose-800/50 rounded-xl 
                                 flex items-center justify-center mr-3">
                    <FiX className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-rose-800 dark:text-rose-200">Error</h3>
                    <p className="text-sm text-rose-700 dark:text-rose-300 mt-1">{apiError}</p>
                  </div>
                  <button
                    onClick={() => setApiError(null)}
                    className="ml-4 text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-200 
                              transition-colors duration-200"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form Fields */}
            <div className="grid grid-cols-1 gap-8">
              <FormInput
                label="Course Title"
                name="courseTitle"
                value={formData.courseTitle}
                onChange={handleChange}
                placeholder="Enter an engaging course title..."
                icon={FiBook}
                error={errors.courseTitle}
              />

              <FormSelect
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                options={COURSE_CATEGORIES}
                icon={FiGrid}
                error={errors.category}
              />
            </div>

            {/* Submit Button */}
            <motion.div 
              className="pt-6 flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                type="submit" 
                disabled={isLoading}
                className={`group relative px-8 py-4 rounded-2xl font-semibold text-white
                  bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-size-200 bg-pos-0
                  hover:bg-pos-100 transition-all duration-500 shadow-lg hover:shadow-xl
                  transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 
                  focus:ring-blue-500/50 dark:focus:ring-blue-400/50 min-w-[200px]
                  ${isLoading ? "cursor-not-allowed opacity-70" : "hover:shadow-blue-500/25"}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  backgroundSize: '200% 100%',
                  backgroundPosition: isLoading ? '100% 0' : '0% 0'
                }}
              >
                <span className="relative flex items-center justify-center space-x-2">
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <FiLoader className="h-5 w-5" />
                      </motion.div>
                      <span>Creating Course...</span>
                    </>
                  ) : (
                    <>
                      <FiStar className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                      <span>Create Course</span>
                      <FiPlus className="h-4 w-4 ml-1 group-hover:rotate-90 transition-transform duration-300" />
                    </>
                  )}
                </span>
                
                {/* Button Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 
                               opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl" />
              </motion.button>
            </motion.div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}

export default AddCourse;
