import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiUsers, FiActivity, FiCheckCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const stats = [
  { label: 'Courses live', value: '320+', sublabel: '14 launched this week' },
  { label: 'Verified instructors', value: '1.2K+', sublabel: 'creators across domains' },
  { label: 'Learners enrolled', value: '28K+', sublabel: 'active across 42 countries' },
];

const floatingBadges = [
  {
    id: 'courses',
    title: 'New courses today',
    value: '18',
    detail: 'Fresh uploads from creators',
  },
  {
    id: 'payout',
    title: 'Avg. monthly payout',
    value: '₹82K',
    detail: 'For top instructors',
  },
  {
    id: 'learners',
    title: 'Learners online',
    value: '2,130',
    detail: 'Browsing the marketplace',
  },
];
const trendingTags = ['MERN stack', 'Product design', 'Data analytics', 'No-code'];

const dualHighlights = [
  {
    title: 'For learners',
    meta: 'Structured journeys',
    points: ['Skill paths + attendance tracking', 'Live mentor feedback loops', 'Certificates & placement pods'],
  },
  {
    title: 'For instructors',
    meta: 'Commerce ready',
    points: ['Upload curriculum & drip content', 'Automated enrollments & CRM', 'Weekly payouts with analytics'],
  },
];

const HeroSection = ({ search, setSearch, filteredCourses }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const filteredCourseSuggestions = search.trim()
    ? filteredCourses.filter((c) =>
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
    <section className="relative overflow-visible pt-24 pb-20 sm:pb-28">
      <div className="hero-aurora" aria-hidden />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-10 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-violet-500/40 via-sky-400/40 to-cyan-400/30 blur-[140px]"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-[8%] hidden lg:block h-[360px] w-[360px] -translate-y-1/2 -translate-x-1/2 transform-gpu rounded-full blur-[140px]"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(56,189,248,0.45), rgba(59,130,246,0.15) 45%, transparent 70%)' }}
        animate={{ scale: [1.05, 0.95, 1.05], rotate: [0, 6, -4, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.18), transparent 55%)' }}
        animate={{ opacity: [0.08, 0.18, 0.08] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col gap-12 px-4 sm:px-8 lg:px-12 lg:flex-row lg:items-start">
        <div className="space-y-10 lg:w-[55%]">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-3 rounded-full border border-slate-200/60 bg-white/80 px-5 py-1.5 text-sm font-medium text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
          >
            <span className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.4em] text-indigo-600">
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" /> LMS
            </span>
            One platform for learners & instructors
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-[56px] lg:leading-[1.1] dark:text-white"
          >
            Launch courses, enroll cohorts, and run your
            <span className="block bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-400 bg-clip-text text-transparent">
              community-driven academy
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="max-w-2xl text-base text-slate-600 sm:text-lg dark:text-slate-300"
          >
            Students discover verified courses, track progress, and earn certificates. Instructors publish curricula, manage enrollments, and get paid globally—all powered by EduLearn LMS.
          </motion.p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              onClick={handleScrollToCourses}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-violet-500 to-sky-400 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/40 transition hover:-translate-y-0.5 hover:shadow-indigo-500/60"
            >
              Explore courses
            </button>
            <button
              onClick={() => navigate('/become-instructor')}
              className="inline-flex items-center justify-center rounded-full border border-slate-200/70 bg-white/70 px-8 py-3 text-base font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
            >
              Start teaching
            </button>
            <div className="flex items-center gap-3 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm text-slate-500 shadow-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-300">
              <FiUsers className="h-4 w-4 text-indigo-500" /> Open to students & creators
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-900/5 backdrop-blur dark:border-white/10 dark:bg-slate-950/40"
              >
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{stat.label}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-300">{stat.sublabel}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {dualHighlights.map((highlight) => (
              <div
                key={highlight.title}
                className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-900/5 backdrop-blur dark:border-white/1  0 dark:bg-slate-950/40"
              >
                <p className="text-xs uppercase tracking-[0.35em] text-indigo-500">{highlight.meta}</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{highlight.title}</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-300">
                  {highlight.points.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <FiCheckCircle className="mt-0.5 h-4 w-4 text-emerald-500" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full space-y-6 lg:w-[45%]">
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-[32px] border border-white/30 bg-white/80 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur dark:border-white/10 dark:bg-slate-950/70"
          >
            <div className="absolute inset-0 opacity-50" aria-hidden style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(99,102,241,0.25), transparent 55%)' }} />
            <div className="relative space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.35em] text-slate-400">Global course search</p>
                  <h4 className="text-xl font-semibold text-slate-900 dark:text-white">Find subjects, mentors, or academies</h4>
                </div>
                <span className="rounded-full border border-white/60 px-3 py-1 text-xs text-slate-500 dark:border-white/20">⌘K</span>
              </div>

              <label htmlFor="course-search" className="sr-only">
                Search courses
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-100/60 bg-white/90 px-3 py-2 shadow-inner dark:border-slate-800/60 dark:bg-slate-900/70">
                <FiSearch className="text-slate-400 dark:text-slate-300" />
                <input
                  id="course-search"
                  ref={inputRef}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setActiveIdx(-1);
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-base text-slate-900 placeholder-slate-400 outline-none dark:text-white"
                  placeholder="Search by skill, instructor, or stack"
                  aria-label="Search courses"
                />
                <button
                  onClick={handleScrollToCourses}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white/90 dark:text-slate-900"
                >
                  Search
                </button>
              </div>

              {isFocused && search.trim() && (
                <div
                  className="max-h-64 overflow-y-auto rounded-2xl border border-white/40 bg-white/95 shadow-xl dark:border-slate-800/70 dark:bg-slate-950/80"
                  role="listbox"
                  aria-label="Search results"
                >
                  {filteredCourseSuggestions.length > 0 ? (
                    filteredCourseSuggestions.map((course, idx) => (
                      <button
                        key={course._id}
                        onMouseDown={() => handleCourseSuggestionClick(course)}
                        onMouseEnter={() => setActiveIdx(idx)}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                          activeIdx === idx
                            ? 'bg-indigo-50/80 dark:bg-indigo-500/10'
                            : 'hover:bg-slate-100/70 dark:hover:bg-slate-900/70'
                        }`}
                        role="option"
                        aria-selected={activeIdx === idx}
                      >
                        <img
                          src={course.courseThumbnail || 'https://via.placeholder.com/48'}
                          alt=""
                          className="h-11 w-11 rounded-xl object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-slate-800 dark:text-slate-100">{course.courseTitle}</p>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{course.category}</p>
                        </div>
                        <span className="text-xs text-slate-400">{course.duration || ''}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-500">No results found</div>
                  )}
                </div>
              )}

              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Popular searches</p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                {trendingTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearch(tag);
                      setActiveIdx(-1);
                      inputRef.current?.focus();
                      setIsFocused(true);
                    }}
                    className="rounded-full border border-slate-200/60 px-3 py-1 font-semibold text-slate-600 transition hover:border-indigo-400 hover:text-indigo-500 dark:border-slate-700 dark:text-slate-200"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {floatingBadges.map((badge, index) => (
              <motion.div
                key={badge.id}
                className={`relative overflow-hidden rounded-3xl border border-white/50 bg-white/80 p-5 text-xs text-slate-600 shadow-lg shadow-slate-900/10 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 ${
                  index === floatingBadges.length - 1 ? 'sm:col-span-2' : ''
                }`}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 6 + index * 0.3, repeat: Infinity, ease: 'easeInOut', delay: index * 0.2 }}
              >
                <div className="absolute inset-0 opacity-40" aria-hidden style={{ backgroundImage: 'linear-gradient(120deg, rgba(14,165,233,0.22), transparent)' }} />
                <div className="relative space-y-3">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.26em] text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <FiActivity className="h-3.5 w-3.5 text-emerald-400" /> {badge.title}
                    </span>
                    <span className="rounded-full bg-slate-900/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500 dark:bg-white/10 dark:text-slate-200">
                      Live
                    </span>
                  </div>
                  <p className="text-3xl font-semibold text-slate-900 dark:text-white">{badge.value}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-300">{badge.detail}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-[32px] border border-white/20 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-6 text-white shadow-2xl shadow-indigo-500/30"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.32em] text-white/60">Top selling course</p>
                <h4 className="text-2xl font-semibold">Business Analytics Pro</h4>
                <p className="text-sm text-white/70">1,420 learners enrolled · curated by GrowthSchool</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-white/30 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/80">Live pod</span>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <FiUsers className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                <p className="text-xs uppercase tracking-[0.25em] text-white/50">Instructor payout</p>
                <p className="mt-1 text-lg font-semibold text-white">₹3.4L this month</p>
                <p className="text-xs text-white/60">Auto-deposits every Friday</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                <p className="text-xs uppercase tracking-[0.25em] text-white/50">Next enrollment window</p>
                <p className="mt-1 text-lg font-semibold text-white">Closes in 02d 11h</p>
                <p className="text-xs text-white/60">Secure your cohort seats now</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;