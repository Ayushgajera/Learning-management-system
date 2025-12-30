import React, { useState, useRef, useEffect, useCallback, useMemo } from "react"; // Forced rebuild
import {
  FiPlayCircle,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiEyeOff,
  FiArrowLeft,
  FiMenu,
  FiX,
  FiAward,
  FiRefreshCw,
  FiBookmark,
  FiEdit2,
  FiDownload,
  FiMessageSquare,
  FiSettings,
  FiMoreVertical,
  FiVideo,
  FiCalendar,
  FiFileText,
  FiImage,
  FiFile
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetCourseProgressQuery,
  useUpdateCourseProgressMutation,
  useMarkAsCompletedMutation,
  useMarkAsInCompletedMutation,
} from "@/features/api/courseProgressApi";
import {
  getLectureNotes,
  setLectureNotes,
  getBookmarkedLectures,
  toggleBookmarkLecture,
  getLastWatchedLecture,
  setLastWatchedLecture,
} from "@/utils";
import { useSelector } from "react-redux";
import {
  PDFDownloadLink,
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import CourseChat from './../chat/CourseChat';
import Rating from '@/components/Rating';
import { useAddRatingMutation } from '@/features/api/courseApi';

// PDF styles for certificate
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 0,
  },
  container: {
    flex: 1,
    margin: 20,
    border: '3 solid #1e293b', // Slate 900
    padding: 5,
    position: 'relative',
  },
  innerContainer: {
    flex: 1,
    border: '1 solid #d97706', // Amber 600
    padding: 40,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc', // Slate 50
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 120,
    height: 120,
    borderTop: '25 solid #1e293b',
    borderLeft: '25 solid #1e293b',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 120,
    height: 120,
    borderBottom: '25 solid #1e293b',
    borderRight: '25 solid #1e293b',
  },
  logo: {
    fontSize: 20,
    color: '#64748b',
    fontWeight: 'bold',
    marginBottom: 30,
    textTransform: 'uppercase',
    letterSpacing: 6,
  },
  title: {
    fontSize: 42,
    fontFamily: 'Times-Roman',
    color: '#1e293b',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 12,
    color: '#d97706', // Amber 600
    marginBottom: 40,
    textTransform: 'uppercase',
    letterSpacing: 3,
    fontWeight: 'bold',
  },
  presentedTo: {
    fontSize: 14,
    color: '#64748b', // Slate 500
    marginBottom: 15,
    fontFamily: 'Times-Italic',
  },
  studentName: {
    fontSize: 32,
    fontFamily: 'Times-Bold',
    color: '#0f172a', // Slate 900
    marginBottom: 15,
    borderBottom: '1 solid #cbd5e1',
    paddingBottom: 5,
    minWidth: 350,
    textAlign: 'center',
  },
  completionText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 15,
    marginBottom: 15,
    fontFamily: 'Times-Italic',
  },
  courseTitle: {
    fontSize: 24,
    fontFamily: 'Times-Bold',
    color: '#1e293b',
    marginBottom: 50,
    textAlign: 'center',
    maxWidth: '80%',
  },
  footer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 20,
    paddingHorizontal: 40,
  },
  signatureBlock: {
    alignItems: 'center',
    width: '35%',
  },
  signature: {
    fontFamily: 'Courier-Oblique',
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 5,
  },
  signatureLabel: {
    fontSize: 9,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    borderTop: '1 solid #94a3b8',
    paddingTop: 8,
    width: '100%',
    textAlign: 'center',
  },
  dateBlock: {
    alignItems: 'center',
    width: '25%',
  },
  date: {
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  sealContainer: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#d97706',
    alignItems: 'center',
    justifyContent: 'center',
    border: '3 solid #fff',
  },
  sealText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  idText: {
    position: 'absolute',
    bottom: 10,
    right: 20,
    fontSize: 8,
    color: '#cbd5e1',
  }
});



const RatingModal = ({ isOpen, onClose, courseId, isLoading }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [addRating, { isLoading: isSubmitting }] = useAddRatingMutation();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    try {
      await addRating({ courseId, rating, comment }).unwrap();
      toast.success("Thank you for your rating!");
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to submit rating");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Rate this Course</h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition">
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <div className="mb-8 text-center">
              <p className="text-slate-600 dark:text-slate-400 mb-4">How was your learning experience?</p>
              <div className="flex justify-center">
                <Rating
                  rating={rating}
                  onRate={setRating}
                  size="text-4xl text-yellow-400"
                />
              </div>
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you liked or what could be improved..."
              className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 h-32 focus:ring-2 focus:ring-indigo-500 outline-none mb-6 text-slate-900 dark:text-white resize-none"
            />

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <FiRefreshCw className="animate-spin" /> : "Submit Review"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const MyCertificate = ({
  name = "John Doe",
  course = "React Mastery Bootcamp",
  instructorName = "Jane Smith",
  date = new Date().toLocaleDateString(),
}) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.container}>
        <View style={styles.cornerTopLeft} />
        <View style={styles.cornerBottomRight} />

        <View style={styles.innerContainer}>
          <Text style={styles.logo}>LearnGPT</Text>

          <Text style={styles.title}>Certificate of Completion</Text>
          <Text style={styles.subtitle}>Excellence in Education</Text>

          <Text style={styles.presentedTo}>This certificate is proudly presented to</Text>
          <Text style={styles.studentName}>{name}</Text>

          <Text style={styles.completionText}>for successfully completing the course</Text>
          <Text style={styles.courseTitle}>{course}</Text>

          <View style={styles.sealContainer}>
            <View style={styles.sealCircle}>
              <Text style={styles.sealText}>Verified</Text>
              <Text style={styles.sealText}>LearnGPT</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.dateBlock}>
              <Text style={styles.date}>{date}</Text>
              <Text style={styles.signatureLabel}>Date Issued</Text>
            </View>

            <View style={styles.signatureBlock}>
              <Text style={styles.signature}>{instructorName}</Text>
              <Text style={styles.signatureLabel}>Instructor Signature</Text>
            </View>
          </View>

          <Text style={styles.idText}>Certificate ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</Text>
        </View>
      </View>
    </Page>
  </Document>
);
// New memoized component for the sidebar to prevent unnecessary re-renders
const MemoizedSidebarContent = React.memo(
  ({
    courseLectures,
    selectedLecture,
    setSelectedLecture,
    setSidebarOpen,
    watchedLectureIds,
    bookmarkedLectures,
    handleToggleBookmark,
    completed,
    handleMarkCompleted,
    handleMarkInCompleted,
    markingCompleted,
    markingInCompleted,
    username,
    creatorName,
    courseTitle,
    courseDetails, // Add courseDetails to destructured props so we can access modules
  }) => {
    // Local state for sidebar accordion
    const [openModules, setOpenModules] = useState({});

    // Initialize all modules as open by default or just the first one
    useEffect(() => {
      if (courseDetails?.modules) {
        const initialOpenState = {};
        courseDetails.modules.forEach((mod, idx) => {
          initialOpenState[mod._id] = true; // Open all by default for better visibility
        });
        setOpenModules(initialOpenState);
      }
    }, [courseDetails]);

    const toggleModule = (moduleId) => {
      setOpenModules(prev => ({
        ...prev,
        [moduleId]: !prev[moduleId]
      }));
    };
    const isBookmarked = useCallback(
      (lectureId) => bookmarkedLectures.includes(lectureId),
      [bookmarkedLectures]
    );

    const progressPercentage = Math.round((watchedLectureIds.length / courseLectures.length) * 100) || 0;

    return (
      <div className="bg-white dark:bg-slate-900 h-full flex flex-col border-r border-slate-200 dark:border-slate-800">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 font-display">Course Content</h2>

          {/* Progress Bar */}
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
            <span>{progressPercentage}% Completed</span>
            <span>{watchedLectureIds.length}/{courseLectures.length} Lectures</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-emerald-500 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {courseDetails?.modules?.map((module, moduleIdx) => (
            <div key={module._id} className="border-b border-slate-200 dark:border-slate-800">
              {/* Collapsible Module Header */}
              <button
                onClick={() => toggleModule(module._id)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 p-4 flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200 text-sm sticky top-0 z-10 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span>{module.moduleTitle}</span>
                {openModules[module._id] ? (
                  <FiChevronLeft className="rotate-90 transition-transform" />
                ) : (
                  <FiChevronLeft className="-rotate-90 transition-transform" />
                )}
              </button>

              {/* Collapsible Content */}
              <AnimatePresence>
                {openModules[module._id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-2 space-y-1">
                      {module.lectures?.map((lecture, idx) => {
                        const isActive = selectedLecture && selectedLecture._id === lecture._id;
                        const isWatched = watchedLectureIds.includes(lecture._id);
                        const bookmarked = isBookmarked(lecture._id);

                        return (
                          <motion.button
                            key={lecture._id}
                            initial={false}
                            animate={{ backgroundColor: isActive ? "rgba(79, 70, 229, 0.05)" : "transparent" }}
                            onClick={() => {
                              setSelectedLecture(lecture);
                              setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 group border ${isActive
                              ? "border-indigo-200 dark:border-indigo-500/30"
                              : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50"
                              }`}
                          >
                            <div className="flex-shrink-0 mt-0.5 relative">
                              {isActive ? (
                                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                  <FiPlayCircle className="text-white w-4 h-4 fill-current" />
                                </div>
                              ) : isWatched ? (
                                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                  <FiCheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:border-slate-300 dark:group-hover:border-slate-600 transition-colors">
                                  {idx + 1}
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold truncate transition-colors ${isActive ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white'
                                }`}>
                                {lecture?.lectureTitle}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-slate-500 dark:text-slate-500 flex items-center gap-1">
                                  <FiVideo className="w-3 h-3" /> {lecture.duration || "10m"}
                                </span>
                                {bookmarked && (
                                  <span className="text-xs text-amber-500 flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded">
                                    <FiBookmark className="w-3 h-3 fill-current" /> Saved
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              className={`p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 ${bookmarked ? "text-amber-500 opacity-100" : "text-slate-400 hover:text-indigo-500"
                                }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleBookmark(lecture._id);
                              }}
                              title={bookmarked ? "Remove Bookmark" : "Bookmark"}
                            >
                              <FiBookmark className={bookmarked ? "fill-current" : ""} />
                            </button>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex flex-col gap-3 items-center">
            {completed ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center"
              >
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-2 text-emerald-600 dark:text-emerald-400">
                  <FiAward className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-emerald-800 dark:text-emerald-300 mb-1">Course Completed!</h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-3">You've mastered this course.</p>

                <PDFDownloadLink
                  document={
                    <MyCertificate
                      name={username}
                      course={courseTitle}
                      instructorName={creatorName}
                      date={new Date().toLocaleDateString()}
                    />
                  }
                  fileName={`certificate_${username.replace(/\s/g, "_")}_${courseTitle.replace(/\s/g, "_")}.pdf`}
                  className="w-full py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-500/20"
                >
                  {({ loading }) => (
                    <>
                      {loading ? "Generating..." : <><FiDownload /> Download Certificate</>}
                    </>
                  )}
                </PDFDownloadLink>
              </motion.div>
            ) : (
              <div className="w-full flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-2"><FiPlayCircle /> In Progress</span>
                <span className="font-mono font-bold">{progressPercentage}%</span>
              </div>
            )}

            <button
              onClick={completed ? handleMarkInCompleted : handleMarkCompleted}
              className={`w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${completed
                ? "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-lg"
                }`}
              disabled={markingCompleted || markingInCompleted}
            >
              {completed ? <><FiRefreshCw /> Mark Incomplete</> : <><FiCheckCircle /> Mark as Completed</>}
            </button>
          </div>
        </div>
      </div>
    );
  }
);

function EnrolledCourseLectures() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const videoRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const {
    data: courseData,
    error,
    isLoading,
    refetch,
  } = useGetCourseProgressQuery(courseId);
  const [updateProgress] = useUpdateCourseProgressMutation();
  const [markCompleted, { isLoading: markingCompleted }] = useMarkAsCompletedMutation();
  const [markInCompleted, { isLoading: markingInCompleted }] = useMarkAsInCompletedMutation();

  const [activeTab, setActiveTab] = useState("overview");
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [videoQuality, setVideoQuality] = useState("auto"); // Mock state for quality selector
  const creatorName = courseData?.data?.courseDetails?.creator?.name || "Instructor";
  const courseTitle = courseData?.data?.courseDetails?.courseTitle || "Course";
  const username = user?.name || "Student";
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [bookmarkedLectures, setBookmarkedLectures] = useState([]);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [currentNote, setCurrentNote] = useState("");

  const courseDetails = courseData?.data?.courseDetails || {};
  const progress = courseData?.data?.progress || [];
  const completed = courseData?.data?.completed || false;

  // Calculate watched lecture IDs for quick lookup
  const watchedLectureIds = useMemo(() => {
    return progress.filter(p => p.viewed).map(p => p.lectureId);
  }, [progress]);

  // Calculate flattened lectures for easy navigation and initial selection
  const courseLectures = useMemo(() => {
    if (courseDetails?.modules) {
      return courseDetails.modules.flatMap(m => m.lectures || []);
    }
    return Array.isArray(courseDetails.lectures) ? courseDetails.lectures : [];
  }, [courseDetails]);


  // Effect to handle initial lecture selection and bookmarks
  useEffect(() => {
    setBookmarkedLectures(getBookmarkedLectures(courseId));
    if (courseLectures.length > 0 && !selectedLecture) { // Check if not already selected to avoid reset
      let lastWatched = getLastWatchedLecture(courseId);
      let initialLecture = courseLectures.find((l) => l._id === lastWatched);
      if (!initialLecture) {
        initialLecture = courseLectures[0];
      }
      setSelectedLecture(initialLecture);
    }
  }, [courseLectures, courseId, selectedLecture]);

  // Effect to store the last watched lecture
  useEffect(() => {
    if (selectedLecture) {
      setLastWatchedLecture(courseId, selectedLecture._id);
      // Load notes for the selected lecture
      setCurrentNote(getLectureNotes(courseId, selectedLecture._id));
    }
  }, [selectedLecture, courseId]);

  // Effect to sync video playback rate with state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const currentIdx = useMemo(
    () => (selectedLecture ? courseLectures.findIndex((l) => l._id === selectedLecture._id) : -1),
    [selectedLecture, courseLectures]
  );
  const goToPrev = () => {
    if (currentIdx > 0) setSelectedLecture(courseLectures[currentIdx - 1]);
  };
  const goToNext = () => {
    if (currentIdx < courseLectures.length - 1) setSelectedLecture(courseLectures[currentIdx + 1]);
  };

  const toggleWatched = useCallback(
    async (lectureId) => {
      try {
        await updateProgress({ courseId, lectureId }).unwrap();
        refetch();
        toast.success(
          watchedLectureIds.includes(lectureId) ? "Lecture marked as unwatched!" : "Lecture marked as watched!"
        );
      } catch (err) {
        toast.error("Failed to update lecture progress.");
        console.error("Error updating lecture progress:", err);
      }
    },
    [courseId, refetch, updateProgress, watchedLectureIds]
  );

  const handleMarkCompleted = useCallback(async () => {
    try {
      await markCompleted(courseId).unwrap();
      refetch();
      toast.success("Course marked as completed!");
      // Open rating modal on completion if not already rated (logic can be improved to check if user already rated)
      setIsRatingModalOpen(true);
    } catch (err) {
      toast.error("Failed to mark course as completed.");
      console.error("Error marking course completed:", err);
    }
  }, [courseId, markCompleted, refetch]);

  const handleMarkInCompleted = useCallback(async () => {
    try {
      await markInCompleted(courseId).unwrap();
      refetch();
      toast.success("Course marked as incomplete!");
    } catch (err) {
      toast.error("Failed to mark course as incomplete.");
      console.error("Error marking course incomplete:", err);
    }
  }, [courseId, markInCompleted, refetch]);

  const handleProgress = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !selectedLecture || watchedLectureIds.includes(selectedLecture._id)) return;
    const percent = (video.currentTime / video.duration) * 100;
    if (!isNaN(percent) && percent >= 50) {
      try {
        await updateProgress({ courseId, lectureId: selectedLecture._id }).unwrap();
        refetch();
      } catch (err) {
        console.error("Error auto-updating lecture progress:", err);
      }
    }
  }, [selectedLecture, watchedLectureIds, courseId, updateProgress, refetch]);

  const handleToggleBookmark = useCallback(
    (lectureId) => {
      const updated = toggleBookmarkLecture(courseId, lectureId);
      setBookmarkedLectures(updated);
      toast.success(updated.includes(lectureId) ? "Lecture bookmarked!" : "Bookmark removed!");
    },
    [courseId]
  );

  const saveNote = useCallback(() => {
    if (selectedLecture) {
      setLectureNotes(courseId, selectedLecture._id, currentNote);
      toast.success("Note saved successfully!");
    }
  }, [courseId, selectedLecture, currentNote]);

  const handleSpeedChange = (e) => {
    setPlaybackRate(parseFloat(e.target.value));
  };

  const handleQualityChange = (e) => {
    setVideoQuality(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-8 text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
            <FiX className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Error loading course</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error.message || "An unknown error occurred."}</p>
          <button
            onClick={() => navigate(`/course/${courseId}`)}
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const sidebarProps = {
    courseLectures,
    selectedLecture,
    setSelectedLecture,
    setSidebarOpen,
    watchedLectureIds,
    bookmarkedLectures,
    handleToggleBookmark,
    completed,
    handleMarkCompleted,
    handleMarkInCompleted,
    markingCompleted,
    markingInCompleted,
    creatorName,
    username,
    courseTitle,
    courseDetails, // Pass the full courseDetails down
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/course/${courseId}`)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition"
              title="Back to Course Details"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-md">
              {courseDetails.courseTitle}
            </h1>
            {/* Rating Display in Header */}
            <div className="hidden md:flex items-center gap-3">
              {completed && (
                <button
                  onClick={() => setIsRatingModalOpen(true)}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Rate this Course
                </button>
              )}
              {courseDetails && (
                <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                  <div className="flex text-yellow-500 text-xs">
                    <Rating rating={courseDetails.averageRating || 0} totalStars={1} readOnly={true} size="text-yellow-500 text-sm" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {courseDetails.averageRating ? courseDetails.averageRating.toFixed(1) : "0.0"}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    ({courseDetails.totalRatings || 0})
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/chat/${courseId}`)}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition"
            >
              <FiMessageSquare className="w-4 h-4" />
              <span>Discussion</span>
            </button>
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <FiMenu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex max-w-[1600px] mx-auto w-full">
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Video Player Section */}
          <div className="bg-black aspect-video w-full relative group">
            {selectedLecture ? (
              selectedLecture.videoUrl ? (
                <video
                  key={selectedLecture._id}
                  ref={videoRef}
                  src={selectedLecture.videoUrl}
                  controls
                  controlsList="nodownload"
                  className="w-full h-full"
                  onTimeUpdate={handleProgress}
                  onContextMenu={(e) => e.preventDefault()}
                  playbackRate={playbackRate}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-900">
                  <FiVideo className="w-12 h-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium">No video content available</p>
                </div>
              )
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-900">
                <FiPlayCircle className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">Select a lecture to start learning</p>
              </div>
            )}
          </div>

          {/* Content Tabs & Details */}
          <div className="flex-1 bg-white dark:bg-slate-900">
            <div className="border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8">
              <div className="flex gap-6 overflow-x-auto no-scrollbar">
                <div className="flex gap-6 overflow-x-auto no-scrollbar">
                  {['overview', 'resources', 'notes'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap capitalize ${activeTab === tab
                        ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-8 max-w-4xl">
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && selectedLecture && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                          {selectedLecture.lectureTitle}
                        </h2>
                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <FiVideo /> {selectedLecture.duration || "10m"}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiCalendar /> Last updated {new Date().toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleWatched(selectedLecture._id)}
                          className={`p-2 rounded-lg border transition ${watchedLectureIds.includes(selectedLecture._id)
                            ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                            }`}
                          title={watchedLectureIds.includes(selectedLecture._id) ? "Mark as Unwatched" : "Mark as Watched"}
                        >
                          {watchedLectureIds.includes(selectedLecture._id) ? <FiCheckCircle className="w-5 h-5" /> : <FiCheckCircle className="w-5 h-5 opacity-50" />}
                        </button>
                        <button
                          onClick={() => handleToggleBookmark(selectedLecture._id)}
                          className={`p-2 rounded-lg border transition ${bookmarkedLectures.includes(selectedLecture._id)
                            ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                            }`}
                          title="Bookmark Lecture"
                        >
                          <FiBookmark className={`w-5 h-5 ${bookmarkedLectures.includes(selectedLecture._id) ? "fill-current" : ""}`} />
                        </button>
                      </div>
                    </div>

                    <div className="prose dark:prose-invert max-w-none">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Description</h3>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {selectedLecture.description || "No description available for this lecture."}
                      </p>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
                      <button
                        onClick={goToPrev}
                        disabled={currentIdx === 0}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${currentIdx === 0
                          ? "text-slate-400 cursor-not-allowed"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                      >
                        <FiChevronLeft /> Previous Lecture
                      </button>
                      <button
                        onClick={goToNext}
                        disabled={currentIdx === courseLectures.length - 1}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition shadow-lg shadow-emerald-500/20 ${currentIdx === courseLectures.length - 1
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                          }`}
                      >
                        Next Lecture <FiChevronRight />
                      </button>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'notes' && (
                  <motion.div
                    key="notes"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="max-w-2xl"
                  >
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4 mb-6 flex gap-3">
                      <FiEdit2 className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-amber-800 dark:text-amber-400 text-sm">Personal Notes</h4>
                        <p className="text-xs text-amber-700 dark:text-amber-500/80 mt-1">
                          These notes are private and only visible to you. They are automatically saved to your browser.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Your notes for: <span className="font-bold text-slate-900 dark:text-white">{selectedLecture?.lectureTitle}</span>
                      </label>
                      <textarea
                        value={currentNote}
                        onChange={(e) => setCurrentNote(e.target.value)}
                        placeholder="Start typing your notes here..."
                        className="w-full h-64 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none transition-shadow shadow-sm"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={saveNote}
                          className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                        >
                          <FiCheckCircle /> Save Notes
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
                {activeTab === 'resources' && (
                  <motion.div
                    key="resources"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/10 border border-indigo-100 dark:border-indigo-800/30 rounded-xl p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      <div className="w-12 h-12 rounded-full bg-white dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-800">
                        <FiDownload className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-800 dark:text-white">Downloadable Resources</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          Access supplementary materials, source code, and assets for this lecture.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {selectedLecture?.resources && selectedLecture.resources.length > 0 ? (
                        selectedLecture.resources.map((resource, idx) => {
                          const downloadUrl = `https://learning-management-system-20d6.onrender.com/api/v1/resource/download/${resource._id}?t=${Date.now()}`;

                          return (
                            <div key={resource._id || idx} className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300">
                              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl shadow-sm ${resource.fileType === 'PDF' ? 'bg-red-50 text-red-500 dark:bg-red-900/20' :
                                  resource.fileType === 'IMG' ? 'bg-blue-50 text-blue-500 dark:bg-blue-900/20' :
                                    'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                                  }`}>
                                  {resource.fileType === 'PDF' ? <FiFileText /> : resource.fileType === 'IMG' ? <FiImage /> : <FiFile />}
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {resource.title}
                                  </h4>
                                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
                                      {resource.fileType || 'FILE'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <a
                                href={downloadUrl}
                                download
                                className="w-full sm:w-auto px-5 py-2.5 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 group/btn cursor-pointer"
                              >
                                <span className="group-hover/btn:-translate-y-0.5 transition-transform"><FiDownload /></span>
                                Download
                              </a>
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex flex-col items-center justify-center py-16 px-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-center">
                          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-300 dark:text-slate-600">
                            <FiDownload className="w-8 h-8" />
                          </div>
                          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No resources available</h3>
                          <p className="text-slate-500 dark:text-slate-500 max-w-sm mt-2 text-sm">
                            The instructor hasn't uploaded any supplementary materials for this particular lecture yet.
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Rating Modal */}
              </AnimatePresence>
            </div>
          </div>
        </main>
        < RatingModal
          isOpen={isRatingModalOpen}
          onClose={() => setIsRatingModalOpen(false)
          }
          courseId={courseId}
        />

        {/* Sidebar (Desktop) */}
        < aside className="hidden lg:block w-96 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-[calc(100vh-64px)] sticky top-16 overflow-hidden" >
          <MemoizedSidebarContent {...sidebarProps} />
        </aside >
      </div >

      {/* Mobile Sidebar Drawer */}
      < AnimatePresence >
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-80 max-w-full bg-white dark:bg-slate-900 shadow-2xl z-50 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Course Content</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <MemoizedSidebarContent {...sidebarProps} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence >

      {/* Floating Chat Button (Mobile) */}
      < button
        onClick={() => navigate(`/chat/${courseId}`)}
        className="fixed right-4 bottom-4 z-30 lg:hidden p-4 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition"
      >
        <FiMessageSquare className="w-6 h-6" />
      </button >
    </div >
  );
}

export default EnrolledCourseLectures;