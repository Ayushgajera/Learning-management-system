import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiBookOpen, FiDollarSign, FiTrendingUp, FiTrendingDown, FiEye, FiStar, FiClock, FiSettings, FiPlus, FiActivity, FiTarget, FiBarChart2 } from 'react-icons/fi';
import { useGetAllCoursesQuery } from '@/features/api/courseApi';
import { useLoaduserQuery } from '@/features/api/authApi';

function Dashboard() {
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
    const calculateStats = () => {
      if (!coursesData?.courses) return;

      const courses = coursesData?.courses;
      const totalCourses = courses.length;
      const activeCourses = courses.filter(course => course.ispublished).length;
      
      const allStudentIds = new Set();
      
      // Calculate total enrollments and total revenue accurately
      const totalEnrollments = courses.reduce((sum, course) => {
        const enrollmentCount = course.enrolledStudents?.length || 0;
        
        // Collect all student IDs to find unique students
        if (course.enrolledStudents) {
          course.enrolledStudents.forEach(studentId => allStudentIds.add(studentId));
        }

        return sum + enrollmentCount;
      }, 0);
      
      const totalRevenue = courses.reduce((sum, course) => {
        const enrollmentCount = course.enrolledStudents?.length || 0;
        return sum + ((course.coursePrice || 0) * enrollmentCount);
      }, 0);

      // Total unique students is the size of the set
      const totalStudents = allStudentIds.size;

      // Calculate average rating
      const totalRating = courses.reduce((sum, course) => {
        return sum + (course.rating || 0);
      }, 0);
      const averageRating = totalCourses > 0 ? (totalRating / totalCourses).toFixed(1) : 0;

      setStats({
        totalCourses,
        totalStudents,
        totalRevenue,
        totalEnrollments,
        averageRating,
        activeCourses
      });
      setIsLoading(false);
    };

    if (!coursesLoading) {
      calculateStats();
    }
  }, [coursesData, coursesLoading]);

  // ... (rest of your component remains the same)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const dashboardCards = [
    {
      label: 'Total Courses',
      value: formatNumber(stats.totalCourses),
      icon: <FiBookOpen className="w-6 h-6" />,
      change: `${stats.activeCourses} published`,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      textColor: 'text-blue-600',
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
      changeColor: 'text-blue-600'
    },
    {
      label: 'Total Students',
      value: formatNumber(stats.totalStudents),
      icon: <FiUsers className="w-6 h-6" />,
      change: `${formatNumber(stats.totalEnrollments)} enrollments`,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'from-emerald-50 to-emerald-100',
      textColor: 'text-emerald-600',
      gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      changeColor: 'text-emerald-600'
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: <FiDollarSign className="w-6 h-6" />,
      change: 'This month',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
      textColor: 'text-purple-600',
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
      changeColor: 'text-purple-600'
    },
    {
      label: 'Average Rating',
      value: stats.averageRating,
      icon: <FiStar className="w-6 h-6" />,
      change: 'out of 5.0',
      color: 'from-amber-500 to-amber-600',
      bgColor: 'from-amber-50 to-amber-100',
      textColor: 'text-amber-600',
      gradient: 'bg-gradient-to-br from-amber-500 to-amber-600',
      changeColor: 'text-amber-600'
    }
  ];

  const recentCourses = coursesData?.courses?.slice(0, 5) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white/80 dark:bg-gray-800/60 rounded-2xl p-6 space-y-4 border border-gray-100 dark:border-gray-700">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-pink-50 flex items-center justify-center p-4">
        <motion.div 
          className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Failed to load dashboard</h2>
          <p className="text-gray-600 mb-6">Please try refreshing the page</p>
          <motion.button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Refresh Page
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Welcome back, <span className="font-semibold text-gray-800 dark:text-gray-100">{userData?.user?.name || 'Admin'}</span>! Here's what's happening with your platform.
              </p>
            </div>
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live Updates</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {dashboardCards.map((card, index) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-white dark:bg-gray-800/60 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${card.bgColor} shadow-sm group-hover:shadow-md transition-all duration-300`}>
                    <div className={card.textColor}>{card.icon}</div>
                  </div>
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${card.color} shadow-sm`}></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-300 mb-2">{card.label}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{card.value}</p>
                  <p className={`text-xs font-medium ${card.changeColor} bg-opacity-10 px-2 py-1 rounded-full inline-block`}>
                    {card.change}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 mb-8">
          {/* Recent Courses */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg dark:bg-gray-800/60 dark:border-gray-700 text-gray-900 dark:text-white    "
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <FiBookOpen className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Recent Courses</h2>
              </div>
              <motion.button 
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold px-3 py-1 rounded-lg hover:bg-blue-50 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View All
              </motion.button>
            </div>
            <div className="space-y-4">
              {recentCourses.map((course, index) => (
                <motion.div 
                  key={course._id} 
                  className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50/50 transition-all duration-200 border border-transparent hover:border-gray-200/50"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <img
                    src={course.courseThumbnail || 'https://via.placeholder.com/50'}
                    alt={course.courseTitle}
                    className="w-12 h-12 rounded-xl object-cover shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {course.courseTitle}
                    </p>
                    <p className="text-xs text-gray-500">
                      by {course.creator?.name || 'Unknown Instructor'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      ${course.coursePrice || 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      {course.enrolledStudents?.length || 0} students
                    </p>
                  </div>
                </motion.div>
              ))}
              {recentCourses.length === 0 && (
                <motion.div 
                  className="text-center py-12 text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <FiBookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No courses yet</p>
                  <p className="text-sm">Start by creating your first course</p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                <FiActivity className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <FiPlus className="w-6 h-6" />, label: "Add Course", color: "from-blue-500 to-blue-600", hover: "hover:from-blue-600 hover:to-blue-700" },
                { icon: <FiUsers className="w-6 h-6" />, label: "Manage Users", color: "from-emerald-500 to-emerald-600", hover: "hover:from-emerald-600 hover:to-emerald-700" },
                { icon: <FiBarChart2 className="w-6 h-6" />, label: "View Reports", color: "from-purple-500 to-purple-600", hover: "hover:from-purple-600 hover:to-purple-700" },
                { icon: <FiSettings className="w-6 h-6" />, label: "Settings", color: "from-amber-500 to-amber-600", hover: "hover:from-amber-600 hover:to-amber-700" }
              ].map((action, index) => (
                <motion.button 
                  key={action.label}
                  className={`p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-transparent transition-all duration-300 text-center group ${action.hover}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl mx-auto mb-3 flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    {action.icon}
                  </div>
                  <p className="text-sm font-semibold text-gray-700 group-hover:text-white transition-colors duration-300">{action.label}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Platform Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
              <FiTarget className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Platform Overview</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                value: `${stats.totalCourses > 0 ? ((stats.activeCourses / stats.totalCourses) * 100).toFixed(1) : 0}%`,
                label: "Course Publication Rate",
                color: "from-blue-500 to-blue-600",
                icon: <FiTrendingUp className="w-5 h-5" />
              },
              {
                value: `$${stats.totalEnrollments > 0 ? (stats.totalRevenue / stats.totalEnrollments).toFixed(0) : 0}`,
                label: "Average Revenue per Enrollment",
                color: "from-emerald-500 to-emerald-600",
                icon: <FiDollarSign className="w-5 h-5" />
              },
              {
                value: `${stats.totalStudents > 0 ? (stats.totalEnrollments / stats.totalStudents).toFixed(1) : 0}`,
                label: "Courses per Student",
                color: "from-purple-500 to-purple-600",
                icon: <FiBookOpen className="w-5 h-5" />
              }
            ].map((stat, index) => (
              <motion.div 
                key={stat.label}
                className="text-center p-4 rounded-xl hover:bg-gray-50/50 transition-all duration-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl mx-auto mb-3 flex items-center justify-center text-white shadow-lg`}>
                  {stat.icon}
                </div>
                <div className={`text-2xl sm:text-3xl font-bold bg-gradient-to-br ${stat.color} bg-clip-text text-transparent mb-2`}>
                  {stat.value}
                </div>
                <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;