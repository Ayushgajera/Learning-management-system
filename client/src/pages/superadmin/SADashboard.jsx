import React from 'react';
import { motion } from 'framer-motion';
import {
  FiUsers, FiBook, FiDollarSign, FiShoppingCart,
  FiTrendingUp, FiUserCheck, FiUserPlus, FiLayers
} from 'react-icons/fi';
import { useGetAdminStatsQuery, useGetPlatformRevenueQuery } from '@/features/api/adminApi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const formatCurrency = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

const StatCard = ({ icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
        <p className="text-3xl font-bold mt-2 font-display text-slate-900 dark:text-white">{value}</p>
      </div>
      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

const COLORS = ['#f43f5e', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

function SADashboard() {
  const { data: statsData, isLoading: statsLoading } = useGetAdminStatsQuery();
  const { data: revenueData, isLoading: revenueLoading } = useGetPlatformRevenueQuery();

  const stats = statsData?.stats || {};
  const monthly = revenueData?.monthlyRevenue || [];

  const roleData = [
    { name: 'Students', value: stats.totalStudents || 0 },
    { name: 'Instructors', value: stats.totalInstructors || 0 },
    { name: 'Admins', value: stats.totalAdmins || 0 },
  ].filter(d => d.value > 0);

  const courseData = [
    { name: 'Published', value: stats.publishedCourses || 0 },
    { name: 'Drafts', value: stats.draftCourses || 0 },
  ].filter(d => d.value > 0);

  if (statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
          <p className="text-slate-500 animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-display">Super Admin Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Complete platform overview and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Total Users" value={stats.totalUsers || 0} icon={<FiUsers className="h-6 w-6 text-white" />} color="bg-rose-500" delay={0} />
        <StatCard label="Instructors" value={stats.totalInstructors || 0} icon={<FiUserCheck className="h-6 w-6 text-white" />} color="bg-orange-500" delay={0.05} />
        <StatCard label="Total Courses" value={stats.totalCourses || 0} icon={<FiBook className="h-6 w-6 text-white" />} color="bg-blue-500" delay={0.1} />
        <StatCard label="Published" value={stats.publishedCourses || 0} icon={<FiLayers className="h-6 w-6 text-white" />} color="bg-emerald-500" delay={0.15} />
        <StatCard label="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon={<FiDollarSign className="h-6 w-6 text-white" />} color="bg-violet-500" delay={0.2} />
        <StatCard label="Total Purchases" value={stats.totalPurchases || 0} icon={<FiShoppingCart className="h-6 w-6 text-white" />} color="bg-amber-500" delay={0.25} />
        <StatCard label="Enrollments" value={stats.totalEnrollments || 0} icon={<FiUserPlus className="h-6 w-6 text-white" />} color="bg-pink-500" delay={0.3} />
        <StatCard label="Students" value={stats.totalStudents || 0} icon={<FiTrendingUp className="h-6 w-6 text-white" />} color="bg-sky-500" delay={0.35} />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <FiTrendingUp className="text-rose-500" /> Monthly Revenue
          </h3>
          <div className="h-[300px]">
            {!revenueLoading && monthly.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                    formatter={(val) => [formatCurrency(val), 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#f43f5e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                {revenueLoading ? 'Loading...' : 'No revenue data yet'}
              </div>
            )}
          </div>
        </div>

        {/* Pie Charts */}
        <div className="space-y-6">
          {/* Users by Role */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-sm font-bold mb-4 text-slate-900 dark:text-white">Users by Role</h3>
            <div className="h-[130px]">
              {roleData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={roleData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={55} strokeWidth={2}>
                      {roleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-sm">No data</div>
              )}
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {roleData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-slate-500 dark:text-slate-400">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Courses by Status */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-sm font-bold mb-4 text-slate-900 dark:text-white">Courses Status</h3>
            <div className="h-[130px]">
              {courseData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={courseData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={55} strokeWidth={2}>
                      {courseData.map((_, i) => <Cell key={i} fill={COLORS[(i + 3) % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-sm">No data</div>
              )}
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {courseData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[(i + 3) % COLORS.length] }} />
                  <span className="text-slate-500 dark:text-slate-400">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SADashboard;
