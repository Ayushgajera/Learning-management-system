import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FiBarChart, FiBook, FiDollarSign, FiInfo, FiTarget, FiTrendingUp, FiUsers } from 'react-icons/fi';
import { toast } from 'sonner';
import { useGetAllCoursesQuery, useGetMonthlyRevenueQuery } from '@/features/api/courseApi';
import { useLoaduserQuery } from '@/features/api/authApi';

const formatCurrency = (amount = 0) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
}).format(amount || 0);

const formatNumber = (value = 0) => new Intl.NumberFormat('en-US').format(value || 0);

export default function Revenue() {
  const [timeframe, setTimeframe] = useState(6);
  const [chartData, setChartData] = useState([]);
  const [trendSummary, setTrendSummary] = useState({ bestMonth: '-', bestRevenue: 0, slowMonth: '-', slowRevenue: 0 });
  const [revenueGrowth, setRevenueGrowth] = useState('0');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    monthlyEnrollments: 0,
    avgRevenuePerCourse: 0,
    avgEnrollmentPerCourse: 0,
    mostProfitableCourse: 'N/A',
    totalEnrollments: 0,
    activeCourses: 0,
    avgCoursePrice: 0,
  });
  const [coursesData, setCoursesData] = useState([]);
  const [hasAnnounced, setHasAnnounced] = useState(false);

  const { data: currentUserData, isLoading: userLoading } = useLoaduserQuery();
  const instructorId = currentUserData?.user?._id;

  const {
    data: coursesQueryData,
    isLoading: coursesLoading,
    error: coursesError,
  } = useGetAllCoursesQuery(null, { skip: !instructorId });

  const {
    data: monthlyData,
    isLoading: monthlyLoading,
    error: monthlyError,
  } = useGetMonthlyRevenueQuery(instructorId, { skip: !instructorId });

  const combinedIsLoading = userLoading || coursesLoading || monthlyLoading;
  const combinedError = coursesError || monthlyError;

  useEffect(() => {
    if (combinedIsLoading) return;
    if (!coursesQueryData?.courses?.length) return;

    const monthlyRevenueData = Array.isArray(monthlyData?.data) ? monthlyData.data : [];
    const courses = coursesQueryData.courses;

    const totalRevenue = courses.reduce((sum, course) => {
      const enrollments = course.enrolledStudents?.length || 0;
      return sum + ((course.coursePrice || 0) * enrollments);
    }, 0);

    const totalEnrollments = courses.reduce((sum, course) => sum + (course.enrolledStudents?.length || 0), 0);

    const avgEnrollmentPerCourse = courses.length ? totalEnrollments / courses.length : 0;
    const avgRevenuePerCourse = courses.length ? totalRevenue / courses.length : 0;
    const avgCoursePrice = courses.length
      ? courses.reduce((sum, course) => sum + (course.coursePrice || 0), 0) / courses.length
      : 0;

    const mostProfitableCourse = courses.reduce((max, course) => {
      const courseRevenue = (course.coursePrice || 0) * (course.enrolledStudents?.length || 0);
      return courseRevenue > max.totalCourseRevenue
        ? { title: course.courseTitle, totalCourseRevenue: courseRevenue }
        : max;
    }, { title: 'N/A', totalCourseRevenue: -1 });

    const trimmedSeries = monthlyRevenueData.slice(-timeframe);
    const activeSeries = trimmedSeries.length ? trimmedSeries : monthlyRevenueData;
    const sanitizedSeries = activeSeries.filter(Boolean);
    const latestPoint = sanitizedSeries[sanitizedSeries.length - 1] || {};

    setChartData(sanitizedSeries);

    if (sanitizedSeries.length) {
      const bestMonthEntry = sanitizedSeries.reduce((prev, curr) => (curr.revenue > (prev?.revenue || 0) ? curr : prev), sanitizedSeries[0]);
      const slowMonthEntry = sanitizedSeries.reduce((prev, curr) => (curr.revenue < (prev?.revenue || Infinity) ? curr : prev), sanitizedSeries[0]);
      setTrendSummary({
        bestMonth: bestMonthEntry?.month || '-',
        bestRevenue: bestMonthEntry?.revenue || 0,
        slowMonth: slowMonthEntry?.month || '-',
        slowRevenue: slowMonthEntry?.revenue || 0,
      });
    } else {
      setTrendSummary({ bestMonth: '-', bestRevenue: 0, slowMonth: '-', slowRevenue: 0 });
    }

    if (monthlyRevenueData.length >= 2) {
      const lastMonthRevenue = monthlyRevenueData[monthlyRevenueData.length - 2]?.revenue || 0;
      const currentMonthRevenue = monthlyRevenueData[monthlyRevenueData.length - 1]?.revenue || 0;

      if (lastMonthRevenue > 0) {
        const growth = ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
        setRevenueGrowth(Number.isFinite(growth) ? growth.toFixed(1) : '0');
      } else {
        setRevenueGrowth(currentMonthRevenue > 0 ? '100+' : '0');
      }
    } else {
      setRevenueGrowth('0');
    }

    setStats({
      totalRevenue,
      monthlyRevenue: latestPoint?.revenue || 0,
      monthlyEnrollments: latestPoint?.enrollments || 0,
      avgRevenuePerCourse: avgRevenuePerCourse || 0,
      avgEnrollmentPerCourse,
      mostProfitableCourse: mostProfitableCourse.title,
      totalEnrollments,
      activeCourses: courses.length,
      avgCoursePrice,
    });

    setCoursesData(courses.map(course => ({
      courseId: course._id,
      courseTitle: course.courseTitle,
      price: course.coursePrice || 0,
      enrollments: course.enrolledStudents?.length || 0,
      totalCourseRevenue: (course.coursePrice || 0) * (course.enrolledStudents?.length || 0),
    })));

    if (!hasAnnounced) {
      toast.success('Revenue data loaded successfully!');
      setHasAnnounced(true);
    }
  }, [coursesQueryData, monthlyData, timeframe, combinedIsLoading, hasAnnounced]);

  const revenuePerEnrollment = useMemo(() => {
    if (!stats.totalEnrollments) return 0;
    return stats.totalRevenue / stats.totalEnrollments;
  }, [stats.totalRevenue, stats.totalEnrollments]);

  const projectedAnnualRevenue = useMemo(() => stats.monthlyRevenue * 12, [stats.monthlyRevenue]);

  const heroQuickStats = useMemo(() => ([
    { label: 'Active Courses', value: formatNumber(stats.activeCourses || 0) },
    { label: 'Total Enrollments', value: formatNumber(stats.totalEnrollments || 0) },
    { label: 'Avg. Course Price', value: formatCurrency(stats.avgCoursePrice || 0) },
  ]), [stats.activeCourses, stats.totalEnrollments, stats.avgCoursePrice, revenuePerEnrollment]);

  const dashboardCards = [
    {
      label: 'This Month\'s Revenue',
      value: formatCurrency(stats.monthlyRevenue),
      hint: `${formatNumber(stats.monthlyEnrollments)} enrollments`,
      icon: <FiBarChart className="w-6 h-6" />,
      color: 'from-blue-500 to-violet-500',
      accent: 'text-blue-600',
    },
    {
      label: 'Monthly Enrollments',
      value: formatNumber(stats.monthlyEnrollments),
      hint: `${formatCurrency(revenuePerEnrollment || 0)} / learner`,
      icon: <FiUsers className="w-6 h-6" />,
      color: 'from-emerald-500 to-emerald-600',
      accent: 'text-emerald-600',
    },
    {
      label: 'Avg. Revenue / Course',
      value: formatCurrency(stats.avgRevenuePerCourse || 0),
      hint: `${formatNumber(stats.avgEnrollmentPerCourse || 0)} learners avg`,
      icon: <FiDollarSign className="w-6 h-6" />,
      color: 'from-amber-500 to-pink-500',
      accent: 'text-amber-600',
    },
    {
      label: 'Top Course',
      value: stats.mostProfitableCourse,
      hint: 'Highest grossing course',
      icon: <FiBook className="w-6 h-6" />,
      color: 'from-purple-500 to-indigo-500',
      accent: 'text-purple-600',
    }
  ];

  const maxMonthlyRevenue = chartData.length ? Math.max(...chartData.map(d => d.revenue || 0)) : 1;
  const maxCourseRevenue = coursesData.length ? Math.max(...coursesData.map(course => course.totalCourseRevenue || 0)) : 1;

  const topCourses = useMemo(() => {
    if (!coursesData.length) return [];
    return [...coursesData].sort((a, b) => b.totalCourseRevenue - a.totalCourseRevenue).slice(0, 3);
  }, [coursesData]);

  const insights = useMemo(() => ([
    {
      title: 'Avg. Course Price',
      value: formatCurrency(stats.avgCoursePrice || 0),
      meta: 'Catalog-wide pricing',
      icon: <FiBook className="w-5 h-5" />,
      accent: 'text-purple-600',
    }
  ]), [stats.avgCoursePrice]);

  if (combinedIsLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-500 rounded-full mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Calculating revenue...</h3>
        </div>
      </div>
    );
  }

  if (combinedError) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6">
        <div className="text-center text-slate-500 dark:text-slate-400">
          <FiInfo className="w-16 h-16 mx-auto mb-4" />
          <p className="text-lg font-medium">Failed to load revenue data.</p>
        </div>
      </div>
    );
  }

  const numericGrowth = parseFloat(revenueGrowth);
  const isPositiveGrowth = !Number.isNaN(numericGrowth) ? numericGrowth >= 0 : true;
  const growthColor = isPositiveGrowth
    ? 'text-emerald-600 dark:text-emerald-300'
    : 'text-red-600 dark:text-red-300';
  const growthBadgeBg = isPositiveGrowth
    ? 'bg-emerald-500/10 border border-emerald-500/30 dark:bg-emerald-500/20 dark:border-emerald-400/50'
    : 'bg-red-500/10 border border-red-500/30 dark:bg-red-500/20 dark:border-red-400/50';
  const growthValueLabel = (() => {
    const raw = `${revenueGrowth}`;
    const base = raw.includes('%') ? raw : `${raw}%`;
    if (base.includes('+') || base.startsWith('-')) {
      return base;
    }
    return isPositiveGrowth ? `+${base}` : base;
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-6 lg:p-8 text-slate-900 dark:text-white transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br from-white via-blue-50 to-slate-50 p-6 sm:p-8 text-slate-900 shadow-2xl dark:border-white/5 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-white">
          <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.2),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.35),_transparent_55%)]" />
          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center">
            <div className="flex-1 space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">Revenue control room</p>
              <div className="flex flex-wrap items-end gap-3">
                <h1 className="text-4xl sm:text-5xl font-semibold">{formatCurrency(stats.totalRevenue)}</h1>
                <span className={`text-sm px-3 py-1 rounded-full ${growthBadgeBg} ${growthColor}`}>
                  {growthValueLabel} vs last month
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-200/80 max-w-2xl">
                Monitor every revenue stream, enrollment pulse, and course contribution in one advanced workspace.
              </p>
              <div className="flex flex-wrap items-center gap-3 text-slate-600 dark:text-slate-200/80">
                <span className="text-sm font-medium">View window</span>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(Number(e.target.value))}
                  className="px-3 py-2 rounded-2xl border border-slate-200 bg-white/80 text-sm text-slate-900 dark:border-white/20 dark:bg-white/10 dark:text-white"
                >
                  <option value={3}>Last 3 months</option>
                  <option value={6}>Last 6 months</option>
                  <option value={12}>Last 12 months</option>
                </select>
              </div>
            </div>
            <div className="grid w-full gap-4 sm:grid-cols-2 lg:max-w-md">
              {heroQuickStats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-slate-900 backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-white"
                >
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300/80">{item.label}</p>
                  <p className="text-xl font-semibold mt-1">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {dashboardCards.map((card, index) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-lg border border-slate-100 dark:bg-slate-900/60 dark:border-white/10 transition-colors"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 transition-opacity duration-300 hover:opacity-5`} />
              <div className="relative space-y-3">
                <div className={`inline-flex items-center justify-center rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/80 ${card.accent}`}>
                  {card.icon}
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">{card.value}</p>
                  {card.hint && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{card.hint}</p>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Insight widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((insight, index) => (
            <motion.div
              key={insight.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * (index + 1) }}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-md dark:border-white/10 dark:bg-slate-900/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`rounded-2xl bg-slate-100 p-2 dark:bg-slate-800/80 ${insight.accent}`}>{insight.icon}</span>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{insight.title}</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">{insight.value}</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">{insight.meta}</p>
            </motion.div>
          ))}
        </div>

        {/* Chart + Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 rounded-3xl border border-slate-100 bg-white/90 backdrop-blur-sm p-6 shadow-xl dark:border-white/10 dark:bg-slate-900/60"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-slate-400 dark:text-slate-500">Revenue trend</p>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Monthly revenue trajectory</h2>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                <span>Best: <strong className="text-slate-800 dark:text-white">{trendSummary.bestMonth}</strong> · {formatCurrency(trendSummary.bestRevenue || 0)}</span>
                <span>Slowest: <strong className="text-slate-800 dark:text-white">{trendSummary.slowMonth}</strong> · {formatCurrency(trendSummary.slowRevenue || 0)}</span>
              </div>
            </div>
            <div className="w-full h-80 relative mt-8">
              <div className="absolute inset-0 grid grid-rows-5 text-slate-100 dark:text-slate-800">
                {[...Array(5)].map((_, i) => (
                  <div key={`row-${i}`} className="border-b last:border-b-0" />
                ))}
              </div>
              <div className="flex justify-between items-end h-full gap-3">
                {chartData.length ? chartData.map((data, index) => (
                  <motion.div
                    key={`${data.month}-${index}`}
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.revenue / maxMonthlyRevenue) * 100}%` }}
                    transition={{ delay: index * 0.05, type: 'spring', stiffness: 120 }}
                    className="flex-1 rounded-t-2xl bg-gradient-to-t from-blue-500 to-violet-500 relative group"
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow opacity-0 group-hover:opacity-100 dark:bg-slate-900 dark:text-white">
                      {formatCurrency(data.revenue)}
                    </div>
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {data.month}
                    </div>
                  </motion.div>
                )) : (
                  <div className="flex items-center justify-center w-full text-slate-400 dark:text-slate-500">No revenue data yet.</div>
                )}
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase text-slate-400 dark:text-slate-500">Revenue / learner</p>
                <p className="text-xl font-semibold text-slate-900 dark:text-white">{formatCurrency(Math.round(revenuePerEnrollment || 0))}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400 dark:text-slate-500">Revenue / course</p>
                <p className="text-xl font-semibold text-slate-900 dark:text-white">{formatCurrency(Math.round(stats.avgRevenuePerCourse || 0))}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400 dark:text-slate-500">Projected run rate</p>
                <p className="text-xl font-semibold text-slate-900 dark:text-white">{formatCurrency(projectedAnnualRevenue || 0)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-slate-900/60"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                <FiTarget className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Course leaderboard</p>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">High performing titles</h3>
              </div>
            </div>
            <div className="space-y-5">
              {topCourses.length ? topCourses.map((course, index) => {
                const contribution = stats.totalRevenue ? ((course.totalCourseRevenue / stats.totalRevenue) * 100).toFixed(1) : 0;
                return (
                  <div key={course.courseId} className="rounded-2xl border border-slate-100 p-4 dark:border-white/10">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs uppercase text-slate-400 dark:text-slate-500">#{index + 1}</p>
                        <p className="text-base font-semibold text-slate-900 mt-1 dark:text-white">{course.courseTitle}</p>
                        <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">{formatNumber(course.enrollments)} learners · {formatCurrency(course.price)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-300">{formatCurrency(course.totalCourseRevenue)}</p>
                        <p className="text-xs text-emerald-500 dark:text-emerald-300/80">{contribution}% of total</p>
                      </div>
                    </div>
                    <div className="mt-3 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                        style={{ width: `${(course.totalCourseRevenue / maxCourseRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              }) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No course revenue captured yet.</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Revenue Breakdown Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-3xl border border-slate-100 bg-white/95 p-6 shadow-xl overflow-x-auto dark:border-white/10 dark:bg-slate-900/60"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-200">
              <FiTarget className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Revenue breakdown</p>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Course contribution map</h2>
            </div>
          </div>
          <table className="min-w-full text-left">
            <thead className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <tr className="border-b border-slate-100 dark:border-white/10">
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-right">Enrollments</th>
                <th className="px-4 py-3 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 dark:text-slate-200">
              {coursesData.map(course => (
                <motion.tr
                  key={course.courseId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-b border-slate-100 last:border-0 dark:border-white/5"
                >
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-900 dark:text-white">{course.courseTitle}</p>
                    <div className="mt-2 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-slate-400 to-blue-500"
                        style={{ width: `${(course.totalCourseRevenue / maxCourseRevenue) * 100}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">{formatCurrency(course.price || 0)}</td>
                  <td className="px-4 py-4 text-right">{formatNumber(course.enrollments)}</td>
                  <td className="px-4 py-4 text-right font-semibold text-emerald-600 dark:text-emerald-300">{formatCurrency(course.totalCourseRevenue)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </motion.div>
    </div>
  );
}