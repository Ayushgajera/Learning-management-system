import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { fetchUser, userRoleChanging, userRoleChanged } from '@/features/authslice';
import Loader from '@/components/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiChevronRight, FiChevronLeft, FiUsers, FiDollarSign, FiTrendingUp, FiTarget, FiGlobe, FiAward, FiBookOpen, FiClock, FiXCircle, FiRefreshCw } from 'react-icons/fi';
import config from '@/config/index';

const QUESTIONS = [
  {
    question: 'How many years of teaching experience do you have?',
    options: ['0-1 years', '2-3 years', '4-6 years', '7+ years'],
    icon: <FiBookOpen className="w-6 h-6" />
  },
  {
    question: 'What is your primary area of expertise?',
    options: ['Web Development', 'Data Science', 'Design', 'Business', 'Other'],
    icon: <FiTarget className="w-6 h-6" />
  },
  {
    question: 'What motivates you to become an instructor?',
    options: ['Share knowledge', 'Earn money', 'Build personal brand', 'Help others grow', 'Other'],
    icon: <FiTrendingUp className="w-6 h-6" />
  },
];

const benefits = [
  {
    icon: <FiUsers className="w-6 h-6 text-indigo-500" />,
    title: "Inspire Learners",
    desc: "Teach what you know and help students explore their interests, gain new skills, and advance their careers."
  },
  {
    icon: <FiDollarSign className="w-6 h-6 text-emerald-500" />,
    title: "Get Rewarded",
    desc: "Expand your professional network, build your expertise, and earn money on each paid enrollment."
  },
  {
    icon: <FiGlobe className="w-6 h-6 text-blue-500" />,
    title: "Global Reach",
    desc: "Publish your course once and reach students from all around the world in our growing community."
  }
];

function BecomeInstructor() {
  const dispatch = useDispatch();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(null));
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState('none'); // none, pending, approved, rejected
  const [rejectionReason, setRejectionReason] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    axios.get(`${config.API_BASE_URL}/api/v1/user/instructor-onboard`, { withCredentials: true })
      .then(res => {
        if (!mounted) return;

        const status = res.data.applicationStatus || 'none';

        // Already approved: switch role and redirect
        if (res.data.onboarded && status === 'approved') {
          (async () => {
            try {
              setSubmitting(true);
              dispatch(userRoleChanging());

              const switchRes = await axios.post(
                `${config.API_BASE_URL}/api/v1/user/instructor-onboard`,
                {},
                { withCredentials: true }
              );

              dispatch(userRoleChanged({ role: switchRes.data.user.role }));
              dispatch(fetchUser());
              navigate('/admin/dashboard', { replace: true });
            } catch (err) {
              console.error(err);
              setError(err.response?.data?.message || 'Failed to switch to instructor. Please try again.');
              dispatch(userRoleChanged({ role: 'student' }));
              setLoading(false);
            } finally {
              setSubmitting(false);
            }
          })();
          return;
        }

        // Pending or rejected: show status
        if (status === 'pending' || status === 'rejected') {
          setApplicationStatus(status);
          setRejectionReason(res.data.rejectionReason || '');
        }

        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => { mounted = false; };
  }, [navigate]);

  const handleOptionClick = (option) => {
    const newAnswers = [...answers];
    newAnswers[step] = option;
    setAnswers(newAnswers);
  };

  const handleContinue = async () => {
    setError(null);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post(
        `${config.API_BASE_URL}/api/v1/user/instructor-onboard`,
        { answers },
        { withCredentials: true }
      );

      // Application submitted - show pending state
      if (res.data.applicationStatus === 'pending') {
        setApplicationStatus('pending');
        setSuccess(true);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReapply = () => {
    setApplicationStatus('none');
    setStep(0);
    setAnswers(Array(QUESTIONS.length).fill(null));
    setSuccess(false);
    setError(null);
  };

  const handlePrevious = () => { if (step > 0) setStep(step - 1); };

  if (loading) return <Loader />;

  // Pending Application State
  if (applicationStatus === 'pending') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 selection:bg-indigo-500/30">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[640px] h-[640px] bg-amber-500/10 rounded-full blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 w-[560px] h-[560px] bg-orange-500/10 rounded-full blur-[110px]" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 shadow-sm overflow-hidden"
          >
            <div className="h-1.5 bg-amber-400" />
            <div className="p-8 sm:p-12 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-200/60 dark:border-amber-700/30"
              >
                <FiClock className="w-10 h-10" />
              </motion.div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Application Pending</h2>
              <p className="mt-4 text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
                Your instructor application has been submitted and is currently under review by our admin team. You'll be notified once a decision is made.
              </p>
              <div className="mt-8 p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/5 border border-amber-200/60 dark:border-amber-500/20">
                <div className="flex items-center justify-center gap-2 text-amber-700 dark:text-amber-400">
                  <FiClock className="w-4 h-4" />
                  <span className="text-sm font-semibold">Waiting for admin approval</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/', { replace: true })}
                className="mt-8 px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:opacity-90 transition-opacity"
              >
                Back to Home
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Rejected Application State
  if (applicationStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 selection:bg-indigo-500/30">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[640px] h-[640px] bg-rose-500/10 rounded-full blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 w-[560px] h-[560px] bg-red-500/10 rounded-full blur-[110px]" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 shadow-sm overflow-hidden"
          >
            <div className="h-1.5 bg-rose-500" />
            <div className="p-8 sm:p-12 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-200/60 dark:border-rose-700/30"
              >
                <FiXCircle className="w-10 h-10" />
              </motion.div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Application Rejected</h2>
              <p className="mt-4 text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
                Unfortunately, your instructor application was not approved at this time.
              </p>
              {rejectionReason && (
                <div className="mt-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/5 border border-rose-200/60 dark:border-rose-500/20 text-left">
                  <p className="text-xs font-semibold text-rose-700 dark:text-rose-400 mb-1">Reason</p>
                  <p className="text-sm text-rose-600 dark:text-rose-300">{rejectionReason}</p>
                </div>
              )}
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  onClick={() => navigate('/', { replace: true })}
                  className="px-6 py-3 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  Back to Home
                </button>
                <button
                  onClick={handleReapply}
                  className="px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:opacity-90 transition-opacity inline-flex items-center gap-2"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  Apply Again
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Normal Onboarding Form
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 selection:bg-indigo-500/30">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[640px] h-[640px] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[560px] h-[560px] bg-violet-500/10 rounded-full blur-[110px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left: Value + Benefits */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-100 dark:border-indigo-800/70">
                <FiAward className="w-4 h-4" />
                Become an Instructor
              </span>
              <h1 className="mt-4 text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white font-display tracking-tight">
                Teach what you know. Build what you want.
              </h1>
              <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                Answer a few quick questions to apply as an instructor. Your application will be reviewed by our admin team.
              </p>
            </motion.div>

            {!success && (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.05 }}
                className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4"
              >
                {benefits.map((benefit) => (
                  <div
                    key={benefit.title}
                    className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                      {benefit.icon}
                    </div>
                    <div className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{benefit.title}</div>
                    <div className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{benefit.desc}</div>
                  </div>
                ))}
              </motion.div>
            )}

            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 shadow-sm p-6">
              <div className="text-sm font-semibold text-slate-900 dark:text-white">What happens next?</div>
              <div className="mt-3 grid sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/60">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Step 1</div>
                  <div className="mt-1 text-sm font-bold text-slate-900 dark:text-white">Complete application</div>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60">
                  <div className="text-xs text-amber-600 dark:text-amber-400">Step 2</div>
                  <div className="mt-1 text-sm font-bold text-slate-900 dark:text-white">Admin reviews & approves</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/60">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Step 3</div>
                  <div className="mt-1 text-sm font-bold text-slate-900 dark:text-white">Start creating courses</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Onboarding Card */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:sticky lg:top-24"
            >
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 shadow-sm overflow-hidden">
                {!success && (
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
                    />
                  </div>
                )}

                <div className="p-6 sm:p-8">
                  {success ? (
                    <div className="text-center py-10">
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                        className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-200/60 dark:border-amber-700/30"
                      >
                        <FiClock className="w-10 h-10" />
                      </motion.div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Application Submitted!</h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-xs mx-auto">Your application is now pending admin approval. We'll notify you once it's reviewed.</p>
                      <button
                        onClick={() => navigate('/', { replace: true })}
                        className="mt-6 px-5 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:opacity-90 transition-opacity"
                      >
                        Back to Home
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                          {QUESTIONS[step].icon}
                          <span className="text-xs font-semibold uppercase tracking-wider">Question {step + 1} of {QUESTIONS.length}</span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">~1 min</div>
                      </div>

                      <h2 className="mt-5 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">{QUESTIONS[step].question}</h2>

                      <div className="mt-6 space-y-3">
                        <AnimatePresence mode="wait">
                          {QUESTIONS[step].options.map((option, idx) => {
                            const selected = answers[step] === option;
                            return (
                              <motion.button
                                key={option}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.06 }}
                                onClick={() => handleOptionClick(option)}
                                className={`w-full p-4 rounded-2xl border text-left transition-colors flex items-center justify-between ${
                                  selected
                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                                    : 'border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                                }`}
                              >
                                <span className="font-semibold">{option}</span>
                                <span
                                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                    selected ? 'border-indigo-600' : 'border-slate-300 dark:border-slate-600'
                                  }`}
                                >
                                  {selected && <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
                                </span>
                              </motion.button>
                            );
                          })}
                        </AnimatePresence>
                      </div>

                      {error && (
                        <div className="mt-5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-300 p-4 rounded-2xl text-sm border border-rose-200/60 dark:border-rose-500/20">
                          {error}
                        </div>
                      )}

                      <div className="mt-8 flex items-center justify-between gap-3 pt-5 border-t border-slate-200/60 dark:border-slate-800/60">
                        <button
                          onClick={handlePrevious}
                          disabled={step === 0 || submitting}
                          className={`px-4 py-2.5 rounded-2xl text-sm font-semibold border transition-colors ${
                            step === 0
                              ? 'opacity-50 cursor-not-allowed border-slate-200/70 dark:border-slate-800/70 text-slate-400'
                              : 'border-slate-200/70 dark:border-slate-800/70 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                          }`}
                        >
                          <span className="inline-flex items-center gap-2"><FiChevronLeft />Back</span>
                        </button>

                        <button
                          onClick={handleContinue}
                          disabled={answers[step] === null || submitting}
                          className="px-5 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="inline-flex items-center gap-2">
                            {submitting ? 'Submitting…' : (step === QUESTIONS.length - 1 ? 'Submit Application' : 'Continue')}
                            {!submitting && <FiChevronRight />}
                          </span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BecomeInstructor;
