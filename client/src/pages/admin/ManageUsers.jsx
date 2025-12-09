import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import { Search, ChevronLeft, ChevronRight, ExternalLink, BookOpen, MinusCircle, Sparkles, Activity, ShieldCheck, AlertTriangle } from 'lucide-react';

// --- Import API Hooks and Course Data ---
import { useGetAllUsersQuery, useDeleteUserMutation, useRemoveCourseFromUserMutation } from '@/features/api/userApi';
import { useGetAllCoursesQuery } from '@/features/api/courseApi';
import { FiInfo } from 'react-icons/fi';
import { useLoaduserQuery } from '@/features/api/authApi';

// --- Reusable Components ---
const UserActionModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, isDestructive, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 w-full max-w-lg mx-auto shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-visible">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{message}</p>
        {children}
        <div className="flex justify-end gap-3 mt-4">
          <motion.button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/40 dark:bg-gray-900/40 text-gray-700 dark:text-gray-200" whileHover={{ scale: 1.03 }}>Cancel</motion.button>
          <motion.button onClick={onConfirm} className={`px-4 py-2 rounded-lg text-white ${isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`} whileHover={{ scale: 1.03 }}>{confirmText}</motion.button>
        </div>
      </motion.div>
    </div>
  );
};

const CoursesModal = ({ user, courses, onClose, onRemoveCourse }) => {
  const userCourses = courses?.filter(c => user?.enrolledCourses?.includes(c._id)) || [];
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl p-4 w-full max-w-md mx-auto shadow-xl border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-md font-bold text-gray-900 dark:text-gray-100">Courses for {user?.name}</h3>
          <motion.button onClick={onClose} className="p-1 rounded-full text-gray-700 dark:text-gray-200" whileHover={{ scale: 1.05 }}>✕</motion.button>
        </div>

        {userCourses.length > 0 ? (
          <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {userCourses.map(course => (
              <li key={course._id} className="flex items-center p-2 rounded-lg bg-white/50 dark:bg-gray-900/50">
                <img src={course.courseThumbnail || '/default-course.png'} alt={course.courseTitle} className="w-12 h-12 object-cover rounded-md shadow-sm border" />
                <div className="flex-1 min-w-0 ml-3">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm">{course.courseTitle}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Price: <span className="font-medium text-gray-800 dark:text-gray-100">${course.coursePrice}</span></p>
                </div>
                <motion.button onClick={() => onRemoveCourse(user, course)} className="ml-3 p-1.5 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 transition-colors" whileHover={{ scale: 1.05 }}>
                  <MinusCircle className="w-4 h-4" />
                </motion.button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center p-6 text-gray-500 dark:text-gray-300">
            <BookOpen className="w-10 h-10 mx-auto mb-2" />
            <p className="text-sm">This user has not purchased any courses yet.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default function ManageUsers() {
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [courseToRemove, setCourseToRemove] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 9;

  const roles = ['all', 'instructor', 'student'];
  const [selectedRole, setSelectedRole] = useState('all');

  const { data: currentUserData, isLoading: currentUserLoading } = useLoaduserQuery();
  const instructorId = currentUserData?.user?._id;

  const { data: usersData, isLoading: usersLoading, isError: usersError, refetch } = useGetAllUsersQuery(instructorId, { skip: !instructorId });
  const users = usersData?.users || [];

  const { data: coursesData, isLoading: coursesLoading, isError: coursesError } = useGetAllCoursesQuery(null, { skip: !instructorId });
  const courses = coursesData?.courses || [];

  const [deleteUser] = useDeleteUserMutation();
  const [removeCourseFromUser] = useRemoveCourseFromUserMutation();

  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = users.filter(u => {
      const nameMatch = u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term);
      const roleMatch = selectedRole === 'all' || u.role === selectedRole;
      return nameMatch && roleMatch;
    });
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [users, searchTerm, selectedRole]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = users ? Math.max(1, Math.ceil(filteredUsers.length / usersPerPage)) : 1;

  const handlePageChange = (page) => { if (page >= 1 && page <= totalPages) setCurrentPage(page); };
  const handleDeleteUser = (user) => { setSelectedUser(user); setModalAction('delete'); setIsModalOpen(true); };
  const handleViewCourses = (user) => { setSelectedUser(user); setModalAction('view-courses'); setIsModalOpen(true); };
  const handleRemoveCourse = (user, course) => { setSelectedUser(user); setCourseToRemove(course); setModalAction('remove-course'); setIsModalOpen(true); };

  const handleConfirmAction = async () => {
    if (!selectedUser) return;
    try {
      const userId = selectedUser._id || selectedUser.id || selectedUser?.userId;
      if (modalAction === 'delete') {
        await deleteUser({ userId, instructorId }).unwrap();
        await refetch();
        toast.success(`${selectedUser.name} has been deleted.`);
      } else if (modalAction === 'remove-course' && courseToRemove) {
        await removeCourseFromUser({ userId: selectedUser._id || userId, courseId: courseToRemove._id, instructorId }).unwrap();
        setSelectedUser(prev => ({ ...prev, enrolledCourses: (prev?.enrolledCourses || []).filter(id => id !== courseToRemove._id) }));
        toast.success(`${courseToRemove.courseTitle || courseToRemove.title} removed from ${selectedUser.name}.`);
        setModalAction('view-courses');
        await refetch();
      }
    } catch (err) { toast.error('Action failed.'); console.error(err); }
    if (modalAction !== 'remove-course') { setIsModalOpen(false); setSelectedUser(null); setCourseToRemove(null); }
  };

  const handleCancelAction = () => { setIsModalOpen(false); setSelectedUser(null); setCourseToRemove(null); };

  if (currentUserLoading || usersLoading || coursesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold text-gray-800">Loading users...</h3>
        </div>
      </div>
    );
  }

  if (usersError || coursesError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center text-gray-500">
          <FiInfo className="w-16 h-16 mx-auto mb-4" />
          <p className="text-lg font-medium">Failed to load user data. Please check your API connection.</p>
        </div>
      </div>
    );
  }

  const getRoleBadge = (role) => {
    const palette = role === 'instructor'
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200'
      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200';
    return (
      <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold ${palette}`}>
        {role?.charAt(0).toUpperCase() + role?.slice(1) || 'User'}
      </span>
    );
  };

  const totalEnrollments = users.reduce((sum, u) => sum + (u.enrolledCourses?.length || 0), 0);
  const instructorCount = users.filter((u) => u.role === 'instructor').length;
  const studentCount = users.filter((u) => u.role === 'student').length;
  const activeLearners = users.filter((u) => (u.enrolledCourses?.length || 0) > 0).length;

  const analytics = [
    {
      label: 'Total users',
      value: filteredUsers.length || users.length,
      meta: `${users.length} imported`,
      accent: 'from-slate-900 via-slate-800 to-slate-900',
      delta: '+8.3%',
      deltaTone: 'text-emerald-300',
      icon: Sparkles,
    },
    {
      label: 'Instructors',
      value: instructorCount,
      meta: 'active creators',
      accent: 'from-indigo-500 via-violet-500 to-sky-400',
      delta: '+2 onboarding',
      deltaTone: 'text-indigo-200',
      icon: ShieldCheck,
    },
    {
      label: 'Students',
      value: studentCount,
      meta: 'learning now',
      accent: 'from-emerald-500 to-lime-400',
      delta: '+31 this week',
      deltaTone: 'text-emerald-200',
      icon: Activity,
    },
    {
      label: 'Enrollments',
      value: totalEnrollments,
      meta: 'courses assigned',
      accent: 'from-amber-500 to-orange-500',
      delta: '94% capacity',
      deltaTone: 'text-amber-200',
      icon: AlertTriangle,
    },
  ];

  const recentSnapshots = filteredUsers.slice(0, 4);

  const getEngagementStatus = (user) => {
    const totalCourses = user.enrolledCourses?.length || 0;
    if (totalCourses >= 3) {
      return {
        label: 'Power learner',
        tone: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-100',
      };
    }
    if (totalCourses === 0) {
      return {
        label: 'Dormant',
        tone: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-100',
      };
    }
    return {
      label: 'Active',
      tone: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-400/40 dark:bg-sky-500/10 dark:text-sky-100',
    };
  };

  return (
    <>
      <Toaster position="bottom-right" richColors />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-10 text-slate-900 dark:text-white transition-colors duration-300">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-7xl space-y-8">
          <motion.section
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[40px] border border-slate-200/70 dark:border-white/10 bg-gradient-to-br from-white via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-8 shadow-[0px_35px_140px_rgba(15,23,42,0.15)] dark:shadow-[0px_35px_140px_rgba(0,0,0,0.55)] transition-colors"
          >
            <div className="absolute inset-0 opacity-50 dark:opacity-30">
              <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.25),_transparent_60%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.05)_25%,transparent_25%)] dark:bg-[linear-gradient(120deg,rgba(255,255,255,0.04)_25%,transparent_25%)] bg-[length:14px_14px]" />
            </div>
            <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl space-y-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-white/80">
                  <Sparkles className="h-4 w-4" /> User workspace
                </p>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">Manage users</h1>
                  <p className="mt-3 text-base text-slate-600 dark:text-white/75">
                    Review profiles, revoke course access, and keep your classroom roster tidy from one familiar dashboard.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm text-slate-600 dark:text-white/70">
                  {['Real-time updates', 'Course revocation', 'Audit-safe actions'].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-slate-200/70 bg-white/70 px-3 py-1 text-slate-600 dark:border-white/10 dark:bg-transparent dark:text-white/80"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="w-full max-w-md rounded-[32px] border border-slate-200/70 bg-white/80 p-6 backdrop-blur dark:border-white/15 dark:bg-white/5">
                <p className="text-sm font-medium text-slate-700 dark:text-white/70">Live posture</p>
                <div className="mt-4 grid grid-cols-2 gap-4 text-slate-900 dark:text-white">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950/40">
                    <p className="text-sm text-slate-500 dark:text-white/60">Active learners</p>
                    <p className="mt-1 text-3xl font-semibold">{activeLearners}</p>
                    <span className="text-xs text-emerald-600 dark:text-emerald-300">+12 vs last week</span>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950/40">
                    <p className="text-sm text-slate-500 dark:text-white/60">Enrollments</p>
                    <p className="mt-1 text-3xl font-semibold">{totalEnrollments}</p>
                    <span className="text-xs text-sky-600 dark:text-sky-300">94% course capacity</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {analytics.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="rounded-[26px] border border-slate-200/70 bg-white/90 p-5 text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:shadow-inner"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-500 dark:text-white/60">{card.label}</p>
                    <span className={`text-xs font-semibold ${card.deltaTone}`}>{card.delta}</span>
                  </div>
                  <div className="mt-3 flex items-end justify-between">
                    <p className="text-3xl font-semibold text-slate-900 dark:text-white">{card.value}</p>
                    <div className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-500 dark:border-white/10 dark:bg-slate-950/40 dark:text-white/70">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-white/60">{card.meta}</p>
                  <div className={`mt-4 h-1 rounded-full bg-gradient-to-r ${card.accent}`} />
                </div>
              );
            })}
          </section>

          <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <div className="rounded-[30px] border border-slate-200/70 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <label className="flex w-full flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm dark:border-white/10 dark:bg-slate-900/40 dark:text-white/80">
                  <Search className="h-4 w-4 text-slate-400 dark:text-white/50" />
                  <input
                    aria-label="Search users"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search name, email, or ID"
                    className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-white/40"
                  />
                </label>
                <button
                  onClick={() => setSearchTerm('')}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:text-slate-900 dark:border-white/15 dark:text-white/70 dark:hover:text-white"
                >
                  Clear search
                </button>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {roles.map((role) => {
                  const isActive = selectedRole === role;
                  return (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                        isActive
                          ? 'border-slate-900 bg-slate-900/5 text-slate-900 dark:border-white/70 dark:bg-white/15 dark:text-white'
                          : 'border-slate-200 text-slate-500 hover:text-slate-900 dark:border-white/10 dark:text-white/60 dark:hover:text-white'
                      }`}
                    >
                      {role === 'all' ? 'All users' : role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/60">
                <span className="rounded-full border border-slate-200 px-3 py-1 text-slate-500 dark:border-white/10 dark:text-white/60">
                  Showing {filteredUsers.length} matches
                </span>
                <span className="rounded-full border border-slate-200 px-3 py-1 text-slate-500 dark:border-white/10 dark:text-white/60">
                  Page {currentPage} / {totalPages}
                </span>
                <span className="rounded-full border border-slate-200 px-3 py-1 text-slate-500 dark:border-white/10 dark:text-white/60">
                  {activeLearners} active learners
                </span>
              </div>
            </div>

            <div className="rounded-[30px] border border-slate-200/70 bg-white/90 p-6 text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white/80">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950/50">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700 dark:text-white/80">Recent joins</p>
                  <span className="text-xs text-slate-500 dark:text-white/60">{recentSnapshots.length} of {filteredUsers.length}</span>
                </div>
                <div className="mt-4 space-y-3">
                  {recentSnapshots.length > 0 ? (
                    recentSnapshots.map((user) => (
                      <div key={user._id} className="flex items-center gap-3 text-sm">
                        <img
                          src={user.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || 'User')}`}
                          alt={user.name || 'User avatar'}
                          className="h-9 w-9 rounded-2xl object-cover border border-slate-200 dark:border-white/10"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-slate-500 dark:text-white/50">{user.email}</p>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-white/60">{user.enrolledCourses?.length || 0} courses</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-white/60">No recent user activity</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {currentUsers.length > 0 ? (
            <>
              <div className="hidden rounded-[32px] border border-slate-200/70 bg-white/95 p-0 shadow-xl dark:border-white/10 dark:bg-white/5 md:block">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-700 dark:text-white/80">
                    <thead>
                      <tr className="text-xs font-semibold text-slate-500 dark:text-white/60">
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Courses</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.map((user) => {
                        const status = getEngagementStatus(user);
                        return (
                          <tr key={user._id} className="border-t border-slate-100 dark:border-white/5">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={user.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || 'User')}`}
                                  alt={user.name || 'User avatar'}
                                  className="h-11 w-11 rounded-2xl object-cover border border-slate-200 dark:border-white/10"
                                />
                                <div>
                                  <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                                  <p className="text-xs text-slate-500 dark:text-white/60">ID {user._id?.slice(-6)}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                            <td className="px-6 py-4 text-slate-600 dark:text-white/70">{user.enrolledCourses?.length || 0}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${status.tone}`}>
                                {status.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-600 dark:text-white/70">{user.email}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleViewCourses(user)}
                                  className="rounded-2xl border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:text-slate-900 dark:border-white/10 dark:text-white/80 dark:hover:text-white"
                                >
                                  Courses
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user)}
                                  className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100 dark:border-rose-400/50 dark:bg-rose-500/20 dark:text-rose-100"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-4 md:hidden">
                {currentUsers.map((user) => {
                  const status = getEngagementStatus(user);
                  return (
                    <div key={user._id} className="rounded-[28px] border border-slate-200 bg-white/90 p-4 text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white/80">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || 'User')}`}
                          alt={user.name || 'User avatar'}
                          className="h-10 w-10 rounded-2xl object-cover border border-slate-200 dark:border-white/10"
                        />
                        <div className="flex-1">
                          <p className="text-base font-semibold text-slate-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-slate-500 dark:text-white/60">{user.email}</p>
                        </div>
                        {getRoleBadge(user.role)}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-white/60">
                        <span className="rounded-full border border-slate-200 px-3 py-1 dark:border-white/10">Courses {user.enrolledCourses?.length || 0}</span>
                        <span className="rounded-full border border-slate-200 px-3 py-1 dark:border-white/10">ID {user._id?.slice(-6)}</span>
                        <span className={`rounded-full border px-3 py-1 ${status.tone}`}>{status.label}</span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          onClick={() => handleViewCourses(user)}
                          className="flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900 dark:border-white/10 dark:text-white/80"
                        >
                          Courses
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="flex-1 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-100 dark:border-rose-400/40 dark:bg-rose-500/20 dark:text-rose-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="rounded-[28px] border border-dashed border-slate-200 bg-white/80 p-10 text-center text-slate-500 dark:border-white/20 dark:bg-white/5 dark:text-white/60">
              No users match your search or filter.
            </div>
          )}

          <div className="flex items-center justify-center">
            <nav className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-xs text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white/70">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                className="rounded-full border border-slate-200 px-3 py-1 disabled:opacity-40 dark:border-white/10"
                disabled={currentPage === 1}
              >
                Prev
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                className="rounded-full border border-slate-200 px-3 py-1 disabled:opacity-40 dark:border-white/10"
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </nav>
          </div>
        </motion.div>
      </div>

      {isModalOpen && modalAction === 'view-courses' && (
        <CoursesModal user={selectedUser} courses={courses} onClose={handleCancelAction} onRemoveCourse={handleRemoveCourse} />
      )}
      {isModalOpen && (modalAction === 'delete' || modalAction === 'remove-course') && (
        <UserActionModal
          isOpen={isModalOpen}
          onClose={handleCancelAction}
          onConfirm={handleConfirmAction}
          title={
            modalAction === 'delete'
              ? `Delete ${selectedUser?.name}`
              : `Remove ${courseToRemove?.courseTitle || 'course'}`
          }
          message={
            modalAction === 'delete'
              ? 'This action will permanently delete the user.'
              : 'Confirm removal of this course from the user.'
          }
          confirmText={modalAction === 'delete' ? 'Delete' : 'Remove'}
          isDestructive={modalAction === 'delete'}
        />
      )}
    </>
  );
}
