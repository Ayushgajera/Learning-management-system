import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FiClock,
  FiBarChart,
  FiStar,
  FiArrowRight,
  FiCheckCircle,
  FiBookOpen,
  FiUsers,
  FiHeart,
  FiCalendar,
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import {
  useFetchWishlistQuery,
  useAddCourseToWishlistMutation,
  useRemoveCourseFromWishlistMutation,
} from '@/features/api/wishlistApi';
import { toast } from 'sonner';

const Course = ({ course }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((store) => store.auth);
  const isPurchased = user?.enrolledCourses?.includes(course._id);
  const lectureCount = Array.isArray(course?.lectures)
    ? course.lectures.length
    : Number(course?.totalLectures) || 0;
  const studentCount = Array.isArray(course?.enrolledStudents)
    ? course.enrolledStudents.length
    : Number(course?.enrolledStudents) || 0;
  const levelLabel = course?.courseLevel || 'All levels';
  const durationLabel = course?.duration?.trim() || 'Self-paced';
  const lastUpdatedLabel = course?.updatedAt
    ? new Date(course.updatedAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : null;
  const subtitle = useMemo(() => {
    if (course?.subTitle) return course.subTitle;
    const plainDescription = course?.courseDescription?.replace(/<[^>]*>/g, '') || '';
    return plainDescription.length > 100 ? `${plainDescription.slice(0, 100)}…` : plainDescription;
  }, [course?.subTitle, course?.courseDescription]);
  const ratingValue =
    typeof course?.averageRating === 'number'
      ? course.averageRating.toFixed(1)
      : course?.rating
      ? Number(course.rating).toFixed(1)
      : null;
  const ratingCount = course?.ratingCount ?? course?.reviewsCount ?? null;
  const formattedPrice = typeof course?.coursePrice === 'number'
    ? new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(course.coursePrice)
    : 'Free';

  const {
    data: wishlistData,
    isFetching: isWishlistLoading,
    refetch: refetchWishlist,
  } = useFetchWishlistQuery(undefined, {
    skip: !isAuthenticated,
  });
  const wishlistIds = useMemo(
    () => (wishlistData?.wishlist || []).map((item) => item?._id?.toString()),
    [wishlistData]
  );
  const isWishlisted = isAuthenticated && wishlistIds.includes(course?._id?.toString());
  const [addCourseToWishlist, { isLoading: isAdding }] = useAddCourseToWishlistMutation();
  const [removeCourseFromWishlist, { isLoading: isRemoving }] = useRemoveCourseFromWishlistMutation();
  const wishlistBusy = isAdding || isRemoving;

  const handleWishlistToggle = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please log in to save courses');
      navigate(`/login?redirect=/course/${course._id}`);
      return;
    }
    if (wishlistBusy) return;

    try {
      if (isWishlisted) {
        await removeCourseFromWishlist(course._id).unwrap();
        toast.success('Removed from wishlist');
      } else {
        await addCourseToWishlist(course._id).unwrap();
        toast.success('Added to wishlist');
      }
      if (refetchWishlist) {
        refetchWishlist();
      }
    } catch (wishlistError) {
      toast.error(wishlistError?.data?.message || 'Unable to update wishlist');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="h-full "
    >
      <Link
        to={`/course/${course._id}`}
        className="block h-full relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 rounded-2xl"
      >
        <div
          className={`relative h-full bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col
            ${isPurchased 
              ? 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_25px_rgba(16,185,129,0.25)] hover:border-emerald-500/50' 
              : 'border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/30'
            }
          `}
        >
          {/* Image Section */}
          <div className="relative aspect-[16/10] overflow-hidden">
            <img
              src={course.courseThumbnail || 'https://placehold.co/600x400/png'}
              alt={course.courseTitle}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

            {/* Top Badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
              {course.category && (
                <span className="px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
                  {course.category}
                </span>
              )}
              {isPurchased && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/90 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <FiCheckCircle className="w-3 h-3" />
                  Enrolled
                </span>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              type="button"
              onClick={handleWishlistToggle}
              disabled={wishlistBusy || isWishlistLoading}
              className={`absolute top-3 right-3 z-10 flex items-center justify-center w-9 h-9 rounded-full backdrop-blur-md border transition-all duration-300 ${
                isWishlisted 
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-500' 
                  : 'bg-black/20 border-white/20 text-white hover:bg-white hover:text-rose-500'
              }`}
            >
              <FiHeart className={`w-4.5 h-4.5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>

            {/* Bottom Info on Image (Instructor & Rating) */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
               <div className="flex items-center gap-2">
                  <div className="relative">
                    <img
                      src={course.creator?.photoUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Edu'}
                      alt={course.creator?.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-white/50"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 rounded-full p-[2px]">
                       <FiCheckCircle className="w-2 h-2 text-white" />
                    </div>
                  </div>
                  <span className="text-xs font-medium text-white/90 truncate max-w-[100px] shadow-black/50 drop-shadow-md">
                    {course.creator?.name || 'Instructor'}
                  </span>
               </div>
               
               {ratingValue && (
                  <div className="flex items-center gap-1 text-xs font-bold text-white bg-black/30 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                    <FiStar className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{ratingValue}</span>
                  </div>
               )}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-5 flex flex-col flex-1 gap-4 relative">
             {/* Title & Subtitle */}
             <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1">
                  {course.courseTitle}
                </h3>
                {subtitle && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {subtitle}
                  </p>
                )}
             </div>

             {/* Stats Pills */}
             <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800/50 text-xs font-medium text-slate-600 dark:text-slate-300">
                   <FiBookOpen className="w-3.5 h-3.5 text-indigo-500" />
                   <span>{lectureCount} Lessons</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800/50 text-xs font-medium text-slate-600 dark:text-slate-300">
                   <FiClock className="w-3.5 h-3.5 text-sky-500" />
                   <span>{durationLabel}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800/50 text-xs font-medium text-slate-600 dark:text-slate-300">
                   <FiBarChart className="w-3.5 h-3.5 text-emerald-500" />
                   <span>{levelLabel}</span>
                </div>
             </div>

             {/* Divider */}
             <div className="h-px w-full bg-slate-100 dark:bg-slate-800" />

             {/* Footer */}
             <div className="flex items-center justify-between mt-auto">
                <div>
                   {isPurchased ? (
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        Ready to start
                      </span>
                   ) : (
                      <div className="flex flex-col">
                         <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Price</span>
                         <span className="text-xl font-bold text-slate-900 dark:text-white">
                            {formattedPrice}
                         </span>
                      </div>
                   )}
                </div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all ${
                    isPurchased
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700'
                  }`}
                >
                  {isPurchased ? 'Continue' : 'Enroll Now'}
                  <FiArrowRight className="w-4 h-4" />
                </motion.div>
             </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default Course;
