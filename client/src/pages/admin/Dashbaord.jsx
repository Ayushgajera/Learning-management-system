import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiBookOpen, FiDollarSign, FiStar, FiPlus, FiActivity, FiTarget, FiBarChart2 } from 'react-icons/fi';
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
    activeCourses: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data
  const { data: coursesData, isLoading: coursesLoading } = useGetAllCoursesQuery();
  const { data: userData } = useLoaduserQuery();

  useEffect(() => {
    try {
      if (!coursesData?.courses) return;

      const courses = coursesData.courses;
      const totalCourses = courses.length;
      const activeCourses = courses.filter(course => course.ispublished).length;

      const allStudentIds = new Set();
      const totalEnrollments = courses.reduce((sum, course) => {
        const enrolled = course.enrolledStudents?.length || 0;
        if (course.enrolledStudents) course.enrolledStudents.forEach(id => allStudentIds.add(id));
        return sum + enrolled;
      }, 0);

      const totalRevenue = courses.reduce((sum, course) => {
        const enrolled = course.enrolledStudents?.length || 0;
        return sum + ((course.coursePrice || 0) * enrolled);
      }, 0);

      const totalStudents = allStudentIds.size;
      const totalRating = courses.reduce((s, c) => s + (c.rating || 0), 0);
      const averageRating = totalCourses > 0 ? (totalRating / totalCourses).toFixed(1) : 0;

      setStats({ totalCourses, totalStudents, totalRevenue, totalEnrollments, averageRating, activeCourses });
      setIsLoading(false);
    } catch (err) {
      setError(err);
      setIsLoading(false);
    }
  }, [coursesData, coursesLoading]);

  // -- Helpers --
  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount || 0);
  const formatNumber = (n) => new Intl.NumberFormat('en-US').format(n || 0);

  // -- Motion variants --
  const page = {
    hidden: { opacity: 0, y: 8 },
    enter: { opacity: 1, y: 0, transition: { duration: 0.6, when: 'beforeChildren', staggerChildren: 0.06 } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.35 } }
  };

  const card = {
    hidden: { opacity: 0, y: 12 },
    enter: { opacity: 1, y: 0, transition: { duration: 0.45 } }
  };

  // -- Dashboard data for cards --
  const dashboardCards = [
    { key: 'courses', label: 'Total Courses', value: formatNumber(stats.totalCourses), icon: <FiBookOpen className="w-6 h-6" />, hint: `${stats.activeCourses} published`, color: 'from-blue-500 to-blue-600' },
    { key: 'students', label: 'Total Students', value: formatNumber(stats.totalStudents), icon: <FiUsers className="w-6 h-6" />, hint: `${formatNumber(stats.totalEnrollments)} enrollments`, color: 'from-emerald-400 to-emerald-600' },
    { key: 'revenue', label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: <FiDollarSign className="w-6 h-6" />, hint: 'This month', color: 'from-purple-500 to-purple-600' },
    { key: 'rating', label: 'Average Rating', value: stats.averageRating, icon: <FiStar className="w-6 h-6" />, hint: 'out of 5.0', color: 'from-amber-500 to-amber-600' }
  ];

  const recentCourses = coursesData?.courses?.slice(0, 5) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-blue-50/40 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/30 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-36 rounded-2xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-lg border border-gray-200/30 dark:border-gray-700/30" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-gray-200/30 dark:border-gray-700/30 text-center">
          <h3 className="text-lg font-semibold mb-2">Unable to load dashboard</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">There was an error while loading metrics. Refresh to try again.</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">Refresh</button>
        </div>
      </div>
    );
  }

  return (
    <motion.main initial="hidden" animate="enter" exit="exit" variants={page} className="min-h-screen relative overflow-hidden bg-gradient-to-b from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/20 p-6">
      {/* Floating gradient accents */}
      <motion.div aria-hidden className="pointer-events-none absolute -top-10 -left-20 w-72 h-72 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 opacity-20 blur-3xl mix-blend-overlay" animate={{ x: [0, 40, 0], y: [0, -20, 0] }} transition={{ duration: 10, repeat: Infinity }} />
      <motion.div aria-hidden className="pointer-events-none absolute -bottom-24 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-emerald-300 to-blue-300 opacity-12 blur-3xl mix-blend-overlay" animate={{ x: [0, -30, 0] }} transition={{ duration: 12, repeat: Infinity }} />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <motion.h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-blue-600 dark:from-gray-100 dark:to-blue-400" initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>Admin Dashboard</motion.h1>
              <motion.p className="mt-2 text-gray-600 dark:text-gray-300" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.08 } }}>Welcome back, <span className="font-semibold text-gray-900 dark:text-gray-100">{userData?.user?.name || 'Admin'}</span>. Overview of platform performance and quick actions.</motion.p>
            </div>

            <div className="flex items-center gap-3">
              <motion.button whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/30 dark:border-gray-700/30 shadow-sm text-sm">
                <FiActivity className="w-4 h-4 text-gray-700 dark:text-gray-200" /> Live
              </motion.button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg text-sm">Create Course</motion.button>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardCards.map((c, i) => (
            <motion.article key={c.key} variants={card} className="relative rounded-2xl p-5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-200/30 dark:border-gray-700/30 shadow-md hover:shadow-2xl transition-transform hover:-translate-y-1">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${c.color} text-white shadow-sm`}>{c.icon}</div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-300">{c.label}</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{c.value}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-300">{c.hint}</div>
              </div>
              <div className="mt-4 h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-30" />
            </motion.article>
          ))}
        </section>

        {/* Main area: Recent + Quick Actions */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <motion.section variants={card} className="rounded-2xl p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-200/30 dark:border-gray-700/30 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white"><FiBookOpen className="w-5 h-5" /></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Courses</h3>
              </div>
              <button className="text-sm text-blue-600 dark:text-blue-400 font-semibold">View All</button>
            </div>

            <div className="space-y-4">
              {recentCourses.length > 0 ? recentCourses.map((course, idx) => (
                <motion.div key={course._id || idx} whileHover={{ scale: 1.01 }} transition={{ duration: 0.15 }} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/40 dark:hover:bg-gray-900/40 border border-transparent hover:border-gray-200/20">
                  <img src={course.courseThumbnail || 'https://via.placeholder.com/50'} alt={course.courseTitle} className="w-12 h-12 rounded-lg object-cover shadow-sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{course.courseTitle}</p>
                    <p className="text-xs text-gray-500">by {course.creator?.name || 'Unknown'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatCurrency(course.coursePrice)}</p>
                    <p className="text-xs text-gray-500">{(course.enrolledStudents?.length) || 0} students</p>
                  </div>
                </motion.div>
              )) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-300">No recent courses — create one to get started.</div>
              )}
            </div>
          </motion.section>

          <motion.aside variants={card} className="rounded-2xl p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-200/30 dark:border-gray-700/30 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"><FiActivity className="w-5 h-5" /></div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Quick Actions</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Add Course', icon: <FiPlus className="w-5 h-5" /> },
                { label: 'Manage Users', icon: <FiUsers className="w-5 h-5" /> },
                { label: 'View Reports', icon: <FiBarChart2 className="w-5 h-5" /> },
                { label: 'Settings', icon: <FiTarget className="w-5 h-5" /> }
              ].map((a, i) => (
                <motion.button key={i} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-3 p-3 rounded-lg bg-white/30 dark:bg-gray-900/30 border border-transparent hover:border-gray-200/20">
                  <div className="w-10 h-10 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center">{a.icon}</div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{a.label}</p>
                    <p className="text-xs text-gray-500">Quick action</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.aside>
        </div>

        {/* Platform overview */}
        <motion.section variants={card} className="rounded-2xl p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-200/30 dark:border-gray-700/30 shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white"><FiTarget className="w-5 h-5" /></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Platform Overview</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-white/30 dark:bg-gray-900/30">
              <p className="text-sm text-gray-500">Course Publication Rate</p>
              <p className="mt-2 text-2xl font-bold">{stats.totalCourses > 0 ? ((stats.activeCourses / stats.totalCourses) * 100).toFixed(1) : 0}%</p>
            </div>
            <div className="p-4 rounded-lg bg-white/30 dark:bg-gray-900/30">
              <p className="text-sm text-gray-500">Average Revenue per Enrollment</p>
              <p className="mt-2 text-2xl font-bold">{stats.totalEnrollments > 0 ? formatCurrency(Math.round(stats.totalRevenue / stats.totalEnrollments)) : formatCurrency(0)}</p>
            </div>
            <div className="p-4 rounded-lg bg-white/30 dark:bg-gray-900/30">
              <p className="text-sm text-gray-500">Courses per Student</p>
              <p className="mt-2 text-2xl font-bold">{stats.totalStudents > 0 ? (stats.totalEnrollments / stats.totalStudents).toFixed(1) : 0}</p>
            </div>
          </div>
        </motion.section>
      </div>
    </motion.main>
  );
}

export default Dashboard;