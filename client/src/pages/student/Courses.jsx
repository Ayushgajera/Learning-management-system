import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiGrid, FiList, FiRefreshCw } from 'react-icons/fi';
import Course from './Course';
import { useGetPublishCourseQuery } from '@/features/api/courseApi';
import { useLoaduserQuery } from '@/features/api/authApi';
import { socket } from '../../extensions/socket';

const Courses = () => {
  const { data, isSuccess, isLoading, isError, refetch } = useGetPublishCourseQuery();
  const courses = data?.courses || [];
  const { data: userData } = useLoaduserQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const user = userData?.user || {};
  
  const enrolledCourseIds = user.enrolledCourses || [];
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    refetch();
    const handleCourseUpdated = () => refetch();
    socket.on("courseUpdated", handleCourseUpdated);
    return () => socket.off("courseUpdated", handleCourseUpdated);
  }, [refetch]);

  const isCoursePurchased = (course) => enrolledCourseIds.includes(course._id);

  const filteredCourses = courses.filter(course => 
    course.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">
              Explore Courses
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Discover new skills and advance your career with our expert-led courses.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none w-full md:w-64 transition-all"
              />
            </div>
            
            <div className="flex bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                <FiGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                <FiList className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl h-[380px] animate-pulse border border-slate-200 dark:border-slate-800" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 mb-4">
              <FiRefreshCw className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Failed to load courses</h3>
            <button onClick={() => refetch()} className="text-indigo-600 hover:underline font-medium">
              Try again
            </button>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No courses found</h3>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {filteredCourses.map(course => (
              <Course 
                key={course._id} 
                course={course} 
                // We can pass isPurchased if we update Course component to use it
                // isPurchased={isCoursePurchased(course)} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
