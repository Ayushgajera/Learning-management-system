import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { fetchUser, userRoleChanging, userRoleChanged } from '@/features/authslice';
import Loader from '@/components/Loader';

const QUESTIONS = [
  {
    question: 'How many years of teaching experience do you have?',
    options: ['0-1 years', '2-3 years', '4-6 years', '7+ years'],
  },
  {
    question: 'What is your primary area of expertise?',
    options: ['Web Development', 'Data Science', 'Design', 'Business', 'Other'],
  },
  {
    question: 'What motivates you to become an instructor?',
    options: ['Share knowledge', 'Earn money', 'Build personal brand', 'Help others grow', 'Other'],
  },
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
    axios.get('http://localhost:8000/api/v1/user/instructor-onboard', { withCredentials: true })
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
        'http://localhost:8000/api/v1/user/instructor-onboard',
        { answers },
        { withCredentials: true }
      );

      // 🔹 Update Redux with new role
      dispatch(userRoleChanged({ role: res.data.user.role }));

      // 🔹 Optionally refetch full user data
      dispatch(fetchUser());

      setSuccess(true);
      setTimeout(() => navigate('/', { replace: true }), 1200);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-neutral-900 p-6">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-emerald-700">Become an Instructor</h2>
          <div className="text-sm text-gray-500">Step {step + 1} of {QUESTIONS.length}</div>
        </div>

        <div className="mb-6">
          <div className="text-lg font-semibold mb-4 dark:text-gray-100">{QUESTIONS[step].question}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUESTIONS[step].options.map(option => {
              const selected = answers[step] === option;
              return (
                <button
                  key={option}
                  onClick={() => handleOptionClick(option)}
                  aria-pressed={selected}
                  className={`p-4 rounded-lg border transition text-left flex items-start gap-3 ${selected ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:shadow-md'}`}
                >
                  <div className={`w-3 h-3 rounded-full mt-1 ${selected ? 'bg-white' : 'bg-emerald-500'}`} />
                  <div>
                    <div className="font-medium">{option}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {error && <div className="text-sm text-red-500 mb-4">{error}</div>}

        <div className="flex items-center justify-between">
          <button onClick={handlePrevious} disabled={step === 0 || submitting} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50">Previous</button>
          <div className="flex items-center gap-3">
            {submitting && <div className="text-sm text-gray-500">Submitting…</div>}
            <button onClick={handleContinue} disabled={answers[step] === null || submitting} className="px-4 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-50">{step === QUESTIONS.length - 1 ? (submitting ? 'Finishing…' : 'Finish') : 'Continue'}</button>
          </div>
        </div>

        {success && <div className="mt-4 text-green-600">Thanks! Redirecting...</div>}
      </div>
    </div>
  );
}

export default BecomeInstructor;
