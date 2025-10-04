import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiBook, FiAward, FiClock, FiBarChart2, FiMail, FiLinkedin, FiGithub, FiEdit2 } from 'react-icons/fi';
import { toast } from 'sonner';
import { useLoaduserQuery } from '@/features/api/authApi';
import UnauthorizedAccess from '@/components/UnauthorizedAccess';
import EditProfile from './EditProfile'; // keep existing edit component

// Small reusable components
const Avatar = ({ src, name }) => (
  <div className="relative">
    <img src={src} alt={name} className="w-36 h-36 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white/60 dark:border-gray-800 shadow-md" />
    <svg viewBox="0 0 100 100" className="absolute -bottom-2 -right-2 w-8 h-8" aria-hidden>
      <circle cx="50" cy="50" r="40" fill="url(#g)" />
      <defs>
        <linearGradient id="g" x1="0" x2="1">
          <stop offset="0" stopColor="#7C3AED" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

const StatCard = ({ icon: Icon, label, value, index }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * index }} className="rounded-2xl p-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-lg border border-gray-200/30 dark:border-gray-700/30 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 text-white"><Icon className="w-5 h-5" /></div>
      <div>
        <div className="text-sm text-gray-500 dark:text-gray-300">{label}</div>
        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{value}</div>
      </div>
    </div>
  </motion.div>
);

const Tabs = ({ active, onChange }) => (
  <div className="flex gap-6 border-b border-gray-100 dark:border-gray-700 pb-3">
    {['courses', 'certificates', 'wishlist'].map(tab => (
      <button key={tab} onClick={() => onChange(tab)} className={`text-sm font-medium pb-2 ${active === tab ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600' : 'text-gray-600 dark:text-gray-300'}`}>
        {tab.charAt(0).toUpperCase() + tab.slice(1)}
      </button>
    ))}
  </div>
);

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [isEditing, setIsEditing] = useState(false);

  const { data, isLoading, error, refetch } = useLoaduserQuery();

  useEffect(() => {
    // optional side-effects
  }, [data]);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => setIsEditing(false);
  const handleSave = async (payload) => {
    try {
      // Assume EditProfile performs the update and then calls this to refetch
      await refetch();
      setIsEditing(false);
      toast.success('Profile updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile');
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 p-6">
      <div className="text-gray-500">Loading profile…</div>
    </div>
  );

  if (error?.data?.message) return <UnauthorizedAccess />;

  const user = data?.user;

  // stats (replace placeholders with real fields if available)
  const stats = {
    hoursLearned: user?.hoursLearned || 45,
    coursesEnrolled: user?.enrolledCourses?.length || 0,
    certificatesEarned: user?.certificates?.length || 0,
    avgScore: user?.avgScore || 92
  };

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen py-8 bg-gradient-to-b from-gray-50 via-blue-50/30 to-purple-50/10 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/20">
      <div className="max-w-5xl mx-auto px-4">
        {/* Hero */}
        <motion.section initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="relative mb-8">
          <div className="absolute inset-0 pointer-events-none -z-10">
            <div className="absolute -top-16 left-[-10%] w-72 h-72 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 opacity-10 blur-3xl" />
            <div className="absolute -bottom-20 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-emerald-300 to-blue-300 opacity-8 blur-3xl" />
          </div>

          <div className="rounded-2xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-lg border border-gray-200/30 dark:border-gray-700/30 p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <Avatar src={user?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=7C3AED&color=fff`} name={user?.name} />
            </div>

            <div className="flex-1 w-full">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{user?.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-300">{user?.role?.toUpperCase() || 'Member'}</p>
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 max-w-xl">{user?.bio || 'A passionate learner exploring modern web development and creative systems.'}</p>
                </div>

                <div className="flex items-center gap-3">
                  <motion.button whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} onClick={handleEdit} aria-label="Edit profile" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow hover:shadow-xl">
                    <FiEdit2 className="w-4 h-4" /> Edit Profile
                  </motion.button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-4 items-center">
                <a href={`mailto:${user?.email}`} className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600">
                  <FiMail className="w-4 h-4" /> {user?.email}
                </a>
                <a href={user?.linkedin || '#'} className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600"> <FiLinkedin className="w-4 h-4" /> LinkedIn</a>
                <a href={user?.github || '#'} className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600"> <FiGithub className="w-4 h-4" /> GitHub</a>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Stats grid */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard index={0} icon={FiClock} label="Hours Learned" value={stats.hoursLearned} />
          <StatCard index={1} icon={FiBook} label="Courses" value={stats.coursesEnrolled} />
          <StatCard index={2} icon={FiAward} label="Certificates" value={stats.certificatesEarned} />
          <StatCard index={3} icon={FiBarChart2} label="Avg. Score" value={`${stats.avgScore}%`} />
        </section>

        {/* Tabs and content */}
        <section className="mb-8">
          <Tabs active={activeTab} onChange={setActiveTab} />

          <div className="mt-6">
            {activeTab === 'courses' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user?.enrolledCourses?.length > 0 ? user.enrolledCourses.map((c, i) => (
                  <div key={c._id || i} className="rounded-xl p-4 bg-white/30 dark:bg-gray-900/30 border border-transparent hover:border-gray-200/20 transition-shadow shadow-sm">
                    <div className="flex items-center gap-4">
                      <img src={c.courseThumbnail || 'https://via.placeholder.com/80'} alt={c.courseTitle} className="w-16 h-16 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{c.courseTitle}</p>
                        <p className="text-xs text-gray-500">{c.creator?.name || 'Instructor'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">${c.coursePrice || 0}</p>
                        <p className="text-xs text-gray-500">{(c.enrolledStudents?.length) || 0} students</p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center p-8 rounded-lg bg-white/30 dark:bg-gray-900/30 border">
                    <p className="text-lg font-medium mb-3">No enrolled courses yet</p>
                    <p className="text-sm text-gray-500 mb-4">Explore courses to start learning.</p>
                    <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white">Explore Courses</button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'certificates' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Map certificates if available */}
                {user?.certificates?.length > 0 ? user.certificates.map((cert, i) => (
                  <div key={i} className="p-4 rounded-lg bg-white/30 dark:bg-gray-900/30 border">
                    <p className="font-semibold">{cert.title}</p>
                    <p className="text-xs text-gray-500">Issued: {new Date(cert.issuedAt).toLocaleDateString()}</p>
                  </div>
                )) : (
                  <div className="text-center p-8 rounded-lg bg-white/30 dark:bg-gray-900/30 border">No certificates yet.</div>
                )}
              </motion.div>
            )}

            {activeTab === 'wishlist' && (
              <div className="text-center p-8 rounded-lg bg-white/30 dark:bg-gray-900/30 border">Wishlist is empty.</div>
            )}
          </div>
        </section>

        {/* Footer quick links */}
        <footer className="text-center text-sm text-gray-500 dark:text-gray-400 py-6">Powered by your modern learning platform • {new Date().getFullYear()}</footer>
      </div>

      {isEditing && (
        <EditProfile userProfile={user} onSave={handleSave} onCancel={handleCancel} />
      )}
    </motion.main>
  );
};

export default ProfilePage;