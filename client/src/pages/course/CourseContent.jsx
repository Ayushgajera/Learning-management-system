import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FiCheckCircle,
  FiUser,
  FiClock,
  FiBookOpen,
  FiChevronDown,
  FiChevronUp,
  FiVideo,
  FiSmartphone,
  FiAward,
  FiLock,
} from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { socket } from '../../extensions/socket';
import { useGetPurchaseCourseQuery } from '@/features/api/paymentApi';
import UnauthorizedAccess from '@/components/UnauthorizedAccess';
import CourseSidebar from '../../components/CourseSidebar';
import LecturePreviewModal from '../../components/LecturePreviewModal';
import CourseSkeleton from '../../components/CourseSkeleton';

function CourseContent() {
  const [openSection, setOpenSection] = useState(null);
  const [previewLecture, setPreviewLecture] = useState(null);

  const { courseId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error, refetch } = useGetPurchaseCourseQuery(courseId);
  console.log()

  const courseData = useMemo(() => data?.course || {}, [data]);
  const purchased = data?.purchased;
  const lectures = useMemo(
    () => (Array.isArray(courseData.lectures) ? courseData.lectures : []),
    [courseData.lectures]
  );

  const {
    courseTitle,
    creator,
    courseDescription,
    courseThumbnail,
    duration,
    whatYouWillLearn,
    requirements,
  } = courseData;

  // ✅ FIX: Clean & Sanitize Description
  const sanitizedDescription = useMemo(() => {
    if (!courseDescription) return '';

    let cleanedDescription = courseDescription
      .replace(/<li><p>(.*?)<\/p><\/li>/g, '<li>$1</li>') // fix nested p inside li
      .replace(/\r\n/g, '') // remove carriage returns
      .replace(/\n/g, '<br/>'); // preserve line breaks

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
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'style', 'class', 'target', 'rel', 'loading'],
    });
  }, [courseDescription]);

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

  const toggleSection = useCallback(
    (idx) => {
      setOpenSection(openSection === idx ? null : idx);
    },
    [openSection]
  );

  if (isLoading) {
    return <CourseSkeleton />;
  }

  if (error && (error.data?.message || error.status === 401)) {
    return <UnauthorizedAccess />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-gray-900 dark:text-neutral-200 py-12 px-4 sm:px-8 lg:px-16 mt-16">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Main Content Area */}
        <div className="flex-1">
          {/* Course Hero Section */}
          <div className="bg-white dark:bg-neutral-800 rounded-3xl p-8 mb-6 shadow-xl border border-gray-100 dark:border-gray-700">
            <button
              onClick={() => navigate('/')}
              className="mb-6 flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Courses
            </button>

            {/* Thumbnail */}
            <div className="aspect-[16/9] bg-neutral-200 dark:bg-neutral-700 overflow-hidden rounded-2xl mb-6">
              <img
                src={courseThumbnail || ''}
                alt="Course Thumbnail"
                className="w-full h-full object-cover transition-opacity duration-500 opacity-0"
                onLoad={(e) => e.currentTarget.classList.remove('opacity-0')}
              />
            </div>

            <h1 className="text-4xl font-bold mb-3 text-gray-900 dark:text-white">
              {courseTitle || 'Untitled Course'}
            </h1>

            {/* Creator Info */}
            <div className="flex items-center gap-4 mb-4 text-gray-600 dark:text-neutral-400">
              <img
                src={creator?.photoUrl || ''}
                alt={creator?.name || 'Creator'}
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400"
              />
              <div>
                <div className="flex items-center gap-2 font-medium text-neutral-300">
                  <FiUser className="text-emerald-400" /> {creator?.name || 'Unknown'}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-neutral-500 mt-1">
                  <div className="flex items-center gap-1">
                    <FiClock /> {duration || '--'}
                  </div>
                  <div className="flex items-center gap-1">
                    <FiBookOpen /> {lectures.length} Lectures
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ Description */}
            <div
              className="course-description max-w-none  dark:text-white "
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  (courseData.courseDescription || '').replace(
                    /<li><p>(.*?)<\/p><\/li>/g,
                    '<li>$1</li>'
                  ),
                  {
                    ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'u', 'ul', 'ol', 'li', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'span', 'a', 'img', 'blockquote', 'pre', 'code', 'hr'],
                    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'style'],
                  }
                ),
              }}
            />
          </div>

          {/* What You'll Learn Section */}
          <div className="bg-white dark:bg-neutral-800 rounded-3xl p-8 mb-6 shadow-xl border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
              What you'll learn
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(whatYouWillLearn || []).map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-gray-700 dark:text-neutral-300">
                  <FiCheckCircle className="text-emerald-400 mt-1 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Requirements Section */}
          <div className="bg-white dark:bg-neutral-800 rounded-3xl p-8 mb-6 shadow-xl border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
              Requirements
            </h2>
            <ul className="list-disc list-inside text-gray-700 dark:text-neutral-300 space-y-2">
              {(requirements || []).map((req, idx) => (
                <li key={idx}>{req}</li>
              ))}
            </ul>
          </div>

          {/* Course Content Section */}
          <div className="bg-white dark:bg-neutral-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Course Content
            </h2>
            <div className="divide-y divide-gray-200 dark:divide-neutral-700">
              {lectures.length === 0 ? (
                <div className="text-neutral-500 italic py-6">
                  No lectures found for this course.
                </div>
              ) : (
                lectures.map((lecture, idx) => (
                  <div key={lecture._id ?? idx}>
                    <button
                      className="w-full flex justify-between items-center py-4 px-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded transition-colors"
                      onClick={() => toggleSection(idx)}
                    >
                      <span className="font-bold text-lg flex items-center gap-2">
                        {lecture?.lectureTitle || 'Untitled Lecture'}
                      </span>
                      {openSection === idx ? (
                        <FiChevronUp className="text-emerald-400 text-2xl transition-transform duration-300" />
                      ) : (
                        <FiChevronDown className="text-gray-500 dark:text-neutral-500 text-2xl transition-transform duration-300" />
                      )}
                    </button>
                    {openSection === idx && (
                      <div className="pl-4 pb-4">
                        <div
                          className={`flex flex-col sm:flex-row sm:items-center justify-between py-3 px-3 rounded-lg
                            ${
                              lecture.isPreviewFree
                                ? 'hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer'
                                : 'opacity-70 cursor-not-allowed'
                            }`}
                          onClick={() => lecture.isPreviewFree && setPreviewLecture(lecture)}
                        >
                          <div className="flex items-center gap-2">
                            {lecture.isPreviewFree ? (
                              <FiVideo className="text-emerald-400" />
                            ) : (
                              <FiLock className="text-neutral-500" />
                            )}
                            <span className="text-gray-800 dark:text-neutral-300 font-medium">
                              {lecture?.lectureTitle || 'Untitled Lecture'}
                            </span>
                            {lecture.isPreviewFree && (
                              <span className="ml-2 px-2 py-0.5 bg-emerald-700 text-emerald-200 rounded-full text-xs font-semibold">
                                Free Preview
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-2 sm:mt-0 text-gray-500 dark:text-neutral-500 text-sm">
                            <span>{lecture?.duration || '--'}</span>
                            <span>{lecture?.description || ''}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <CourseSidebar
          courseData={courseData}
          purchased={purchased}
          courseId={courseId}
          refetch={refetch}
          navigate={navigate}
        />
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
