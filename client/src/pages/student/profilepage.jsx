import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiBook, FiAward, FiClock, FiBarChart2, FiMail, FiLinkedin, FiGithub, FiEdit2, FiHeart } from 'react-icons/fi';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { useLoaduserQuery } from '@/features/api/authApi';
import { useFetchWishlistQuery, useRemoveCourseFromWishlistMutation } from '@/features/api/wishlistApi';
import UnauthorizedAccess from '@/components/UnauthorizedAccess';
import EditProfile from './EditProfile';

const formatInr = (value = 0) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);

const StatCard = ({ icon: Icon, label, value, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} 
    animate={{ opacity: 1, y: 0 }} 
    transition={{ delay: 0.1 * index }} 
    className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex items-center gap-4">
      <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  </motion.div>
);

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [isEditing, setIsEditing] = useState(false);
  const [removingCourseId, setRemovingCourseId] = useState(null);

  const { data, isLoading, error, refetch } = useLoaduserQuery();
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

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (error?.data?.message) return <UnauthorizedAccess />;

  const user = data?.user;
  const wishlistCourses = wishlistData?.wishlist || [];

  const stats = [
    { icon: FiClock, label: 'Hours Learned', value: user?.hoursLearned || 0 },
    { icon: FiBook, label: 'Courses Enrolled', value: user?.enrolledCourses?.length || 0 },
    { icon: FiAward, label: 'Certificates', value: user?.certificates?.length || 0 },
    { icon: FiBarChart2, label: 'Avg. Score', value: `${user?.avgScore || 0}%` },
  ];

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Profile Header */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-3xl opacity-10 blur-3xl" />
          
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-8">
              
              {/* Avatar */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-indigo-500 to-violet-500">
                  <img 
                    src={user?.photoUrl || "https://github.com/shadcn.png"} 
                    alt={user?.name} 
                    className="w-full h-full rounded-full object-cover border-4 border-white dark:border-slate-900" 
                  />
                </div>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors"
                >
                  <FiEdit2 className="w-4 h-4" />
                </button>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{user?.name}</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-4">{user?.email}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium capitalize">
                    {user?.role}
                  </span>
                  {user?.bio && (
                    <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm">
                      {user.bio}
                    </span>
                  )}
                </div>
              </div>

              {/* Edit Button (Desktop) */}
              <div className="hidden md:block">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:opacity-90 transition-opacity"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} index={idx} />
          ))}
        </div>

        {/* Content Tabs */}
        <div className="mb-8 border-b border-slate-200 dark:border-slate-800">
          <div className="flex gap-8">
            {['courses', 'certificates', 'wishlist'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-medium capitalize transition-colors relative ${
                  activeTab === tab 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[300px]">
          {activeTab === 'courses' && (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-4">
                <FiBook className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No courses yet</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Enrolled courses will appear here.
              </p>
            </div>
          )}
          {activeTab === 'wishlist' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
              {wishlistLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400">
                  <div className="w-10 h-10 border-2 border-dashed border-indigo-400 rounded-full animate-spin mb-4" />
                  <p>Loading saved courses...</p>
                </div>
              ) : wishlistCourses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-500 mb-4">
                    <FiHeart className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Your wishlist is empty</h3>
                  <p className="text-slate-600 dark:text-slate-400">Save courses to review them later.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {wishlistCourses.map((course) => (
                    <motion.div
                      key={course._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row gap-5">
                        <div className="sm:w-48 w-full h-32 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                          <img
                            src={course.courseThumbnail || 'https://via.placeholder.com/400x300'}
                            alt={course.courseTitle}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                            {course.category && (
                              <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30">{course.category}</span>
                            )}
                            {course.courseLevel && (
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
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
                            <span>{course.duration || 'Duration coming soon'}</span>
                            <span>
                              {(course.enrolledStudents?.length || 0)} learners
                            </span>
                          </div>
                          <div className="mt-6 flex flex-wrap items-center gap-3">
                            <Link
                              to={`/course/${course._id}`}
                              className="px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-colors"
                            >
                              View Course
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleRemoveWishlistCourse(course._id)}
                              disabled={removingCourseId === course._id}
                              className={`px-4 py-2 rounded-full border text-sm font-semibold transition-colors
                                ${removingCourseId === course._id ? 'border-slate-300 text-slate-400 cursor-not-allowed' : 'border-slate-300 text-slate-600 hover:border-rose-500 hover:text-rose-500'}
                              `}
                            >
                              {removingCourseId === course._id ? 'Removing...' : 'Remove'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* Add other tabs content as needed */}
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