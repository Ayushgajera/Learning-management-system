import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiVideo, FiTrash2, FiUpload, FiLock, FiSave, FiUnlock } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'sonner';
import { useEditLectureMutation, useGetLectureByIdQuery } from '@/features/api/courseApi';
import { useNavigate, useParams } from 'react-router-dom';

const MEDIA_API = 'http://localhost:8000/api/v1/media';

const EditLecture = () => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [secure_url, setSecureUrl] = useState('');
  const [public_id, setPublicId] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    lectureTitle: '',
    isPreviewFree: true,
    videoUrl: '',
    videoFile: null,
    secure_url: '',
    public_id: '',
  });

  const navigate = useNavigate();
  const { lectureId, courseId } = useParams();
  console.log(lectureId, courseId);

  const [editLecture] = useEditLectureMutation();
  const { data: lecture, isSuccess: lectureSuccess } = useGetLectureByIdQuery({ lectureId, courseId });

  const lectureData = lecture?.lecture;

  useEffect(() => {
    if (lectureSuccess && lectureData) {
      setFormData(prev => ({
        ...prev,
        lectureTitle: lectureData.lectureTitle || '',
        isPreviewFree: lectureData.isPreviewFree || false,
        videoUrl: lectureData.videoUrl || '',
        secure_url: lectureData.secure_url || '',
        public_id: lectureData.public_id || '',
      }));
    }
  }, [lectureSuccess, lectureData]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (file) => {
    if (!file?.type.startsWith('video/')) {
      toast.error('Please upload a valid video file');
      return;
    }

    const MAX_SIZE = 2 * 1024 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error('File size should be less than 2GB');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, videoUrl: previewUrl, videoFile: file }));
    setIsUploading(true);

    const data = new FormData();
    data.append('video', file);

    try {
      const response = await axios.post(`${MEDIA_API}/upload-video`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (event.total) {
            const percent = Math.round((event.loaded * 90) / event.total);
            setUploadProgress(percent);
          }
        },
      });

      for (let i = 91; i <= 100; i++) {
        setUploadProgress(i);
        await new Promise(res => setTimeout(res, 50));
      }

      if (response.data.success) {
        const { secure_url, public_id } = response.data.data;
        setSecureUrl(secure_url);
        setPublicId(public_id);
        setFormData(prev => ({
          ...prev,
          secure_url,
          public_id,
          videoUrl: previewUrl,
        }));
        toast.success('Video uploaded successfully!');
      }
    } catch (error) {
      setFormData(prev => ({ ...prev, videoUrl: '', videoFile: null }));
      URL.revokeObjectURL(previewUrl);
      toast.error(error?.response?.data?.message || 'Upload failed');
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
      const res = await editLecture({
        lectureId,
        courseId,
        lectureTitle: formData.lectureTitle,
        secure_url: secure_url || formData.secure_url || '',
        public_id: public_id || formData.public_id || '',
        isPreviewFree: formData.isPreviewFree,
      }).unwrap();
      

      toast.success("Lecture updated successfully!");
      navigate(-1); // Go back to lecture list
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update lecture");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8"
    >
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6">
          <h1 className="text-2xl font-bold text-white">Edit Lecture</h1>
        </div>

        <form className="p-6 space-y-6" onSubmit={handleSubmit}>
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lecture Title
            </label>
            <input
              type="text"
              value={formData.lectureTitle}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, lectureTitle: e.target.value }))
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Enter lecture title"
            />
          </div>

          {/* Video Upload */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <FiVideo className="w-5 h-5 text-emerald-500" />
                <span className="font-medium text-gray-700">Lecture Video</span>
              </div>
              <button
                type="button"
                onClick={handleUploadClick}
                disabled={isUploading}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 disabled:opacity-50"
              >
                <FiUpload className="w-4 h-4 mr-2" />
                Upload Video
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
                e.target.value = '';
              }}
              accept="video/*"
              className="hidden"
            />

            <div className="border-2 border-dashed rounded-xl p-6">
              {isUploading ? (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">
                      {uploadProgress >= 90 ? 'Processing...' : 'Uploading...'}
                    </span>
                    <span className="text-emerald-600 font-medium">{uploadProgress}%</span>
                  </div>
                  <motion.div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full transition-all duration-300 ${
                        uploadProgress === 100
                          ? 'bg-emerald-500'
                          : uploadProgress >= 90
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${uploadProgress}%` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                  <p className="text-sm text-gray-500">{formData.videoFile?.name}</p>
                </div>
              ) : formData.videoUrl ? (
                <div className="space-y-4">
                  <video
                    className="w-full rounded-lg aspect-video bg-gray-100"
                    controls
                    src={formData.videoUrl}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{formData.videoFile?.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (formData.videoUrl.startsWith('blob:')) {
                          URL.revokeObjectURL(formData.videoUrl);
                        }
                        setFormData(prev => ({
                          ...prev,
                          videoUrl: '',
                          videoFile: null,
                          secure_url: '',
                          public_id: '',
                        }));
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center cursor-pointer" onClick={handleUploadClick}>
                  <FiVideo className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-400 mt-2">Maximum file size: 2GB</p>
                </div>
              )}
            </div>
          </div>

          {/* Free Preview Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-2">
              {formData.isPreviewFree ? (
                <FiUnlock className="w-5 h-5 text-emerald-500" />
              ) : (
                <FiLock className="w-5 h-5 text-gray-500" />
              )}
              <span className="font-medium text-gray-700">Free Preview</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPreviewFree}
                onChange={(e) => setFormData(prev => ({ ...prev, isPreviewFree: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-emerald-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              <FiSave className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default EditLecture;
