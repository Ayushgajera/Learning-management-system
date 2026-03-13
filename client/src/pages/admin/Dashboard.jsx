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
  FiCreditCard,
  FiAward
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGetAllCoursesQuery } from '@/features/api/courseApi';
import { useLoaduserQuery } from '@/features/api/authApi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { toast } from 'sonner';

function Dashboard() {
  const navigate = useNavigate();
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

  const revenuePerCourse = useMemo(
    () => (stats.totalCourses ? stats.totalRevenue / stats.totalCourses : 0),
    [stats.totalCourses, stats.totalRevenue]
  );
  const enrollmentPerCourse = useMemo(
    () => (stats.totalCourses ? stats.totalEnrollments / stats.totalCourses : 0),
    [stats.totalCourses, stats.totalEnrollments]
  );

  const recentCourses = useMemo(() => courses.slice(0, 5), [courses]);

  // -- Chart Data Preparation --
  const revenueData = useMemo(() => {
    // Mocking trend data based on actual totals for visual representation
    // In a real app, this would come from a historical analytics API
    const data = [];
    const points = 7;
    const baseRevenue = stats.totalRevenue / points;

    for (let i = 0; i < points; i++) {
      // Add some randomness to make it look like a real trend
      const randomFactor = 0.8 + Math.random() * 0.4;
      data.push({
        name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        revenue: Math.round(baseRevenue * randomFactor * (i + 1) * 0.5)
      });
    }
    return data;
  }, [stats.totalRevenue]);

  const courseCategoryData = useMemo(() => {
    // Mock category distribution as it's not in the course object based on previous checks
    // Or derive from subtitles if available, otherwise generic
    return [
      { name: 'Development', value: 45, color: '#8b5cf6' }, // Violet
      { name: 'Design', value: 25, color: '#ec4899' },      // Pink
      { name: 'Marketing', value: 20, color: '#0ea5e9' },   // Sky
      { name: 'Business', value: 10, color: '#10b981' },    // Emerald
    ];
  }, []);


  // -- Motion variants --
  const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: { opacity: 0 }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  // -- Dashboard data for cards --
  const dashboardCards = [
    {
      key: 'revenue',
      label: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: <FiDollarSign className="w-6 h-6" />,
      change: '+12.5%',
      isPositive: true,
      color: 'from-violet-500 to-indigo-600',
      shadow: 'shadow-violet-500/20'
    },
    {
      key: 'students',
      label: 'Total Students',
      value: formatNumber(stats.totalStudents),
      icon: <FiUsers className="w-6 h-6" />,
      change: '+8.2%',
      isPositive: true,
      color: 'from-pink-500 to-rose-600',
      shadow: 'shadow-pink-500/20'
    },
    {
      key: 'courses',
      label: 'Active Courses',
      value: stats.activeCourses.toString(),
      icon: <FiBookOpen className="w-6 h-6" />,
      change: `${stats.totalCourses} total`,
      isPositive: true,
      color: 'from-sky-500 to-blue-600',
      shadow: 'shadow-sky-500/20'
    },
    {
      key: 'rating',
      label: 'Avg. Rating',
      value: stats.averageRating || '0.0',
      icon: <FiStar className="w-6 h-6" />,
      change: '4.8 target',
      isPositive: true,
      color: 'from-amber-400 to-orange-500',
      shadow: 'shadow-amber-500/20'
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-slate-950">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Something went wrong</h3>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <motion.main
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen p-4 md:p-8 pt-24 pb-20 bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden font-sans"
    >
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-pink-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
              Dashboard
            </h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Welcome back, {userData?.user?.name || 'Instructor'}. Here's your daily overview.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/admin/courses/create')} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium hover:opacity-90 transition-opacity shadow-lg shadow-slate-500/20">
              <FiPlus className="w-5 h-5" />
              <span>New Course</span>
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardCards.map((card) => (
            <motion.div
              key={card.key}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="relative p-6 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-sm overflow-hidden group"
            >
              <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${card.color} blur-xl`} />
              </div>

              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${card.color} text-white shadow-lg ${card.shadow}`}>
                  {card.icon}
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${card.isPositive ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-700'}`}>
                  {card.change}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{card.label}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-display">{card.value}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <motion.div variants={itemVariants} className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Revenue Trend</h3>
                <p className="text-sm text-slate-500">Weekly income overview</p>
              </div>
              <select className="bg-slate-50 dark:bg-slate-800 border-none text-sm rounded-lg px-3 py-1 text-slate-600 dark:text-slate-300 outline-none cursor-pointer">
                <option>This Week</option>
                <option>Last Week</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`$${value}`, 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Category Distribution / Insights */}
          <motion.div variants={itemVariants} className="p-6 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-sm flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Course Distribution</h3>
            <div className="flex-1 flex items-center justify-center relative">
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={courseCategoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {courseCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Center Text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalCourses}</p>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Courses</p>
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {courseCategoryData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                  </div>
                  <span className="font-medium text-slate-900 dark:text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Activity / Courses */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Courses</h3>
              <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              {recentCourses.map((course, idx) => (
                <div key={course._id || idx} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-200">
                    <img src={course.courseThumbnail} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-900 dark:text-white truncate">{course.courseTitle}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {course.enrolledStudents?.length || 0} students • {course.lectures?.length || 0} lectures
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${course.ispublished ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                      {course.ispublished ? 'Live' : 'Draft'}
                    </span>
                  </div>
                </div>
              ))}
              {recentCourses.length === 0 && (
                <p className="text-center text-slate-500 py-8">No Recent courses found.</p>
              )}
            </div>
          </div>

          {/* Quick Actions / Tips */}
          <div className="space-y-6">
            {/* Upgrade / Promo Card */}
            <div className="relative p-8 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-xl shadow-indigo-600/30 overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold font-display mb-2">Instructor Pro</h3>
                <p className="text-indigo-100 mb-6 max-w-sm">
                  Unlock advanced analytics, custom certificates, and priority support for your students.
                </p>
                <button 
                  onClick={() => toast.info("Premium features coming soon!")}
                  className="px-5 py-2.5 bg-white text-indigo-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
                >
                  Upgrade Now
                </button>
              </div>

              {/* Decorative Circles */}
              <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-black/10 rounded-full blur-3xl" />
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Platform Health</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 dark:text-slate-300">Server Load</span>
                    <span className="font-medium text-slate-900 dark:text-white">24%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[24%] rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 dark:text-slate-300">Storage Usage</span>
                    <span className="font-medium text-slate-900 dark:text-white">65%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 w-[65%] rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.main>
  );
}

export default Dashboard;
