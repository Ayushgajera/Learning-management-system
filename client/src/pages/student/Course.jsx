import React from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiBook, FiStar, FiBookmark } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

function Course({ course, isPurchased }) {
  const navigate = useNavigate();

  const cardTransition = { duration: 0.45, ease: [0.22, 1, 0.36, 1] };

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/course/${course._id}`)}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={cardTransition}
      whileHover={{ scale: 1.02, y: -6 }}
      whileTap={{ scale: 0.99 }}
      layout
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Thumbnail Section with Fixed Aspect Ratio */}
      <div className="relative overflow-hidden rounded-t-xl aspect-[16/9] bg-gray-100 dark:bg-gray-700">
        <motion.img
          src={course.courseThumbnail}
          alt={course.courseTitle}
          loading="lazy"
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 mix-blend-multiply" />
        <button
          className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-gray-700/80 rounded-full hover:bg-white transition-colors duration-200"
          aria-label="Bookmark course"
          onClick={(e) => e.stopPropagation()}
        >
          <FiBookmark className="w-4 h-4 text-gray-600 dark:text-gray-200" />
        </button>
        <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-2">
          <span className="px-2 py-1 bg-black/90 rounded-lg text-sm font-medium">
            {course.courseLevel}
          </span>
          <span className="px-2 py-1 bg-gradient-to-r from-green-700 to-emerald-600 text-white rounded-lg text-sm font-medium">
            Web Development
          </span>
        </div>
      </div>

      {/* Content */}
  <div className="p-5 pt-2 space-y-2 min-h-[210px] flex flex-col justify-between text-gray-800 dark:text-gray-100">
        {/* Subtitle above Title */}

  <h3 className="font-bold text-lg mb-1 line-clamp-2 hover:text-emerald-600 transition-colors duration-200 overflow-hidden text-ellipsis">
          {course.courseTitle}
        </h3>
  <p className="text-sm line-clamp-1 overflow-hidden text-ellipsis text-gray-600 dark:text-gray-300">{course.subTitle}</p>

        {/* Instructor Section */}
        <div className="flex items-center gap-2">
          <img
            src={course.creator?.photoUrl || 'https://ui-avatars.com/api/?name=Instructor'}
            alt={course.creator?.name || 'Instructor'}
            className="w-9 h-9 rounded-full object-cover border border-gray-100 dark:border-gray-700"
          />
          <div>
            <p className="text-sm font-medium">{course.creator?.name || 'Instructor'}</p>
            <p className="text-xs text-gray-400">Instructor</p>
          </div>
        </div>

        {/* Rating, Lessons, Duration */}
  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mt-2">
          <div className="flex items-center gap-1">
            <FiBook className="w-4 h-4 text-gray-400" />
            <span>{course.lectures.length} Lessons</span>
          </div>
          <div className="flex items-center gap-1">
            <FiClock className="w-4 h-4 text-gray-400" />
            <span>~5 hrs</span>
          </div>
          <div className="flex items-center gap-1 text-yellow-500">
            <FiStar className="w-4 h-4" />
            <span className="text-sm font-medium">4.8</span>
            <span className="text-xs text-gray-500">(123)</span>
          </div>
        </div>

        {/* Price Section */}
        <div>
          <span className="text-lg font-bold">₹{course.coursePrice}</span>
        </div>

        {/* Enroll/Go to Course Button */}
        {isPurchased ? (
          <button
            className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={e => { e.stopPropagation(); navigate(`/course-progress/${course._id}`); }}
          >
            Go to Course
          </button>
        ) : (
          <button
            className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white text-sm font-medium rounded-lg
              hover:from-green-700 hover:to-emerald-600 transition-all duration-200 transform hover:scale-[1.02]
              focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            onClick={e => e.stopPropagation()}
          >
            Enroll Now
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default Course;
