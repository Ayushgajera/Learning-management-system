import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { fetchUser, userRoleChanging, userRoleChanged } from '@/features/authslice';
import Loader from '@/components/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiChevronRight, FiChevronLeft, FiUsers, FiDollarSign, FiTrendingUp, FiTarget, FiGlobe, FiAward, FiBookOpen } from 'react-icons/fi';

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
  const navigate = useNavigate();

  // 🔹 Check if user already onboarded
  useEffect(() => {
    let mounted = true;
    axios.get('https://learning-management-system-20d6.onrender.com/api/v1/user/instructor-onboard', { withCredentials: true })
      .then(res => {
        if (!mounted) return;
        if (res.data.onboarded) {
          navigate('/', { replace: true });
        } else {
          setLoading(false);
        }
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

    // 🔹 Submit final answers
    setSubmitting(true);
    try {
      // 🔹 Tell Redux that role is changing (prevent flicker)
      dispatch(userRoleChanging());

      const res = await axios.post(
        'https://learning-management-system-20d6.onrender.com/api/v1/user/instructor-onboard',
        { answers },
        { withCredentials: true }
      );

      // 🔹 Update Redux with new role
      dispatch(userRoleChanged({ role: res.data.user.role }));

      // 🔹 Optionally refetch full user data
      dispatch(fetchUser());

      setSuccess(true);
      setTimeout(() => navigate('/', { replace: true }), 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save. Please try again.');
      // 🔹 Revert role change if error occurs
      dispatch(userRoleChanged({ role: 'student' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrevious = () => { if (step > 0) setStep(step - 1); };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-indigo-500/30">

      {/* Hero Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated blobs similar to unauthorized, but subtle */}
        <div className="absolute -top-[20%] -right-[10%] w-[700px] h-[700px] bg-indigo-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-lighten opacity-70 animate-blob" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-lighten opacity-70 animate-blob animation-delay-2000" />
      </div>

      <div className="container mx-auto px-4 py-24 relative z-10">

        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-semibold tracking-wide mb-6 border border-indigo-200 dark:border-indigo-800">
              JOIN OUR INSTRUCTOR TEAM
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 font-display tracking-tight leading-tight">
              Come teach with us
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
              Become an instructor and change lives — including your own.
            </p>
          </motion.div>
        </div>

        {/* Benefits Grid */}
        {!success && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20"
          >
            {benefits.map((benefit, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 p-8 rounded-3xl hover:-translate-y-1 transition-transform duration-300 shadow-sm hover:shadow-lg">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{benefit.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Application Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">

            {/* Progress Bar */}
            {!success && (
              <div className="h-1.5 bg-slate-100 dark:bg-slate-800 w-full absolute top-0 left-0">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                />
              </div>
            )}

            <div className="p-8 md:p-10">
              {success ? (
                <div className="text-center py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <FiCheck className="w-10 h-10" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">You're In!</h2>
                  <p className="text-slate-600 dark:text-slate-400">Welcome to the team. Redirecting you to your dashboard...</p>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-6 text-indigo-600 dark:text-indigo-400">
                      {QUESTIONS[step].icon}
                      <span className="text-sm font-semibold uppercase tracking-wider">Question {step + 1} of {QUESTIONS.length}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">{QUESTIONS[step].question}</h2>

                    <div className="space-y-3">
                      <AnimatePresence mode="wait">
                        {QUESTIONS[step].options.map((option, idx) => {
                          const selected = answers[step] === option;
                          return (
                            <motion.button
                              key={option}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              onClick={() => handleOptionClick(option)}
                              className={`w-full p-5 rounded-xl border-2 text-left transition-all duration-200 flex items-center justify-between group
                                  ${selected
                                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                                  : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                            >
                              <span className="font-semibold text-lg">{option}</span>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                                 ${selected ? 'border-indigo-600' : 'border-slate-300 dark:border-slate-600'}
                               `}>
                                {selected && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
                              </div>
                            </motion.button>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
                      <span>⚠️</span> {error}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={handlePrevious}
                      disabled={step === 0 || submitting}
                      className={`flex items-center gap-2 text-slate-500 font-medium hover:text-slate-800 dark:hover:text-slate-200 transition-colors ${step === 0 ? 'opacity-0 pointer-events-none' : ''}`}
                    >
                      <FiChevronLeft /> Back
                    </button>

                    <button
                      onClick={handleContinue}
                      disabled={answers[step] === null || submitting}
                      className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {submitting ? (
                        <>Processing...</>
                      ) : (
                        <>
                          {step === QUESTIONS.length - 1 ? 'Complete Setup' : 'Continue'}
                          {!submitting && <FiChevronRight />}
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

export default BecomeInstructor;
