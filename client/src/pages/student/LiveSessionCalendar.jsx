import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiChevronLeft, FiChevronRight, FiClock, FiUser, FiPlay, FiVideo, FiX } from 'react-icons/fi';
import { useGetUpcomingStudentSessionsQuery } from '@/features/api/liveSessionApi';
import { useNavigate } from 'react-router-dom';
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

const COURSE_COLORS = [
  'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400',
];

function LiveSessionCalendar() {
  const navigate = useNavigate();
  const { data, isLoading } = useGetUpcomingStudentSessionsQuery();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState(null);

  const sessions = data?.sessions || [];

  // Assign a color per unique courseId
  const courseColorMap = useMemo(() => {
    const map = {};
    let idx = 0;
    sessions.forEach((s) => {
      const cid = s.courseId?._id || s.courseId;
      if (!map[cid]) {
        map[cid] = COURSE_COLORS[idx % COURSE_COLORS.length];
        idx++;
      }
    });
    return map;
  }, [sessions]);

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

  const upcomingSessions = sessions
    .filter((s) => new Date(s.scheduledAt) >= new Date() || s.status === 'live')
    .slice(0, 5);

  return (
    <div className="p-4 sm:p-8 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <FiCalendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Live Classes</h1>
            <p className="text-sm text-slate-500">Upcoming live sessions from your enrolled courses</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="xl:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6">
              {/* Month nav */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-emerald-500 hover:border-emerald-300 transition-colors"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-emerald-500 hover:border-emerald-300 transition-colors"
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
                          ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30'
                          : 'border-slate-100 dark:border-slate-800'
                      } ${!isCurrentMonth ? 'opacity-40' : ''}`}
                    >
                      <p className={`text-xs font-semibold mb-1 ${isToday ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                        {format(day, 'd')}
                      </p>
                      {daySessions.slice(0, 2).map((s) => {
                        const cid = s.courseId?._id || s.courseId;
                        return (
                          <div
                            key={s._id}
                            onClick={() => setSelectedSession(s)}
                            className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-md mb-0.5 truncate cursor-pointer ${
                              s.status === 'live'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 font-semibold'
                                : courseColorMap[cid] || 'bg-slate-100 text-slate-600'
                            }`}
                            title={s.title}
                          >
                            {s.status === 'live' ? 'LIVE ' : ''}{format(new Date(s.scheduledAt), 'h:mm a')} {s.title}
                          </div>
                        );
                      })}
                      {daySessions.length > 2 && (
                        <p className="text-[10px] text-slate-400 pl-1">+{daySessions.length - 2} more</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming List sidebar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <h3 className="text-base font-bold mb-4">Upcoming Sessions</h3>
              {upcomingSessions.length === 0 ? (
                <div className="text-center py-10">
                  <FiVideo className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-sm text-slate-400">No upcoming live sessions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingSessions.map((s) => (
                    <div
                      key={s._id}
                      onClick={() => setSelectedSession(s)}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold truncate flex-1">{s.title}</h4>
                        {s.status === 'live' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            LIVE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate">{s.courseId?.courseTitle || 'Course'}</p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <FiCalendar className="w-3 h-3" />
                          {format(new Date(s.scheduledAt), 'MMM d')}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiClock className="w-3 h-3" />
                          {format(new Date(s.scheduledAt), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Session Detail Modal */}
      <AnimatePresence>
        {selectedSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setSelectedSession(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <FiVideo className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">{selectedSession.title}</h3>
                    {selectedSession.status === 'live' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        LIVE NOW
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => setSelectedSession(null)} className="p-1 text-slate-400 hover:text-slate-600">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {selectedSession.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{selectedSession.description}</p>
              )}

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <FiCalendar className="w-4 h-4 text-slate-400" />
                  <span>{format(new Date(selectedSession.scheduledAt), 'EEEE, MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <FiClock className="w-4 h-4 text-slate-400" />
                  <span>{format(new Date(selectedSession.scheduledAt), 'h:mm a')} ({selectedSession.duration} minutes)</span>
                </div>
                {selectedSession.instructorId && (
                  <div className="flex items-center gap-3 text-sm">
                    <FiUser className="w-4 h-4 text-slate-400" />
                    <div className="flex items-center gap-2">
                      {selectedSession.instructorId.photoUrl ? (
                        <img src={selectedSession.instructorId.photoUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">
                          {selectedSession.instructorId.name?.[0]}
                        </div>
                      )}
                      <span>{selectedSession.instructorId.name}</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <FiVideo className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">{selectedSession.courseId?.courseTitle || 'Course'}</span>
                </div>
              </div>

              {selectedSession.status === 'live' ? (
                <button
                  onClick={() => {
                    setSelectedSession(null);
                    navigate(`/live-session/${selectedSession._id}`);
                  }}
                  className="w-full py-3 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <FiPlay className="w-4 h-4" /> Join Live Session
                </button>
              ) : (
                <div className="text-center py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-sm">
                  Session starts on {format(new Date(selectedSession.scheduledAt), 'MMM d')} at {format(new Date(selectedSession.scheduledAt), 'h:mm a')}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LiveSessionCalendar;
