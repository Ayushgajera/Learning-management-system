import React from 'react';
import { FiCheckCircle, FiHeart, FiVideo, FiSmartphone, FiAward } from 'react-icons/fi';
import BuyCourseButton from '@/components/BuyCourseButton';

function CourseSidebar({ courseData, purchased, courseId, refetch, navigate }) {
  const defaultCourse = { price: 1499 };
  const coursePrice = courseData.coursePrice ?? defaultCourse.price;

  return (
    <div className="md:w-1/3 w-full sticky top-20">
      <div className="bg-white dark:bg-neutral-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-neutral-700">
        <div className="relative aspect-[16/9] w-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
          <img
            src={courseData.courseThumbnail || ''}
            alt="Course Thumbnail"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 opacity-0"
            onLoad={e => e.currentTarget.classList.remove('opacity-0')}
          />
        </div>
        <div className="p-8">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">₹{coursePrice}</span>
            <span className="text-lg text-gray-500 dark:text-neutral-400 line-through">₹{defaultCourse.price}</span>
          </div>

          <div className="flex flex-col gap-4 mt-6">
            {!purchased && (
              <BuyCourseButton courseId={courseData._id} amount={courseData?.coursePrice} refetch={refetch} />
            )}

            {purchased && (
              <button
                onClick={() => navigate(`/course-progress/${courseData._id}`)}
                className="bg-emerald-400 text-neutral-900 dark:text-gray-900 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiCheckCircle /> Continue to Course
              </button>
            )}

            <button className="border border-purple-500 text-purple-400 dark:text-purple-300 py-3 rounded-xl font-semibold hover:bg-purple-900 transition-colors flex items-center justify-center gap-2">
              <FiHeart /> Add to Wishlist
            </button>
            <button className="bg-gray-100 dark:bg-neutral-700 text-gray-900 dark:text-neutral-200 py-3 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors">
              Share
            </button>
          </div>

          <p className="text-center text-sm mt-6 text-gray-600 dark:text-neutral-400">30-Day Money-Back Guarantee</p>
          <ul className="mt-6 space-y-3 text-sm text-gray-700 dark:text-neutral-400">
            <li className="flex items-center gap-3"><FiVideo className="text-emerald-400" /> 7.5 hours on-demand video</li>
            <li className="flex items-center gap-3"><FiSmartphone className="text-emerald-400" /> Access on mobile and TV</li>
            <li className="flex items-center gap-3"><FiAward className="text-emerald-400" /> Certificate of completion</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CourseSidebar;