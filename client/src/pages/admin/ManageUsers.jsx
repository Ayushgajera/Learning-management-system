import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import {
  Search, User, Edit, Trash, ChevronLeft, ChevronRight, Check, X,
  ExternalLink, LogOut, CheckCircle2, CircleDashed, BookOpen, MinusCircle
} from 'lucide-react';

// --- Import API Hooks and Course Data ---
import {
  useGetAllUsersQuery,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
  useRemoveCourseFromUserMutation
} from '@/features/api/userApi';
import { useGetAllCoursesQuery } from '@/features/api/courseApi';
import { FiInfo } from 'react-icons/fi';
import { useLoaduserQuery } from '@/features/api/authApi';

// --- Reusable Components ---
const UserActionModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, isDestructive, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md mx-auto shadow-2xl space-y-4"
      >
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <p className="text-gray-600">{message}</p>
        {children}
        <div className="flex justify-end space-x-3">
          <motion.button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cancel
          </motion.button>
          <motion.button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors ${isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {confirmText}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

const CoursesModal = ({ user, courses, onClose, onRemoveCourse }) => {
  // ✅ Filter enrolled courses
  const userCourses =
    courses?.filter(course => user?.enrolledCourses?.includes(course._id)) || [];

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl p-4 w-full max-w-md mx-auto shadow-xl space-y-3"
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">
            Courses for {user.name}
          </h3>
          <motion.button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Course List */}
        {userCourses.length > 0 ? (
          <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {userCourses.map(course => (
              <li
                key={course._id}
                className="flex items-center p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
              >
                {/* Thumbnail */}
                <img
                  src={course.courseThumbnail || "/default-course.png"}
                  alt={course.courseTitle}
                  className="w-12 h-12 object-cover rounded-md shadow-sm border"
                />

                {/* Course Info */}
                <div className="flex-1 min-w-0 ml-3">
                  <p className="font-semibold text-gray-900 truncate text-sm">
                    {course.courseTitle}
                  </p>
                  <p className="text-xs text-gray-600">
                    Price:{" "}
                    <span className="font-medium text-gray-800">
                      ${course.coursePrice}
                    </span>
                  </p>
                </div>

                {/* Remove Button */}
                <motion.button
                  onClick={() => onRemoveCourse(user, course)}
                  className="ml-3 p-1.5 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Remove from course"
                >
                  <MinusCircle className="w-4 h-4" />
                </motion.button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center p-6 text-gray-500">
            <BookOpen className="w-10 h-10 mx-auto mb-2" />
            <p className="text-sm">This user has not purchased any courses yet.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};




// --- Main Component (Updated) ---
function ManageUsers() {
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [courseToRemove, setCourseToRemove] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const roles = ['all', 'instructor', 'student'];
  const [selectedRole, setSelectedRole] = useState('all');

  // Use RTK Query hooks to fetch current user data first
  const { data: currentUserData, isLoading: currentUserLoading } = useLoaduserQuery();
  const instructorId = currentUserData?.user?._id;

  // Use RTK Query hooks to fetch other data, but only when instructorId is available
  const { data: usersData, isLoading: usersLoading, isError: usersError, refetch } = useGetAllUsersQuery(instructorId, {
    skip: !instructorId,
  });
  const users = usersData?.users;

  const { data: coursesData, isLoading: coursesLoading, isError: coursesError, refetch: refetchCourses } = useGetAllCoursesQuery(null, {
    skip: !instructorId,
  });
  const courses = coursesData?.courses;

  // Use RTK Query hooks for mutations
  const [updateUserRole, { isLoading: isUpdatingRole }] = useUpdateUserRoleMutation();
  const [deleteUser, { isLoading: isDeletingUser }] = useDeleteUserMutation();
  const [removeCourseFromUser, { isLoading: isRemovingCourse, refetch: refetchRemoveCourse }] = useRemoveCourseFromUserMutation();

  useEffect(() => {
    if (users) {
      let newFilteredUsers = users.filter(user => {
        const nameMatch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
        const roleMatch = selectedRole === 'all' || user.role === selectedRole;
        return nameMatch && roleMatch;
      });
      setFilteredUsers(newFilteredUsers);
      setCurrentPage(1);
    }
  }, [users, searchTerm, selectedRole]);

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = users ? Math.ceil(users.length / usersPerPage) : 0;

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleEditRole = (user) => {
    setSelectedUser(user);
    setModalAction('edit-role');
    setIsModalOpen(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setModalAction('delete');
    setIsModalOpen(true);
  };

  const handleViewCourses = (user) => {
    setSelectedUser(user);
    setModalAction('view-courses');
    setIsModalOpen(true);
  };

  const handleRemoveCourse = (user, course) => {
    setSelectedUser(user);
    setCourseToRemove(course);
    setModalAction('remove-course');
    setIsModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedUser) return;

    try {
      if (modalAction === 'edit-role') {
        await updateUserRole({ id: selectedUser.id, role: selectedUser.role }).unwrap();
        toast.success(`${selectedUser.name}'s role updated to ${selectedUser.role}.`);
      } else if (modalAction === 'delete') {
        if (currentUserData?.user?.role === 'instructor' && instructorId) {
          await deleteUser({
            userId: selectedUser?._id,
            instructorId: instructorId
          }).unwrap();
          refetch();
          toast.success(`${selectedUser.name} has been deleted and removed from instructor's courses.`);
        } else {
          await deleteUser(selectedUser.id).unwrap();
          refetch();
          toast.success(`${selectedUser.name} has been deleted.`);
        }
      } else if (modalAction === 'remove-course' && courseToRemove) {
        await removeCourseFromUser({
          userId: selectedUser._id,
          courseId: courseToRemove._id,
          instructorId
        }).unwrap();

        // ✅ Update selectedUser locally so UI updates instantly
        setSelectedUser(prev => ({
          ...prev,
          enrolledCourses: prev.enrolledCourses.filter(id => id !== courseToRemove._id)
        }));

        toast.success(`${courseToRemove.courseTitle || courseToRemove.title} removed from ${selectedUser.name}.`);

        // Keep modal open to show updated courses
        setModalAction('view-courses');
      }
    } catch (error) {
      toast.error('Failed to perform action.');
      console.error('API Error:', error);
    }

    if (modalAction !== 'remove-course') {
      setIsModalOpen(false);
      setSelectedUser(null);
      setCourseToRemove(null);
    } else {
      setModalAction('view-courses');
    }
  };

  const handleCancelAction = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setCourseToRemove(null);
  };

  const getRoleBadge = (role) => {
    let colorClass = '';
    switch (role) {
      case 'instructor':
        colorClass = 'bg-blue-100 text-blue-800';
        break;
      case 'student':
      default:
        colorClass = 'bg-green-100 text-green-800';
        break;
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  // Show loading spinner if current user data is still loading
  if (currentUserLoading || usersLoading || coursesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold text-gray-800">Loading Users...</h3>
        </div>
      </div>
    );
  }

  if (usersError || coursesError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
        <div className="text-center text-gray-500">
          <FiInfo className="w-16 h-16 mx-auto mb-4" />
          <p className="text-lg font-medium">Failed to load user data. Please check your API connection.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="bottom-right" richColors />
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
              <p className="text-gray-600 mt-1">View and manage all users on the platform.</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Filter by Role:</span>
              <select
                className="py-2 px-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                {roles.map(role => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* User List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200"
          >
            {currentUsers.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {currentUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center flex-1 min-w-0 gap-4">
                      <div className="flex-shrink-0">
                        <User className="w-8 h-8 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {getRoleBadge(user.role)}
                      <motion.button
                        onClick={() => handleViewCourses(user)}
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>{user.enrolledCourses?.length || 0} Courses</span>
                      </motion.button>
                    </div>
                    <div className="flex items-center gap-3">
                      <motion.button
                        onClick={() => handleEditRole(user)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Edit Role"
                      >
                        <Edit className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDeleteUser(user)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Delete User"
                      >
                        <Trash className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <p>No users found matching your search.</p>
              </div>
            )}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <motion.button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-full text-gray-500 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              <span className="text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <motion.button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-full text-gray-500 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {isModalOpen && modalAction === 'delete' && (
          <UserActionModal
            isOpen={isModalOpen}
            onClose={handleCancelAction}
            onConfirm={handleConfirmAction}
            title="Delete User"
            message={`Are you sure you want to delete ${selectedUser.name}? This action cannot be undone.`}
            confirmText="Delete"
            isDestructive={true}
          />
        )}
        {isModalOpen && modalAction === 'edit-role' && (
          <UserActionModal
            isOpen={isModalOpen}
            onClose={handleCancelAction}
            onConfirm={handleConfirmAction}
            title="Edit User Role"
            message={`Change the role for ${selectedUser.name}:`}
            confirmText="Update Role"
            isDestructive={false}
          >
            <div className="mt-4">
              <select
                value={selectedUser.role}
                onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                className="w-full p-2 border rounded-xl"
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </UserActionModal>
        )}
        {isModalOpen && modalAction === 'remove-course' && courseToRemove && (
          <UserActionModal
            isOpen={isModalOpen}
            onClose={handleCancelAction}
            onConfirm={handleConfirmAction}
            title="Remove Course"
            message={`Are you sure you want to remove ${courseToRemove.title} from ${selectedUser.name}'s courses?`}
            confirmText="Remove"
            isDestructive={true}
          />
        )}
        {isModalOpen && modalAction === 'view-courses' && selectedUser && courses && (
          <CoursesModal
            user={selectedUser}
            courses={courses}
            onClose={handleCancelAction}
            onRemoveCourse={handleRemoveCourse}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default ManageUsers;
