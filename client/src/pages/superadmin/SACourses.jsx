import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiTrash2, FiEye, FiEyeOff, FiBook, FiUsers,
  FiStar, FiChevronLeft, FiChevronRight, FiCheckCircle, FiClock
} from 'react-icons/fi';
import {
  useGetAllPlatformCoursesQuery,
  useToggleCoursePublishMutation,
  useDeleteCourseAdminMutation
} from '@/features/api/adminApi';
import { toast } from 'sonner';

const formatCurrency = (v) => {
  if (!v || Number(v) === 0) return 'Free';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

function SACourses() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const { data, isLoading } = useGetAllPlatformCoursesQuery({
    page, limit: 20, search, status: statusFilter
  });

  const [togglePublish, { isLoading: toggling }] = useToggleCoursePublishMutation();
  const [deleteCourse, { isLoading: deleting }] = useDeleteCourseAdminMutation();

  const courses = data?.courses || [];
  const totalPages = data?.totalPages || 1;

  const handleTogglePublish = async (courseId) => {
    try {
      const res = await togglePublish(courseId).unwrap();
      toast.success(res.message);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to toggle publish status');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCourse(selectedCourse._id).unwrap();
      toast.success('Course deleted');
      setShowDeleteModal(false);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete course');
    }
  };

  const statusFilters = [
    { key: '', label: 'All' },
    { key: 'published', label: 'Published' },
    { key: 'draft', label: 'Drafts' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
          <p className="text-slate-500 animate-pulse">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-display">All Courses</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage all platform courses across all instructors</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center shadow-sm">
        <div className="flex items-center gap-3">
          {statusFilters.map(f => (
            <button
              key={f.key}
              onClick={() => { setStatusFilter(f.key); setPage(1); }}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-colors ${statusFilter === f.key
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80 ml-auto">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" placeholder="Search courses..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Instructor</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4 text-center">Students</th>
                <th className="px-6 py-4 text-center">Rating</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {courses.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-400">No courses found</td></tr>
              ) : courses.map(course => (
                <tr key={course._id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={course.courseThumbnail || 'https://placehold.co/100x100?text=No+Img'}
                        alt="" className="h-11 w-11 rounded-lg object-cover bg-slate-200"
                      />
                      <div className="max-w-[180px]">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">{course.courseTitle}</p>
                        <p className="text-xs text-slate-500">{course.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <img
                        src={course.creator?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.creator?.name || 'I')}&background=3b82f6&color=fff&size=32`}
                        alt="" className="h-7 w-7 rounded-full object-cover"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{course.creator?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${course.ispublished
                      ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-400'
                      : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400'
                      }`}>
                      {course.ispublished ? <FiCheckCircle className="w-3 h-3" /> : <FiClock className="w-3 h-3" />}
                      {course.ispublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{formatCurrency(course.coursePrice)}</td>
                  <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-300">{course.enrolledStudents?.length || 0}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 dark:bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400 font-medium text-sm">
                      <FiStar className="w-3.5 h-3.5 fill-current" />
                      {(course.averageRating || 0).toFixed(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{formatDate(course.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleTogglePublish(course._id)}
                        disabled={toggling}
                        className={`p-2 rounded-lg transition-all ${course.ispublished
                          ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                          : 'text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10'
                          }`}
                        title={course.ispublished ? 'Unpublish' : 'Publish'}
                      >
                        {course.ispublished ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => { setSelectedCourse(course); setShowDeleteModal(true); }}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed">
            <FiChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed">
            <FiChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedCourse && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiTrash2 className="w-8 h-8 text-rose-600 dark:text-rose-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Course?</h3>
                <p className="text-slate-500 mb-1 font-medium">{selectedCourse.courseTitle}</p>
                <p className="text-slate-400 text-xs mb-6">This will permanently remove the course, all lectures, and unenroll all students.</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleDelete} disabled={deleting}
                    className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-lg shadow-rose-500/20 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SACourses;
