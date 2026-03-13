import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiTrash2, FiUserCheck, FiUsers, FiShield, FiUser,
  FiChevronLeft, FiChevronRight, FiAlertTriangle
} from 'react-icons/fi';
import {
  useGetAllPlatformUsersQuery,
  useUpdateUserRoleMutation,
  useDeleteUserAdminMutation
} from '@/features/api/adminApi';
import { toast } from 'sonner';

const roleBadge = {
  admin: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
  instructor: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
  student: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
};

const roleIcon = {
  admin: <FiShield className="w-3 h-3" />,
  instructor: <FiUserCheck className="w-3 h-3" />,
  student: <FiUser className="w-3 h-3" />,
};

function SAUsers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  const { data, isLoading, error } = useGetAllPlatformUsersQuery({
    page, limit: 20, search, role: roleFilter
  });

  const [updateUserRole, { isLoading: updatingRole }] = useUpdateUserRoleMutation();
  const [deleteUserAdmin, { isLoading: deleting }] = useDeleteUserAdminMutation();

  const users = data?.users || [];
  const totalPages = data?.totalPages || 1;

  const handleRoleChange = async () => {
    try {
      await updateUserRole({ userId: selectedUser._id, newRole }).unwrap();
      toast.success(`Role updated to ${newRole}`);
      setShowRoleModal(false);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update role');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUserAdmin(selectedUser._id).unwrap();
      toast.success('User deleted');
      setShowDeleteModal(false);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete user');
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

  const roleFilters = [
    { key: '', label: 'All Roles' },
    { key: 'student', label: 'Students' },
    { key: 'instructor', label: 'Instructors' },
    { key: 'admin', label: 'Admins' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
          <p className="text-slate-500 animate-pulse">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-display">All Users</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage all platform users, change roles, or remove accounts</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center shadow-sm">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0">
          {roleFilters.map(f => (
            <button
              key={f.key}
              onClick={() => { setRoleFilter(f.key); setPage(1); }}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-colors ${roleFilter === f.key
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80 ml-auto">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" placeholder="Search by name or email..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-center">Enrolled Courses</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No users found</td></tr>
              ) : users.map(user => (
                <tr key={user._id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=f43f5e&color=fff`}
                        alt="" className="h-10 w-10 rounded-full object-cover bg-slate-200"
                      />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${roleBadge[user.role] || roleBadge.student}`}>
                      {roleIcon[user.role] || roleIcon.student}
                      {user.role || 'student'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-300">
                    {user.enrolledCourses?.length || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{formatDate(user.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setSelectedUser(user); setNewRole(user.role); setShowRoleModal(true); }}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-colors"
                      >
                        Change Role
                      </button>
                      <button
                        onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FiChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Role Change Modal */}
      <AnimatePresence>
        {showRoleModal && selectedUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="text-center">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiUserCheck className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Change User Role</h3>
                <p className="text-slate-500 text-sm mb-6">{selectedUser.name} ({selectedUser.email})</p>
                <div className="flex gap-3 justify-center mb-8">
                  {['student', 'instructor', 'admin'].map(role => (
                    <button
                      key={role}
                      onClick={() => setNewRole(role)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${newRole === role
                        ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-rose-300'
                        }`}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowRoleModal(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleRoleChange} disabled={updatingRole || newRole === selectedUser.role}
                    className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold shadow-lg shadow-rose-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {updatingRole ? 'Updating...' : 'Update Role'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiAlertTriangle className="w-8 h-8 text-rose-600 dark:text-rose-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete User?</h3>
                <p className="text-slate-500 mb-1 text-sm">{selectedUser.name}</p>
                <p className="text-slate-400 text-xs mb-6">This will permanently remove the user and unenroll them from all courses.</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleDelete} disabled={deleting}
                    className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-lg shadow-rose-500/20 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SAUsers;
