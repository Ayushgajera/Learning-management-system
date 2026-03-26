import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiBook,
  FiAward,
  FiEdit2,
  FiHeart,
  FiUsers,
  FiBell,
  FiShield,
  FiLogOut,
  FiTrendingUp,
  FiDollarSign,
  FiGrid,
  FiSettings,
  FiCheckCircle,
} from 'react-icons/fi';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import {
  useGetNotificationPreferencesQuery,
  useLoaduserQuery,
  useLogoutUserMutation,
  useUpdateNotificationPreferencesMutation,
} from '@/features/api/authApi';
import { useFetchWishlistQuery, useRemoveCourseFromWishlistMutation } from '@/features/api/wishlistApi';
import UnauthorizedAccess from '@/components/UnauthorizedAccess';
import EditProfile from './EditProfile';
import { useGetAllCoursesQuery, useGetMonthlyRevenueQuery, useGetPublishCourseQuery } from '@/features/api/courseApi';
import { useGetInstructorReputationQuery } from '@/features/api/userApi';
import axios from 'axios';
import config from '@/config/index';

const formatInr = (value = 0) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);

const StatCard = ({ icon: Icon, label, value, index, hint }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} 
    animate={{ opacity: 1, y: 0 }} 
    transition={{ delay: 0.1 * index }} 
    className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex items-center gap-4">
      <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        {hint && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{hint}</p>}
      </div>
    </div>
  </motion.div>
);

const SectionShell = ({ title, subtitle, right, children }) => (
  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/70 dark:border-slate-800/70 shadow-sm overflow-hidden">
    <div className="p-6 sm:p-8 border-b border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display">{title}</h2>
        {subtitle && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{subtitle}</p>}
      </div>
      {right}
    </div>
    <div className="p-6 sm:p-8">{children}</div>
  </div>
);

const Toggle = ({ checked, onChange, label, description, disabled = false }) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!checked)}
    className={`w-full text-left flex items-start justify-between gap-4 p-4 rounded-2xl border transition-colors ${
      disabled
        ? 'border-slate-200/70 dark:border-slate-800/70 bg-slate-50 dark:bg-slate-900/20 opacity-60 cursor-not-allowed'
        : 'border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900 hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
    }`}
  >
    <div>
      <div className="text-sm font-semibold text-slate-900 dark:text-white">{label}</div>
      {description && <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{description}</div>}
    </div>
    <div className={`shrink-0 w-12 h-7 rounded-full p-1 transition-colors ${checked ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
  </button>
);

const ProfilePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [removingCourseId, setRemovingCourseId] = useState(null);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [courseNotifications, setCourseNotifications] = useState({});
  const [switchingToInstructor, setSwitchingToInstructor] = useState(false);

  const { data, isLoading, error, refetch } = useLoaduserQuery();
  const user = data?.user;
  const role = user?.role;
  const isInstructor = role === 'instructor';

  const [logoutUser] = useLogoutUserMutation();

  const { data: myCoursesData, isFetching: myCoursesLoading } = useGetAllCoursesQuery(undefined, { skip: !isInstructor });
  const myCreatedCourses = myCoursesData?.courses || [];

  const { data: publishedCoursesData, isFetching: publishedCoursesLoading } = useGetPublishCourseQuery(undefined, {
    skip: isInstructor || !(user?.enrolledCourses?.length > 0),
  });
  const publishedCourses = publishedCoursesData?.courses || [];

  const { data: revenueData, isFetching: revenueLoading } = useGetMonthlyRevenueQuery(user?._id, { skip: !isInstructor || !user?._id });
  const monthlyRevenue = revenueData?.totalRevenue || 0;

  const { data: reputationData, isFetching: reputationLoading } = useGetInstructorReputationQuery(undefined, { skip: !isInstructor });
  const instructorLevel = reputationData?.level || user?.instructorLevel || 'New Instructor';
  const reputationScore = reputationData?.score ?? user?.reputationScore ?? 0;
  const reputationMetrics = reputationData?.metrics || user?.reputationMetrics;

  const {
    data: notificationData,
    isFetching: notificationLoading,
    refetch: refetchNotifications,
  } = useGetNotificationPreferencesQuery(undefined, { skip: !user });
  const [updateNotificationPreferences] = useUpdateNotificationPreferencesMutation();

  const isWishlistTab = activeTab === 'wishlist';
  const {
    data: wishlistData,
    isFetching: wishlistLoading,
    refetch: refetchWishlist,
  } = useFetchWishlistQuery(undefined, { skip: !isWishlistTab });
  const [removeCourseFromWishlist] = useRemoveCourseFromWishlistMutation();

  useEffect(() => {
    if (data) {
      // Optional: Update local state if needed
    }
  }, [data]);

  // Initialize per-course notification toggles based on API data + the relevant course list.
  useEffect(() => {
    const prefs = notificationData?.notificationPreferences;
    if (!prefs) return;

    const preferenceMap = {};
    (prefs.courses || []).forEach((c) => {
      if (c?.courseId) preferenceMap[String(c.courseId)] = !!c.enabled;
    });

    const relevantCourseIds = (isInstructor ? myCreatedCourses : publishedCourses)
      .map((c) => String(c?._id))
      .filter(Boolean);

    const next = {};
    relevantCourseIds.forEach((id) => {
      next[id] = preferenceMap[id] ?? true;
    });
    setCourseNotifications(next);
  }, [notificationData, isInstructor, myCreatedCourses, publishedCourses]);

  const wishlistCourses = wishlistData?.wishlist || [];

  const enrolledIds = user?.enrolledCourses?.map((id) => String(id)) || [];
  const enrolledCourseCards = useMemo(() => {
    if (!enrolledIds.length) return [];
    const byId = new Map(publishedCourses.map((c) => [String(c._id), c]));
    return enrolledIds.map((id) => byId.get(id)).filter(Boolean);
  }, [enrolledIds, publishedCourses]);

  const createdCoursesTotalStudents = useMemo(() => {
    if (!myCreatedCourses.length) return 0;
    return myCreatedCourses.reduce((acc, c) => acc + (c?.enrolledStudents?.length || 0), 0);
  }, [myCreatedCourses]);

  const stats = useMemo(() => {
    if (!user) return [];
    if (isInstructor) {
      return [
        { icon: FiBook, label: 'Courses Created', value: myCreatedCourses.length, hint: myCoursesLoading ? 'Loading…' : undefined },
        { icon: FiUsers, label: 'Total Students', value: createdCoursesTotalStudents, hint: myCoursesLoading ? 'Loading…' : undefined },
        { icon: FiTrendingUp, label: 'Reputation', value: reputationScore, hint: reputationLoading ? 'Loading…' : instructorLevel },
        { icon: FiDollarSign, label: 'Monthly Revenue', value: formatInr(monthlyRevenue), hint: revenueLoading ? 'Loading…' : 'This month' },
      ];
    }

    return [
      { icon: FiBook, label: 'Enrolled Courses', value: enrolledIds.length, hint: publishedCoursesLoading ? 'Loading…' : undefined },
      { icon: FiHeart, label: 'Wishlist', value: wishlistCourses.length, hint: wishlistLoading ? 'Loading…' : undefined },
      { icon: FiBell, label: 'Notifications', value: notificationData?.notificationPreferences?.global ? 'On' : 'Off', hint: notificationLoading ? 'Loading…' : 'Global' },
      { icon: FiAward, label: 'Instructor Level', value: user?.instructorLevel || '—', hint: 'If you teach' },
    ];
  }, [
    user,
    isInstructor,
    myCreatedCourses.length,
    myCoursesLoading,
    createdCoursesTotalStudents,
    reputationScore,
    reputationLoading,
    instructorLevel,
    revenueLoading,
    monthlyRevenue,
    enrolledIds.length,
    publishedCoursesLoading,
    wishlistCourses.length,
    wishlistLoading,
    notificationData,
    notificationLoading,
  ]);

  const handleRemoveWishlistCourse = async (courseId) => {
    if (!courseId) return;
    try {
      setRemovingCourseId(courseId);
      await removeCourseFromWishlist(courseId).unwrap();
      toast.success('Removed from wishlist');
      if (refetchWishlist) {
        await refetchWishlist();
      }
    } catch (wishlistError) {
      toast.error(wishlistError?.data?.message || 'Failed to update wishlist');
    } finally {
      setRemovingCourseId(null);
    }
  };

  const navItems = useMemo(() => {
    const base = [
      { id: 'overview', label: 'Overview', icon: FiGrid },
      { id: 'notifications', label: 'Notifications', icon: FiBell },
      { id: 'security', label: 'Security', icon: FiShield },
    ];

    if (isInstructor) {
      return [
        ...base.slice(0, 1),
        { id: 'teaching', label: 'Teaching', icon: FiBook },
        { id: 'wallet', label: 'Wallet', icon: FiDollarSign },
        { id: 'reputation', label: 'Reputation', icon: FiTrendingUp },
        ...base.slice(1),
      ];
    }

    return [
      ...base.slice(0, 1),
      { id: 'learning', label: 'Learning', icon: FiBook },
      { id: 'wishlist', label: 'Wishlist', icon: FiHeart },
      ...base.slice(1),
    ];
  }, [isInstructor]);

  const saveNotificationPrefs = async (nextGlobal) => {
    const global = typeof nextGlobal === 'boolean'
      ? nextGlobal
      : !!notificationData?.notificationPreferences?.global;

    // Save only overrides (enabled != global).
    const overrides = Object.entries(courseNotifications)
      .filter(([_, enabled]) => enabled !== global)
      .map(([courseId, enabled]) => ({ courseId, enabled }));

    setSavingNotifications(true);
    try {
      await updateNotificationPreferences({ global, courses: overrides }).unwrap();
      toast.success('Notification preferences saved');
      if (refetchNotifications) await refetchNotifications();
    } catch (e) {
      toast.error(e?.data?.message || 'Failed to save preferences');
    } finally {
      setSavingNotifications(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
      toast.success('Logged out');
      navigate('/login');
    } catch (e) {
      toast.error('Logout failed');
    }
  };

  const handleSwitchToStudent = async () => {
    try {
      await axios.patch(`${config.API_BASE_URL}/api/v1/user/become-student`, {}, { withCredentials: true });
      toast.success('Switched to student');
      await refetch();
      setActiveTab('overview');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to switch role');
    }
  };

  if (error?.data?.message) return <UnauthorizedAccess />;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Sidebar */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900 shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-violet-500/10 to-transparent" />
                <div className="relative p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl p-1 bg-gradient-to-br from-indigo-500 to-violet-500">
                      <img
                        src={user?.photoUrl || 'https://github.com/shadcn.png'}
                        alt={user?.name}
                        className="w-full h-full rounded-2xl object-cover border-2 border-white dark:border-slate-900"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-lg font-bold text-slate-900 dark:text-white font-display truncate">{user?.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-xs font-semibold capitalize">
                          {role}
                        </span>
                        {isInstructor && (
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                            {instructorLevel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                      <FiEdit2 className="w-4 h-4" />
                      Edit
                    </button>
                    {isInstructor ? (
                      <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        Dashboard
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate('/my-courses')}
                        className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        My Learning
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                <div className="p-2">
                  {navItems.map((item) => {
                    const active = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-colors ${
                          active
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                        }`}
                      >
                        <item.icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
                <div className="p-4 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-semibold hover:bg-rose-500/15 transition-colors"
                  >
                    <FiLogOut className="w-4 h-4" />
                    Log out
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {stats.map((stat, idx) => (
                <StatCard key={idx} {...stat} index={idx} />
              ))}
            </div>

            {activeTab === 'overview' && (
              <SectionShell
                title="Profile Overview"
                subtitle={isInstructor ? 'Your teaching performance and quick actions in one place.' : 'Your learning progress, saved courses, and settings in one place.'}
                right={
                  <div className="flex flex-wrap gap-2">
                    {isInstructor ? (
                      <button
                        onClick={() => navigate('/admin/courses')}
                        className="px-4 py-2 rounded-2xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
                      >
                        Manage Courses
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate('/courses')}
                        className="px-4 py-2 rounded-2xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
                      >
                        Browse Courses
                      </button>
                    )}
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      Edit Profile
                    </button>
                  </div>
                }
              >
                <div className="grid lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7">
                    <div className="rounded-3xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50 dark:bg-slate-950/40 p-6">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">Quick info</div>
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60">
                          <div className="text-xs text-slate-500 dark:text-slate-400">Role</div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white capitalize mt-1">{role}</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60">
                          <div className="text-xs text-slate-500 dark:text-slate-400">Notifications</div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                            {notificationLoading ? 'Loading…' : (notificationData?.notificationPreferences?.global ? 'Enabled' : 'Disabled')}
                          </div>
                        </div>
                        {isInstructor && (
                          <>
                            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60">
                              <div className="text-xs text-slate-500 dark:text-slate-400">Instructor Level</div>
                              <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">{instructorLevel}</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60">
                              <div className="text-xs text-slate-500 dark:text-slate-400">Wallet Balance</div>
                              <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">{formatInr(user?.walletBalance || 0)}</div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-5">
                    <div className="rounded-3xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900 p-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">Recent activity</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Latest updates</div>
                      </div>

                      <div className="mt-5 space-y-3">
                        <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800/60">
                          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                            <FiCheckCircle className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900 dark:text-white">Account active</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">You’re signed in and ready to learn.</div>
                          </div>
                        </div>

                        {isInstructor && (user?.walletTransactions?.length > 0) ? (
                          user.walletTransactions.slice(0, 3).map((t, idx) => (
                            <div
                              key={`${t?.date || ''}-${idx}`}
                              className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800/60"
                            >
                              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-300">
                                <FiDollarSign className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{t?.type || 'Transaction'}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">Amount: {formatInr(t?.amount || 0)}</div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400">
                            {isInstructor ? 'No wallet activity yet.' : 'Keep learning — your activity will show up here.'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </SectionShell>
            )}

            {activeTab === 'learning' && !isInstructor && (
              <SectionShell
                title="Learning"
                subtitle="A quick view of your enrolled courses."
                right={
                  <button
                    onClick={() => navigate('/my-courses')}
                    className="px-4 py-2 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    Open My Learning
                  </button>
                }
              >
                {publishedCoursesLoading ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <div key={n} className="rounded-3xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50 dark:bg-slate-800/30 overflow-hidden">
                        <div className="aspect-[16/10] skeleton-shimmer" />
                        <div className="p-5 space-y-3">
                          <div className="h-4 w-3/4 rounded-md skeleton-shimmer" />
                          <div className="h-3.5 w-1/2 rounded-md skeleton-shimmer" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : enrolledCourseCards.length === 0 ? (
                  <div className="text-center py-14 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 text-slate-400 mb-4">
                      <FiBook className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">No enrolled courses found</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Enroll in a course to start tracking your progress.</p>
                    <button
                      onClick={() => navigate('/courses')}
                      className="mt-6 px-5 py-2.5 rounded-2xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      Browse Courses
                    </button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {enrolledCourseCards.slice(0, 9).map((course) => (
                      <Link
                        key={course._id}
                        to={`/course/${course._id}`}
                        className="group rounded-3xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900 overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <img
                            src={course.courseThumbnail || 'https://via.placeholder.com/1200x750'}
                            alt={course.courseTitle}
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-5">
                          <div className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">{course.courseTitle}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">By {course.creator?.name || 'Instructor'}</div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {course.category && (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                                {course.category}
                              </span>
                            )}
                            {course.courseLevel && (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {course.courseLevel}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </SectionShell>
            )}

            {activeTab === 'teaching' && isInstructor && (
              <SectionShell
                title="Teaching"
                subtitle="Your created courses and teaching stats."
                right={
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => navigate('/admin/courses')}
                      className="px-4 py-2 rounded-2xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      Manage Courses
                    </button>
                    <button
                      onClick={() => navigate('/admin/revenue')}
                      className="px-4 py-2 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      Revenue
                    </button>
                  </div>
                }
              >
                {myCoursesLoading ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <div key={n} className="rounded-3xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50 dark:bg-slate-800/30 overflow-hidden">
                        <div className="aspect-[16/10] skeleton-shimmer" />
                        <div className="p-5 space-y-3">
                          <div className="h-4 w-3/4 rounded-md skeleton-shimmer" />
                          <div className="h-3.5 w-1/2 rounded-md skeleton-shimmer" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : myCreatedCourses.length === 0 ? (
                  <div className="text-center py-14 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 text-slate-400 mb-4">
                      <FiBook className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">No courses created yet</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Create your first course to start teaching.</p>
                    <button
                      onClick={() => navigate('/admin/courses/create')}
                      className="mt-6 px-5 py-2.5 rounded-2xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      Create Course
                    </button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myCreatedCourses.slice(0, 9).map((course) => (
                      <div
                        key={course._id}
                        className="group rounded-3xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900 overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <img
                            src={course.courseThumbnail || 'https://via.placeholder.com/1200x750'}
                            alt={course.courseTitle}
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-5">
                          <div className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">{course.courseTitle}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {(course.enrolledStudents?.length || 0)} students • {formatInr(course.coursePrice || 0)}
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Link
                              to={`/course/${course._id}`}
                              className="px-3 py-2 rounded-2xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => navigate(`/admin/courses/edit/${course._id}`)}
                              className="px-3 py-2 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionShell>
            )}

            {activeTab === 'wishlist' && !isInstructor && (
              <SectionShell
                title="Wishlist"
                subtitle="Courses you saved to revisit later."
                right={
                  <button
                    onClick={() => navigate('/courses')}
                    className="px-4 py-2 rounded-2xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Browse
                  </button>
                }
              >
                {wishlistLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400">
                    <div className="w-10 h-10 border-2 border-dashed border-indigo-400 rounded-full animate-spin mb-4" />
                    <p>Loading saved courses...</p>
                  </div>
                ) : wishlistCourses.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 mb-4">
                      <FiHeart className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Your wishlist is empty</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">Save courses to review them later.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {wishlistCourses.map((course) => (
                      <motion.div
                        key={course._id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 rounded-3xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col sm:flex-row gap-5">
                          <div className="sm:w-56 w-full h-36 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                            <img
                              src={course.courseThumbnail || 'https://via.placeholder.com/400x300'}
                              alt={course.courseTitle}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                              {course.category && (
                                <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">{course.category}</span>
                              )}
                              {course.courseLevel && (
                                <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                  {course.courseLevel}
                                </span>
                              )}
                            </div>
                            <Link
                              to={`/course/${course._id}`}
                              className="mt-2 block text-lg font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
                            >
                              {course.courseTitle}
                            </Link>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                              By {course.creator?.name || 'Instructor'}
                            </p>
                            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                              <span>{formatInr(course.coursePrice)}</span>
                              <span>{(course.enrolledStudents?.length || 0)} learners</span>
                            </div>
                            <div className="mt-6 flex flex-wrap items-center gap-3">
                              <Link
                                to={`/course/${course._id}`}
                                className="px-4 py-2 rounded-2xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
                              >
                                View Course
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleRemoveWishlistCourse(course._id)}
                                disabled={removingCourseId === course._id}
                                className={`px-4 py-2 rounded-2xl border text-sm font-semibold transition-colors ${
                                  removingCourseId === course._id
                                    ? 'border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed'
                                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-400'
                                }`}
                              >
                                {removingCourseId === course._id ? 'Removing…' : 'Remove'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </SectionShell>
            )}

            {activeTab === 'wallet' && isInstructor && (
              <SectionShell
                title="Wallet"
                subtitle="Track your earnings and recent transactions."
                right={
                  <button
                    onClick={() => navigate('/admin/wallet')}
                    className="px-4 py-2 rounded-2xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Open Wallet
                  </button>
                }
              >
                <div className="grid lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-4">
                    <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/70 dark:border-slate-800/70">
                      <div className="text-xs text-slate-500 dark:text-slate-400">Available balance</div>
                      <div className="text-3xl font-bold text-slate-900 dark:text-white font-display mt-2">{formatInr(user?.walletBalance || 0)}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">Payouts may be limited by platform rules.</div>
                    </div>
                  </div>
                  <div className="lg:col-span-8">
                    <div className="rounded-3xl border border-slate-200/70 dark:border-slate-800/70 overflow-hidden">
                      <div className="p-5 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/60">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">Recent transactions</div>
                      </div>
                      <div className="p-5 bg-white dark:bg-slate-900">
                        {user?.walletTransactions?.length ? (
                          <div className="space-y-3">
                            {user.walletTransactions.slice(0, 8).map((t, idx) => (
                              <div
                                key={`${t?.date || ''}-${idx}`}
                                className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800/60"
                              >
                                <div className="min-w-0">
                                  <div className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{t?.type || 'transaction'}</div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{t?.date ? new Date(t.date).toLocaleString() : ''}</div>
                                </div>
                                <div className="text-sm font-bold text-slate-900 dark:text-white">{formatInr(t?.amount || 0)}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-slate-600 dark:text-slate-400">No transactions yet.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </SectionShell>
            )}

            {activeTab === 'reputation' && isInstructor && (
              <SectionShell
                title="Reputation"
                subtitle="Your level and performance metrics."
                right={
                  <button
                    onClick={() => navigate('/admin/reputation')}
                    className="px-4 py-2 rounded-2xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Open Details
                  </button>
                }
              >
                <div className="grid lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-4">
                    <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/70 dark:border-slate-800/70">
                      <div className="text-xs text-slate-500 dark:text-slate-400">Level</div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white font-display mt-2">{reputationLoading ? 'Loading…' : instructorLevel}</div>
                      <div className="mt-4 flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <FiAward className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm">Score: <span className="font-semibold text-slate-900 dark:text-white">{reputationScore}</span></span>
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-8">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70">
                        <div className="text-xs text-slate-500 dark:text-slate-400">Average rating</div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{(reputationMetrics?.avgRating || 0).toFixed(1)} / 5</div>
                      </div>
                      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70">
                        <div className="text-xs text-slate-500 dark:text-slate-400">Completion rate</div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{Math.round(reputationMetrics?.completionRate || 0)}%</div>
                      </div>
                      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70">
                        <div className="text-xs text-slate-500 dark:text-slate-400">Response rate</div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{Math.round(reputationMetrics?.responseRate || 0)}%</div>
                      </div>
                      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70">
                        <div className="text-xs text-slate-500 dark:text-slate-400">Total students</div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{reputationMetrics?.totalStudents || createdCoursesTotalStudents || 0}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </SectionShell>
            )}

            {activeTab === 'notifications' && (
              <SectionShell
                title="Notifications"
                subtitle="Control global and per-course notifications."
                right={
                  <button
                    onClick={() => saveNotificationPrefs()}
                    disabled={savingNotifications || notificationLoading}
                    className="px-4 py-2 rounded-2xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    {savingNotifications ? 'Saving…' : 'Save'}
                  </button>
                }
              >
                <div className="space-y-4">
                  <Toggle
                    checked={!!notificationData?.notificationPreferences?.global}
                    onChange={(next) => saveNotificationPrefs(next)}
                    label="Global notifications"
                    description="Turn all course notifications on/off for your account."
                    disabled={notificationLoading}
                  />

                  <div className="rounded-3xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50 dark:bg-slate-950/40 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">Per-course settings</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Overrides are saved when you click Save.</div>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{Object.keys(courseNotifications).length} courses</div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3">
                      {Object.keys(courseNotifications).length === 0 ? (
                        <div className="text-sm text-slate-600 dark:text-slate-400">No courses available for per-course notification settings.</div>
                      ) : (
                        Object.entries(courseNotifications).map(([courseId, enabled]) => {
                          const course = (isInstructor ? myCreatedCourses : enrolledCourseCards).find((c) => String(c?._id) === String(courseId));
                          const title = course?.courseTitle || 'Course';
                          return (
                            <Toggle
                              key={courseId}
                              checked={enabled}
                              onChange={(next) => setCourseNotifications((prev) => ({ ...prev, [courseId]: next }))}
                              label={title}
                              description={isInstructor ? 'Students will receive updates for your course.' : 'Get updates for this course.'}
                              disabled={notificationLoading}
                            />
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </SectionShell>
            )}

            {activeTab === 'security' && (
              <SectionShell
                title="Security & Settings"
                subtitle="Account actions and role management."
              >
                <div className="grid lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 space-y-4">
                    <div className="p-6 rounded-3xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <FiSettings className="w-4 h-4 text-indigo-500" />
                            Password
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            Password change endpoint isn’t available in this project yet. If you want, I can add it in backend and wire it here.
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled
                          className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-sm font-semibold cursor-not-allowed"
                        >
                          Change
                        </button>
                      </div>
                    </div>

                    <div className="p-6 rounded-3xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <FiLogOut className="w-4 h-4 text-rose-500" />
                            Sign out
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Logs you out from this device.</div>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="px-4 py-2 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-sm font-semibold hover:bg-rose-500/15 transition-colors"
                        >
                          Log out
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-5 space-y-4">
                    {isInstructor && (
                      <div className="p-6 rounded-3xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50 dark:bg-slate-950/40">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">Role</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          Switch back to the student experience. You can return to instructor anytime via onboarding.
                        </div>
                        <button
                          onClick={handleSwitchToStudent}
                          className="mt-4 w-full px-4 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold hover:opacity-90 transition-opacity"
                        >
                          Switch to Student
                        </button>
                      </div>
                    )}

                    {!isInstructor && (
                      <div className="p-6 rounded-3xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50 dark:bg-slate-950/40">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">
                          {user?.roles?.includes('instructor') && user?.instructorApplicationStatus === 'approved'
                            ? 'Switch to Instructor'
                            : 'Become an Instructor'}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {user?.roles?.includes('instructor') && user?.instructorApplicationStatus === 'approved'
                            ? 'You are an approved instructor. Switch back to access your teaching tools.'
                            : 'Unlock teaching tools, revenue tracking, and instructor reputation.'}
                        </div>
                        <button
                          onClick={async () => {
                            if (user?.roles?.includes('instructor') && user?.instructorApplicationStatus === 'approved') {
                              try {
                                setSwitchingToInstructor(true);
                                await axios.patch(
                                  `${config.API_BASE_URL}/api/v1/user/switch-to-instructor`,
                                  {},
                                  { withCredentials: true }
                                );
                                window.location.href = '/admin/dashboard';
                              } catch (err) {
                                console.error(err);
                                toast.error('Failed to switch role. Please try again.');
                              } finally {
                                setSwitchingToInstructor(false);
                              }
                            } else {
                              navigate('/become-instructor');
                            }
                          }}
                          disabled={switchingToInstructor}
                          className="mt-4 w-full px-4 py-2.5 rounded-2xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                          {switchingToInstructor
                            ? 'Switching...'
                            : user?.roles?.includes('instructor') && user?.instructorApplicationStatus === 'approved'
                              ? 'Switch to Instructor'
                              : 'Start onboarding'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </SectionShell>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Profile</h2>
              <button onClick={() => setIsEditing(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                Close
              </button>
            </div>
            <div className="p-6">
              <EditProfile user={user} onClose={() => setIsEditing(false)} refetch={refetch} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;