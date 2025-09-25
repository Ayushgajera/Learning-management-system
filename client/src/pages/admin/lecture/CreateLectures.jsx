import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiEdit2, FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCreateLecturesMutation, useGetAllLecturesQuery, useRemoveLectureMutation } from '@/features/api/courseApi';

function CreateLectures() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [lectureTitle, setLectureTitle] = useState('');
  const [createLectures] = useCreateLecturesMutation();
  const { data: lectureData, isLoading,refetch } = useGetAllLecturesQuery(courseId);
  const [removeLecture,{data,isLoading:removeLoading,isSuccess}]=useRemoveLectureMutation();
  const handleDelete = async (lectureId) => {
    try {
      const response = await removeLecture({ lectureId, courseId }).unwrap();
      refetch();
      if (response.success) {
        toast.success('Lecture deleted successfully');
      }
    } catch (error) {
      toast.error(error.data?.message || 'Failed to delete lecture');
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="text-gray-500 text-sm">Loading lectures...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lectureTitle.trim()) {
      toast.error('Please enter a lecture title');
      return;
    }

    try {
      const response = await createLectures({ lectureTitle, courseId }).unwrap();
      if (response.success) {
        setLectureTitle('');
        toast.success('Lecture created successfully');
      }
    } catch (error) {
      toast.error(error.data?.message || 'Failed to create lecture');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8"
    >
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Course Lectures</h1>
              <p className="mt-1 text-sm text-gray-500">Add and manage your course lectures</p>
            </div>
            <button
              onClick={() => navigate(`/admin/courses/edit/${courseId}`)}
              className="p-2.5 text-gray-400 hover:text-gray-500 rounded-lg border border-gray-200"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              type="text"
              value={lectureTitle}
              onChange={(e) => setLectureTitle(e.target.value)}
              placeholder="Enter lecture title"
              className="flex-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors duration-200"
            />
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Add Lecture
            </button>
          </form>
        </div>

        <div className="border-t border-gray-200">
          {lectureData?.lectures?.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {lectureData.lectures.map((lecture, index) => (
                <li
                  key={lecture._id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50"
                >
                  <span className="text-sm font-medium text-gray-900">
                    Lecture {index + 1}: {lecture.lectureTitle}
                  </span>
                  <div>
                    <button
                      onClick={() => navigate(`${lecture._id}`)}
                      className="p-2 text-emerald-600 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors duration-200"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={()=>handleDelete(lecture._id)}
                      className="p-2 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors duration-200"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>

                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No lectures added yet. Start by adding your first lecture.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default CreateLectures;