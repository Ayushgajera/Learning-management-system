
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiMessageCircle, FiBookOpen, FiUsers, FiTrendingUp } from 'react-icons/fi';
import { useGetInstructorReputationQuery } from '@/features/api/userApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Reputation = () => {
    // Note: We need to add this query to userApi
    const { data, isLoading } = useGetInstructorReputationQuery();
    const reputation = data?.score || 0;
    const level = data?.level || 'New Instructor';
    const metrics = data?.metrics || { avgRating: 0, completionRate: 0, avgResponseHours: 0, totalStudents: 0 };

    // Sample history data for chart
    const historyData = [
        { name: 'Week 1', score: Math.max(0, reputation - 10) },
        { name: 'Week 2', score: Math.max(0, reputation - 5) },
        { name: 'Week 3', score: Math.max(0, reputation - 2) },
        { name: 'Current', score: reputation },
    ];

    const getLevelColor = (lvl) => {
        switch (lvl) {
            case 'Top Instructor': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            case 'Level 2': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'Level 1': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
        }
    };

    return (
        <div className="p-4 sm:p-8 space-y-8 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold font-display mb-2">Reputation & Levels</h1>
                <p className="text-slate-500 dark:text-slate-400">Track your performance and level up to unlock benefits.</p>
            </div>

            {/* Main Stats Card */}
            <div className="grid md:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden"
                >
                    <div className={`absolute top-0 right-0 p-4 rounded-bl-2xl border-b border-l ${getLevelColor(level)}`}>
                        <span className="font-bold flex items-center gap-2">
                            <FiAward className="text-xl" /> {level}
                        </span>
                    </div>

                    <div className="mt-8 text-center">
                        <div className="relative inline-flex items-center justify-center">
                            <svg className="w-40 h-40 transform -rotate-90">
                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * reputation) / 100} className="text-indigo-600 dark:text-indigo-500 transition-all duration-1000 ease-out" strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-bold font-display">{reputation}</span>
                                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Score</span>
                            </div>
                        </div>
                        <p className="mt-6 text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                            Your reputation score is calculated based on student ratings, completion rates, and response time.
                        </p>
                    </div>
                </motion.div>

                {/* Chart */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <FiTrendingUp className="text-indigo-500" /> Score History
                    </h3>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={historyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-2 text-slate-500 dark:text-slate-400">
                        <FiAward /> Rating (40%)
                    </div>
                    <div className="text-2xl font-bold font-display">{metrics.avgRating?.toFixed(1) || 0} <span className="text-sm text-slate-400 font-sans font-normal">/ 5.0</span></div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-2 text-slate-500 dark:text-slate-400">
                        <FiBookOpen /> Completion (30%)
                    </div>
                    <div className="text-2xl font-bold font-display">{metrics.completionRate?.toFixed(1) || 0}%</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-2 text-slate-500 dark:text-slate-400">
                        <FiMessageCircle /> Response (20%)
                    </div>
                    <div className="text-2xl font-bold font-display">{metrics.avgResponseHours?.toFixed(1) || 0}h</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-2 text-slate-500 dark:text-slate-400">
                        <FiUsers /> Students (10%)
                    </div>
                    <div className="text-2xl font-bold font-display">{metrics.totalStudents || 0}</div>
                </div>

            </div>

            {/* Level Criteria */}
            <div className="bg-indigo-600 rounded-3xl p-8 relative overflow-hidden text-center sm:text-left">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2">Next Level: {level === 'New Instructor' ? 'Level 1' : level === 'Level 1' ? 'Level 2' : 'Top Instructor'}</h3>
                        <p className="text-indigo-100 max-w-xl">
                            {level === 'Top Instructor'
                                ? "You are at the top! Maintain your score above 80 to keep this status."
                                : "Increase your score by improving student completion rates and responding faster to questions."}
                        </p>
                    </div>
                    {level !== 'Top Instructor' && (
                        <div className="px-6 py-3 bg-white text-indigo-600 rounded-full font-bold shadow-lg">
                            Target Score: {level === 'New Instructor' ? '40' : level === 'Level 1' ? '60' : '80'}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default Reputation;
