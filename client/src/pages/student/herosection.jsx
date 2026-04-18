import React, { useState, useRef, useContext } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { FiSearch, FiArrowRight, FiPlay, FiStar, FiUsers, FiCheckCircle, FiChevronDown } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ThemeContext } from '@/extensions/ThemeProvider';

const trendingTags = ['Full Stack Dev', 'AI & ML', 'Product Design', 'Data Science', 'DevOps'];

const headlineWords = ['Master', 'Skills', 'for', 'the'];
const headlineGradient = 'Future of Work';

// Fallback cards when no courses are loaded yet
const fallbackCards = [
    { _id: '1', courseTitle: 'Full Stack Web Development', category: 'Development', courseThumbnail: null, creator: { name: 'Sarah Chen' }, averageRating: 4.9 },
    { _id: '2', courseTitle: 'AI & Machine Learning Bootcamp', category: 'AI & ML', courseThumbnail: null, creator: { name: 'Alex Rivera' }, averageRating: 4.8 },
    { _id: '3', courseTitle: 'UI/UX Design Masterclass', category: 'Design', courseThumbnail: null, creator: { name: 'Emma Wilson' }, averageRating: 4.7 },
    { _id: '4', courseTitle: 'Data Science with Python', category: 'Data Science', courseThumbnail: null, creator: { name: 'Michael Chang' }, averageRating: 4.9 },
    { _id: '5', courseTitle: 'Cloud & DevOps Engineering', category: 'DevOps', courseThumbnail: null, creator: { name: 'David Kim' }, averageRating: 4.6 },
];

// Card layout configs: position, rotation, size, animation duration
const cardConfigs = [
    { x: '-10%', y: '0%', rotate: -3, scale: 1, duration: 4.5, delay: 1.3 },
    { x: '12%', y: '8%', rotate: 2, scale: 0.9, duration: 5.2, delay: 1.5 },
    { x: '35%', y: '-4%', rotate: -1.5, scale: 1.05, duration: 3.8, delay: 1.4 },
    { x: '58%', y: '6%', rotate: 2.5, scale: 0.92, duration: 4.8, delay: 1.6 },
    { x: '80%', y: '-2%', rotate: -2, scale: 0.95, duration: 5.5, delay: 1.7 },
];

// Floating accent badges
const accentBadges = [
    { label: '4.9 Rating', icon: FiStar, x: '5%', y: '40%', duration: 5, delay: 1.8 },
    { label: '1.2k Students', icon: FiUsers, x: '50%', y: '55%', duration: 4.2, delay: 2.0 },
    { label: 'Certified', icon: FiCheckCircle, x: '85%', y: '35%', duration: 5.8, delay: 1.9 },
];

const HeroSection = ({ search, setSearch, courses = [] }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [activeIdx, setActiveIdx] = useState(-1);
    const navigate = useNavigate();
    const inputRef = useRef(null);
    const sectionRef = useRef(null);
    const { user, role, isAuthenticated } = useSelector((state) => state.auth);
    const effectiveRole = role || user?.role;
    // Instructor CTA rules:
    // - show for guests
    // - show for authenticated users when their active role is student
    //   (label becomes "Switch to Instructor" if they already completed onboarding)
    const userRoles = Array.isArray(user?.roles)
        ? user.roles
        : (effectiveRole ? [effectiveRole] : []);
    const hasInstructorCapability =
        userRoles.includes('instructor') ||
        !!user?.instructorOnboardingCompleted ||
        !!user?.onboardedAsInstructor;
    const showInstructorCta = !isAuthenticated || effectiveRole === 'student';
    const shouldReduceMotion = useReducedMotion();
    const { theme } = useContext(ThemeContext);
    const isDarkTheme = theme === 'dark';

    // Parallax + scroll-based effects
    const { scrollY } = useScroll();
    const orbY1 = useTransform(scrollY, [0, 600], [0, 120]);
    const orbY2 = useTransform(scrollY, [0, 600], [0, 80]);
    const orbY3 = useTransform(scrollY, [0, 600], [0, 180]);
    const contentY = useTransform(scrollY, [0, 400], [0, -60]);
    const contentOpacity = useTransform(scrollY, [0, 400], [1, 0.3]);
    const cardsY = useTransform(scrollY, [0, 500], [0, -40]);
    const scrollIndicatorOpacity = useTransform(scrollY, [0, 150], [1, 0]);

    // Course data for floating cards
    const displayCourses = courses.length >= 5 ? courses.slice(0, 5) : fallbackCards;

    // Search autocomplete
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

    // Stagger animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.3,
            },
        },
    };

    const wordVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
        },
    };

    const premiumEase = [0.25, 0.1, 0.25, 1];

    return (
        <section
            ref={sectionRef}
            className="relative min-h-screen flex flex-col overflow-hidden"
        >
            {/* ── Cinematic Background ── */}
            <div className="absolute inset-0 -z-10">
                {/* Base gradient mesh */}
                <div className={`absolute inset-0 ${isDarkTheme ? 'bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950' : 'bg-gradient-to-br from-slate-100 via-indigo-50 to-violet-100'}`} />
                <div className={`absolute inset-0 ${isDarkTheme ? 'bg-gradient-to-tr from-violet-900/40 via-transparent to-indigo-900/30' : 'bg-gradient-to-tr from-violet-300/20 via-transparent to-indigo-300/20'}`} />

                {/* Animated floating orbs */}
                <motion.div
                    style={{ y: shouldReduceMotion ? 0 : orbY1 }}
                    animate={shouldReduceMotion ? {} : { x: [0, 30, 0], y: [0, -20, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                    className={`absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full blur-[120px] ${isDarkTheme ? 'bg-indigo-500/20' : 'bg-indigo-400/25'}`}
                />
                <motion.div
                    style={{ y: shouldReduceMotion ? 0 : orbY2 }}
                    animate={shouldReduceMotion ? {} : { x: [0, -25, 0], y: [0, 15, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                    className={`absolute top-[30%] right-[10%] w-[600px] h-[400px] rounded-full blur-[140px] ${isDarkTheme ? 'bg-violet-500/15' : 'bg-violet-400/20'}`}
                />
                <motion.div
                    style={{ y: shouldReduceMotion ? 0 : orbY3 }}
                    animate={shouldReduceMotion ? {} : { x: [0, 20, 0], y: [0, -30, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                    className={`absolute bottom-[20%] left-[40%] w-[400px] h-[400px] rounded-full blur-[100px] ${isDarkTheme ? 'bg-purple-500/15' : 'bg-purple-400/20'}`}
                />
                <motion.div
                    animate={shouldReduceMotion ? {} : { x: [0, -15, 0], y: [0, 20, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    className={`absolute top-[60%] left-[5%] w-[300px] h-[300px] rounded-full blur-[100px] ${isDarkTheme ? 'bg-sky-500/10' : 'bg-sky-400/15'}`}
                />
                <motion.div
                    animate={shouldReduceMotion ? {} : { x: [0, 10, 0], y: [0, -15, 0] }}
                    transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
                    className={`absolute top-[5%] right-[30%] w-[250px] h-[250px] rounded-full blur-[80px] ${isDarkTheme ? 'bg-pink-500/10' : 'bg-pink-400/15'}`}
                />

                {/* Noise texture overlay */}
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
                    }}
                />

                {/* Subtle grid */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
                        backgroundSize: '32px 32px',
                    }}
                />
            </div>

            {/* ── Main Content ── */}
            <motion.div
                style={{ y: shouldReduceMotion ? 0 : contentY, opacity: shouldReduceMotion ? 1 : contentOpacity }}
                className="flex-1 flex flex-col items-center justify-center pt-24 pb-4 lg:pt-28 lg:pb-6 px-4 sm:px-6 lg:px-8"
            >
                <div className="max-w-5xl mx-auto text-center space-y-5 lg:space-y-6">

                    {/* Announcement Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: premiumEase }}
                        className={`inline-flex items-center gap-2 px-5 py-2 rounded-full backdrop-blur-xl ${isDarkTheme ? 'bg-white/10 border border-white/20' : 'bg-white/80 border border-slate-200/80 shadow-sm'}`}
                    >
                        <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                        <span className={`text-sm font-medium ${isDarkTheme ? 'text-slate-200' : 'text-slate-700'}`}>
                            New: AI-Powered Learning Paths
                        </span>
                    </motion.div>

                    {/* Staggered Headline */}
                    <motion.h1
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className={`text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1] tracking-[-0.03em] font-display ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}
                    >
                        {headlineWords.map((word, i) => (
                            <motion.span key={i} variants={wordVariants} className="inline-block mr-[0.3em]">
                                {word}
                            </motion.span>
                        ))}
                        <br className="hidden lg:block" />
                        <motion.span
                            variants={wordVariants}
                            className={`inline-block text-transparent bg-clip-text bg-[length:200%_auto] animate-gradient ${isDarkTheme ? 'bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400' : 'bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600'}`}
                        >
                            {headlineGradient}
                        </motion.span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.9, ease: premiumEase }}
                        className={`text-base sm:text-lg max-w-2xl mx-auto leading-relaxed ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}
                    >
                        Join a global community of learners and instructors. Access premium courses,
                        get certified, and advance your career with industry-recognized skills.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 1.0, ease: premiumEase }}
                        className="flex flex-col sm:flex-row items-center gap-3 justify-center"
                    >
                        <button
                            onClick={handleScrollToCourses}
                            className="group w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_20px_60px_-15px_rgba(255,255,255,0.25)] hover:shadow-[0_20px_60px_-10px_rgba(255,255,255,0.35)]"
                        >
                            Start Learning
                            <FiArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                        </button>
                        {showInstructorCta && (
                            <button
                                onClick={() => navigate(isAuthenticated ? '/become-instructor' : '/login?redirect=/become-instructor')}
                                className={`w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold border transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-2 ${isDarkTheme ? 'bg-transparent text-white border-white/30 hover:bg-white/10' : 'bg-white/70 text-slate-800 border-slate-300/80 hover:bg-white'}`}
                            >
                                <FiPlay className="w-5 h-5" />
                                {isAuthenticated && hasInstructorCapability ? 'Switch to Instructor' : 'Become Instructor'}
                            </button>
                        )}
                    </motion.div>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 1.1, ease: premiumEase }}
                        className="relative max-w-2xl mx-auto w-full"
                    >
                        <div className="relative group">
                            <div className={`absolute inset-0 rounded-2xl blur-lg transition-opacity duration-500 ${isFocused ? 'opacity-50 bg-gradient-to-r from-indigo-500 to-violet-500' : 'opacity-20 bg-gradient-to-r from-indigo-500 to-violet-500 group-hover:opacity-30'}`} />
                            <div className={`relative flex items-center backdrop-blur-2xl rounded-2xl p-2 ${isDarkTheme ? 'bg-white/10 border border-white/20' : 'bg-white/90 border border-slate-200/90 shadow-sm'}`}>
                                <FiSearch className={`w-6 h-6 ml-3 transition-colors duration-300 ${isFocused ? 'text-indigo-500' : isDarkTheme ? 'text-white/50' : 'text-slate-500'}`} />
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
                                    className={`flex-1 bg-transparent border-none outline-none px-4 py-2 ${isDarkTheme ? 'text-white placeholder-white/40' : 'text-slate-900 placeholder-slate-500'}`}
                                />
                                <div className="hidden sm:flex items-center gap-2 px-2">
                                    <kbd className={`hidden sm:inline-flex h-6 items-center gap-1 rounded px-2 font-mono text-[10px] font-medium ${isDarkTheme ? 'border border-white/20 bg-white/10 text-white/50' : 'border border-slate-200 bg-slate-50 text-slate-500'}`}>
                                        <span className="text-xs">&#8984;</span>K
                                    </kbd>
                                </div>
                            </div>
                        </div>

                        {/* Search Suggestions Dropdown */}
                        {isFocused && search.trim() && (
                            <div className={`absolute top-full left-0 right-0 mt-2 backdrop-blur-xl rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto ${isDarkTheme ? 'bg-slate-900/95 border border-white/10' : 'bg-white/95 border border-slate-200'}`}>
                                {filteredCourseSuggestions.length > 0 ? (
                                    <div className="py-2 space-y-0.5">
                                        {filteredCourseSuggestions.map((course, idx) => (
                                            <button
                                                key={course._id}
                                                onMouseDown={() => handleCourseSuggestionClick(course)}
                                                onMouseEnter={() => setActiveIdx(idx)}
                                                className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${activeIdx === idx
                                                    ? isDarkTheme ? 'bg-white/10' : 'bg-slate-100'
                                                    : isDarkTheme ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                                                    }`}
                                            >
                                                <img
                                                    src={course.courseThumbnail || 'https://via.placeholder.com/48'}
                                                    alt=""
                                                    className="w-10 h-10 rounded-lg object-cover"
                                                />
                                                <div>
                                                    <p className={`font-medium text-sm line-clamp-1 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                                                        {course.courseTitle}
                                                    </p>
                                                    <p className={`text-xs ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
                                                        {course.category}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={`p-4 text-center text-sm ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
                                        No courses found matching &ldquo;{search}&rdquo;
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Trending Tags */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2, duration: 0.5 }}
                            className="mt-4 flex flex-wrap items-center gap-2 justify-center"
                        >
                            <span className={`text-xs font-semibold uppercase tracking-[0.2em] ${isDarkTheme ? 'text-white/40' : 'text-slate-500'}`}>Trending:</span>
                            {trendingTags.map((tag, i) => (
                                <motion.button
                                    key={tag}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.2 + i * 0.08 }}
                                    onClick={() => {
                                        setSearch(tag);
                                        inputRef.current?.focus();
                                    }}
                                    className={`text-xs px-3.5 py-1.5 rounded-full backdrop-blur border transition-colors duration-300 ${isDarkTheme ? 'bg-white/10 border-white/15 text-white/70 hover:bg-white/20 hover:text-white' : 'bg-white/80 border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900'}`}
                                >
                                    {tag}
                                </motion.button>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>

            {/* ── Floating Course Cards ── */}
            <motion.div
                style={{ y: shouldReduceMotion ? 0 : cardsY }}
                className="relative w-full h-[160px] sm:h-[190px] lg:h-[220px] mt-auto"
            >
                <div className="absolute inset-0 max-w-7xl mx-auto px-4">
                    {/* Course Cards */}
                    {displayCourses.map((course, idx) => {
                        const config = cardConfigs[idx];
                        const isHiddenOnMobile = idx > 2;
                        return (
                            <motion.div
                                key={course._id}
                                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                                animate={{
                                    opacity: 1,
                                    scale: config.scale,
                                    y: shouldReduceMotion ? 0 : [0, -15, 0],
                                    rotate: config.rotate,
                                }}
                                transition={{
                                    opacity: { duration: 0.5, delay: config.delay },
                                    scale: { duration: 0.5, delay: config.delay },
                                    rotate: { duration: 0.5, delay: config.delay },
                                    y: { duration: config.duration, repeat: Infinity, ease: 'easeInOut', delay: config.delay + 0.5 },
                                }}
                                className={`absolute top-0 w-[160px] sm:w-[200px] cursor-pointer group ${isHiddenOnMobile ? 'hidden md:block' : ''}`}
                                style={{ left: config.x, top: config.y }}
                                onClick={() => course._id && courses.length > 0 ? navigate(`/course/${course._id}`) : null}
                            >
                                <div className={`backdrop-blur-lg rounded-2xl overflow-hidden transition-all duration-500 ${isDarkTheme ? 'bg-white/10 border border-white/20 shadow-2xl shadow-black/20 hover:bg-white/15 hover:border-white/30' : 'bg-white/85 border border-slate-200 shadow-xl shadow-slate-900/10 hover:bg-white hover:border-slate-300'}`}>
                                    {/* Thumbnail */}
                                    <div className="aspect-[16/10] bg-gradient-to-br from-indigo-500/30 to-violet-500/30 relative overflow-hidden">
                                        {course.courseThumbnail ? (
                                            <img
                                                src={course.courseThumbnail}
                                                alt={course.courseTitle}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className={`text-2xl font-bold ${isDarkTheme ? 'text-white/20' : 'text-slate-500/60'}`}>{course.category?.charAt(0) || 'C'}</span>
                                            </div>
                                        )}
                                        <div className={`absolute inset-0 ${isDarkTheme ? 'bg-gradient-to-t from-black/40 to-transparent' : 'bg-gradient-to-t from-slate-900/20 to-transparent'}`} />
                                    </div>
                                    {/* Info */}
                                    <div className="p-3">
                                        <p className={`text-xs font-semibold line-clamp-1 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>{course.courseTitle}</p>
                                        <div className="flex items-center justify-between mt-1.5">
                                            <span className={`text-[10px] ${isDarkTheme ? 'text-white/50' : 'text-slate-500'}`}>{course.creator?.name || 'Instructor'}</span>
                                            {course.averageRating && (
                                                <div className="flex items-center gap-0.5">
                                                    <FiStar className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                                                    <span className={`text-[10px] font-medium ${isDarkTheme ? 'text-white/70' : 'text-slate-700'}`}>{Number(course.averageRating).toFixed(1)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* Accent Badges floating between cards */}
                    {accentBadges.map((badge, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: shouldReduceMotion ? 0 : [0, -10, 0],
                            }}
                            transition={{
                                opacity: { duration: 0.4, delay: badge.delay },
                                scale: { duration: 0.4, delay: badge.delay },
                                y: { duration: badge.duration, repeat: Infinity, ease: 'easeInOut', delay: badge.delay + 0.5 },
                            }}
                            className={`absolute hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg ${isDarkTheme ? 'bg-white/10 border border-white/15' : 'bg-white/85 border border-slate-200'}`}
                            style={{ left: badge.x, top: badge.y }}
                        >
                            <badge.icon className="w-3 h-3 text-indigo-400" />
                            <span className={`text-[10px] font-semibold ${isDarkTheme ? 'text-white/80' : 'text-slate-700'}`}>{badge.label}</span>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* ── Scroll Indicator ── */}
            <motion.div
                style={{ opacity: shouldReduceMotion ? 1 : scrollIndicatorOpacity }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 0.5 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
                <span className={`text-[10px] font-medium uppercase tracking-[0.2em] ${isDarkTheme ? 'text-white/30' : 'text-slate-500'}`}>Scroll</span>
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <FiChevronDown className={`w-5 h-5 ${isDarkTheme ? 'text-white/30' : 'text-slate-500'}`} />
                </motion.div>
            </motion.div>
        </section>
    );
};

export default HeroSection;
