import React from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiBook, FiStar, FiBookmark } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const formatINR = (value) => {
  if (!value || Number.isNaN(Number(value))) return '₹ —';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value));
};

function Course({ course, isPurchased, variant = 'default' }) {
  const navigate = useNavigate();
  const isCompact = variant === 'compact';

  const cardTransition = { duration: 0.45, ease: [0.22, 1, 0.36, 1] };
  const cardPadding = isCompact ? 'p-5' : 'p-6';
  const infoGap = isCompact ? 'gap-3' : 'gap-4';
  const imageRatio = isCompact ? 'aspect-[4/3] lg:aspect-[3/2]' : 'aspect-[16/9]';
  const headingSize = isCompact ? 'text-base' : 'text-lg';
  const containerShape = isCompact ? 'rounded-2xl border-white/50 dark:border-slate-800/50 shadow-lg hover:shadow-2xl' : 'rounded-3xl border-white/60 dark:border-slate-800/60 shadow-xl hover:shadow-2xl';

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/course/${course._id}`)}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={cardTransition}
      whileHover={{ scale: isCompact ? 1.01 : 1.02, y: isCompact ? -4 : -6 }}
      whileTap={{ scale: 0.99 }}
      layout
      className={`glass-panel ${containerShape} transition-all duration-300 cursor-pointer overflow-hidden group`}
    >
      <div className={`relative overflow-hidden ${imageRatio} bg-slate-900`}>
        <motion.img
          src={course.courseThumbnail}
          alt={course.courseTitle}
          loading="lazy"
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/10 to-transparent" />
        <button
          className="absolute top-4 right-4 p-2 rounded-full bg-white/90 dark:bg-slate-900/80 text-slate-600 hover:text-indigo-500 shadow"
          aria-label="Bookmark course"
          onClick={(e) => e.stopPropagation()}
        >
          <FiBookmark className="w-4 h-4 text-gray-600 dark:text-gray-200" />
        </button>
        <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 bg-white/95 text-slate-900 rounded-full text-xs font-semibold">
            {course.courseLevel}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-400">
            {course.category || 'Featured'}
          </span>
        </div>
      </div>

      <div className={`flex flex-col ${infoGap} ${cardPadding} text-slate-900 dark:text-slate-100`}>
        <div>
          <h3 className={`font-semibold ${headingSize} leading-snug line-clamp-2 group-hover:text-indigo-500 transition-colors`}>
            {course.courseTitle}
          </h3>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-300 line-clamp-1">{course.subTitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <img
            src={course.creator?.photoUrl || 'https://ui-avatars.com/api/?name=Instructor'}
            alt={course.creator?.name || 'Instructor'}
            className="w-10 h-10 rounded-full object-cover border-2 border-white/70"
          />
          <div>
            <p className="text-sm font-semibold">{course.creator?.name || 'Instructor'}</p>
            <p className="text-xs text-slate-400">Instructor</p>
          </div>
        </div>

        <div className="flex justify-between text-[11px] sm:text-xs text-slate-500 dark:text-slate-300">
          <div className="flex items-center gap-1">
            <FiBook className="w-4 h-4 text-indigo-400" />
            <span>{course.lectures?.length ?? 0} modules</span>
          </div>
          <div className="flex items-center gap-1">
            <FiClock className="w-4 h-4 text-indigo-400" />
            <span>~5 hrs</span>
          </div>
          <div className="flex items-center gap-1 text-amber-400">
            <FiStar className="w-4 h-4" />
            <span className="text-sm font-medium">4.8</span>
            <span className="text-xs text-slate-400">(123)</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className={isCompact ? 'text-lg font-semibold' : 'text-xl font-semibold'}>
            {formatINR(course.coursePrice)}
          </span>
          <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Full stack</span>
        </div>

        {isPurchased ? (
          <button
            className="w-full rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/40"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/course-progress/${course._id}`);
            }}
          >
            Go to course
          </button>
        ) : (
          <button
            className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-500 to-sky-400 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/40"
            onClick={(e) => e.stopPropagation()}
          >
            Enroll now
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default Course;
