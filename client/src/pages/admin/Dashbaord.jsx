import React, { useState, useEffect, useMemo } from 'react';

import {
  FiUsers,
  FiBookOpen,
  FiDollarSign,
  FiStar,
  FiPlus,
  FiActivity,
  FiTarget,
  FiTrendingUp,
  FiShield,
} from 'react-icons/fi';
import { useGetAllCoursesQuery } from '@/features/api/courseApi';
import { useLoaduserQuery } from '@/features/api/authApi';

function Dashboard() {
  // -- Data state --
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    totalEnrollments: 0,
    averageRating: 0,
    activeCourses: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data
  const { data: coursesData, isLoading: coursesLoading } = useGetAllCoursesQuery();
  const { data: userData } = useLoaduserQuery();
  const courses = coursesData?.courses || [];

  useEffect(() => {
    try {
      if (coursesLoading || !coursesData?.courses) return;

      const fetchedCourses = coursesData.courses;
      const totalCourses = fetchedCourses.length;
      const activeCourses = fetchedCourses.filter((course) => course.ispublished).length;

      const allStudentIds = new Set();
      const totalEnrollments = fetchedCourses.reduce((sum, course) => {
        const enrolled = course.enrolledStudents?.length || 0;
        if (course.enrolledStudents) {
          course.enrolledStudents.forEach((id) => allStudentIds.add(id));
        }
        return sum + enrolled;
      }, 0);

      const totalRevenue = fetchedCourses.reduce((sum, course) => {
        const enrolled = course.enrolledStudents?.length || 0;
        return sum + (course.coursePrice || 0) * enrolled;
      }, 0);

      const totalStudents = allStudentIds.size;
      const totalRating = fetchedCourses.reduce((sum, c) => sum + (c.rating || c.averageRating || 0), 0);
      const averageRating = totalCourses > 0 ? Number((totalRating / totalCourses).toFixed(1)) : 0;

      setStats({ totalCourses, totalStudents, totalRevenue, totalEnrollments, averageRating, activeCourses });
      setIsLoading(false);
    } catch (err) {
      setError(err);
      setIsLoading(false);
    }
  }, [coursesData, coursesLoading]);

  // -- Helpers --
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount || 0);
  const formatNumber = (n) => new Intl.NumberFormat('en-US').format(n || 0);
  const formatPercent = (value) => `${Math.min(100, Math.max(0, value || 0)).toFixed(0)}%`;

  // -- Derived metrics --
  const publicationRate = useMemo(
    () => (stats.totalCourses ? (stats.activeCourses / stats.totalCourses) * 100 : 0),
    [stats.totalCourses, stats.activeCourses]
  );
  const satisfactionRate = useMemo(
    () => (stats.averageRating ? (stats.averageRating / 5) * 100 : 0),
    [stats.averageRating]
  );
  const revenuePerStudent = useMemo(
    () => (stats.totalStudents ? stats.totalRevenue / stats.totalStudents : 0),
    [stats.totalStudents, stats.totalRevenue]
  );
  const revenuePerCourse = useMemo(
    () => (stats.totalCourses ? stats.totalRevenue / stats.totalCourses : 0),
    [stats.totalCourses, stats.totalRevenue]
  );
  const enrollmentPerCourse = useMemo(
    () => (stats.totalCourses ? stats.totalEnrollments / stats.totalCourses : 0),
    [stats.totalCourses, stats.totalEnrollments]
  );

  const recentCourses = useMemo(() => courses.slice(0, 5), [courses]);
  const bestSeller = useMemo(() => {
    if (!courses.length) return null;
    return courses.reduce((best, current) => {
      const currentEnrollments = current.enrolledStudents?.length || 0;
      const bestEnrollments = best?.enrolledStudents?.length || 0;
      return currentEnrollments > bestEnrollments ? current : best;
    }, null);
  }, [courses]);

  const highestRated = useMemo(() => {
    if (!courses.length) return null;
    return courses.reduce((top, current) => {
      const currentRating = current.rating || current.averageRating || 0;
      const topRating = top ? top.rating || top.averageRating || 0 : 0;
      return currentRating > topRating ? current : top;
    }, null);
  }, [courses]);

  // -- Motion variants --
  const page = {
    hidden: { opacity: 0, y: 8 },
    enter: { opacity: 1, y: 0, transition: { duration: 0.6, when: 'beforeChildren', staggerChildren: 0.06 } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.35 } },
  };

  const card = {
    hidden: { opacity: 0, y: 12 },
    enter: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  };

  // -- Dashboard data for cards --
  const dashboardCards = [
    {
      key: 'courses',
      label: 'Total Courses',
      value: formatNumber(stats.totalCourses),
      icon: <FiBookOpen className="w-5 h-5" />,
      hint: `${stats.activeCourses} live now`,
      color: 'from-sky-500 to-sky-600',
    },
    {
      key: 'students',
      label: 'Learners',
      value: formatNumber(stats.totalStudents),
      icon: <FiUsers className="w-5 h-5" />,
      hint: `${formatNumber(stats.totalEnrollments)} enrollments`,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      key: 'revenue',
      label: 'Lifetime Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: <FiDollarSign className="w-5 h-5" />,
      hint: `${formatCurrency(revenuePerCourse)} / course`,
      color: 'from-purple-500 to-purple-600',
    },
    {
      key: 'rating',
      label: 'Avg. Rating',
      value: stats.averageRating || '0.0',
      icon: <FiStar className="w-5 h-5" />,
      hint: 'out of 5',
      color: 'from-amber-500 to-amber-600',
    },
  ];

  const performanceMetrics = [
    {
      label: 'Publication Rate',
      value: publicationRate,
      sublabel: `${stats.activeCourses}/${stats.totalCourses} courses live`,
      accent: 'from-sky-500 via-blue-500 to-indigo-500',
    },
    {
      label: 'Student Satisfaction',
      value: satisfactionRate,
      sublabel: `${stats.averageRating || 0} / 5 average rating`,
      accent: 'from-amber-500 via-orange-500 to-rose-500',
    },
    {
      label: 'Engagement Depth',
      value: Math.min(100, (enrollmentPerCourse / 20) * 100),
      sublabel: `${enrollmentPerCourse.toFixed(1)} enrollments / course`,
      accent: 'from-emerald-500 via-green-500 to-lime-500',
    },
  ];

  const insightCards = useMemo(() => {
    const cards = [];
    if (bestSeller) {
      cards.push({
        key: 'best-seller',
        title: 'Best Seller',
        description: bestSeller.courseTitle,
        meta: `${bestSeller.enrolledStudents?.length || 0} active learners`,
        icon: <FiTrendingUp className="w-5 h-5" />,
        accent: 'text-emerald-500 bg-emerald-500/15',
      });
    }
    if (highestRated) {
      cards.push({
        key: 'top-rated',
        title: 'Highest Rated',
        description: highestRated.courseTitle,
        meta: `${highestRated.rating || highestRated.averageRating || 0} ★ average`,
        icon: <FiStar className="w-5 h-5" />,
        accent: 'text-amber-500 bg-amber-500/15',
      });
    }
    if (stats.totalCourses) {
      cards.push({
        key: 'health',
        title: 'Publication Health',
        description: `${stats.activeCourses} of ${stats.totalCourses} courses live`,
        meta: `${publicationRate.toFixed(1)}% publication rate`,
        icon: <FiShield className="w-5 h-5" />,
        accent: 'text-sky-500 bg-sky-500/15',
      });
    }
    return cards;
  }, [bestSeller, highestRated, stats.activeCourses, stats.totalCourses, publicationRate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
        <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
          <div className="h-10 w-1/3 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-32 rounded-2xl bg-white/70 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800" />
            ))}
          </div>
          <div className="h-64 rounded-3xl bg-white/70 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-3xl border border-slate-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md p-8 text-center shadow-2xl">
          <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Unable to load dashboard</h3>
          <p className="text-sm text-slate-500 dark:text-slate-300 mb-6">There was an issue fetching the latest metrics. Please refresh to try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const hasInsights = insightCards.length > 0;
  const hasRecentCourses = recentCourses.length > 0;
  const leftColumnSpanClass = hasInsights ? 'xl:col-span-2' : 'xl:col-span-3';

  return (
    <motion.main
      initial="hidden"
      animate="enter"
      exit="exit"
      variants={page}
      className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 pt-20"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-16 -left-10 w-72 h-72 rounded-full bg-violet-400/40 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 right-0 w-[28rem] h-[28rem] rounded-full bg-cyan-300/30 blur-3xl"
        animate={{ x: [0, -40, 0] }}
        transition={{ duration: 14, repeat: Infinity }}
      />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <motion.h1
                className="text-4xl font-black tracking-tight text-slate-900 dark:text-white"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.05 } }}
              >
                Instructor Control Center
              </motion.h1>
              <p className="mt-2 text-sm sm:text-base text-slate-500 dark:text-slate-300">
                Welcome back, <span className="font-semibold text-slate-900 dark:text-white">{userData?.user?.name || 'Admin'}</span>. Monitor health,
                revenue, and learner engagement in one place.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-200 shadow-sm"
              >
                <FiActivity className="w-4 h-4" />
                Live metrics
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30"
              >
                <FiPlus className="w-4 h-4" />
                New course
              </motion.button>
            </div>
          </div>
        </header>

        {/* Primary stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
          {dashboardCards.map((cardData) => (
            <motion.article
              key={cardData.key}
              variants={card}
              className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl p-5 shadow-lg shadow-slate-200/50 dark:shadow-none"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">{cardData.label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{cardData.value}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{cardData.hint}</p>
                </div>
                <span className={`inline-flex rounded-2xl bg-gradient-to-br ${cardData.color} p-3 text-white shadow-md`}>
                  {cardData.icon}
                </span>
              </div>
            </motion.article>
          ))}
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left rail */}
          <motion.section
            variants={card}
            className={`${leftColumnSpanClass} rounded-3xl border border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl p-6 shadow-lg shadow-slate-200/40 dark:shadow-none`}
          >
            <div className={`grid gap-6 ${hasRecentCourses ? 'lg:grid-cols-2' : ''}`}>
              {/* Performance snapshot */}
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Health</p>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Performance snapshot</h3>
                  </div>
                  <FiTarget className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="space-y-4">
                  {performanceMetrics.map((metric) => (
                    <div key={metric.label}>
                      <div className="flex items-center justify-between text-sm font-medium text-slate-600 dark:text-slate-300">
                        <span>{metric.label}</span>
                        <span>{formatPercent(metric.value)}</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-1">{metric.sublabel}</p>
                      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${metric.accent}`}
                          style={{ width: formatPercent(metric.value) }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent courses */}
              {hasRecentCourses && (
                <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-5 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">Content</p>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent courses</h3>
                    </div>
                    <button className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">View all</button>
                  </div>
                  <div className="space-y-4 flex-1">
                    {recentCourses.map((course, idx) => (
                      <div
                        key={course._id || idx}
                        className="flex items-center gap-3 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 p-3 transition-colors"
                      >
                        <img
                          src={course.courseThumbnail || 'https://placehold.co/64x64/png'}
                          alt={course.courseTitle}
                          className="h-12 w-12 rounded-xl object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{course.courseTitle}</p>
                          <p className="text-xs text-slate-500">{course.creator?.name || 'Unknown'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(course.coursePrice)}</p>
                          <p className="text-xs text-slate-500">{course.enrolledStudents?.length || 0} learners</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Metrics row */}
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                {
                  label: 'Revenue / learner',
                  value: formatCurrency(Math.round(revenuePerStudent || 0)),
                  hint: 'Lifetime average',
                },
                {
                  label: 'Revenue / course',
                  value: formatCurrency(Math.round(revenuePerCourse || 0)),
                  hint: 'Across all offerings',
                },
                {
                  label: 'Enrollments / course',
                  value: `${enrollmentPerCourse.toFixed(1)}x`,
                  hint: 'Engagement depth',
                },
              ].map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-400">{metric.label}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{metric.value}</p>
                  <p className="text-xs text-slate-500">{metric.hint}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Right rail */}
          {hasInsights && (
            <div className="space-y-6">
              <motion.section
                variants={card}
                className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl p-6 shadow-lg shadow-slate-200/40 dark:shadow-none"
              >
                <div className="flex items-center gap-3 mb-4">
                  <FiTrendingUp className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Live insights</h3>
                </div>
                <div className="space-y-4">
                  {insightCards.map((insight) => (
                    <div key={insight.key} className="flex items-start gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
                      <span className={`inline-flex rounded-2xl p-2 ${insight.accent}`}>{insight.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{insight.title}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-300">{insight.description}</p>
                        <p className="text-xs font-semibold text-slate-400 mt-1">{insight.meta}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            </div>
          )}
        </div>

        {/* Bottom section */}
        <motion.section
          variants={card}
          className="mt-10 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl p-6 shadow-lg shadow-slate-200/40 dark:shadow-none"
        >
          <div className="flex items-center gap-3 mb-6">
            <FiTarget className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Platform overview</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-4">
              <p className="text-sm text-slate-500">Publication rate</p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{publicationRate.toFixed(1)}%</p>
              <p className="text-xs text-slate-400">Courses live vs. total</p>
            </div>
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-4">
              <p className="text-sm text-slate-500">Revenue per enrollment</p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                {stats.totalEnrollments ? formatCurrency(Math.round(stats.totalRevenue / stats.totalEnrollments)) : formatCurrency(0)}
              </p>
              <p className="text-xs text-slate-400">Average ticket size</p>
            </div>
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-4">
              <p className="text-sm text-slate-500">Courses per learner</p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                {stats.totalStudents ? (stats.totalEnrollments / stats.totalStudents).toFixed(1) : '0.0'}
              </p>
              <p className="text-xs text-slate-400">Cross-sell opportunity</p>
            </div>
          </div>
        </motion.section>
      </div>
    </motion.main>
  );
}

export default Dashboard;