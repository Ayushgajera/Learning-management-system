import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiEdit2,
  FiX,
  FiPlus,
  FiTrash2,
  FiLayers,
  FiActivity,
  FiArrowLeft,
  FiBookOpen,
  FiTrendingUp,
  FiPlayCircle,
  FiClipboard,
} from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  useCreateLecturesMutation,
  useGetAllLecturesQuery,
  useRemoveLectureMutation,
} from "@/features/api/courseApi";

function CreateLectures() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [lectureTitle, setLectureTitle] = useState("");
  const [createLectures, { isLoading: isCreating }] = useCreateLecturesMutation();
  const { data: lectureData, isLoading, refetch } = useGetAllLecturesQuery(courseId);
  const [removeLecture, { isLoading: removeLoading }] = useRemoveLectureMutation();

  const lectures = lectureData?.lectures || [];
  const lectureStats = {
    total: lectures.length,
    previewable: lectures.filter((item) => item.isPreviewFree).length,
  };

  const handleDelete = async (lectureId) => {
    try {
      const response = await removeLecture({ lectureId, courseId }).unwrap();
      refetch();
      if (response.success) {
        toast.success("Lecture deleted successfully");
      }
    } catch (error) {
      toast.error(error.data?.message || "Failed to delete lecture");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lectureTitle.trim()) {
      toast.error("Please enter a lecture title");
      return;
    }

    try {
      const response = await createLectures({ lectureTitle, courseId }).unwrap();
      if (response.success) {
        setLectureTitle("");
        toast.success("Lecture created successfully");
        refetch();
      }
    } catch (error) {
      toast.error(error.data?.message || "Failed to create lecture");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-violet-50/40 dark:from-slate-900 dark:via-blue-950/30 dark:to-violet-950/30 p-4 sm:p-6 lg:p-10 transition-colors duration-500">
      <div className="max-w-5xl mx-auto space-y-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(`/admin/courses/edit/${courseId}`)}
          className="inline-flex items-center px-4 py-2 rounded-2xl border border-white/50 bg-white/70 dark:bg-gray-900/40 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-md shadow-blue-500/10"
        >
          <FiArrowLeft className="w-4 h-4 mr-2" />
          Back to course cockpit
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl border border-white/60 dark:border-gray-800/60 shadow-2xl overflow-hidden"
        >
          <div className="relative p-8 pb-6 bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-cyan-500/20">
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <div className="absolute -bottom-12 -right-10 w-72 h-72 bg-blue-400/30 blur-3xl" />
              <div className="absolute -top-16 -left-20 w-64 h-64 bg-violet-400/30 blur-3xl" />
            </div>
            <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/80 dark:bg-gray-900/60 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                  <FiLayers className="w-4 h-4 mr-2" />
                  Lecture Assembly Lab
                </div>
                <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Design the learning flow.</h1>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
                  Batch lectures, balance depth and pacing, and give each milestone a clear unlock. Learners remember sequences—not standalone videos.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/80 dark:bg-gray-900/70 p-4 border border-white/60 dark:border-gray-800/60">
                  <p className="text-xs text-gray-500">Total lectures</p>
                  <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{lectureStats.total}</p>
                  <p className="text-xs text-green-600">Aim for 6-12 per module</p>
                </div>
                <div className="rounded-2xl bg-white/80 dark:bg-gray-900/70 p-4 border border-white/60 dark:border-gray-800/60">
                  <p className="text-xs text-gray-500">Preview unlocked</p>
                  <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{lectureStats.previewable}</p>
                  <p className="text-xs text-blue-600">Best practice: 1 per module</p>
                </div>
                <div className="col-span-2 rounded-2xl border border-dashed border-blue-200 dark:border-blue-800/60 px-4 py-3 text-sm text-blue-800 dark:text-blue-200 flex items-center gap-3">
                  <FiTrendingUp className="w-5 h-5" />
                  Cohorts with consistent pacing drive 18% higher completion.
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <FiBookOpen className="w-4 h-4 text-blue-500" />
                  Name the next lecture
                </label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    value={lectureTitle}
                    onChange={(e) => setLectureTitle(e.target.value)}
                    placeholder="Eg. Rapid prototyping sprint"
                    className="flex-1 px-4 py-3 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-800/60 focus:ring-2 focus:ring-blue-500/50 focus:outline-none text-gray-900 dark:text-gray-100"
                  />
                  <motion.button
                    type="submit"
                    disabled={isCreating}
                    className="inline-flex items-center justify-center px-6 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 shadow-lg disabled:opacity-60"
                    whileHover={{ scale: isCreating ? 1 : 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <FiPlus className="w-4 h-4 mr-2" />
                    {isCreating ? "Adding..." : "Add lecture"}
                  </motion.button>
                </div>
              </form>

              <div className="rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white/70 dark:bg-gray-900/70 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Live lecture list</h2>
                  <span className="text-xs uppercase tracking-wide text-gray-500">{lectureStats.total} checkpoints</span>
                </div>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((idx) => (
                      <div key={idx} className="h-14 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {lectures.length ? (
                      <ul className="space-y-3">
                        {lectures.map((lecture, index) => (
                          <motion.li
                            layout
                            key={lecture._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center justify-between gap-4 px-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-200 flex items-center justify-center font-semibold">
                                {index + 1}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{lecture.lectureTitle}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{lecture.isPreviewFree ? "Preview unlocked" : "Members only"}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => navigate(`${lecture._id}`)}
                                className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-900/40"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                              <button
                                disabled={removeLoading}
                                onClick={() => handleDelete(lecture._id)}
                                className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-900/30"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.li>
                        ))}
                      </ul>
                    ) : (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10 text-gray-500">
                        <FiPlayCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        Sketch your first lecture to unlock module planning.
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-200/60 dark:border-gray-800/60 p-6 bg-white/70 dark:bg-gray-900/70">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  <FiClipboard className="w-4 h-4 text-blue-500" />
                  Module rhythm checklist
                </div>
                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <li>⏱️ Keep lectures under 7 minutes when introducing new concepts.</li>
                  <li>🧩 Group 3-4 lectures into a single learner outcome.</li>
                  <li>🎯 Alternate between instruction, demo, and action.</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-dashed border-indigo-200 dark:border-indigo-800/60 p-6 bg-gradient-to-br from-indigo-50/70 to-purple-50/30 dark:from-indigo-900/30 dark:to-purple-900/10">
                <div className="flex items-center gap-3 mb-3">
                  <FiActivity className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Flow insight</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Trigger an action step every 2 lectures</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-200">
                  Learners retain more when they switch from watching to doing quickly. Pair each new concept with a prompt or worksheet.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default CreateLectures;