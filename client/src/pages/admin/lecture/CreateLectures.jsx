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
  FiFolder,
  FiVideo,
  FiChevronDown,
  FiChevronRight
} from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  useCreateLecturesMutation,
  useRemoveLectureMutation,
} from "@/features/api/courseApi";
import {
  useGetCourseModulesQuery,
  useCreateModuleMutation,
  useDeleteModuleMutation
} from "@/features/api/moduleApi";

function CreateLectures() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // States
  const [newLectureTitle, setNewLectureTitle] = useState("");
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [expandedModules, setExpandedModules] = useState({});
  const [selectedModuleId, setSelectedModuleId] = useState(null);

  // APIs
  const { data: moduleData, isLoading: modulesLoading, refetch: refetchModules } = useGetCourseModulesQuery(courseId);
  const [createModule, { isLoading: isCreatingModule }] = useCreateModuleMutation();
  const [deleteModule] = useDeleteModuleMutation();
  const [createLecture, { isLoading: isCreatingLecture }] = useCreateLecturesMutation();
  const [removeLecture] = useRemoveLectureMutation();

  const modules = moduleData?.modules || [];

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) {
      toast.error("Please enter a module title");
      return;
    }
    try {
      await createModule({ courseId, moduleTitle: newModuleTitle }).unwrap();
      setNewModuleTitle("");
      toast.success("Module created successfully");
      refetchModules();
    } catch (error) {
      toast.error("Failed to create module");
    }
  };

  const handleDeleteModule = async (moduleId) => {
    try {
      await deleteModule(moduleId).unwrap();
      toast.success("Module deleted");
      refetchModules();
    } catch (error) {
      toast.error("Failed to delete module");
    }
  };

  const handleCreateLecture = async (e, moduleId) => {
    e.preventDefault();
    if (!newLectureTitle.trim()) {
      toast.error("Please enter a lecture title");
      return;
    }
    try {
      // HACK: Passing moduleId as courseId because backend route is /:courseId/lectures but logic treats it as parent ID
      await createLecture({ lectureTitle: newLectureTitle, courseId: moduleId }).unwrap();
      setNewLectureTitle("");
      toast.success("Lecture created successfully");
      refetchModules();
    } catch (error) {
      toast.error("Failed to create lecture");
    }
  };

  const handleDeleteLecture = async (lectureId, moduleId) => {
    try {
      // Similar HACK: Passing moduleId as courseId for backend compatibility if needed, 
      // OR simple lecture delete if route is /lectures/:id
      // Check backend: route is /:courseID/lectures/:lectureID
      // So I must pass the PARENT ID (moduleId) as courseId
      await removeLecture({ lectureId, courseId: moduleId }).unwrap();
      toast.success("Lecture deleted");
      refetchModules();
    } catch (error) {
      toast.error("Failed to delete lecture");
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-violet-50/40 dark:from-slate-900 dark:via-blue-950/30 dark:to-violet-950/30 p-4 sm:p-6 lg:p-10 transition-colors duration-500">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(`/admin/courses/edit/${courseId}`)}
          className="inline-flex items-center px-4 py-2 rounded-2xl border border-white/50 bg-white/70 dark:bg-gray-900/40 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-md shadow-blue-500/10"
        >
          <FiArrowLeft className="w-4 h-4 mr-2" />
          Back to course cockpit
        </motion.button>

        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
          {/* Main Content: Modules List */}
          <div className="space-y-6">
            <div className="bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl border border-white/60 dark:border-gray-800/60 p-6 shadow-xl">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <FiLayers className="text-blue-600" /> Course Curriculum
              </h1>


              {/* Add Module Form */}
              <form onSubmit={handleCreateModule} className="mb-8 flex gap-3">
                <input
                  type="text"
                  placeholder="New Module Title..."
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                  disabled={isCreatingModule}
                >
                  {isCreatingModule ? "Creating..." : "Add Module"}
                </button>
              </form>

              {/* Modules List */}
              <div className="space-y-4">
                {modulesLoading ? (
                  <div className="text-center py-10">Loading curriculum...</div>
                ) : modules.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 border border-dashed border-gray-300 rounded-2xl">
                    Start by creating your first module using the form above.
                  </div>
                ) : (
                  modules.map((module, index) => (
                    <div key={module._id} className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-800">
                      <div
                        className="p-4 bg-gray-50 dark:bg-gray-900 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-colors"
                        onClick={() => toggleModule(module._id)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                            {expandedModules[module._id] ? <FiChevronDown /> : <FiChevronRight />}
                          </span>
                          <div>
                            <h3 className="font-bold text-gray-800 dark:text-gray-100">
                              Module {index + 1}: {module.moduleTitle}
                            </h3>
                            <p className="text-xs text-gray-500">{module.lectures?.length || 0} Lectures</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteModule(module._id); }}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>

                      {/* Lectures Area */}
                      <AnimatePresence>
                        {expandedModules[module._id] && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                              {/* Lecture List */}
                              {module.lectures?.map((lecture, lIdx) => (
                                <div key={lecture._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all group">
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-gray-400 w-6">{lIdx + 1}</span>
                                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-lg">
                                      <FiVideo className="w-4 h-4" />
                                    </div>
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">{lecture.lectureTitle}</span>
                                  </div>
                                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => navigate(`${lecture._id}`)}
                                      className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"
                                    >
                                      <FiEdit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteLecture(lecture._id, module._id)}
                                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"
                                    >
                                      <FiTrash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}

                              {/* Add Lecture Input */}
                              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                {selectedModuleId === module._id ? (
                                  <form
                                    onSubmit={(e) => {
                                      handleCreateLecture(e, module._id);
                                      // Don't close immediately to allow multiple adds? Or close? Let's keep open.
                                    }}
                                    className="flex gap-2"
                                  >
                                    <input
                                      autoFocus
                                      type="text"
                                      placeholder="Lecture Title..."
                                      className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500"
                                      value={newLectureTitle}
                                      onChange={(e) => setNewLectureTitle(e.target.value)}
                                    />
                                    <button
                                      type="submit"
                                      disabled={isCreatingLecture}
                                      className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700"
                                    >
                                      Add
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => { setSelectedModuleId(null); setNewLectureTitle(""); }}
                                      className="px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm"
                                    >
                                      Cancel
                                    </button>
                                  </form>
                                ) : (
                                  <button
                                    onClick={() => setSelectedModuleId(module._id)}
                                    className="w-full py-2 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                                  >
                                    <FiPlus /> Add Lecture to {module.moduleTitle}
                                  </button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar: Guidelines */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white/70 dark:bg-gray-900/70 p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
                <FiClipboard className="w-4 h-4 text-blue-500" />
                Structure Tips
              </div>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <li>📂 <b>Modules</b> organize your course into big topics (e.g., "Intro to React").</li>
                <li>🎥 <b>Lectures</b> are the individual videos inside modules.</li>
                <li>✨ Aim for 3-5 modules for a short course.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateLectures;