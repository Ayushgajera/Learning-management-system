import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
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
  // You can also import Image, Svg, Path if needed
} from "@react-pdf/renderer";
import { toast } from "react-hot-toast";
import CourseChat from './../chat/CourseChat';

// PDF styles for certificate
const styles = StyleSheet.create({
  page: {
    backgroundColor: "#fafafa",
    padding: 40,
    fontFamily: "Helvetica",
    display: "flex",
    flexDirection: "column",
    border: "8 solid #1e3a8a",
  },
  borderInner: {
    border: "4 solid #facc15",
    padding: 30,
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  platformName: {
    position: "absolute",
    top: 20,
    fontSize: 18,
    color: "#1e3a8a",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  heading: {
    fontSize: 42,
    textTransform: "uppercase",
    marginBottom: 12,
    textAlign: "center",
    fontWeight: "bold",
    color: "#1e3a8a",
    letterSpacing: 2,
  },
  decorativeLine: {
    width: "50%",
    borderBottom: "2 solid #facc15",
    marginVertical: 10,
  },
  subHeading: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
    color: "#6b7280",
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginVertical: 10,
    textAlign: "center",
  },
  course: {
    fontSize: 22,
    fontWeight: "semibold",
    color: "#1e3a8a",
    marginVertical: 10,
    textAlign: "center",
  },
  footer: {
    marginTop: 20,
    fontSize: 14,
    textAlign: "center",
    color: "#6b7280",
  },
  signatureArea: {
    marginTop: 50,
    width: "60%",
    alignItems: "center",
  },
  signatureBox: {
    borderBottom: "2 solid #111",
    fontFamily: "Courier-Oblique",
    width: "100%",
    textAlign: "center",
    paddingTop: 5,
    paddingBottom: 3,
    fontSize: 20,
    fontWeight: "bold",
  },
  stampBox: {
    padding: 8,
    marginTop: 5,
    fontSize: 10,
    color: "#1e3a8a",
    textTransform: "uppercase",
  },
});

const MyCertificate = ({
  name = "John Doe",
  course = "React Mastery Bootcamp",
  instructorName = "Jane Smith",
  date = new Date().toLocaleDateString(),
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.borderInner}>
        
        {/* Platform Branding */}
        <Text style={styles.platformName}>EduLearn</Text>

        <Text style={styles.heading}>Certificate of Completion</Text>
        <View style={styles.decorativeLine}></View>
        
        <Text style={styles.subHeading}>This is proudly presented to</Text>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.subHeading}>for successfully completing</Text>
        <Text style={styles.course}>{course}</Text>
        <Text style={styles.footer}>Issued on: {date}</Text>

        {/* Instructor Signature */}
        <View style={styles.signatureArea}>
          <Text style={styles.signatureBox}>{instructorName}</Text>
          <Text style={styles.stampBox}>Official Instructor</Text>
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
  }) => {
    const isBookmarked = useCallback(
      (lectureId) => bookmarkedLectures.includes(lectureId),
      [bookmarkedLectures]
    );
    console.log(creatorName);
    return (
      <div className="bg-white rounded-xl shadow p-6 w-full">
        <h2 className="text-lg font-semibold mb-4 text-emerald-700">Lectures</h2>
        <ul className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {courseLectures.map((lecture) => (
            <li key={lecture._id}>
              <button
                className={`flex items-center w-full gap-2 px-3 py-2 rounded-lg transition group ${
                  selectedLecture && selectedLecture._id === lecture._id
                    ? "bg-emerald-100 text-emerald-700 font-semibold"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
                onClick={() => {
                  setSelectedLecture(lecture);
                  setSidebarOpen(false);
                }}
              >
                <FiPlayCircle className="text-emerald-500" />
                <span className="truncate flex-1 text-left">
                  {lecture?.lectureTitle}
                </span>
                {watchedLectureIds.includes(lecture._id) && (
                  <FiCheckCircle className="text-emerald-500 ml-2" title="Watched" />
                )}
                <button
                  type="button"
                  className={`ml-2 p-1 rounded-full ${
                    isBookmarked(lecture._id) ? "bg-yellow-200" : "bg-gray-100"
                  } hover:bg-yellow-300`}
                  title={isBookmarked(lecture._id) ? "Remove Bookmark" : "Bookmark"}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleBookmark(lecture._id);
                  }}
                  aria-label="Bookmark"
                >
                  <FiBookmark
                    className={isBookmarked(lecture._id) ? "text-yellow-600" : "text-gray-400"}
                  />
                </button>
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-6 text-xs text-gray-400 text-center">
          Progress: {watchedLectureIds.length}/{courseLectures.length} watched
        </div>
        <div className="mt-4 flex flex-col gap-2 items-center">
          {completed ? (
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full font-semibold text-sm">
              <FiAward /> Course Completed!
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-500 rounded-full font-semibold text-sm">
              <FiPlayCircle /> In Progress
            </span>
          )}
          <button
            onClick={completed ? handleMarkInCompleted : handleMarkCompleted}
            className={`mt-2 px-3 py-1 rounded text-xs font-semibold flex items-center gap-2 ${
              completed
                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
            disabled={markingCompleted || markingInCompleted}
          >
            {completed ? <FiRefreshCw /> : <FiCheckCircle />}
            {completed ? "Mark as Incomplete" : "Mark as Completed"}
          </button>
          {completed && (
            <div className="my-8 flex flex-col items-center">
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
                className="mb-4 px-6 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition flex items-center gap-2"
              >
                {({ loading }) => (
                  <>
                    {loading ? (
                      "Generating PDF..."
                    ) : (
                      <>
                        <FiDownload className="w-5 h-5" /> Download Certificate
                      </>
                    )}
                  </>
                )}
              </PDFDownloadLink>
            </div>
          )}
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
  console.log(user?._id);
  console.log(courseId);

  const {
    data: courseData,
    error,
    isLoading,
    refetch,
  } = useGetCourseProgressQuery(courseId);
  const [updateProgress] = useUpdateCourseProgressMutation();
  const [markCompleted, { isLoading: markingCompleted }] = useMarkAsCompletedMutation();
  const [markInCompleted, { isLoading: markingInCompleted }] = useMarkAsInCompletedMutation();

  const courseDetails = courseData?.data?.courseDetails || {};
  const progress = courseData?.data?.progress || [];
  const completed = courseData?.data?.completed || false;
  const courseLectures = Array.isArray(courseDetails.lectures)
    ? courseDetails.lectures
    : [];

  const [bookmarkedLectures, setBookmarkedLectures] = useState([]);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState("");
  const [playbackRate, setPlaybackRate] = useState(1);
  const [videoQuality, setVideoQuality] = useState("auto");

  // Memoize these values to avoid re-computation on every render
  const watchedLectureIds = useMemo(
    () => (Array.isArray(progress) ? progress.filter((lp) => lp.viewed).map((lp) => lp.lectureId) : []),
    [progress]
  );
  const courseTitle = courseDetails.courseTitle || "Course Title";
  console.log(courseDetails?.creator?.name)
  const username = user?.name || user?.username || "Student";
  const creatorName = courseDetails?.creator?.name || "Instructor";


  // Effect to handle initial lecture selection and bookmarks
  useEffect(() => {
    setBookmarkedLectures(getBookmarkedLectures(courseId));
    if (courseLectures.length > 0) {
      let lastWatched = getLastWatchedLecture(courseId);
      let initialLecture = courseLectures.find((l) => l._id === lastWatched);
      if (!initialLecture) {
        initialLecture = courseLectures[0];
      }
      setSelectedLecture(initialLecture);
    }
  }, [courseLectures.length, courseId, courseLectures]);

  // Effect to store the last watched lecture
  useEffect(() => {
    if (selectedLecture) {
      setLastWatchedLecture(courseId, selectedLecture._id);
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

  const openNotesModal = useCallback(() => {
    if (selectedLecture) {
      setCurrentNote(getLectureNotes(courseId, selectedLecture._id));
      setNotesModalOpen(true);
    }
  }, [courseId, selectedLecture]);

  const saveNote = useCallback(() => {
    if (selectedLecture) {
      setLectureNotes(courseId, selectedLecture._id, currentNote);
      setNotesModalOpen(false);
      toast.success("Note saved!");
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white shadow-lg rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error loading course</h2>
          <p className="text-gray-600">{error.message || "An unknown error occurred."}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
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
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pt-10">
      <div className="max-w-6xl mx-auto w-full py-8 px-2 sm:px-6">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-emerald-700 transition"
            aria-label="Back"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-emerald-700">{courseDetails.courseTitle}</h1>

          {/* Chat CTA - header button */}
          <button
            onClick={() => navigate(`/chat/${courseId}`)}
            className="ml-4 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold shadow hover:from-blue-700 hover:to-blue-800 transition flex items-center gap-2"
            title="Open Course Chat"
            aria-label="Open Course Chat"
          >
            <FiMessageSquare className="w-5 h-5" />
            Chat
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <aside className="hidden md:block md:w-1/3">
            <MemoizedSidebarContent {...sidebarProps} />
          </aside>

          <main className="flex-1">
            <div className="md:hidden mb-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold shadow hover:bg-emerald-700 transition"
              >
                <FiMenu className="w-5 h-5" />
                Lectures
              </button>
            </div>

            {sidebarOpen && (
              <div className="fixed inset-0 z-40 flex">
                <div
                  className="fixed inset-0 bg-black bg-opacity-30"
                  onClick={() => setSidebarOpen(false)}
                  aria-hidden="true"
                />
                <div className="relative z-50 w-80 max-w-full h-full bg-white shadow-xl p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-emerald-700">Lectures</h2>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
                      aria-label="Close"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                  <MemoizedSidebarContent {...sidebarProps} setSidebarOpen={setSidebarOpen} />
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow p-6 min-h-[400px] flex flex-col">
              {selectedLecture ? (
                <>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-2">
                    <h2 className="text-xl font-bold text-emerald-700">
                      {selectedLecture.lectureTitle}
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleWatched(selectedLecture._id)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition ${
                          watchedLectureIds.includes(selectedLecture._id)
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {watchedLectureIds.includes(selectedLecture._id) ? (
                          <>
                            <FiEyeOff /> Mark as Unwatched
                          </>
                        ) : (
                          <>
                            <FiEye /> Mark as Watched
                          </>
                        )}
                      </button>
                      <button
                        onClick={openNotesModal}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"
                        title="Add/Edit Notes"
                      >
                        <FiEdit2 /> Notes
                      </button>
                      <button
                        onClick={() => handleToggleBookmark(selectedLecture._id)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium ${
                          bookmarkedLectures.includes(selectedLecture._id)
                            ? "bg-yellow-200 text-yellow-700"
                            : "bg-gray-100 text-gray-600 hover:bg-yellow-100"
                        }`}
                        title={
                          bookmarkedLectures.includes(selectedLecture._id)
                            ? "Remove Bookmark"
                            : "Bookmark"
                        }
                      >
                        <FiBookmark />
                        {bookmarkedLectures.includes(selectedLecture._id)
                          ? "Bookmarked"
                          : "Bookmark"}
                      </button>
                    </div>
                  </div>
                  <p className="mb-4 text-gray-600">{selectedLecture.description}</p>

                  <div className="flex flex-col sm:flex-row items-center gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <label htmlFor="speed" className="text-sm text-gray-700 font-medium">
                        Speed:
                      </label>
                      <select
                        id="speed"
                        value={playbackRate}
                        onChange={handleSpeedChange}
                        className="border rounded px-2 py-1 text-sm"
                      >
                        <option value={0.5}>0.5x</option>
                        <option value={0.75}>0.75x</option>
                        <option value={1}>1x (Normal)</option>
                        <option value={1.25}>1.25x</option>
                        <option value={1.5}>1.5x</option>
                        <option value={2}>2x</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <label htmlFor="quality" className="text-sm text-gray-700 font-medium">
                        Quality:
                      </label>
                      <select
                        id="quality"
                        value={videoQuality}
                        onChange={handleQualityChange}
                        className="border rounded px-2 py-1 text-sm"
                      >
                        <option value="auto">Auto</option>
                        <option value="720p">720p</option>
                        <option value="480p">480p</option>
                        <option value="360p">360p</option>
                      </select>
                    </div>
                  </div>

                  <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4 shadow">
                    {selectedLecture.videoUrl ? (
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
                      <div className="flex items-center justify-center h-full text-gray-400 text-lg font-semibold">
                        No video available for this lecture.
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between mt-auto">
                    <button
                      onClick={goToPrev}
                      disabled={currentIdx === 0}
                      className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition ${
                        currentIdx === 0
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      <FiChevronLeft /> Previous
                    </button>
                    <button
                      onClick={goToNext}
                      disabled={currentIdx === courseLectures.length - 1}
                      className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition ${
                        currentIdx === courseLectures.length - 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      }`}
                    >
                      Next <FiChevronRight />
                    </button>
                  </div>

                  {notesModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative">
                        <button
                          className="absolute top-2 right-2 p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                          onClick={() => setNotesModalOpen(false)}
                          aria-label="Close"
                        >
                          <FiX className="w-5 h-5" />
                        </button>
                        <h3 className="text-lg font-bold mb-2 text-emerald-700">
                          Notes for: {selectedLecture.lectureTitle}
                        </h3>
                        <textarea
                          className="w-full min-h-[120px] border rounded p-2 mb-4"
                          value={currentNote}
                          onChange={(e) => setCurrentNote(e.target.value)}
                          placeholder="Write your notes here..."
                        />
                        <button
                          onClick={saveNote}
                          className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 font-semibold"
                        >
                          Save Note
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-gray-500 text-center py-16">
                  Select a lecture to watch the video.
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      {/* Floating Chat Button (FAB) */}
      <button
        onClick={() => navigate(`/chat/${courseId}`)}
        aria-label="Open Course Chat"
        title="Open Course Chat"
        className="fixed right-6 bottom-6 z-50 flex items-center gap-3 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-2xl hover:scale-105 transform transition focus:outline-none"
      >
        <FiMessageSquare className="w-5 h-5" />
        <span className="hidden sm:inline font-semibold">Open Chat</span>
      </button>

      {/* <CourseChat courseId={courseId} userId={user._id} /> */}

      <footer className="w-full py-4 bg-white border-t text-gray-500 text-center mt-auto">
        &copy; {new Date().getFullYear()} React Mastery Bootcamp &mdash; All rights reserved.
      </footer>
    </div>
  );
}

export default EnrolledCourseLectures;