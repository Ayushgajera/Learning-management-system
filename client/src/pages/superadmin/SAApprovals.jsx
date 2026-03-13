import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUserCheck, FiUserX, FiClock, FiCheckCircle, FiXCircle,
  FiMessageSquare, FiBookOpen, FiTarget, FiTrendingUp
} from 'react-icons/fi';
import {
  useGetPendingInstructorsQuery,
  useApproveInstructorMutation,
  useRejectInstructorMutation
} from '@/features/api/adminApi';
import { toast } from 'sonner';

const QUESTIONS = [
  'How many years of teaching experience do you have?',
  'What is your primary area of expertise?',
  'What motivates you to become an instructor?',
];

const QUESTION_ICONS = [
  <FiBookOpen className="w-4 h-4 text-indigo-500" />,
  <FiTarget className="w-4 h-4 text-emerald-500" />,
  <FiTrendingUp className="w-4 h-4 text-amber-500" />,
];

const statusConfig = {
  pending: { label: 'Pending', icon: <FiClock className="w-3.5 h-3.5" />, className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' },
  approved: { label: 'Approved', icon: <FiCheckCircle className="w-3.5 h-3.5" />, className: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' },
  rejected: { label: 'Rejected', icon: <FiXCircle className="w-3.5 h-3.5" />, className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' },
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';

function SAApprovals() {
  const [statusFilter, setStatusFilter] = useState('pending');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading } = useGetPendingInstructorsQuery({ status: statusFilter });
  const [approveInstructor, { isLoading: approving }] = useApproveInstructorMutation();
  const [rejectInstructor, { isLoading: rejecting }] = useRejectInstructorMutation();

  const applications = data?.applications || [];

  const handleApprove = async (userId, userName) => {
    try {
      await approveInstructor(userId).unwrap();
      toast.success(`${userName} approved as instructor`);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async () => {
    try {
      await rejectInstructor({ userId: selectedUser._id, reason: rejectReason }).unwrap();
      toast.success(`${selectedUser.name}'s application rejected`);
      setShowRejectModal(false);
      setRejectReason('');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to reject');
    }
  };

  const filters = [
    { key: 'pending', label: 'Pending', icon: <FiClock className="w-4 h-4" /> },
    { key: 'approved', label: 'Approved', icon: <FiCheckCircle className="w-4 h-4" /> },
    { key: 'rejected', label: 'Rejected', icon: <FiXCircle className="w-4 h-4" /> },
    { key: 'all', label: 'All', icon: null },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
          <p className="text-slate-500 animate-pulse">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-display">Instructor Approvals</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Review and approve instructor applications</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3 shadow-sm overflow-x-auto">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${statusFilter === f.key
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            {f.icon}
            {f.label}
          </button>
        ))}
        <div className="ml-auto text-sm text-slate-500 font-medium">
          {applications.length} application{applications.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUserCheck className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 text-lg font-medium">No {statusFilter === 'all' ? '' : statusFilter} applications</p>
          <p className="text-slate-400 text-sm mt-1">Applications will appear here when users apply to become instructors</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((user, i) => {
            const status = statusConfig[user.instructorApplicationStatus] || statusConfig.pending;
            return (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* User Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <img
                      src={user.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=f43f5e&color=fff`}
                      alt="" className="h-14 w-14 rounded-2xl object-cover bg-slate-200"
                    />
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">{user.name}</h3>
                      <p className="text-sm text-slate-500">{user.email}</p>
                      <p className="text-xs text-slate-400 mt-1">Applied: {formatDate(user.instructorApplicationDate)}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border self-start ${status.className}`}>
                    {status.icon}
                    {status.label}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-start md:self-center">
                    <button
                      onClick={() => { setSelectedUser(user); setShowDetailModal(true); }}
                      className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      View Answers
                    </button>
                    {user.instructorApplicationStatus === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(user._id, user.name)}
                          disabled={approving}
                          className="px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-colors disabled:opacity-50"
                        >
                          {approving ? '...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => { setSelectedUser(user); setRejectReason(''); setShowRejectModal(true); }}
                          className="px-4 py-2 text-sm font-semibold rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-sm transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Rejection reason (if rejected) */}
                {user.instructorApplicationStatus === 'rejected' && user.instructorRejectionReason && (
                  <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/5 border border-rose-200 dark:border-rose-500/20 text-sm text-rose-700 dark:text-rose-400">
                    <span className="font-semibold">Rejection reason:</span> {user.instructorRejectionReason}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* View Answers Modal */}
      <AnimatePresence>
        {showDetailModal && selectedUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={selectedUser.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name || 'U')}&background=f43f5e&color=fff`}
                  alt="" className="h-12 w-12 rounded-2xl object-cover"
                />
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedUser.name}</h3>
                  <p className="text-sm text-slate-500">{selectedUser.email}</p>
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <FiMessageSquare className="text-indigo-500" /> Onboarding Answers
              </h4>

              <div className="space-y-4">
                {(selectedUser.instructorOnboardingAnswers || []).map((answer, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      {QUESTION_ICONS[i] || <FiMessageSquare className="w-4 h-4 text-slate-400" />}
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{QUESTIONS[i] || `Question ${i + 1}`}</p>
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-white">{answer}</p>
                  </div>
                ))}
                {(!selectedUser.instructorOnboardingAnswers || selectedUser.instructorOnboardingAnswers.length === 0) && (
                  <p className="text-slate-400 text-center py-4">No answers submitted</p>
                )}
              </div>

              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full mt-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && selectedUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="text-center">
                <div className="w-14 h-14 bg-rose-100 dark:bg-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiUserX className="w-7 h-7 text-rose-600 dark:text-rose-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Reject Application</h3>
                <p className="text-slate-500 text-sm mb-5">{selectedUser.name} ({selectedUser.email})</p>

                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Reason for rejection (optional)..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none mb-5"
                />

                <div className="flex gap-3">
                  <button onClick={() => setShowRejectModal(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleReject} disabled={rejecting}
                    className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-lg shadow-rose-500/20 transition-colors disabled:opacity-70">
                    {rejecting ? 'Rejecting...' : 'Reject'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SAApprovals;
