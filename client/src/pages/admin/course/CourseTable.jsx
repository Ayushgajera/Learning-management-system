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
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useGetAllCoursesQuery, useRemoveCourseMutation } from '@/features/api/courseApi';
import { toast } from 'sonner';

const AccentSVG = ({ className = '' }) => (
  <svg
    className={`w-20 h-20 opacity-40 ${className}`}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <defs>
      <linearGradient id="g1" x1="0" x2="1">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="100%" stopColor="#60a5fa" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="40" stroke="url(#g1)" strokeWidth="2" />
    <motion.circle
      cx="50"
      cy="50"
      r="20"
      stroke="url(#g1)"
      strokeWidth="1.5"
      initial={{ r: 16, opacity: 0.6 }}
      animate={{ r: 22, opacity: 0.2 }}
      transition={{ repeat: Infinity, repeatType: 'reverse', duration: 3 }}
    />
  </svg>
);

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
  const [removeCourse, { isLoading: removeCourseLoading }] = useRemoveCourseMutation();

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
    const totalRevenue = courses.reduce(
      (sum, course) => sum + (Number(course.coursePrice) || 0) * getEnrolledStudentsCount(course),
      0
    );
    const averageRating =
      totalCourses > 0
        ? Number(
            (
              courses.reduce((sum, course) => sum + Number(course.rating || course.averageRating || 0), 0) /
              totalCourses
            ).toFixed(1)
          )
        : 0;

    return { totalCourses, publishedCourses, draftCourses, totalStudents, totalRevenue, averageRating };
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
        <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
          <div className="h-10 w-2/5 rounded-2xl bg-white/70 dark:bg-slate-900/50" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, index) => (
              <div key={`s-${index}`} className="h-28 rounded-3xl border border-white/40 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50" />
            ))}
          </div>
          <div className="h-80 rounded-3xl border border-white/40 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl p-10 text-center shadow-2xl"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-500/10">
              <FiBook className="h-7 w-7 text-rose-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Unable to load courses</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
              {error.message || 'An unexpected error occurred. Please refresh and try again.'}
            </p>
            <motion.button
              onClick={() => refetch()}
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Retry
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!stats.totalCourses) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <motion.div
            className="flex flex-col gap-4 rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl p-8 shadow-2xl"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-400">Courses</p>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">No courses yet</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                Create your first course to populate the catalog and start enrolling learners.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/admin/courses/create"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg"
              >
                <FiPlus className="h-4 w-4" />
                Create course
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
            className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl p-10 text-center"
          >
            <AccentSVG className="mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Publish your first learning path</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">Upload content, set pricing, and monitor performance from this workspace.</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 pt-20">
      <div className="mx-auto max-w-7xl space-y-8">
        <motion.header
          className="flex flex-col gap-5 rounded-3xl border border-slate-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl p-6 shadow-2xl"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Courses</p>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">Course control center</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Monitor publishing status, learners, and revenue in one workspace.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-300">
                {stats.publishedCourses} published · {stats.draftCourses} drafts
              </div>
              <Link
                to="/admin/courses/create"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-5 py-2 text-sm font-semibold text-white shadow-lg"
              >
                <FiPlus className="h-4 w-4" />
                New course
              </Link>
            </div>
          </div>
        </motion.header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: 'Total courses',
              value: stats.totalCourses,
              meta: `${stats.publishedCourses} live now`,
              icon: <FiBook className="h-5 w-5" />,
              accent: 'bg-sky-500/10 text-sky-600 dark:text-sky-300',
            },
            {
              label: 'Learners',
              value: stats.totalStudents,
              meta: 'Across all cohorts',
              icon: <FiUsers className="h-5 w-5" />,
              accent: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
            },
            {
              label: 'Lifetime revenue',
              value: formatCurrency(stats.totalRevenue),
              meta: `${formatCurrency(stats.totalCourses ? stats.totalRevenue / stats.totalCourses : 0)} avg / course`,
              icon: <FiDollarSign className="h-5 w-5" />,
              accent: 'bg-amber-500/10 text-amber-600 dark:text-amber-300',
            },
            {
              label: 'Average rating',
              value: `${stats.averageRating.toFixed(1)} / 5`,
              meta: 'Learner satisfaction',
              icon: <FiStar className="h-5 w-5" />,
              accent: 'bg-rose-500/10 text-rose-600 dark:text-rose-300',
            },
          ].map((card) => (
            <motion.article
              key={card.label}
              className="rounded-3xl border border-slate-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl p-5 shadow-lg"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">{card.label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{card.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-300">{card.meta}</p>
                </div>
                <span className={`inline-flex rounded-2xl p-3 ${card.accent}`}>{card.icon}</span>
              </div>
            </motion.article>
          ))}
        </section>

        <section className="rounded-3xl border border-slate-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <label className="sr-only" htmlFor="course-search">
                Search courses
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="course-search"
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by title, subtitle, or category"
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent py-2.5 pl-10 pr-4 text-sm text-slate-700 dark:text-white placeholder:text-slate-400"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <FiFilter className="h-4 w-4" />
              Status filter
            </div>
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setStatusFilter(filter.key)}
                  className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                    statusFilter === filter.key
                      ? 'border-indigo-200 bg-indigo-600/10 text-indigo-600 dark:border-indigo-500/40 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500'
                  }`}
                >
                  <FiLayers className="h-3.5 w-3.5" />
                  {filter.label}
                  <span className="rounded-xl bg-white/40 px-2 py-0.5 text-[10px] text-slate-500 dark:bg-white/10 dark:text-slate-300">
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Showing {filteredCourses.length} of {stats.totalCourses} courses
          </div>
        </section>

        <section className="space-y-4">
          {filteredCourses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-10 text-center"
            >
              <p className="text-sm text-slate-500 dark:text-slate-300">No courses match your filters. Try changing the search or status filter.</p>
            </motion.div>
          ) : (
            filteredCourses.map((course, index) => {
              const students = getEnrolledStudentsCount(course);
              const lectures = getLectureCount(course);
              const rating = getRatingValue(course);
              const updatedLabel = formatDate(course.updatedAt);
              return (
                <motion.article
                  key={course._id}
                  className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/95 dark:bg-slate-900/60 px-4 py-3 shadow"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.04 * index } }}
                  whileHover={{ translateY: -2 }}
                >
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70">
                    {course.courseThumbnail ? (
                      <img src={course.courseThumbnail} alt={course.courseTitle} className="h-full w-full object-cover" />
                    ) : (
                      <FiBook className="h-6 w-6 text-slate-400" />
                    )}
                  </div>

                  <div className="min-w-[220px] flex-1 space-y-1">
                    <div className="flex w-full flex-wrap items-center gap-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{course.courseTitle}</h3>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          course.ispublished
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-300'
                        }`}>
                          {course.ispublished ? (
                            <>
                              <FiCheckCircle className="h-3 w-3" /> Live
                            </>
                          ) : (
                            <>
                              <FiXCircle className="h-3 w-3" /> Draft
                            </>
                          )}
                        </span>
                      </div>
                      <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-semibold text-white shadow">
                       {formatPrice(course.coursePrice)}
                      </span>
                    </div>
                    {course.subTitle && <p className="text-xs text-slate-500 dark:text-slate-300">{course.subTitle}</p>}
                    <div className="flex flex-wrap gap-2 text-[12px] text-slate-500">
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-0.5 dark:border-slate-700">
                        <FiTag className="h-3 w-3" /> {course.category || 'General'}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-0.5 dark:border-slate-700">
                        <FiLayers className="h-3 w-3" /> {lectures} lessons
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-300">
                    <span className="inline-flex items-center gap-1">
                      <FiUsers className="h-3.5 w-3.5" /> {students}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <FiStar className="h-3.5 w-3.5 text-amber-400" /> {rating}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <FiClock className="h-3.5 w-3.5" /> {updatedLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <Link
                      to={`/admin/courses/edit/${course._id}`}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-800 dark:text-slate-200"
                    >
                      <FiEdit2 className="h-4 w-4" /> Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCourseId(course._id);
                        setShowDeletePopup(true);
                      }}
                      className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-3 py-1.5 text-xs font-semibold text-white shadow"
                    >
                      <FiTrash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>
                </motion.article>
              );
            })
          )}
        </section>

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
              <div className="fixed inset-0 bg-slate-900/60" onClick={() => setShowDeletePopup(false)} />

              <motion.div
                className="relative w-full max-w-md rounded-3xl border border-slate-200/60 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-6 shadow-2xl"
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
              >
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/20">
                    <FiTrash2 className="h-6 w-6 text-rose-500" />
                  </div>
                  <h3 id="delete-course-title" className="text-lg font-semibold text-slate-900 dark:text-white">
                    Delete course
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                    This action cannot be undone and will permanently remove the course from the catalog.
                  </p>

                  <div className="mt-6 flex gap-3">
                    <motion.button
                      type="button"
                      onClick={() => setShowDeletePopup(false)}
                      className="flex-1 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 dark:border-slate-800 dark:text-slate-200"
                      whileHover={{ scale: 1.01 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={handleRemoveCourse}
                      disabled={removeCourseLoading}
                      className="flex-1 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
                      whileHover={{ scale: removeCourseLoading ? 1 : 1.01 }}
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
