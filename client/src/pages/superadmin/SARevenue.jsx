import React from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiTrendingUp, FiAward, FiUsers } from 'react-icons/fi';
import { useGetPlatformRevenueQuery, useGetAdminStatsQuery } from '@/features/api/adminApi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';

const formatCurrency = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

function SARevenue() {
  const { data, isLoading } = useGetPlatformRevenueQuery();
  const { data: statsData } = useGetAdminStatsQuery();

  const monthly = data?.monthlyRevenue || [];
  const byInstructor = data?.revenueByInstructor || [];
  const topCourses = data?.topCourses || [];
  const stats = statsData?.stats || {};

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
          <p className="text-slate-500 animate-pulse">Loading revenue data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-display">Platform Revenue</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Detailed revenue analytics across the entire platform</p>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-rose-500 via-red-500 to-orange-400 rounded-3xl p-6 text-white shadow-lg shadow-rose-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
              <FiDollarSign className="h-5 w-5" />
            </div>
            <p className="text-white/80 text-sm font-medium">Total Revenue</p>
          </div>
          <p className="text-3xl font-bold font-display">{formatCurrency(stats.totalRevenue)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
              <FiTrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-slate-500 text-sm font-medium">Total Purchases</p>
          </div>
          <p className="text-3xl font-bold font-display">{stats.totalPurchases || 0}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
              <FiUsers className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-slate-500 text-sm font-medium">Total Enrollments</p>
          </div>
          <p className="text-3xl font-bold font-display">{stats.totalEnrollments || 0}</p>
        </motion.div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <FiTrendingUp className="text-rose-500" /> Monthly Revenue Trend
        </h3>
        <div className="h-[350px]">
          {monthly.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                  formatter={(val, name) => [formatCurrency(val), name === 'revenue' ? 'Revenue' : 'Enrollments']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f43f5e" strokeWidth={3} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">No revenue data yet</div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Instructors by Revenue */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <FiAward className="text-orange-500" /> Top Instructors by Revenue
          </h3>
          {byInstructor.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-3">
              {byInstructor.map((item, i) => (
                <div key={item._id || i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-orange-400 text-white text-sm font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">{item.instructorName || 'Unknown'}</p>
                    <p className="text-xs text-slate-500">{item.instructorEmail || ''} &bull; {item.totalSales} sales</p>
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white shrink-0">{formatCurrency(item.totalRevenue)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Courses by Revenue */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <FiAward className="text-blue-500" /> Top Courses by Revenue
          </h3>
          {topCourses.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-3">
              {topCourses.map((item, i) => (
                <div key={item._id || i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-violet-400 text-white text-sm font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">{item.courseTitle || 'Unknown'}</p>
                    <p className="text-xs text-slate-500">{item.totalSales} purchases</p>
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white shrink-0">{formatCurrency(item.totalRevenue)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SARevenue;
