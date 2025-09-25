import React, { useState, useEffect } from 'react';
import Course from './Course';
import { useLoaduserQuery } from '@/features/api/authApi';

const TABS = [
  { key: 'all', label: 'All Courses' },
  { key: 'inProgress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'notStarted', label: 'Not Started' },
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

  if (isLoadingUser) {
    return <div className="text-center text-gray-500 py-16">Loading user...</div>;
  }
  if (userError) {
    return <div className="text-center text-red-500 py-16">Failed to load user data.</div>;
  }

  // Gather all courses for the 'All Courses' tab
  const allCourses = [
    ...coursesByStatus.completed,
    ...coursesByStatus.inProgress,
    ...coursesByStatus.notStarted,
  ];

  return (
    <div className="min-h-screen bg-gray-50 mt-10">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Learning</h1>
        <div className="flex gap-4 mb-8">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-full font-medium transition ${
                activeTab === tab.key
                  ? 'bg-blue-700 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-blue-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {isLoading ? (
          <div className="text-center text-gray-500 py-16">Loading courses...</div>
        ) : fetchError ? (
          <div className="text-center text-red-500 py-16">{fetchError}</div>
        ) : enrolledCourseIds.length === 0 ? (
          <div className="text-center text-gray-500 py-16">You are not enrolled in any courses yet.</div>
        ) : (
          <Section
            title={TABS.find(t => t.key === activeTab).label}
            courses={activeTab === 'all' ? allCourses : coursesByStatus[activeTab]}
          />
        )}
      </div>
    </div>
  );
}

function Section({ title, courses }) {
  if (!courses.length) return (
    <div className="text-center text-gray-500 py-16">No courses in {title}.</div>
  );
  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Course course={course} key={course._id} isPurchased={true} />
        ))}
      </div>
    </div>
  );
}

export default MyLearning;
