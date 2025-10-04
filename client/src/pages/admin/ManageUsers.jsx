import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import { Search, Trash, ChevronLeft, ChevronRight, ExternalLink, CheckCircle2, BookOpen, MinusCircle } from 'lucide-react';

// --- Import API Hooks and Course Data ---
import { useGetAllUsersQuery, useUpdateUserRoleMutation, useDeleteUserMutation, useRemoveCourseFromUserMutation } from '@/features/api/userApi';
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

  const [updateUserRole] = useUpdateUserRoleMutation();
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
  const handleEditRole = (user) => { setSelectedUser(user); setModalAction('edit-role'); setIsModalOpen(true); };
  const handleDeleteUser = (user) => { setSelectedUser(user); setModalAction('delete'); setIsModalOpen(true); };
  const handleViewCourses = (user) => { setSelectedUser(user); setModalAction('view-courses'); setIsModalOpen(true); };
  const handleRemoveCourse = (user, course) => { setSelectedUser(user); setCourseToRemove(course); setModalAction('remove-course'); setIsModalOpen(true); };

  const handleConfirmAction = async () => {
    if (!selectedUser) return;
    try {
      const userId = selectedUser._id || selectedUser.id || selectedUser?.userId;
      if (modalAction === 'edit-role') {
        await updateUserRole({ id: userId, role: selectedUser.role }).unwrap();
        toast.success(`${selectedUser.name}'s role updated to ${selectedUser.role}.`);
        await refetch();
      } else if (modalAction === 'delete') {
        await deleteUser(userId).unwrap();
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
    let colorClass = '';
    switch (role) { case 'instructor': colorClass = 'bg-blue-100 text-blue-800'; break; default: colorClass = 'bg-green-100 text-green-800'; }
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>{role?.charAt(0).toUpperCase() + role?.slice(1)}</span>;
  };

  return (
    <>
      <Toaster position="bottom-right" richColors />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-blue-50/40 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/30 p-6 sm:p-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto">
          <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative mb-6 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-300/6 to-green-300/6 backdrop-blur-sm pointer-events-none" />
            <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-blue-600 dark:from-gray-100 dark:to-blue-400">Manage Users</h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 max-w-xl">Manage platform users — view profiles, edit roles, remove users or revoke course access. Fast, secure, and responsive.</p>
              </div>
              <div className="flex items-center gap-3">
                <motion.button onClick={() => refetch()} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-md hover:shadow-lg text-sm font-medium text-gray-700 dark:text-gray-200" whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                  Refresh
                </motion.button>
                <motion.button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg text-sm font-semibold" whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  <ExternalLink className="w-4 h-4" />
                  Export
                </motion.button>
              </div>
            </div>
            <div className="h-6 sm:h-8 bg-gradient-to-r from-blue-500/6 to-purple-500/6" />
          </motion.header>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-4 sm:p-6 shadow-lg">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <input aria-label="Search users" type="text" placeholder="Search by name or email..." className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/40 dark:bg-gray-900/40 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-400/60 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>

              <div className="flex items-center gap-3">
                <label className="sr-only">Filter by role</label>
                <select aria-label="Filter by role" className="py-2 px-3 rounded-xl bg-white/40 dark:bg-gray-900/40 border border-transparent focus:ring-2 focus:ring-blue-400/60 text-sm text-gray-800 dark:text-gray-100" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                  {roles.map(role => (<option key={role} value={role}>{role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}</option>))}
                </select>
                <motion.button onClick={() => setSearchTerm('')} className="px-3 py-2 rounded-xl bg-white/30 dark:bg-gray-900/30 border border-transparent text-sm text-gray-700 dark:text-gray-200" whileHover={{ scale: 1.03 }}>Clear</motion.button>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentUsers.length > 0 ? currentUsers.map((user, idx) => (
              <motion.article key={user._id || user.id || idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }} className="relative p-4 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-md hover:shadow-xl hover:scale-[1.01] transition-transform" role="article" aria-labelledby={`user-${user._id || user.id}`}>
                <div className="flex items-start gap-3">
                  <div className="shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">{user.name?.slice(0, 1) || 'U'}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 id={`user-${user._id || user.id}`} className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-300 truncate">{user.email}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs">{getRoleBadge(user.role)}</span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">{(user.enrolledCourses || []).length} courses</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <motion.button onClick={() => handleViewCourses(user)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/30 dark:bg-gray-900/30 text-sm text-blue-600 dark:text-blue-300 border border-transparent" whileHover={{ y: -2 }}>
                      <BookOpen className="w-4 h-4" /> Courses
                    </motion.button>
                    <motion.button onClick={() => handleEditRole(user)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-400 to-green-500 text-white text-sm font-medium shadow-sm" whileHover={{ y: -2 }}>
                      <CheckCircle2 className="w-4 h-4" /> Edit Role
                    </motion.button>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button onClick={() => handleDeleteUser(user)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500 text-white text-sm font-medium shadow-sm" whileHover={{ scale: 1.03 }}>
                      <Trash className="w-4 h-4" /> Delete
                    </motion.button>
                  </div>
                </div>
              </motion.article>
            )) : (
              <motion.div className="col-span-full p-8 text-center text-gray-500 bg-white/30 dark:bg-gray-800/30 rounded-2xl">
                <p className="text-sm">No users match your search or filter.</p>
              </motion.div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-center">
            <nav className="inline-flex items-center gap-2 bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-full p-2">
              <motion.button onClick={() => handlePageChange(currentPage - 1)} className="p-2 rounded-full bg-white/60 dark:bg-gray-900/60" whileHover={{ scale: 1.05 }} aria-label="Previous page" disabled={currentPage === 1}><ChevronLeft className="w-4 h-4" /></motion.button>
              <div className="px-3 text-sm text-gray-700 dark:text-gray-200">Page {currentPage} of {totalPages}</div>
              <motion.button onClick={() => handlePageChange(currentPage + 1)} className="p-2 rounded-full bg-white/60 dark:bg-gray-900/60" whileHover={{ scale: 1.05 }} aria-label="Next page" disabled={currentPage === totalPages}><ChevronRight className="w-4 h-4" /></motion.button>
            </nav>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      {isModalOpen && modalAction === 'view-courses' && <CoursesModal user={selectedUser} courses={courses} onClose={handleCancelAction} onRemoveCourse={handleRemoveCourse} />}
      {isModalOpen && (modalAction === 'delete' || modalAction === 'edit-role' || modalAction === 'remove-course') && (
        <UserActionModal isOpen={isModalOpen} onClose={handleCancelAction} onConfirm={handleConfirmAction} title={modalAction === 'delete' ? `Delete ${selectedUser?.name}` : modalAction === 'edit-role' ? `Edit Role for ${selectedUser?.name}` : `Remove ${courseToRemove?.courseTitle || 'course'}`} message={modalAction === 'delete' ? 'This action will permanently delete the user.' : modalAction === 'edit-role' ? 'Change the user role and save.' : 'Confirm removal of this course from the user.'} confirmText={modalAction === 'delete' ? 'Delete' : modalAction === 'edit-role' ? 'Save' : 'Remove'} isDestructive={modalAction === 'delete'}>
          {modalAction === 'edit-role' && (
            <div className="mt-3 w-full">
              <label className="text-sm text-gray-700 dark:text-gray-200 block mb-2">Role</label>
              <div className="relative w-full max-w-sm">
                <select value={selectedUser?.role} onChange={(e) => setSelectedUser(prev => ({ ...prev, role: e.target.value }))} className="w-full appearance-none px-3 py-2 rounded-xl bg-white/40 dark:bg-gray-900/40 border border-transparent pr-10">
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-600 dark:text-gray-300"><path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </div>
          )}
        </UserActionModal>
      )}
    </>
  );
}
