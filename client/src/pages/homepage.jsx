import React, { useState, useMemo } from 'react';
import HeroSection from "./student/herosection"
import Courses from "./student/Courses"
import { useGetPublishCourseQuery } from '@/features/api/courseApi';
import { motion } from 'framer-motion';
import { FiAward, FiMessageCircle, FiTrendingUp } from 'react-icons/fi';

// Re-using data from the original component
const features = [
  {
    icon: <FiAward className="w-8 h-8 text-white" />,
    title: 'Certification',
    desc: 'Earn industry-recognized certificates to validate your expertise.'
  },
  {
    icon: <FiMessageCircle className="w-8 h-8 text-white" />,
    title: 'Exclusive Community',
    desc: 'Connect with a private network of peers and mentors for guidance.'
  },
  {
    icon: <FiTrendingUp className="w-8 h-8 text-white" />,
    title: 'Career Acceleration',
    desc: 'Our courses are designed to give you a tangible edge in the job market.'
  },
];

const instructors = [
  {
    name: 'Jane Doe',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    title: 'Senior React Instructor',
  },
  {
    name: 'John Smith',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    title: 'Data Science Lead',
  },
  {
    name: 'Emily Clark',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    title: 'UI/UX Designer',
  },
];

const faqs = [
  {
    q: 'How do I enroll in a course?',
    a: 'Simply click on the course you are interested in and follow the enrollment instructions.'
  },
  {
    q: 'Do I get a certificate after completion?',
    a: 'Yes, you will receive a certificate for every course you complete.'
  },
  {
    q: 'Can I access courses on mobile?',
    a: 'Absolutely! Our platform is fully responsive and works on all devices.'
  },
  {
    q: 'Are there any free courses?',
    a: 'Yes, we offer a selection of free courses. Look for the "Free" label.'
  },
];

function Homepage() {
  const [search, setSearch] = useState('');
  const { data, isSuccess, isLoading, isError } = useGetPublishCourseQuery();
  const allCourses = Array.isArray(data?.courses) ? data.courses : [];
  const [openFaq, setOpenFaq] = useState(null);

  const filteredCourses = useMemo(() => {
    if (!search.trim()) return allCourses;
    const term = search.trim().toLowerCase();
    return allCourses.filter(course =>
      (course.courseTitle || '').toLowerCase().includes(term) ||
      (course.category || '').toLowerCase().includes(term)
    );
  }, [search, allCourses]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 bg-gray-100">
        Failed to load courses. Please try again later.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <HeroSection
        search={search}
        setSearch={setSearch}
        filteredCourses={filteredCourses}
      />

      <main className="container mx-auto px-6 -mt-12">
        {/* Why Learn With Us? (Features) */}
        <section className="py-20">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-10 tracking-tight">Why learners choose EduLearn</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, idx) => (
              <motion.div
                key={f.title}
                className="p-6 rounded-2xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800 border border-gray-100 dark:border-gray-700"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-emerald-500 text-white">{f.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold">{f.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{f.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Featured Courses */}
        <div id="courses-section" className="scroll-mt-24">
          <section className="py-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-extrabold">Trending & Exclusive</h2>
              <a href="/courses" className="text-sm text-emerald-500 hover:underline">View all courses</a>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow">
              {filteredCourses.length > 0 ? (
                <Courses courses={filteredCourses.slice(0, 6)} />
              ) : (
                <div className="text-center text-gray-500 py-12 text-lg">No courses found matching your search.</div>
              )}
            </div>
          </section>
        </div>

        {/* Top Instructors */}
        <section className="py-12">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-8">Meet Our Instructors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {instructors.map((inst, idx) => (
              <motion.div
                key={inst.name}
                className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: idx * 0.06 }}
                viewport={{ once: true }}
              >
                <img src={inst.avatar} alt={inst.name} className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-emerald-500/30" />
                <h4 className="font-semibold">{inst.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{inst.title}</p>
                <button className="mt-4 px-6 py-2 bg-emerald-500 text-white rounded-full text-sm font-medium">View Profile</button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-8">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, idx) => (
              <motion.div key={faq.q} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                <button
                  className="w-full text-left p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex justify-between items-center"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  aria-expanded={openFaq === idx}
                  aria-controls={`faq-${idx}`}
                >
                  <span className="font-medium">{faq.q}</span>
                  <svg className={`w-5 h-5 text-emerald-500 transform transition-transform ${openFaq === idx ? 'rotate-45' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                {openFaq === idx && <div id={`faq-${idx}`} className="p-4 text-sm bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700">{faq.a}</div>}
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Newsletter/CTA */}
      <section className="py-12 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-extrabold mb-3">Start learning today</h2>
          <p className="mb-6 max-w-2xl mx-auto">Join thousands of learners and accelerate your career with real projects and mentorship.</p>
          <a href="/courses" className="inline-block px-8 py-3 bg-white text-emerald-600 rounded-full font-semibold">Browse Courses</a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6 text-sm text-gray-600 dark:text-gray-400 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <div className="text-2xl font-bold mb-2">EduLearn</div>
            <div>A modern learning platform focused on projects and mentorship.</div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Company</h4>
            <a href="#" className="block hover:underline">About</a>
            <a href="#" className="block hover:underline">Careers</a>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Support</h4>
            <a href="#" className="block hover:underline">Help Center</a>
            <a href="#" className="block hover:underline">Privacy</a>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Newsletter</h4>
            <form className="flex gap-2">
              <input placeholder="Your email" className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" />
              <button className="px-3 py-2 bg-emerald-500 text-white rounded-lg">Join</button>
            </form>
          </div>
        </div>
        <div className="text-center text-xs mt-8 text-gray-500 dark:text-gray-400">&copy; {new Date().getFullYear()} EduLearn. All rights reserved.</div>
      </footer>
    </div>
  );
}

export default Homepage;