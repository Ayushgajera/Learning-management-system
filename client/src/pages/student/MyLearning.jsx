import React, { useState, useEffect } from 'react';
import Course from './Course';
import { useLoaduserQuery } from '@/features/api/authApi';
import { motion } from 'framer-motion';
import { FiBookOpen, FiCheckCircle, FiClock, FiPlayCircle } from 'react-icons/fi';

const TABS = [
  { key: 'all', label: 'All Courses', icon: FiBookOpen },
  { key: 'inProgress', label: 'In Progress', icon: FiPlayCircle },
  { key: 'completed', label: 'Completed', icon: FiCheckCircle },
  { key: 'notStarted', label: 'Not Started', icon: FiClock },
];

function MyLearning() {
  const [coursesByStatus, setCoursesByStatus] = useState({
    completed: [],
    inProgress: [],
    notStarted: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [fetchError, setFetchError] = useState(null);

  const { data: userData, isLoading: isLoadingUser, error: userError } = useLoaduserQuery();
  const user = userData?.user || {};
  const enrolledCourseIds = user.enrolledCourses || [];

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      setFetchError(null);
      const completed = [];
      const inProgress = [];
      const notStarted = [];

      try {
        await Promise.all(
          enrolledCourseIds.map(async (courseId) => {
            try {
              // Fetch course details
              const courseRes = await fetch(`http://localhost:8000/api/v1/course/${courseId}`, { credentials: 'include' });
              if (!courseRes.ok) throw new Error('Failed to fetch course');
              const courseData = await courseRes.json();
              const course = courseData.course;
              if (!course) throw new Error('Course not found');

              // Fetch progress
              const progressRes = await fetch(`http://localhost:8000/api/v1/progress/${courseId}`, { credentials: 'include' });
              if (!progressRes.ok) throw new Error('Failed to fetch progress');
              const progressData = await progressRes.json();
              const progress = progressData.data;

              // Categorize
              if (progress?.completed) {
                completed.push(course);
              } else if (progress?.progress?.length > 0) {
                inProgress.push(course);
              } else {
                notStarted.push(course);
              }
            } catch (err) {
              // Skip this course, but log error
              console.error(`Error loading course or progress for courseId ${courseId}:`, err);
            }
          })
        );
        setCoursesByStatus({ completed, inProgress, notStarted });
      } catch (err) {
        setFetchError('Failed to load some or all courses. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (enrolledCourseIds.length > 0) fetchAll();
    else setIsLoading(false);
  }, [enrolledCourseIds]);

  const allCourses = [
    ...coursesByStatus.completed,
    ...coursesByStatus.inProgress,
    ...coursesByStatus.notStarted,
  ];

  const getCoursesToDisplay = () => {
    switch (activeTab) {
      case 'inProgress': return coursesByStatus.inProgress;
      case 'completed': return coursesByStatus.completed;
      case 'notStarted': return coursesByStatus.notStarted;
      default: return allCourses;
    }
  };

  const coursesToDisplay = getCoursesToDisplay();

  if (isLoadingUser) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display mb-4">
            My Learning
          </h1>
          
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-medium text-sm transition-all relative ${
                  activeTab === tab.key
                    ? 'text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 border-x border-t border-slate-200 dark:border-slate-800 -mb-px'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute top-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl h-[380px] animate-pulse border border-slate-200 dark:border-slate-800" />
            ))}
          </div>
        ) : coursesToDisplay.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-4">
              <FiBookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No courses found</h3>
            <p className="text-slate-600 dark:text-slate-400">
              {activeTab === 'all' 
                ? "You haven't enrolled in any courses yet." 
                : `You have no courses in the "${TABS.find(t => t.key === activeTab)?.label}" category.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {coursesToDisplay.map(course => (
              <Course key={course._id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyLearning;
