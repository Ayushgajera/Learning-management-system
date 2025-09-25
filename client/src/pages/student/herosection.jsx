import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiUsers, FiBookOpen, FiAward } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const HeroSection = ({ search, setSearch, filteredCourses }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const inputRef = useRef(null);

  const filteredCourseSuggestions = search.trim()
    ? filteredCourses.filter(c =>
        (c.courseTitle || '').toLowerCase().includes(search.trim().toLowerCase()) ||
        (c.category || '').toLowerCase().includes(search.trim().toLowerCase())
      )
    : [];
  const totalSuggestions = filteredCourseSuggestions.length;

  const handleKeyDown = (e) => {
    if (!totalSuggestions) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(idx => (idx + 1) % totalSuggestions);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(idx => (idx - 1 + totalSuggestions) % totalSuggestions);
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
    <section className="relative bg-gradient-to-b from-white to-emerald-50 dark:from-gray-900 dark:to-neutral-900">
      <div className="container mx-auto px-6 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left - Hero content */}
          <div className="lg:col-span-7">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6 text-gray-900 dark:text-white"
            >
              Upskill faster with industry-led courses —
              <span className="block bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">designed for real careers</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mb-8">
              Practical projects, expert instructors, and a community that helps you ship real results. Join thousands of learners accelerating their careers.
            </motion.p>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <button onClick={handleScrollToCourses} className="inline-flex items-center justify-center px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-semibold shadow-md transition">
                Explore Courses
              </button>
              {user?.role !== 'instructor' && (
                <button onClick={() => navigate('/become-instructor')} className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 rounded-full font-semibold shadow-sm hover:shadow-md transition">
                  Become an Instructor
                </button>
              )}
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="bg-emerald-500 text-white p-3 rounded-lg shadow"> <FiBookOpen className="w-5 h-5" /> </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">Courses</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">200+ practical courses</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-teal-500 text-white p-3 rounded-lg shadow"> <FiUsers className="w-5 h-5" /> </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">Community</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Mentors & peers</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-indigo-500 text-white p-3 rounded-lg shadow"> <FiAward className="w-5 h-5" /> </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">Certification</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Industry-recognized</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Search / Visual */}
          <div className="lg:col-span-5">
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-xl">
              <label htmlFor="course-search" className="sr-only">Search courses</label>
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 rounded-full px-3 py-2 border border-transparent focus-within:ring-2 focus-within:ring-emerald-300">
                <FiSearch className="text-gray-400 dark:text-gray-300" />
                <input
                  id="course-search"
                  ref={inputRef}
                  value={search}
                    onChange={e => { setSearch(e.target.value); setActiveIdx(-1); }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
                    placeholder="Search for courses, categories or skills"
                    aria-label="Search courses"
                />
                <button onClick={handleScrollToCourses} className="px-4 py-2 bg-emerald-500 text-white rounded-full text-sm font-semibold">Search</button>
              </div>

              {isFocused && search.trim() && (
                <div className="mt-3 max-h-64 overflow-y-auto rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 shadow-lg" role="listbox" aria-label="Search results">
                  {filteredCourseSuggestions.length > 0 ? (
                    filteredCourseSuggestions.map((course, idx) => (
                      <button
                        key={course._id}
                        onMouseDown={() => handleCourseSuggestionClick(course)}
                        onMouseEnter={() => setActiveIdx(idx)}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 ${activeIdx === idx ? 'bg-emerald-50 dark:bg-emerald-900/30' : ''}`}
                        role="option"
                        aria-selected={activeIdx === idx}
                      >
                        <img src={course.courseThumbnail || 'https://via.placeholder.com/48'} alt="" className="w-10 h-10 rounded-md object-cover" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{course.courseTitle}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{course.category}</div>
                        </div>
                        <div className="text-xs text-gray-400">{course.duration || ''}</div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-500">No results found</div>
                  )}
                </div>
              )}

              <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">Try searching for <span className="text-gray-900 dark:text-white font-medium">React, Python, UI Design</span></div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;