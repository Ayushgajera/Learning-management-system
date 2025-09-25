import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiGrid, FiList, FiStar, FiClock, FiUsers, FiBookOpen, FiChevronDown, FiX, FiTrendingUp, FiAward, FiPlay } from 'react-icons/fi';
import { useGetPublishCourseQuery } from '@/features/api/courseApi';
import Course from '../student/Course';
import { useLoaduserQuery } from '@/features/api/authApi';
import { socket } from '../../extensions/socket';

const CATEGORIES = [
  'All Categories',
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Design',
  'Business',
  'Marketing',
  'Music',
  'Photography',
  'AI & Machine Learning',
  'Cybersecurity',
  'Cloud Computing'
];

const LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
const PRICES = ['All Prices', 'Free', 'Paid', 'Under $50', '$50-$100', '$100-$200', '$200+'];
const SORT_OPTIONS = [
  'Most Popular',
  'Newest',
  'Highest Rated',
  'Price: Low to High',
  'Price: High to Low',
  'Most Enrolled'
];

function ExplorePage() {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [selectedPrice, setSelectedPrice] = useState('All Prices');
  const [sortBy, setSortBy] = useState('Most Popular');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { data, isLoading, error , refetch} = useGetPublishCourseQuery();
  const courses = data?.courses || [];
  const observerRef = useRef();

   const { data: userData } = useLoaduserQuery(undefined, {
      refetchOnMountOrArgChange: true,
    });
    const user = userData?.user || {};
    
    const enrolledCourseIds = user.enrolledCourses || [];
    const isCoursePurchased = (course) => enrolledCourseIds.includes(course._id);

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

  // Filter and sort courses
  useEffect(() => {
    let filtered = [...courses];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.courseTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.subTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.creator?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    // Level filter
    if (selectedLevel !== 'All Levels') {
      filtered = filtered.filter(course => course.courseLevel === selectedLevel);
    }

    // Price filter
    if (selectedPrice !== 'All Prices') {
      switch (selectedPrice) {
        case 'Free':
          filtered = filtered.filter(course => course.coursePrice === 0);
          break;
        case 'Paid':
          filtered = filtered.filter(course => course.coursePrice > 0);
          break;
        case 'Under $50':
          filtered = filtered.filter(course => course.coursePrice < 50);
          break;
        case '$50-$100':
          filtered = filtered.filter(course => course.coursePrice >= 50 && course.coursePrice <= 100);
          break;
        case '$100-$200':
          filtered = filtered.filter(course => course.coursePrice > 100 && course.coursePrice <= 200);
          break;
        case '$200+':
          filtered = filtered.filter(course => course.coursePrice > 200);
          break;
        default:
          break;
      }
    }

    // Sort
    switch (sortBy) {
      case 'Newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'Highest Rated':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'Price: Low to High':
        filtered.sort((a, b) => a.coursePrice - b.coursePrice);
        break;
      case 'Price: High to Low':
        filtered.sort((a, b) => b.coursePrice - a.coursePrice);
        break;
      case 'Most Enrolled':
        filtered.sort((a, b) => (b.enrolledStudents || 0) - (a.enrolledStudents || 0));
        break;
      default: // Most Popular
        filtered.sort((a, b) => (b.enrolledStudents || 0) - (a.enrolledStudents || 0));
        break;
    }

    setFilteredCourses(filtered);
    setPage(1);
    setHasMore(filtered.length > 0);
  }, [courses, searchQuery, selectedCategory, selectedLevel, selectedPrice, sortBy]);

  // Infinite scroll
  const lastCourseRef = useCallback(node => {
    if (isLoadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
        setIsLoadingMore(true);
        setTimeout(() => {
          setIsLoadingMore(false);
          if (page * 12 >= filteredCourses.length) {
            setHasMore(false);
          }
        }, 1000);
      }
    });
    if (node) observerRef.current.observe(node);
  }, [isLoadingMore, hasMore, page, filteredCourses.length]);

  // Get paginated courses
  const displayedCourses = filteredCourses.slice(0, page * 12);
  console.log("course data:",displayedCourses)
  

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setSelectedLevel('All Levels');
    setSelectedPrice('All Prices');
    setSortBy('Most Popular');
  };

  const activeFiltersCount = [
    selectedCategory !== 'All Categories',
    selectedLevel !== 'All Levels',
    selectedPrice !== 'All Prices'
  ].filter(Boolean).length;

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 bg-white dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            {/* Header Skeleton */}
            <div className="mb-8">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-1/3 mb-4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2"></div>
            </div>
            {/* Search Skeleton */}
            <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-xl w-full mb-8"></div>
            {/* Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-2xl p-6 space-y-4 border bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-white dark:bg-gray-900 transition-colors">
      {/* Header Section */}
      <div className="backdrop-blur-xl border-b border-gray-200/10 dark:border-gray-800 sticky top-16 z-40 bg-white/60 dark:bg-gray-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div 
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-2 dark:from-gray-100 dark:via-sky-300 dark:to-purple-300">
                Explore Courses
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Discover the best courses from top instructors worldwide
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="relative flex-1 max-w-lg">
              <div className="relative group">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                <input
                  type="search"
                  placeholder="Search courses, instructors, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200/50 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent  backdrop-blur-sm transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="backdrop-blur-xl border-b border-gray-200/10 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <motion.div 
            className="flex flex-wrap items-center justify-between gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Filter Toggle */}
                <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200/50 rounded-xl hover:bg-gray-50/50 transition-all duration-200 bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiFilter className="w-4 h-4" />
              <span className="font-medium">Filters</span>
              <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
            </motion.button>

            {/* Active Filters Count */}
            {activeFiltersCount > 0 && (
              <motion.button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-600 rounded-full text-sm hover:bg-red-200 transition-all duration-200 font-medium dark:bg-red-900/30 dark:text-red-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <FiX className="w-3 h-3" />
                Clear Filters ({activeFiltersCount})
              </motion.button>
            )}

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-1 border border-gray-200/50 dark:border-gray-700">
                <motion.button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiGrid className="w-5 h-5" />
              </motion.button>
              <motion.button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiList className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>

          {/* Expandable Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-gray-100/50 dark:border-gray-800"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800 dark:border-gray-700 backdrop-blur-sm transition-all duration-200 text-gray-900 dark:text-gray-100"
                    >
                      {CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Level Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Level</label>
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800 dark:border-gray-700 backdrop-blur-sm transition-all duration-200 text-gray-900 dark:text-gray-100"
                    >
                      {LEVELS.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Price</label>
                    <select
                      value={selectedPrice}
                      onChange={(e) => setSelectedPrice(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800 dark:border-gray-700 backdrop-blur-sm transition-all duration-200 text-gray-900 dark:text-gray-100"
                    >
                      {PRICES.map(price => (
                        <option key={price} value={price}>{price}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800 dark:border-gray-700 backdrop-blur-sm transition-all duration-200 text-gray-900 dark:text-gray-100"
                    >
                      {SORT_OPTIONS.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Count */}
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-4">
            <p className="text-gray-600 text-lg">
              <span className="font-semibold text-gray-900">{filteredCourses.length}</span> course{filteredCourses.length !== 1 ? 's' : ''} found
            </p>
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-blue-600 font-medium">Filters applied</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Courses Grid */}
        {error ? (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Failed to load courses</h3>
              <p className="text-gray-600 mb-4">Please try refreshing the page</p>
              <motion.button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Refresh Page
              </motion.button>
            </div>
          </motion.div>
        ) : displayedCourses.length === 0 ? (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg">
              <FiBookOpen className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-700 mb-3">No courses found</h3>
              <p className="text-gray-500 mb-6 text-lg">Try adjusting your search or filters to find what you're looking for</p>
              <motion.button
                onClick={clearFilters}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear All Filters
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}>
            <AnimatePresence>
              {displayedCourses.map((course, index) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  ref={index === displayedCourses.length - 1 ? lastCourseRef : null}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <Course key={course._id} course={course} isPurchased={isCoursePurchased(course)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Loading More Indicator */}
        {isLoadingMore && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="inline-flex items-center gap-3 text-gray-600 bg-white/80 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="font-medium">Loading more courses...</span>
            </div>
          </motion.div>
        )}

        {/* End of Results */}
        {!hasMore && displayedCourses.length > 0 && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20 inline-block">
              <p className="text-gray-500 font-medium">You've reached the end of the results</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default ExplorePage;
