// This is a conceptual example of how to refactor your code.
// You will need to implement the actual logic for EditProfile and other components.
// This example assumes 'EditProfile' and 'UnauthorizedAccess' are already defined.

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiBook, FiAward, FiClock, FiBarChart2, FiMail, FiLinkedin, FiGithub } from 'react-icons/fi';
import { toast } from 'sonner';
import { useLoaduserQuery } from '@/features/api/authApi';
import UnauthorizedAccess from '@/components/UnauthorizedAccess';
import EditProfile from './EditProfile'; // Assuming this component exists

// --- Sub-components for better organization ---

const ProfileHeader = ({ user, onEdit }) => (
  <div className="flex flex-col sm:flex-row items-center gap-6">
    <div className="relative">
      <img
        src={user?.photoUrl || 'https://ui-avatars.com/api/?name=User&background=7C3AED&color=fff'}
        alt={user?.name}
        className="w-36 h-36 rounded-full border-4 border-purple-100 object-cover"
      />
    </div>
    <div className="flex-1 text-center sm:text-left">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{user?.name}</h1>
      <p className="text-gray-600 mb-4">{user?.role?.toUpperCase()}</p>
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
        <a href={`mailto:${user?.email}`} className="flex items-center gap-2 text-gray-600 hover:text-purple-600">
          <FiMail className="w-4 h-4" />
          <span>{user?.email}</span>
        </a>
        <div className="flex items-center gap-2">
          {/* Use user data for social links if available */}
          <a href="#" className="p-2 text-gray-600 hover:text-purple-600">
            <FiLinkedin className="w-5 h-5" />
          </a>
          <a href="#" className="p-2 text-gray-600 hover:text-purple-600">
            <FiGithub className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
    <button
      onClick={onEdit}
      className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors duration-200"
    >
      Edit Profile
    </button>
  </div>
);

const LearningStats = ({ stats }) => {
  const statItems = [
    { icon: FiClock, label: 'Hours Learned', value: stats.hoursLearned },
    { icon: FiBook, label: 'Courses Enrolled', value: stats.coursesEnrolled },
    { icon: FiAward, label: 'Certificates', value: stats.certificatesEarned },
    { icon: FiBarChart2, label: 'Avg. Score', value: `${stats.avgScore}%` }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {statItems.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className=" p-6 rounded-lg border hover:shadow-lg transition-shadow duration-200"
          >
            <Icon className="w-8 h-8 text-purple-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
};

// Main component
const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [isEditing, setIsEditing] = useState(false);

  // Use the RTK Query hook
  const { data, isLoading, error, refetch } = useLoaduserQuery();

  // Handle side effects for refetching or notifications
  useEffect(() => {
    if (data) {
      // You can add logic here if needed, but it's often better to just use `data` directly
      // No need to set a separate `userProfile` state
      console.log('User data loaded:', data);
    }
  }, [data]);

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = async (updatedProfile) => {
    try {
      // Logic to update the user on the backend
      // ... (your existing save logic) ...
      
      // After a successful save, refetch the data to get the latest user info
      await refetch();
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error("Failed to update profile.");
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // Conditional Rendering for loading and error states
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-medium text-gray-500">Loading profile...</div>
      </div>
    );
  }

  if (error?.data?.message) {
    return <UnauthorizedAccess />;
  }

  const user = data?.user;

  // Render the main page if the user data is available
  return (
    <>
      {/* Keep the main wrapper background transparent so global/theme classes control page background (fixes dark mode toggle) */}
      <div className="min-h-screen mt-18 bg-transparent">
        <div className=" border-b py-8">
          <div className="max-w-5xl mx-auto px-4">
            <ProfileHeader user={user} onEdit={handleEditProfile} />
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">
          <LearningStats stats={{
            hoursLearned: 45, // Replace with dynamic data from `user` if available
            coursesEnrolled: user?.enrolledCourses?.length || 0,
            certificatesEarned: 3,
            avgScore: 92
          }} />
        </div>

        <div className="border-b ">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex space-x-8">
              {['courses', 'certificates', 'wishlist'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors duration-200 ${
                    activeTab === tab ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">
          {activeTab === 'courses' && (
            <div className="grid gap-6">
              {user?.enrolledCourses?.length > 0 ? (
                // Map over enrolledCourses to display them
                <p>You are enrolled in courses.</p> // Placeholder
              ) : (
                <div className="text-center text-gray-600 p-8  rounded-lg border">
                  <p className="text-lg font-medium mb-4">You are not enrolled in any courses yet.</p>
                  <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Explore Courses
                  </button>
                </div>
              )}
            </div>
          )}
          {/* Content for other tabs can go here */}
        </div>
      </div>

      {isEditing && (
        <EditProfile
          userProfile={user} // Pass the fetched user data
          onSave={handleSaveProfile}
          onCancel={handleCancelEdit}
        />
      )}
    </>
  );
};

export default ProfilePage;