import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiVideo, FiPlus, FiCalendar, FiList, FiPlay, FiX, FiEdit2, FiChevronLeft, FiChevronRight, FiClock, FiUsers, FiDownload } from 'react-icons/fi';
import { useGetUpcomingInstructorSessionsQuery, useGetInstructorSessionHistoryQuery, useStartLiveSessionMutation, useCancelLiveSessionMutation } from '@/features/api/liveSessionApi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns';

function InstructorLiveSessions() {
  const navigate = useNavigate();
  const { data, isLoading } = useGetUpcomingInstructorSessionsQuery();
  const [startSession] = useStartLiveSessionMutation();
  const [cancelSession] = useCancelLiveSessionMutation();

  const [activeTab, setActiveTab] = useState('upcoming');
  const [viewMode, setViewMode] = useState('list');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [cancelModal, setCancelModal] = useState(null);

  const { data: historyData, isLoading: historyLoading } = useGetInstructorSessionHistoryQuery(
    { page: 1, limit: 50 },
    { skip: activeTab !== 'history' }
  );

  const sessions = data?.sessions || [];
  const historySessions = historyData?.sessions || [];

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const getSessionsForDay = (day) => {
    return sessions.filter((s) => isSameDay(new Date(s.scheduledAt), day));
  };

  const handleStart = async (sessionId) => {
    try {
      await startSession(sessionId).unwrap();
      toast.success('Session is now live!');
      navigate(`/live-session/${sessionId}`);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to start session.');
    }
  };

  const handleCancel = async () => {
    if (!cancelModal) return;
    try {
      await cancelSession(cancelModal._id).unwrap();
      toast.success('Session cancelled.');
      setCancelModal(null);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to cancel session.');
    }
  };

  const statusBadge = (status) => {
    const map = {
      scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      live: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      ended: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
      cancelled: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    };
    const labels = {
      live: 'LIVE',
      ended: 'Ended',
      cancelled: 'Cancelled',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] || 'bg-slate-100 text-slate-600'}`}>
        {labels[status] || status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const loading = activeTab === 'upcoming' ? isLoading : historyLoading;

  return (
    <div className="p-4 sm:p-8 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <FiVideo className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Live Sessions</h1>
              <p className="text-sm text-slate-500">
                {activeTab === 'upcoming'
                  ? `${sessions.length} upcoming session${sessions.length !== 1 ? 's' : ''}`
                  : `${historySessions.length} past session${historySessions.length !== 1 ? 's' : ''}`
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Tab toggle */}
            <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'upcoming'
                    ? 'bg-indigo-500 text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'history'
                    ? 'bg-indigo-500 text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                History
              </button>
            </div>

            {/* View toggle + Schedule (only for upcoming tab) */}
            {activeTab === 'upcoming' && (
              <>
                <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 text-sm flex items-center gap-1.5 transition-colors ${viewMode === 'list' ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                  >
                    <FiList className="w-4 h-4" /> List
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`px-3 py-2 text-sm flex items-center gap-1.5 transition-colors ${viewMode === 'calendar' ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                  >
                    <FiCalendar className="w-4 h-4" /> Calendar
                  </button>
                </div>
                <button
                  onClick={() => navigate('/admin/live-sessions/schedule')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-400 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all"
                >
                  <FiPlus className="w-4 h-4" /> Schedule New
                </button>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeTab === 'upcoming' ? (
          /* ═══════════════ UPCOMING TAB ═══════════════ */
          viewMode === 'list' ? (
            /* LIST VIEW */
            <div className="space-y-4">
              {sessions.length === 0 ? (
                <div className="text-center py-20">
                  <FiVideo className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                  <p className="text-lg font-semibold text-slate-500">No upcoming live sessions</p>
                  <p className="text-sm text-slate-400 mt-1">Schedule your first live class for your students.</p>
                </div>
              ) : (
                sessions.map((session) => (
                  <motion.div
                    key={session._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-base truncate">{session.title}</h3>
                        {statusBadge(session.status)}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {session.courseId?.courseTitle || 'Unknown Course'}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <FiCalendar className="w-3.5 h-3.5" />
                          {format(new Date(session.scheduledAt), 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiClock className="w-3.5 h-3.5" />
                          {format(new Date(session.scheduledAt), 'h:mm a')} ({session.duration} min)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {session.status === 'live' && (
                        <button
                          onClick={() => navigate(`/live-session/${session._id}`)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors"
                        >
                          <FiPlay className="w-4 h-4" /> Join
                        </button>
                      )}
                      {session.status === 'scheduled' && (
                        <>
                          <button
                            onClick={() => handleStart(session._id)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 transition-colors"
                          >
                            <FiPlay className="w-4 h-4" /> Start
                          </button>
                          <button
                            onClick={() => navigate(`/admin/live-sessions/edit/${session._id}`)}
                            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-500 hover:border-indigo-300 transition-colors"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setCancelModal(session)}
                            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-500 hover:border-red-300 transition-colors"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          ) : (
            /* CALENDAR VIEW */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6">
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-500 hover:border-indigo-300 transition-colors"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-500 hover:border-indigo-300 transition-colors"
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="text-center text-xs font-semibold text-slate-400 py-2">{d}</div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day) => {
                  const daySessions = getSessionsForDay(day);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <div
                      key={day.toISOString()}
                      className={`min-h-[80px] sm:min-h-[100px] p-1.5 rounded-xl border transition-colors ${
                        isToday
                          ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30'
                          : 'border-slate-100 dark:border-slate-800'
                      } ${!isCurrentMonth ? 'opacity-40' : ''}`}
                    >
                      <p className={`text-xs font-semibold mb-1 ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
                        {format(day, 'd')}
                      </p>
                      {daySessions.slice(0, 2).map((s) => (
                        <div
                          key={s._id}
                          onClick={() => s.status === 'live' ? navigate(`/live-session/${s._id}`) : null}
                          className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-md mb-0.5 truncate cursor-pointer ${
                            s.status === 'live'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                              : 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400'
                          }`}
                          title={`${s.title} - ${format(new Date(s.scheduledAt), 'h:mm a')}`}
                        >
                          {format(new Date(s.scheduledAt), 'h:mm a')} {s.title}
                        </div>
                      ))}
                      {daySessions.length > 2 && (
                        <p className="text-[10px] text-slate-400 pl-1">+{daySessions.length - 2} more</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )
        ) : (
          /* ═══════════════ HISTORY TAB ═══════════════ */
          <div className="space-y-4">
            {historySessions.length === 0 ? (
              <div className="text-center py-20">
                <FiClock className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-lg font-semibold text-slate-500">No past sessions</p>
                <p className="text-sm text-slate-400 mt-1">Your ended and cancelled sessions will appear here.</p>
              </div>
            ) : (
              historySessions.map((session) => (
                <motion.div
                  key={session._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-base truncate">{session.title}</h3>
                      {statusBadge(session.status)}
                      {session.recordingUrl && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                          Recording Available
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                      {session.courseId?.courseTitle || 'Unknown Course'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <FiCalendar className="w-3.5 h-3.5" />
                        {format(new Date(session.scheduledAt), 'MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiClock className="w-3.5 h-3.5" />
                        {session.actualDurationMinutes
                          ? `${session.actualDurationMinutes} min (actual)`
                          : `${session.duration} min (scheduled)`
                        }
                      </span>
                      <span className="flex items-center gap-1">
                        <FiUsers className="w-3.5 h-3.5" />
                        {session.participantCount} participant{session.participantCount !== 1 ? 's' : ''}
                      </span>
                      {session.endedAt && (
                        <span className="text-slate-400">
                          Ended {format(new Date(session.endedAt), 'h:mm a')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {session.recordingUrl && (
                      <a
                        href={session.recordingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-500 text-white text-sm font-semibold hover:bg-violet-600 transition-colors"
                      >
                        <FiPlay className="w-4 h-4" /> Watch
                      </a>
                    )}
                    {session.recordingUrl && (
                      <a
                        href={session.recordingUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-violet-500 hover:border-violet-300 transition-colors"
                        title="Download recording"
                      >
                        <FiDownload className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </motion.div>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {cancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setCancelModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-2">Cancel Session?</h3>
              <p className="text-sm text-slate-500 mb-6">
                Are you sure you want to cancel "<strong>{cancelModal.title}</strong>"? This action cannot be undone.
              </p>
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => setCancelModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Keep It
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
                >
                  Cancel Session
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default InstructorLiveSessions;
