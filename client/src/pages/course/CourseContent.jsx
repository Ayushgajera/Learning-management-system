import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  FiCheckCircle,
  FiUser,
  FiVideo,
  FiUsers,
  FiAward,
  FiHeart,
  FiChevronUp,
  FiChevronDown,
  FiBookOpen,
  FiClock,
  FiLock,
  FiAlertCircle,
  FiPlayCircle,
  FiStar
} from 'react-icons/fi';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DOMPurify from 'dompurify';
import { socket } from '../../extensions/socket';
import { useGetPurchaseCourseQuery } from '@/features/api/paymentApi';
import { useFetchWishlistQuery, useAddCourseToWishlistMutation, useRemoveCourseFromWishlistMutation } from '@/features/api/wishlistApi';
import { useGetCourseReviewsQuery } from '@/features/api/courseApi';
import Rating from '@/components/Rating';
import UnauthorizedAccess from '@/components/UnauthorizedAccess';
import CourseSidebar from '../../components/CourseSidebar';
import LecturePreviewModal from '../../components/LecturePreviewModal';
import CourseSkeleton from '../../components/CourseSkeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const getLevelBadge = (level) => {
  if (!level || level === 'New Instructor') return null;
  switch (level) {
    case 'Top Instructor':
      return <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs font-bold border border-yellow-500/20 flex items-center gap-1">🏆 Top Instructor</span>;
    case 'Level 2':
      return <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">⭐ Level 2 Instructor</span>;
    case 'Level 1':
      return <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-500/20">⚡ Level 1 Instructor</span>;
    default:
      return null;
  }
};

function CourseContent() {
  const [openSection, setOpenSection] = useState(null);
  const [previewLecture, setPreviewLecture] = useState(null);
  const [isWishlistedCourse, setIsWishlistedCourse] = useState(false);
  const [wishlistAnimKey, setWishlistAnimKey] = useState(0);
  const [isWishlistBusy, setIsWishlistBusy] = useState(false);
  const wishlistAnimationTimeout = useRef(null);

  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((store) => store.auth);

  const { data, isLoading, error, refetch } = useGetPurchaseCourseQuery(courseId);
  const {
    data: wishlistData,
    isFetching: isWishlistFetching,
    refetch: refetchWishlist,
  } = useFetchWishlistQuery(undefined, { skip: !isAuthenticated });
  const { data: reviewsData } = useGetCourseReviewsQuery(courseId);
  const reviews = reviewsData?.reviews || [];
  const [addCourseToWishlist] = useAddCourseToWishlistMutation();
  const [removeCourseFromWishlist] = useRemoveCourseFromWishlistMutation();

  const courseData = useMemo(() => data?.course || {}, [data]);
  const purchased = data?.purchased;
  const lectures = useMemo(
    () => {
      if (courseData.modules) {
        return courseData.modules.flatMap(m => m.lectures || []);
      }
      return Array.isArray(courseData.lectures) ? courseData.lectures : [];
    },
    [courseData.modules, courseData.lectures]
  );

  const {
    courseTitle,
    creator,
    courseDescription,
    courseThumbnail,
    duration,
    learningGoals,
    requirements,
    courseLevel,
    enrolledStudents,
    createdAt,
    updatedAt
  } = courseData;

  // Calculate Total Duration
  const totalDurationSeconds = useMemo(() => {
    return lectures.reduce((acc, lecture) => acc + (lecture.duration || 0), 0);
  }, [lectures]);

  const formatDuration = (seconds) => {
    if (!seconds) return '00:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    // const secs = Math.floor(seconds % 60); // Optional: if needed

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatLectureDuration = (seconds) => {
    if (!seconds) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  const enrolledCount = Array.isArray(enrolledStudents) ? enrolledStudents.length : null;
  const lectureCount = lectures.length;
  const lastUpdatedLabel = updatedAt ? new Date(updatedAt).toLocaleDateString() : null;
  const createdDateLabel = createdAt ? new Date(createdAt).toLocaleDateString() : null;
  const plainDescription = courseDescription ? courseDescription.replace(/<[^>]*>/g, '') : '';
  const descriptionPreview = plainDescription.length > 180 ? `${plainDescription.substring(0, 180)}...` : plainDescription;
  const wishlistButtonDisabled = isWishlistBusy || isWishlistFetching;

  // ✅ FIX: Clean & Sanitize Description
  const sanitizedDescription = useMemo(() => {
    if (!courseDescription) return '';

    let cleanedDescription = courseDescription
      .replace(/<li><p>(.*?)<\/p><\/li>/g, '<li>$1</li>'); // fix nested p inside li

    return DOMPurify.sanitize(cleanedDescription, {
      ALLOWED_TAGS: [
        'b',
        'strong',
        'i',
        'em',
        'u',
        'ul',
        'ol',
        'li',
        'p',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'br',
        'span',
        'a',
        'img',
        'blockquote',
        'pre',
        'code',
        'hr',
        'div'
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'style', 'class', 'target', 'rel', 'loading'],
    });
  }, [courseDescription]);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsWishlistedCourse(false);
      return;
    }

    if (!wishlistData?.wishlist) return;

    const wishlistIds = wishlistData.wishlist.map((course) => course?._id?.toString());
    setIsWishlistedCourse(wishlistIds.includes(courseId));
  }, [wishlistData, courseId, isAuthenticated]);

  useEffect(() => {
    const handleCourseUpdated = (updatedCourse) => {
      if (updatedCourse._id === courseId) {
        refetch();
      }
    };
    socket.on('courseUpdated', handleCourseUpdated);
    return () => {
      socket.off('courseUpdated', handleCourseUpdated);
    };
  }, [courseId, refetch]);

  // Fix: Scroll to top when course opens
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [courseId]);

  const toggleSection = useCallback(
    (idx) => {
      setOpenSection(openSection === idx ? null : idx);
    },
    [openSection]
  );

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to save courses');
      navigate(`/login?redirect=/course/${courseId}`);
      return;
    }

    if (isWishlistBusy) return;

    try {
      setIsWishlistBusy(true);
      if (isWishlistedCourse) {
        await removeCourseFromWishlist(courseId).unwrap();
        setIsWishlistedCourse(false);
        toast.success('Removed from wishlist');
      } else {
        await addCourseToWishlist(courseId).unwrap();
        setIsWishlistedCourse(true);
        toast.success('Added to wishlist');
        setWishlistAnimKey(Date.now());
        if (wishlistAnimationTimeout.current) {
          clearTimeout(wishlistAnimationTimeout.current);
        }
        wishlistAnimationTimeout.current = setTimeout(() => {
          setWishlistAnimKey(0);
          wishlistAnimationTimeout.current = null;
        }, 450);
      }
      if (refetchWishlist) {
        await refetchWishlist();
      }
    } catch (wishlistError) {
      toast.error(wishlistError?.data?.message || 'Unable to update wishlist');
    } finally {
      setIsWishlistBusy(false);
    }
  };

  useEffect(() => {
    return () => {
      if (wishlistAnimationTimeout.current) {
        clearTimeout(wishlistAnimationTimeout.current);
      }
    };
  }, []);

  if (isLoading) {
    return <CourseSkeleton />;
  }

  if (error && (error.data?.message || error.status === 401)) {
    return <UnauthorizedAccess />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pt-24 pb-20">

      {/* Hero Section */}
      <div className="bg-slate-900 text-white pt-20 pb-20 lg:pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-slate-900 z-0" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 z-0" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-6 font-medium">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <FiChevronDown className="-rotate-90 w-3 h-3" />
            <Link to="/courses" className="hover:text-white transition-colors">Courses</Link>
            <FiChevronDown className="-rotate-90 w-3 h-3" />
            <span className="text-indigo-400 truncate max-w-[200px]">{courseData.category || 'Development'}</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-2/3 pr-0 lg:pr-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 font-display leading-tight">
                {courseTitle || 'Untitled Course'}
              </h1>

              <div className="flex items-center gap-2 mb-6">
                <span className="text-yellow-400 font-bold text-lg">
                  {courseData.averageRating?.toFixed(1) || "0.0"}
                </span>
                <Rating rating={courseData.averageRating || 0} totalStars={5} readOnly={true} size="text-yellow-400" />
                <span className="text-slate-400 text-sm">
                  ({courseData.totalRatings || 0} ratings)
                </span>
              </div>

              <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-3xl">
                {descriptionPreview || 'Course description will be available soon.'}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-sm font-medium">
                {creator?.name && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <FiUser className="text-indigo-400" />
                    <span>
                      Created by <span className="text-white underline decoration-indigo-500/30 underline-offset-4">{creator.name}</span>
                      <span className="ml-2 inline-flex">{getLevelBadge(creator.instructorLevel)}</span>
                    </span>
                  </div>
                )}

                {courseLevel && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <FiAward className="text-indigo-400" />
                    Level: {courseLevel}
                  </div>
                )}

                {lectureCount !== null && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <FiBookOpen className="text-indigo-400" />
                    {lectureCount} lectures
                  </div>
                )}

                {duration && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <FiClock className="text-indigo-400" />
                    {duration}
                  </div>
                )}

                {typeof enrolledCount === 'number' && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <FiUsers className="text-indigo-400" />
                    {enrolledCount} enrolled learners
                  </div>
                )}

                {lastUpdatedLabel && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <FiAlertCircle className="text-indigo-400" />
                    Updated {lastUpdatedLabel}
                  </div>
                )}
              </div>

              <div className="mt-8">
                <motion.button
                  type="button"
                  aria-pressed={isWishlistedCourse}
                  onClick={handleToggleWishlist}
                  disabled={wishlistButtonDisabled}
                  whileTap={{ scale: wishlistButtonDisabled ? 1 : 0.95 }}
                  className={`relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all border overflow-hidden
                    ${isWishlistedCourse
                      ? 'bg-rose-500/20 border-rose-400 text-white hover:bg-rose-500/30'
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                    }
                    ${wishlistButtonDisabled ? 'opacity-70 cursor-not-allowed' : ''}
                  `}
                >
                  <span className="relative flex items-center gap-2">
                    <AnimatePresence mode="wait">
                      {wishlistAnimKey !== 0 && (
                        <motion.span
                          key={wishlistAnimKey}
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={{ opacity: 0.75, scale: 1.5 }}
                          exit={{ opacity: 0, scale: 1.8 }}
                          transition={{ duration: 0.4 }}
                          className="absolute inset-0 -z-10 rounded-full bg-rose-500/40 blur-lg"
                        />
                      )}
                    </AnimatePresence>
                    <FiHeart className={`text-lg ${isWishlistedCourse ? 'fill-rose-500 text-rose-200' : 'text-white'}`} />
                    <span>
                      {wishlistButtonDisabled
                        ? 'Saving...'
                        : isWishlistedCourse
                          ? 'Wishlisted'
                          : 'Add to wishlist'}
                    </span>
                  </span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

          {/* Left Column - Main Content */}
          <div className="lg:w-2/3 space-y-8 py-8 lg:py-0 lg:-mt-12">

            {/* What you'll learn */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 font-display">What you'll learn</h2>
              {Array.isArray(learningGoals) && learningGoals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {learningGoals.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                      <FiCheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Learning outcomes have not been added for this course yet.</p>
              )}
            </div>

            {/* Course Content Accordion (Modules) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">Course Content</h2>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="font-medium">
                    {courseData.modules?.length || 0} modules • {lectures.length} lectures • {formatDuration(totalDurationSeconds)} total length
                  </span>
                  <button
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                    onClick={() => setOpenSection(openSection === 'all' ? null : 'all')}
                  >
                    {openSection === 'all' ? 'Collapse all' : 'Expand all'}
                  </button>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-800">
                {(!courseData.modules || courseData.modules.length === 0) ? (
                  <div className="text-slate-500 italic py-8 text-center bg-slate-50 dark:bg-slate-800/50">
                    No modules found for this course.
                  </div>
                ) : (
                  courseData.modules.map((module, modIdx) => (
                    <div key={module._id || modIdx} className="bg-white dark:bg-slate-900">
                      {/* Module Header */}
                      <button
                        className="w-full flex justify-between items-center py-4 px-6 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                        onClick={() => toggleSection(modIdx)}
                      >
                        <div className="flex items-center gap-4">
                          {openSection === modIdx || openSection === 'all' ? (
                            <FiChevronUp className="text-indigo-600 dark:text-indigo-400 text-xl transition-transform duration-300" />
                          ) : (
                            <FiChevronDown className="text-slate-400 text-xl transition-transform duration-300 group-hover:text-slate-600" />
                          )}
                          <div>
                            <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors block">
                              {module.moduleTitle || `Module ${modIdx + 1}`}
                            </span>
                            <span className="text-xs text-slate-400 font-normal">
                              {module.lectures?.length || 0} lectures
                            </span>
                          </div>
                        </div>
                      </button>

                      {/* Lectures List (Animated) */}
                      <AnimatePresence>
                        {(openSection === modIdx || openSection === 'all') && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-5 pt-1 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800/50 space-y-2">
                              {module.lectures?.map((lecture, lecIdx) => (
                                <div
                                  key={lecture._id || lecIdx}
                                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-transparent
                                    ${lecture.isPreviewFree
                                      ? 'hover:bg-white dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer shadow-sm hover:shadow-md transition-all'
                                      : 'opacity-70 cursor-not-allowed'
                                    }`}
                                  onClick={() => lecture.isPreviewFree && setPreviewLecture(lecture)}
                                >
                                  <div className="flex items-center gap-3">
                                    {lecture.isPreviewFree ? (
                                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                        <FiPlayCircle className="w-4 h-4 fill-current" />
                                      </div>
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                        <FiLock className="w-4 h-4" />
                                      </div>
                                    )}
                                    <div>
                                      <span className="text-slate-900 dark:text-slate-200 font-medium block text-sm">
                                        {lecture.lectureTitle || 'Untitled Lecture'}
                                      </span>
                                      {lecture.isPreviewFree && (
                                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                          Free Preview
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4 mt-2 sm:mt-0 text-slate-500 text-xs">
                                    <span>{formatLectureDuration(lecture.duration)}</span>
                                  </div>
                                </div>
                              ))}
                              {(!module.lectures || module.lectures.length === 0) && (
                                <p className="text-sm text-slate-400 italic text-center py-2">No lectures in this module yet.</p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 font-display">Requirements</h2>
              {Array.isArray(requirements) && requirements.length > 0 ? (
                <ul className="space-y-3">
                  {requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2.5 flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No prerequisites have been specified for this course.</p>
              )}
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 font-display">Description</h2>
              <div
                className="course-description prose prose-slate dark:prose-invert max-w-none prose-headings:font-display prose-a:text-indigo-600 dark:prose-a:text-indigo-400 hover:prose-a:text-indigo-500"
                dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
              />
            </div>

            {/* Instructor */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 font-display">Instructor</h2>
              {creator ? (
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <img
                      src={creator.photoUrl || 'https://github.com/shadcn.png'}
                      alt={creator.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 dark:border-slate-800 shadow-md"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{creator.name}</h3>
                      {getLevelBadge(creator.instructorLevel)}
                    </div>
                    {creator.email && (
                      <p className="text-slate-500 text-sm mb-4">{creator.email}</p>
                    )}
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
                      {courseData.category
                        ? `This course is authored by ${creator.name} for the ${courseData.category} track.`
                        : `${creator.name} is the creator of this course.`}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm font-medium">
                      {lectureCount !== null && (
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                          <FiVideo className="text-indigo-500" /> {lectureCount} lectures
                        </div>
                      )}
                      {typeof enrolledCount === 'number' && (
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                          <FiUsers className="text-indigo-500" /> {enrolledCount} learners
                        </div>
                      )}
                      {createdDateLabel && (
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                          <FiClock className="text-indigo-500" /> Created on {createdDateLabel}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Instructor information will appear as soon as the course owner completes their profile.</p>
              )}
            </div>

            {/* Student Feedback & Reviews */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 font-display">Student Feedback</h2>
              <div className="flex items-center gap-4 mb-8">
                <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 min-w-[140px]">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white mb-1">
                    {courseData.averageRating ? courseData.averageRating.toFixed(1) : "0.0"}
                  </span>
                  <div className="flex text-yellow-400 text-sm mb-1">
                    <Rating rating={courseData.averageRating || 0} totalStars={5} readOnly={true} size="text-yellow-400" />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Course Rating</span>
                </div>

                <div className="flex-1">
                  {/* Simplified distribution bars could go here, for now just showing total reviews */}
                  <p className="text-slate-600 dark:text-slate-300 font-medium">
                    {reviews.length > 0
                      ? `${reviews.length} Review${reviews.length > 1 ? 's' : ''}`
                      : "No reviews yet"
                    }
                  </p>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-6">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review._id} className="border-b border-slate-100 dark:border-slate-800 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={review.user?.photoUrl || "https://github.com/shadcn.png"}
                          alt={review.user?.name || "User"}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                            {review.user?.name || "Student"}
                          </h4>
                          <div className="flex items-center gap-2">
                            <div className="flex text-yellow-400 text-xs">
                              <Rating rating={review.rating} totalStars={5} readOnly={true} size="text-yellow-400" />
                            </div>
                            <span className="text-xs text-slate-400">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic text-sm">Be the first to rate this course!</p>
                )}
              </div>
            </div>

          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:w-1/3 relative">
            <div className="sticky top-24 lg:-mt-90 z-30">
              <CourseSidebar
                courseData={courseData}
                purchased={purchased}
                courseId={courseId}
                refetch={refetch}
                navigate={navigate}
                isWishlistedCourse={isWishlistedCourse}
                wishlistButtonDisabled={wishlistButtonDisabled}
                onToggleWishlist={handleToggleWishlist}
              />
            </div>
          </div>

        </div>
      </div>

      {previewLecture && (
        <LecturePreviewModal
          previewLecture={previewLecture}
          onClose={() => setPreviewLecture(null)}
        />
      )}
    </div>
  );
}

export default CourseContent;
