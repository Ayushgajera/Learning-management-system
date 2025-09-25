import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiTrash2, FiPlus, FiBook, FiUsers, FiDollarSign, FiEye, FiStar, FiTag, FiCalendar, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useGetAllCoursesQuery, useRemoveCourseMutation } from '@/features/api/courseApi';
import { toast } from 'sonner';

// Subtle SVG animation component for card accent
const AccentSVG = ({ className = '' }) => (
  <svg className={`w-20 h-20 opacity-40 ${className}`} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <defs>
      <linearGradient id="g1" x1="0" x2="1">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="100%" stopColor="#60a5fa" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="40" stroke="url(#g1)" strokeWidth="2" />
    <motion.circle cx="50" cy="50" r="20" stroke="url(#g1)" strokeWidth="1.5"
      initial={{ r: 16, opacity: 0.6 }}
      animate={{ r: 22, opacity: 0.2 }}
      transition={{ repeat: Infinity, repeatType: 'reverse', duration: 3 }}
    />
  </svg>
);

function CourseTable() {
  const { data, isLoading, error, refetch } = useGetAllCoursesQuery();
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [removeCourse, { data: removeCourseData, isLoading: removeCourseLoading }] = useRemoveCourseMutation();

  useEffect(() => {
    refetch();
  }, []);

  const handleRemoveCourse = async () => {
    try {
      await removeCourse(selectedCourseId).unwrap();
      toast.success('Course deleted successfully!');
      refetch();
      setShowDeletePopup(false);
    } catch (error) {
      toast.error('Failed to delete course. Please try again.');
    }
  };

  // Loading state with a futuristic glass skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-gray-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gradient-to-r from-emerald-100 to-blue-100 dark:from-emerald-800/40 dark:to-blue-900/40 rounded-2xl shadow-inner"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-white/10 dark:border-gray-700/40 p-6">
                  <div className="h-36 bg-gradient-to-br from-white/60 to-white/30 dark:from-white/5 rounded-xl"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced error state with retry option
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-gray-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-white/40 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl border border-white/10 dark:border-gray-700 p-6"
          >
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100/80 dark:bg-red-900/40 mb-4">
              <FiBook className="h-7 w-7 text-red-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Failed to load courses</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error.message || 'An unexpected error occurred'}</p>
            <motion.button
              onClick={() => refetch()}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white font-medium shadow-md hover:brightness-105 transition"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Retry
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Helper functions
  const formatPrice = (price) => {
    return price ? `$${Number(price)}` : 'Free';
  };

  const getEnrolledStudentsCount = (course) => {
    return course.enrolledStudents?.length || 0;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Empty state
  if (!data?.courses || data.courses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-gray-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-5xl mx-auto">
          <motion.div className="sm:flex sm:items-center sm:justify-between mb-8" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Your Courses</h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg">Get started by creating your first course</p>
            </div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }}>
              <Link to="/admin/courses/create" className="inline-flex items-center gap-3 px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-md hover:scale-105 transition-transform">
                <FiPlus className="h-5 w-5" />
                Create New Course
              </Link>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center py-16 bg-white/40 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl border border-white/10 dark:border-gray-700/30 shadow-lg">
            <AccentSVG className="mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">No courses yet</h3>
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">Create your first course to get started.</p>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }} className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium shadow-md">
              Start Creating
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main content with courses
  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          className="sm:flex sm:items-center sm:justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Your Courses</h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">Manage and monitor your course catalog</p>
          </div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Link to="/admin/courses/create" className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-md hover:scale-105 transition-transform">
              <FiPlus className="h-5 w-5" />
              Create New Course
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {[
            { label: 'Total Courses', value: data.courses.length, icon: <FiBook className="w-7 h-7 text-white" />, color: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
            { label: 'Published', value: data.courses.filter(c => c.ispublished).length, icon: <FiEye className="w-6 h-6 text-white" />, color: 'bg-gradient-to-br from-emerald-500 to-emerald-600' },
            { label: 'Total Students', value: data.courses.reduce((sum, c) => sum + getEnrolledStudentsCount(c), 0), icon: <FiUsers className="w-6 h-6 text-white" />, color: 'bg-gradient-to-br from-purple-500 to-pink-500' },
            { label: 'Total Revenue', value: `$${data.courses.reduce((sum, c) => sum + (c.coursePrice * getEnrolledStudentsCount(c)), 0)}`, icon: <FiDollarSign className="w-6 h-6 text-white" />, color: 'bg-gradient-to-br from-amber-500 to-orange-500' }
          ].map((stat, index) => (
            <motion.div key={stat.label} className="rounded-2xl p-4 shadow-lg border border-white/10 bg-white/30 dark:bg-gray-800/50 backdrop-blur-md" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + index * 0.06 }} whileHover={{ translateY: -6 }}>
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${stat.color} shadow-md`}>{stat.icon}</div>
                <div className="text-right">
                  <p className="text-sm text-gray-200/90">{stat.label}</p>
                  <p className="text-xl font-bold text-white mt-1">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Courses List */}
        <motion.div className="grid grid-cols-1 gap-6" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          {data.courses.map((course, index) => (
            <motion.div key={course._id} className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/30 dark:bg-gray-800/50 backdrop-blur-md shadow-2xl" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 + index * 0.03 }} whileHover={{ scale: 1.01 }}>
              {/* Decorative accent */}
              <div className="absolute -top-8 -right-8 opacity-30 pointer-events-none">
                <AccentSVG />
              </div>

              <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Thumbnail / left */}
                <div className="col-span-1 lg:col-span-2 flex items-center justify-center">
                  <div className="h-20 w-20 rounded-xl overflow-hidden bg-gradient-to-br from-white/50 to-white/20 dark:from-white/5 dark:to-white/2 flex items-center justify-center shadow-inner">
                    {course?.courseThumbnail ? (
                      <img src={course.courseThumbnail} alt={course.courseTitle} className="h-20 w-20 object-cover" />
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                        <FiBook className="h-6 w-6 text-emerald-600" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Main info */}
                <div className="col-span-1 lg:col-span-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100">{course.courseTitle}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">{course.subTitle}</p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${course.ispublished ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                        {course.ispublished ? <FiCheckCircle className="h-4 w-4" /> : <FiXCircle className="h-4 w-4" />}
                        {course.ispublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-gray-500 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <FiTag className="h-4 w-4" />
                      <div>
                        <div className="text-xs">Category</div>
                        <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{course.category}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <FiUsers className="h-4 w-4" />
                      <div>
                        <div className="text-xs">Students</div>
                        <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{getEnrolledStudentsCount(course)}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <FiDollarSign className="h-4 w-4" />
                      <div>
                        <div className="text-xs">Price</div>
                        <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{formatPrice(course.coursePrice)}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <FiStar className="h-4 w-4" />
                      <div>
                        <div className="text-xs">Rating</div>
                        <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{course.rating || '0'}/5</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meta & Actions */}
                <div className="col-span-1 lg:col-span-4 flex flex-col lg:items-end gap-3">
                  <div className="text-sm text-gray-500 dark:text-gray-300">Created: <span className="font-medium text-gray-900 dark:text-gray-100">{formatDate(course.createdAt)}</span></div>

                  <div className="flex items-center gap-3">
                    <Link to={`/admin/courses/edit/${course._id}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-sm border border-white/5 text-sm font-medium transition-transform hover:scale-105">
                      <FiEdit2 className="h-4 w-4" /> Edit
                    </Link>

                    <button onClick={() => { setSelectedCourseId(course._id); setShowDeletePopup(true); }} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white hover:brightness-105 text-sm font-medium transition-transform">
                      <FiTrash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeletePopup && (
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-course-title"
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDeletePopup(false)} />

              <motion.div
                className="relative bg-white/40 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl shadow-2xl p-6 w-full max-w-md border border-white/10 dark:border-gray-700"
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ duration: 0.18 }}
              >
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100/80 dark:bg-red-900/40 mb-4">
                    <FiTrash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 id="delete-course-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Delete Course</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to delete this course? This action cannot be undone.</p>

                  <div className="flex gap-3">
                    <motion.button
                      onClick={() => setShowDeletePopup(false)}
                      className="flex-1 px-4 py-2 rounded-lg bg-white/10 dark:bg-white/5 text-sm font-medium backdrop-blur-sm border border-white/5 hover:brightness-105"
                      whileHover={{ scale: 1.02 }}
                    >
                      Cancel
                    </motion.button>

                    <motion.button
                      onClick={handleRemoveCourse}
                      disabled={removeCourseLoading}
                      className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-medium shadow-md disabled:opacity-60"
                      whileHover={{ scale: 1.02 }}
                    >
                      {removeCourseLoading ? 'Deleting...' : 'Delete'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default CourseTable;
