import React from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiUsers, FiBook, FiDatabase, FiServer, FiInfo } from 'react-icons/fi';
import { useGetAdminStatsQuery } from '@/features/api/adminApi';
import { useSelector } from 'react-redux';

function SASettings() {
  const { data } = useGetAdminStatsQuery();
  const stats = data?.stats || {};
  const { user } = useSelector(state => state.auth);

  const platformInfo = [
    { icon: <FiUsers className="h-5 w-5 text-rose-500" />, label: 'Total Users', value: stats.totalUsers || 0 },
    { icon: <FiBook className="h-5 w-5 text-blue-500" />, label: 'Total Courses', value: stats.totalCourses || 0 },
    { icon: <FiDatabase className="h-5 w-5 text-emerald-500" />, label: 'Published Courses', value: stats.publishedCourses || 0 },
    { icon: <FiServer className="h-5 w-5 text-violet-500" />, label: 'Total Purchases', value: stats.totalPurchases || 0 },
  ];

  return (
    <div className="p-4 sm:p-8 space-y-8 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-display">Platform Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Platform information and admin account details</p>
      </div>

      {/* Admin Account Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-rose-500 via-red-500 to-orange-400 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="relative z-10 flex items-center gap-6">
          <div className="h-20 w-20 rounded-2xl bg-white/20 flex items-center justify-center">
            <FiShield className="h-10 w-10" />
          </div>
          <div>
            <p className="text-white/80 text-sm font-medium">Logged in as Super Admin</p>
            <h2 className="text-2xl font-bold mt-1">{user?.name || 'Admin'}</h2>
            <p className="text-white/70 text-sm mt-1">{user?.email || 'admin@platform.com'}</p>
          </div>
        </div>
      </motion.div>

      {/* Platform Info Grid */}
      <div>
        <h2 className="text-xl font-bold mb-4">Platform Overview</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {platformInfo.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {item.icon}
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
              <p className="text-2xl font-bold font-display mt-1">{item.value}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* How to Create Admin */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FiInfo className="text-blue-500" /> Admin Seed Guide
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
          To create a new admin account, send a POST request to the seed endpoint:
        </p>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-sm font-mono text-slate-700 dark:text-slate-300 overflow-x-auto">
          <pre>{`POST /api/v1/admin/seed
Content-Type: application/json

{
  "secret": "YOUR_ADMIN_SEED_SECRET",
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "securePassword123"
}`}</pre>
        </div>
        <p className="text-slate-400 text-xs mt-3">
          The <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">ADMIN_SEED_SECRET</code> must be set in your server environment variables.
        </p>
      </div>

      {/* Role Distribution */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h2 className="text-lg font-bold mb-4">User Role Distribution</h2>
        <div className="space-y-4">
          {[
            { label: 'Students', count: stats.totalStudents || 0, color: 'bg-emerald-500', total: stats.totalUsers || 1 },
            { label: 'Instructors', count: stats.totalInstructors || 0, color: 'bg-blue-500', total: stats.totalUsers || 1 },
            { label: 'Admins', count: stats.totalAdmins || 0, color: 'bg-rose-500', total: stats.totalUsers || 1 },
          ].map(role => (
            <div key={role.label}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-slate-700 dark:text-slate-300">{role.label}</span>
                <span className="text-slate-500">{role.count} ({((role.count / role.total) * 100).toFixed(1)}%)</span>
              </div>
              <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(role.count / role.total) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full rounded-full ${role.color}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SASettings;
