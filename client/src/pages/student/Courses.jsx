import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiGrid, FiList } from 'react-icons/fi';
import Course from './Course';
import { useGetPublishCourseQuery } from '@/features/api/courseApi';
import { useLoaduserQuery } from '@/features/api/authApi';
import { socket } from '../../extensions/socket'; // ✅ Import socket connection

const Courses = () => {
  const { data, isSuccess, isLoading, isError, refetch } = useGetPublishCourseQuery();
  const courses = data?.courses || [];
   const { data: userData } = useLoaduserQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const user = userData?.user || {};
  
  const enrolledCourseIds = user.enrolledCourses || [];
  console.log("enrolledCourseIds:", enrolledCourseIds);

  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  // ✅ Real-time course update listener
  useEffect(() => {
    refetch();
    const handleCourseUpdated = () => {
      refetch();
    };
    socket.on("courseUpdated", handleCourseUpdated);
    return () => {
      socket.off("courseUpdated", handleCourseUpdated);
    };
  }, [refetch]);

  const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
      <div className="w-full h-48 bg-gray-200 rounded-lg animate-pulse" />
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
        <div className="flex gap-2">
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4" />
        </div>
      </div>
    </div>
  );

  // Helper to check if a course is purchased
  const isCoursePurchased = (course) => enrolledCourseIds.includes(course._id);

  // Exception handling for no published courses or error
  let mainContent;
  if (isLoading) {
    mainContent = (
      <div className={`grid gap-6 ${
        viewMode === 'grid'
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch'
          : 'grid-cols-1'
      }`}>
        {[...Array(8)].map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  } else if (isError) {
    mainContent = (
      <div className="text-center text-red-500 py-16 text-lg font-semibold">
        Failed to load courses. Please try again later.
      </div>
    );
  } else if (!courses.length) {
    mainContent = (
      <div className="flex flex-col items-center justify-center py-24">
        <img src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png" alt="No courses" className="w-32 h-32 mb-6 opacity-70" />
        <div className="text-2xl font-bold text-gray-700 mb-2">No published courses available</div>
        <div className="text-gray-500 mb-4">Check back later or explore other categories!</div>
        <button
          onClick={() => refetch()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Refresh
        </button>
      </div>
    );
  } else {
    mainContent = (
      <div className={`grid gap-6 ${
        viewMode === 'grid'
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch'
          : 'grid-cols-1'
      }`}>
        {courses.map(course => (
          <Course key={course._id} course={course} isPurchased={isCoursePurchased(course)} />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
   
      

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {mainContent}
      </div>
    </div>
  );
};

export default Courses;
