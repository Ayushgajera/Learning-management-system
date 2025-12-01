import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiUsers, FiActivity, FiCheckCircle, FiArrowRight, FiPlay } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const floatingBadges = [
  {
    id: 'courses',
    title: 'New courses',
    value: '18+',
    detail: 'Added today',
    icon: FiActivity,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    id: 'instructors',
    title: 'Expert Mentors',
    value: '1.2k',
    detail: 'From top tech companies',
    icon: FiUsers,
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
  },
];

const trendingTags = ['Full Stack Dev', 'AI & ML', 'Product Design', 'Data Science', 'DevOps'];

const HeroSection = ({ search, setSearch, courses = [] }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const { user, role } = useSelector((state) => state.auth);
  const effectiveRole = role || user?.role;
  const canBecomeInstructor = effectiveRole === 'student';

  const filteredCourseSuggestions = search.trim()
    ? courses.filter((c) =>
        (c.courseTitle || '').toLowerCase().includes(search.trim().toLowerCase()) ||
        (c.category || '').toLowerCase().includes(search.trim().toLowerCase())
      )
    : [];
  const totalSuggestions = filteredCourseSuggestions.length;

  const handleKeyDown = (e) => {
    if (!totalSuggestions) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((idx) => (idx + 1) % totalSuggestions);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((idx) => (idx - 1 + totalSuggestions) % totalSuggestions);
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      const course = filteredCourseSuggestions[activeIdx];
      if (course && course._id) navigate(`/course/${course._id}`);
    }
  };

  const handleCourseSuggestionClick = (course) => {
    if (course && course._id) navigate(`/course/${course._id}`);
  };

  const handleBlur = () => setTimeout(() => setIsFocused(false), 150);

  const handleScrollToCourses = () => {
    const coursesElement = document.getElementById('courses-section');
    if (coursesElement) coursesElement.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-visible">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] opacity-50 dark:opacity-20" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-violet-500/20 rounded-full blur-[100px] opacity-30 dark:opacity-10" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-sm"
            >
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                New: AI-Powered Learning Paths
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white font-display"
            >
              Master Skills for the <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 dark:from-indigo-400 dark:via-violet-400 dark:to-indigo-400 animate-gradient">
                Future of Work
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              Join a global community of learners and instructors. Access premium courses, 
              get certified, and advance your career with industry-recognized skills.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
            >
              <button
                onClick={handleScrollToCourses}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
              >
                Start Learning
                <FiArrowRight className="w-5 h-5" />
              </button>
              {canBecomeInstructor && (
                <button
                  onClick={() => navigate('/become-instructor')}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white dark:bg-white/5 text-slate-900 dark:text-white font-semibold border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <FiPlay className="w-5 h-5" />
                  Become Instructor
                </button>
              )}
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative max-w-xl mx-auto lg:mx-0 w-full "
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-2">
                  <FiSearch className="w-6 h-6 text-slate-400 ml-3" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setActiveIdx(-1);
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    placeholder="What do you want to learn today?"
                    className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-slate-900 dark:text-white placeholder-slate-400"
                  />
                  <div className="hidden sm:flex items-center gap-2 px-2">
                    <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 font-mono text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      <span className="text-xs">⌘</span>K
                    </kbd>
                  </div>
                </div>
              </div>

              {/* Search Suggestions */}
              {isFocused && search.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
                  {filteredCourseSuggestions.length > 0 ? (
                    <div className="py-2 space-y-0.5">
                      {filteredCourseSuggestions.map((course, idx) => (
                        <button
                          key={course._id}
                          onMouseDown={() => handleCourseSuggestionClick(course)}
                          onMouseEnter={() => setActiveIdx(idx)}
                          className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                            activeIdx === idx
                              ? 'bg-slate-50 dark:bg-slate-800'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <img
                            src={course.courseThumbnail || 'https://via.placeholder.com/48'}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white text-sm line-clamp-1">
                              {course.courseTitle}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {course.category}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-slate-500">
                      No courses found matching "{search}"
                    </div>
                  )}
                </div>
              )}

              {/* Trending Tags */}
              <div className="mt-4 flex flex-wrap items-center gap-2 justify-center lg:justify-start">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Trending:</span>
                {trendingTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearch(tag);
                      inputRef.current?.focus();
                    }}
                    className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Visuals */}
          <div className="flex-1 relative w-full max-w-[600px] lg:max-w-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="relative z-10"
            >
              {/* Main Card */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5" />
                
                {/* Mock UI Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-xs font-medium text-slate-400">Edulearn Dashboard</div>
                </div>

                {/* Mock UI Content */}
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">My Progress</h3>
                      <p className="text-sm text-slate-500">Keep it up! You're doing great.</p>
                    </div>
                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                      <FiActivity className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Progress Item */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-700 dark:text-slate-200">Full Stack Development</span>
                      <span className="text-indigo-600 font-semibold">75%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '75%' }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Floating Badges Grid */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    {floatingBadges.map((badge) => (
                      <div key={badge.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <div className={`w-8 h-8 rounded-lg ${badge.bg} ${badge.color} flex items-center justify-center mb-3`}>
                          <badge.icon className="w-4 h-4" />
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{badge.value}</div>
                        <div className="text-xs text-slate-500 font-medium">{badge.title}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-8 -right-8 p-4 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 z-20 hidden sm:block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <FiCheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Course Completed</p>
                    <p className="text-xs text-slate-500">Just now</p>
                  </div>
                </div>
              </motion.div>

            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;