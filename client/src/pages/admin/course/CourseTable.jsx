import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiBook,
  FiUsers,
  FiDollarSign,
  FiStar,
  FiTag,
  FiCheckCircle,
  FiXCircle,
  FiSearch,
  FiFilter,
  FiLayers,
  FiClock,
  FiGrid,
  FiList,
  FiMoreVertical
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useGetAllCoursesQuery, useRemoveCourseMutation } from '@/features/api/courseApi';
import { toast } from 'sonner';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (dateString) => {
  if (!dateString) return 'Not available';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatPrice = (price) => {
  if (!price || Number(price) === 0) return 'Free';
  return formatCurrency(Number(price));
};

const getLectureCount = (course) => {
  if (Array.isArray(course?.lectures)) return course.lectures.length;
  if (typeof course?.totalLectures === 'number') return course.totalLectures;
  return 0;
};

const getEnrolledStudentsCount = (course) => course?.enrolledStudents?.length || 0;

const getRatingValue = (course) => {
  const rating = Number(course?.rating || course?.averageRating || 0);
  return Number.isNaN(rating) ? '0.0' : rating.toFixed(1);
};

function CourseTable() {
  const { data, isLoading, error, refetch } = useGetAllCoursesQuery();
  const courses = data?.courses || [];
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [removeCourse, { isLoading: removeCourseLoading }] = useRemoveCourseMutation();
  const navigate = useNavigate();

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleRemoveCourse = async () => {
    try {
      await removeCourse(selectedCourseId).unwrap();
      toast.success('Course deleted successfully!');
      refetch();
      setShowDeletePopup(false);
    } catch (requestError) {
      toast.error('Failed to delete course. Please try again.');
    }
  };

  const stats = useMemo(() => {
    const totalCourses = courses.length;
    const publishedCourses = courses.filter((course) => course.ispublished).length;
    const draftCourses = totalCourses - publishedCourses;
    const totalStudents = courses.reduce((sum, course) => sum + getEnrolledStudentsCount(course), 0);

    return { totalCourses, publishedCourses, draftCourses, totalStudents };
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'published'
            ? course.ispublished
            : !course.ispublished;

      const text = `${course.courseTitle || ''} ${course.subTitle || ''} ${course.category || ''}`.toLowerCase();
      const matchesSearch = text.includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [courses, searchTerm, statusFilter]);

  const statusFilters = useMemo(
    () => [
      { key: 'all', label: 'All', count: stats.totalCourses },
      { key: 'published', label: 'Published', count: stats.publishedCourses },
      { key: 'draft', label: 'Drafts', count: stats.draftCourses },
    ],
    [stats.draftCourses, stats.publishedCourses, stats.totalCourses]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 p-6 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-slate-500 animate-pulse">Loading course data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-red-50 dark:bg-rose-900/10 p-4 rounded-full mb-4">
          <FiXCircle className="w-8 h-8 text-rose-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Error Loading Courses</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
          {error.message || 'We encountered an issue while fetching your course catalog.'}
        </p>
        <button
          onClick={() => refetch()}
          className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-4 md:p-8 pt-24 pb-20 font-sans text-slate-900 dark:text-white">
      <div className="max-w-[1600px] mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-display text-slate-900 dark:text-white">Courses</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Manage your learning content, track performance, and update course details.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 flex items-center">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                <FiList className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                <FiGrid className="w-5 h-5" />
              </button>
            </div>
            <Link
              to="/admin/courses/create"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
            >
              <FiPlus className="w-5 h-5" />
              <span>Create Course</span>
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
          <div className="flex items-center w-full md:w-auto gap-4 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {statusFilters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setStatusFilter(filter.key)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-colors ${statusFilter === filter.key
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                {filter.label} <span className="ml-1 opacity-60">({filter.count})</span>
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Content Area */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiSearch className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No courses found</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Try adjusting your search or filters.</p>
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
              className="text-indigo-600 hover:underline font-medium"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            {viewMode === 'table' ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="px-6 py-4">Course</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4 text-center">Enrolled</th>
                        <th className="px-6 py-4 text-center">Rating</th>
                        <th className="px-6 py-4 text-center">Last Updated</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredCourses.map((course) => (
                        <tr key={course._id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <img
                                src={course.courseThumbnail || "https://placehold.co/100x100?text=No+Img"}
                                alt=""
                                className="h-12 w-12 rounded-lg object-cover bg-slate-200"
                              />
                              <div>
                                <h4 className="font-semibold text-slate-900 dark:text-white line-clamp-1 max-w-[200px] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {course.courseTitle}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                  {course.category}
                                  <span className="mx-1">•</span>
                                  {getLectureCount(course)} lectures
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${course.ispublished ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-400' : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400'}`}>
                              {course.ispublished ? <FiCheckCircle className="w-3 h-3" /> : <FiClock className="w-3 h-3" />}
                              {course.ispublished ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                            {formatPrice(course.coursePrice)}
                          </td>
                          <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-300">
                            {getEnrolledStudentsCount(course)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 dark:bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400 font-medium text-sm">
                              <FiStar className="w-3.5 h-3.5 fill-current" />
                              {getRatingValue(course)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                            {formatDate(course.updatedAt)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => navigate(`/admin/courses/edit/${course._id}`)}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-all"
                                title="Edit"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => { setSelectedCourseId(course._id); setShowDeletePopup(true); }}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                                title="Delete"
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
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCourses.map((course) => (
                  <motion.div
                    key={course._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-300 flex flex-col"
                  >
                    <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <img
                        src={course.courseThumbnail || "https://placehold.co/400x300?text=No+Thumbnail"}
                        alt={course.courseTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-slate-900 dark:text-white shadow-sm">
                        {formatPrice(course.coursePrice)}
                      </div>
                      <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm shadow-sm ${course.ispublished ? 'bg-green-500/90 text-white' : 'bg-amber-500/90 text-white'}`}>
                        {course.ispublished ? 'Published' : 'Draft'}
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] uppercase font-bold tracking-wider text-slate-500">
                          {course.category || 'General'}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-medium text-amber-500 ml-auto">
                          <FiStar className="fill-current w-3 h-3" />
                          {getRatingValue(course)}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2 line-clamp-2 leading-tight">
                        {course.courseTitle}
                      </h3>

                      {course.subTitle && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-1">
                          {course.subTitle}
                        </p>
                      )}

                      <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <FiUsers className="w-3.5 h-3.5" /> {getEnrolledStudentsCount(course)}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiLayers className="w-3.5 h-3.5" /> {getLectureCount(course)}
                          </span>
                        </div>
                        <div>
                          {formatDate(course.updatedAt)}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0 flex gap-2">
                      <button
                        onClick={() => navigate(`/admin/courses/edit/${course._id}`)}
                        className="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white text-slate-600 dark:text-slate-300 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                      >
                        <FiEdit2 className="w-4 h-4" /> Edit
                      </button>
                      <button
                        onClick={() => { setSelectedCourseId(course._id); setShowDeletePopup(true); }}
                        className="w-12 flex items-center justify-center bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white rounded-xl transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Delete Modal */}
        <AnimatePresence>
          {showDeletePopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/20 rounded-full flex items-center justify-center mb-4">
                    <FiTrash2 className="w-8 h-8 text-rose-600 dark:text-rose-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Course?</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs">
                    This will permanently remove the course and all associated data. This action cannot be undone.
                  </p>
                  <div className="flex gap-3 w-full">
                    <button
                      onClick={() => setShowDeletePopup(false)}
                      className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRemoveCourse}
                      disabled={removeCourseLoading}
                      className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-lg shadow-rose-500/20 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {removeCourseLoading ? 'Deleting...' : 'Delete'}
                    </button>
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
