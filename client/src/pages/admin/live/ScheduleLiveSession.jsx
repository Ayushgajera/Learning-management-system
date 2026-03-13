import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiVideo, FiCalendar, FiClock, FiFileText, FiArrowLeft } from 'react-icons/fi';
import { useGetAllCoursesQuery } from '@/features/api/courseApi';
import { useCreateLiveSessionMutation } from '@/features/api/liveSessionApi';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

function ScheduleLiveSession() {
  const navigate = useNavigate();
  const { data: coursesData, isLoading: loadingCourses } = useGetAllCoursesQuery();
  const [createSession, { isLoading: creating }] = useCreateLiveSessionMutation();

  const [form, setForm] = useState({
    title: '',
    description: '',
    courseId: '',
    scheduledAt: '',
    duration: 60,
  });

  const courses = coursesData?.courses || [];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.courseId || !form.scheduledAt || !form.duration) {
      toast.error('Please fill all required fields.');
      return;
    }

    try {
      await createSession({
        title: form.title,
        description: form.description,
        courseId: form.courseId,
        scheduledAt: form.scheduledAt,
        duration: Number(form.duration),
      }).unwrap();
      toast.success('Live session scheduled successfully!');
      navigate('/admin/live-sessions');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to schedule session.');
    }
  };

  return (
    <div className="p-4 sm:p-8 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <button
          onClick={() => navigate('/admin/live-sessions')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" /> Back to Live Sessions
        </button>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <FiVideo className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Schedule Live Session</h1>
              <p className="text-sm text-slate-500">Set up a live class for your students</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Course Select */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <FiFileText className="inline w-4 h-4 mr-1" /> Course *
              </label>
              <select
                name="courseId"
                value={form.courseId}
                onChange={handleChange}
                disabled={loadingCourses}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">Select a course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>{c.courseTitle}</option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Session Title *
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g., Introduction to React Hooks"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="What will you cover in this session?"
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
              />
            </div>

            {/* Date & Duration Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <FiCalendar className="inline w-4 h-4 mr-1" /> Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="scheduledAt"
                  value={form.scheduledAt}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <FiClock className="inline w-4 h-4 mr-1" /> Duration *
                </label>
                <select
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                  <option value={180}>3 hours</option>
                </select>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={creating}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-400 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all disabled:opacity-60"
            >
              {creating ? 'Scheduling...' : 'Schedule Live Session'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default ScheduleLiveSession;
