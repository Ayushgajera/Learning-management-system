import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiVideo,
  FiTrash2,
  FiUpload,
  FiLock,
  FiSave,
  FiUnlock,
  FiArrowLeft,
  FiCheckCircle,
  FiInfo,
  FiClock,
} from "react-icons/fi";
import axios from "axios";
import { toast } from "sonner";
import { useEditLectureMutation, useGetLectureByIdQuery } from "@/features/api/courseApi";
import { useNavigate, useParams } from "react-router-dom";

const MEDIA_API = "http://localhost:8000/api/v1/media";

const uploadTips = [
  "Aim for 1080p MP4/H.264 for best balance of clarity and size.",
  "Keep intros tight—hook within first 12 seconds.",
  "Preview lectures should include a visible action item.",
];

const EditLecture = () => {
  const fileInputRef = useRef(null);
  const [secure_url, setSecureUrl] = useState("");
  const [public_id, setPublicId] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    lectureTitle: "",
    isPreviewFree: true,
    videoUrl: "",
    videoFile: null,
    secure_url: "",
    public_id: "",
  });

  const navigate = useNavigate();
  const { lectureId, courseId } = useParams();

  const [editLecture] = useEditLectureMutation();
  const { data: lecture, isSuccess: lectureSuccess } = useGetLectureByIdQuery({ lectureId, courseId });

  const lectureData = lecture?.lecture;

  useEffect(() => {
    if (lectureSuccess && lectureData) {
      setFormData((prev) => ({
        ...prev,
        lectureTitle: lectureData.lectureTitle || "",
        isPreviewFree: lectureData.isPreviewFree || false,
        videoUrl: lectureData.videoUrl || "",
        secure_url: lectureData.secure_url || "",
        public_id: lectureData.public_id || "",
      }));
    }
  }, [lectureSuccess, lectureData]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (file) => {
    if (!file?.type.startsWith("video/")) {
      toast.error("Please upload a valid video file");
      return;
    }

    const MAX_SIZE = 2 * 1024 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error("File size should be less than 2GB");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, videoUrl: previewUrl, videoFile: file }));
    setIsUploading(true);

    const data = new FormData();
    data.append("video", file);

    try {
      const response = await axios.post(`${MEDIA_API}/upload-video`, data, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          if (event.total) {
            const percent = Math.round((event.loaded * 90) / event.total);
            setUploadProgress(percent);
          }
        },
      });

      for (let i = 91; i <= 100; i++) {
        setUploadProgress(i);
        await new Promise((res) => setTimeout(res, 50));
      }

      if (response.data.success) {
        const { secure_url, public_id } = response.data.data;
        setSecureUrl(secure_url);
        setPublicId(public_id);
        setFormData((prev) => ({
          ...prev,
          secure_url,
          public_id,
          videoUrl: previewUrl,
        }));
        toast.success("Video uploaded successfully!");
      }
    } catch (error) {
      setFormData((prev) => ({ ...prev, videoUrl: "", videoFile: null }));
      URL.revokeObjectURL(previewUrl);
      toast.error(error?.response?.data?.message || "Upload failed");
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.lectureTitle.trim()) {
      toast.error("Lecture title is required");
      return;
    }

    try {
      await editLecture({
        lectureId,
        courseId,
        lectureTitle: formData.lectureTitle,
        secure_url: secure_url || formData.secure_url || "",
        public_id: public_id || formData.public_id || "",
        isPreviewFree: formData.isPreviewFree,
      }).unwrap();

      toast.success("Lecture updated successfully!");
      navigate(-1);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update lecture");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/35 to-emerald-50/35 dark:from-slate-950 dark:via-emerald-950/30 dark:to-slate-900/40 p-4 sm:p-6 lg:p-10 transition-colors duration-500">
      <div className="max-w-5xl mx-auto space-y-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-white/50 bg-white/80 dark:bg-gray-900/50 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-md shadow-emerald-500/10"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to lectures
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/85 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl border border-white/60 dark:border-gray-800/60 shadow-2xl overflow-hidden"
        >
          <div className="relative p-8 bg-gradient-to-r from-emerald-500/15 via-cyan-500/15 to-green-500/15">
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <div className="absolute -top-16 -right-24 w-64 h-64 bg-emerald-400/30 blur-3xl" />
              <div className="absolute -bottom-20 -left-10 w-72 h-72 bg-cyan-400/30 blur-3xl" />
            </div>
            <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <p className="inline-flex items-center px-4 py-2 rounded-full bg-white/70 dark:bg-gray-900/60 text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  <FiCheckCircle className="w-4 h-4 mr-2" />
                  Lecture Builder
                </p>
                <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Polish the experience, not just the file.</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Use this cockpit to refresh the lecture title, update the media asset, and toggle what gets unlocked for students previewing the course.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl p-4 bg-white/80 dark:bg-gray-900/70 border border-white/60 dark:border-gray-800/60">
                  <p className="text-xs text-gray-500">Preview access</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{formData.isPreviewFree ? "Unlocked" : "Gated"}</p>
                  <p className="text-xs text-emerald-600">Control conversion moments</p>
                </div>
                <div className="rounded-2xl p-4 bg-white/80 dark:bg-gray-900/70 border border-white/60 dark:border-gray-800/60">
                  <p className="text-xs text-gray-500">Upload status</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{isUploading ? "Processing" : formData.videoUrl ? "Ready" : "Pending"}</p>
                  <p className="text-xs text-gray-500">2GB limit · MP4 recommended</p>
                </div>
              </div>
            </div>
          </div>

          <form className="p-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]" onSubmit={handleSubmit}>
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Lecture title</label>
                <input
                  type="text"
                  value={formData.lectureTitle}
                  onChange={(e) => setFormData((prev) => ({ ...prev, lectureTitle: e.target.value }))}
                  placeholder="Eg. Building trust with rapid wins"
                  className="w-full px-4 py-3 rounded-2xl bg-white/90 dark:bg-gray-800/70 border border-gray-200/60 dark:border-gray-800/60 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                    <FiVideo className="w-4 h-4 text-emerald-500" />
                    Lecture video
                  </div>
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    disabled={isUploading}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-900/40 disabled:opacity-60"
                  >
                    <FiUpload className="w-4 h-4" />
                    Upload new file
                  </button>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                    e.target.value = "";
                  }}
                  accept="video/*"
                  className="hidden"
                />

                <div className="rounded-3xl border-2 border-dashed border-emerald-200 dark:border-emerald-900/50 p-6 bg-gradient-to-br from-white via-emerald-50/40 to-white dark:from-gray-900 dark:via-emerald-950/20 dark:to-gray-900">
                  {isUploading ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm font-semibold text-gray-600 dark:text-gray-300">
                        <span>{uploadProgress >= 90 ? "Processing..." : "Uploading..."}</span>
                        <span className="text-emerald-600">{uploadProgress}%</span>
                      </div>
                      <motion.div className="h-2.5 bg-emerald-100/70 dark:bg-emerald-900/40 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${uploadProgress === 100 ? "bg-emerald-500" : uploadProgress >= 90 ? "bg-yellow-400" : "bg-teal-500"}`}
                          style={{ width: `${uploadProgress}%` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                        />
                      </motion.div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formData.videoFile?.name}</p>
                    </div>
                  ) : formData.videoUrl ? (
                    <div className="space-y-4">
                      <video className="w-full rounded-2xl aspect-video bg-gray-900/10" controls src={formData.videoUrl} />
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>{formData.videoFile?.name || "Existing upload"}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (formData.videoUrl.startsWith("blob:")) {
                              URL.revokeObjectURL(formData.videoUrl);
                            }
                            setFormData((prev) => ({
                              ...prev,
                              videoUrl: "",
                              videoFile: null,
                              secure_url: "",
                              public_id: "",
                            }));
                          }}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                        >
                          <FiTrash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center" onClick={handleUploadClick}>
                      <FiVideo className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                      <p className="text-gray-700 dark:text-gray-300 font-medium">Drag & drop or click to add media</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">MP4 · up to 2GB · vertical safe zones auto applied</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 p-5 bg-gray-50/80 dark:bg-gray-900/70">
                <div className="flex items-center gap-3">
                  {formData.isPreviewFree ? (
                    <FiUnlock className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <FiLock className="w-5 h-5 text-gray-500" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Free preview toggle</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Preview lessons build trust before checkout</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPreviewFree}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isPreviewFree: e.target.checked }))}
                    className="sr-only"
                  />
                  <span className="w-12 h-6 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center px-1 transition-colors duration-300"
                    style={{ justifyContent: formData.isPreviewFree ? "flex-end" : "flex-start", backgroundColor: formData.isPreviewFree ? "#10b981" : undefined }}>
                    <span className="w-5 h-5 bg-white rounded-full shadow" />
                  </span>
                </label>
              </div>

              <div className="flex flex-wrap gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-5 py-2.5 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 text-gray-600 dark:text-gray-300 bg-white/70 dark:bg-gray-900/60"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={isUploading}
                  whileHover={{ scale: isUploading ? 1 : 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 shadow-lg disabled:opacity-60"
                >
                  <FiSave className="w-4 h-4" />
                  Save changes
                </motion.button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white/75 dark:bg-gray-900/70 p-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
                  <FiInfo className="w-4 h-4 text-emerald-500" />
                  Lecture signals
                </div>
                <dl className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center justify-between">
                    <dt>Current title</dt>
                    <dd className="text-gray-900 dark:text-gray-100 font-medium">{formData.lectureTitle || "Untitled"}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt>Preview status</dt>
                    <dd className="font-medium text-emerald-600">{formData.isPreviewFree ? "Open" : "Members"}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt>Video asset</dt>
                    <dd className="font-medium">{formData.videoUrl ? "Attached" : "Missing"}</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-2xl border border-dashed border-emerald-200 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50/80 to-white dark:from-emerald-900/30 dark:to-gray-900 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <FiClock className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Delivery cues</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Fast-track the record → upload loop</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  {uploadTips.map((tip) => (
                    <li key={tip} className="flex items-start gap-2">
                      <FiCheckCircle className="w-4 h-4 mt-0.5 text-emerald-500" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditLecture;
