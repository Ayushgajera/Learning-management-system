import React, { useMemo, useState, useCallback } from 'react';
import { FiCheckCircle, FiHeart, FiVideo, FiAward, FiClock, FiUsers } from 'react-icons/fi';
import BuyCourseButton from '@/components/BuyCourseButton';
import { toast } from 'sonner';

function CourseSidebar({
  courseData,
  purchased,
  courseId,
  refetch,
  navigate,
  isWishlistedCourse,
  wishlistButtonDisabled,
  onToggleWishlist,
}) {
  const coursePrice = typeof courseData.coursePrice === 'number' ? courseData.coursePrice : null;
  const lectureCount = Array.isArray(courseData.lectures) ? courseData.lectures.length : null;
  const duration = courseData.duration;
  const level = courseData.courseLevel;
  const enrolledCount = Array.isArray(courseData.enrolledStudents) ? courseData.enrolledStudents.length : null;
  const [isSharing, setIsSharing] = useState(false);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/course/${courseId}`;
  }, [courseId]);

  const handleShare = useCallback(async () => {
    if (!shareUrl || isSharing) return;
    try {
      setIsSharing(true);
      const sharePayload = {
        title: courseData.courseTitle || 'Check out this course',
        text: courseData.subTitle || 'Found this course on the LMS platform',
        url: shareUrl,
      };

      if (navigator.share) {
        await navigator.share(sharePayload);
        toast.success('Course shared');
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard');
      } else {
        toast.info('Sharing not supported on this device');
      }
    } catch (error) {
      if (error?.name !== 'AbortError') {
        toast.error('Unable to share right now');
      }
    } finally {
      setIsSharing(false);
    }
  }, [courseData.courseTitle, courseData.subTitle, shareUrl, isSharing]);

  return (
    <div className="w-full sticky top-24">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="relative aspect-[16/9] w-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <img
            src={courseData.courseThumbnail || ''}
            alt="Course Thumbnail"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 opacity-0"
            onLoad={e => e.currentTarget.classList.remove('opacity-0')}
          />
        </div>
        <div className="p-8">
          <div className="mb-4">
            {coursePrice !== null ? (
              <span className="text-3xl font-bold text-slate-900 dark:text-white">₹{coursePrice}</span>
            ) : (
              <span className="text-base text-slate-500 dark:text-slate-400">Pricing information will be available soon.</span>
            )}
          </div>

          <div className="flex flex-col gap-4 mt-6">
            {!purchased && (
              <BuyCourseButton courseId={courseData._id} amount={coursePrice ?? 0} refetch={refetch} />
            )}

            {purchased && (
              <button
                onClick={() => navigate(`/course-progress/${courseData._id}`)}
                className="bg-emerald-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
              >
                <FiCheckCircle /> Continue to Course
              </button>
            )}

            <button
              type="button"
              aria-pressed={!!isWishlistedCourse}
              disabled={wishlistButtonDisabled}
              onClick={onToggleWishlist}
              className={`border border-indigo-200 dark:border-indigo-800 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors
                ${
                  isWishlistedCourse
                    ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-700'
                    : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
                }
                ${wishlistButtonDisabled ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              <FiHeart className={isWishlistedCourse ? 'fill-rose-500 text-rose-500' : ''} />
              {wishlistButtonDisabled
                ? 'Saving...'
                : isWishlistedCourse
                  ? 'Wishlisted'
                  : 'Add to Wishlist'}
            </button>
            <button
              type="button"
              onClick={handleShare}
              disabled={isSharing}
              className={`bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 py-3 rounded-xl font-semibold transition-colors
                ${isSharing ? 'opacity-70 cursor-not-allowed' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}
              `}
            >
              {isSharing ? 'Sharing...' : 'Share'}
            </button>
          </div>

          <ul className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            {lectureCount !== null && (
              <li className="flex items-center gap-3"><FiVideo className="text-indigo-500" /> {lectureCount} lectures</li>
            )}
            {duration && (
              <li className="flex items-center gap-3"><FiClock className="text-indigo-500" /> {duration} total length</li>
            )}
            {level && (
              <li className="flex items-center gap-3"><FiAward className="text-emerald-400" /> Level: {level}</li>
            )}
            {typeof enrolledCount === 'number' && (
              <li className="flex items-center gap-3"><FiUsers className="text-indigo-500" /> {enrolledCount} learners enrolled</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CourseSidebar;