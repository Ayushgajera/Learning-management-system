import React, { useState } from 'react';
import HeroSection from './student/herosection';
import Course from './student/Course';
import Footer from '../components/Footer';
import { useGetPublishCourseQuery, useGetTopCoursesQuery } from '@/features/api/courseApi';
import { motion } from 'framer-motion';
import {
  FiAward,
  FiMessageCircle,
  FiTrendingUp,
  FiGlobe,
  FiPlayCircle,
  FiUsers,
  FiClock,
  FiLayers,
  FiCompass,
  FiStar,
  FiArrowRight,
  FiCheckCircle,
  FiZap,
  FiLinkedin,
  FiTwitter,
  FiCode,
  FiPenTool,
  FiDatabase,
  FiCpu,
  FiLayout,
  FiDollarSign,
  FiMail
} from 'react-icons/fi';

const features = [
  {
    icon: FiAward,
    title: 'Accredited Outcomes',
    desc: 'Earn industry-recognized certificates that unlock roles at top tech companies.'
  },
  {
    icon: FiMessageCircle,
    title: 'Expert Mentorship',
    desc: 'Get direct feedback from senior engineers and designers through live sessions.'
  },
  {
    icon: FiPlayCircle,
    title: 'Project-Based Learning',
    desc: 'Build real-world applications and ship them to production every week.'
  },
  {
    icon: FiGlobe,
    title: 'Global Community',
    desc: 'Connect with 50,000+ learners and alumni from 40+ countries.'
  },
];

const instructors = [
  {
    name: 'Sarah Chen',
    role: 'Senior Engineer @ Google',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    bio: 'Ex-Google, 10+ years in distributed systems. Led the team that built Google Cloud Spanner.',
  },
  {
    name: 'Alex Rivera',
    role: 'Product Designer @ Airbnb',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    bio: 'Design system architect at Airbnb. Previously at Apple and IDEO.',
  },
  {
    name: 'Michael Chang',
    role: 'Data Scientist @ Netflix',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    bio: 'Building recommendation engines at Netflix. PhD in Machine Learning from Stanford.',
  },
  {
    name: 'Emma Wilson',
    role: 'DevOps Lead @ Amazon',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    bio: 'AWS Community Hero. Expert in Kubernetes, Terraform, and Cloud Native architectures.',
  },
];

const faqs = [
  { q: 'How do I get started?', a: 'Simply create an account, browse our catalog, and enroll in any course. You get instant access to all materials.' },
  { q: 'Are the certificates valid?', a: 'Yes, our certificates are recognized by top tech companies and can be added to your LinkedIn profile.' },
  { q: 'Can I learn at my own pace?', a: 'Absolutely. All our courses are self-paced with lifetime access to the content.' },
  { q: 'Is there a refund policy?', a: 'We offer a 30-day money-back guarantee if you are not satisfied with the course content.' },
];

const Homepage = () => {
  const { data, isLoading } = useGetPublishCourseQuery();
  const { data: topCoursesData, isLoading: topCoursesLoading } = useGetTopCoursesQuery();
  const [search, setSearch] = useState('');
  const courses = data?.courses || [];
  const topCourses = topCoursesData?.courses || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-indigo-500/30">

      {/* Hero Section */}
      <HeroSection search={search} setSearch={setSearch} courses={courses} />

      {/* Top Rated Courses Section */}
      <section className="py-12 bg-indigo-50/50 dark:bg-indigo-900/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
            <div>
              <span className="text-amber-500 font-semibold tracking-wider uppercase text-sm flex items-center gap-2">
                <FiStar className="fill-current" /> Top Rated
              </span>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-2 font-display">
                Student Favorites
              </h2>
            </div>
          </div>

          {topCoursesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-[320px] rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : topCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {topCourses.slice(0, 4).map((course) => (
                <Course key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 opacity-60">
              <p className="text-slate-600 dark:text-slate-400">No top rated courses yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-8">Trusted by engineering teams at</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {['Netflix', 'Google', 'Amazon', 'Microsoft', 'Spotify'].map(brand => (
              <span key={brand} className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FiZap className="w-6 h-6" /> {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Top Categories</h2>
              <p className="text-slate-600 dark:text-slate-400 mt-2">Explore our most popular learning paths</p>
            </div>
            <button className="text-indigo-600 font-semibold hover:text-indigo-700 flex items-center gap-2">
              View All <FiArrowRight />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              {
                icon: FiCode,
                label: 'Development',
                color: 'text-blue-500',
                bg: 'bg-blue-500/10'
              },
              {
                icon: FiPenTool,
                label: 'Design',
                color: 'text-pink-500',
                bg: 'bg-pink-500/10'
              },
              {
                icon: FiDatabase,
                label: 'Data Science',
                color: 'text-emerald-500',
                bg: 'bg-emerald-500/10'
              },
              {
                icon: FiCpu,
                label: 'AI & ML',
                color: 'text-purple-500',
                bg: 'bg-purple-500/10'
              },
              {
                icon: FiLayout,
                label: 'Marketing',
                color: 'text-orange-500',
                bg: 'bg-orange-500/10'
              },
              {
                icon: FiDollarSign,
                label: 'Business',
                color: 'text-cyan-500',
                bg: 'bg-cyan-500/10'
              },
            ].map((cat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-indigo-500/50 transition-colors group"
              >
                <div className={`w-12 h-12 rounded-xl ${cat.bg} ${cat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <cat.icon className="w-6 h-6" />
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">{cat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 font-display">
              Why Top Learners Choose EduLearn
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              We provide a comprehensive learning ecosystem designed to take you from beginner to pro.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:border-indigo-500/30 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section id="courses-section" className="py-24 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-800/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold tracking-wider uppercase text-sm">Explore Catalog</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mt-2 font-display">
                Featured Courses
              </h2>
            </div>
            <button className="px-6 py-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
              View All Courses <FiArrowRight />
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="h-[320px] rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.slice(0, 8).map((course) => (
                <Course key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">No courses found</h3>
              <p className="text-slate-600 dark:text-slate-400 mt-2">Try adjusting your search terms</p>
            </div>
          )}
        </div>
      </section>

      {/* Instructors Section - Redesigned */}
      <section className="py-32 bg-slate-900 relative overflow-hidden">
        {/* Dark theme section for contrast */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <span className="text-indigo-400 font-semibold tracking-wider uppercase text-sm">World-Class Mentors</span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 font-display">
                Learn from the people <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">who built the industry.</span>
              </h2>
            </div>
            <button className="px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors backdrop-blur-sm">
              Meet All Instructors
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {instructors.map((instructor, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="group relative bg-slate-800/50 border border-slate-700 rounded-3xl overflow-hidden backdrop-blur-sm"
              >
                <div className="aspect-[4/5] relative overflow-hidden">
                  <img
                    src={instructor.image}
                    alt={instructor.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />

                  {/* Social Links Overlay */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-10 group-hover:translate-x-0 transition-transform duration-300">
                    <a href="#" className="p-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-indigo-500 transition-colors"><FiLinkedin /></a>
                    <a href="#" className="p-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-sky-500 transition-colors"><FiTwitter /></a>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-white mb-1">{instructor.name}</h3>
                  <p className="text-indigo-400 text-sm font-medium mb-2">{instructor.role}</p>
                  <p className="text-slate-400 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                    {instructor.bio}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600 to-violet-600" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-display">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-10">
            Join thousands of learners who are already building their future with EduLearn.
            Get unlimited access to all courses today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-8 py-4 rounded-full bg-white text-indigo-600 font-bold text-lg hover:bg-indigo-50 transition-colors shadow-xl">
              Get Started for Free
            </button>
            <button className="px-8 py-4 rounded-full bg-indigo-700 text-white font-bold text-lg border border-indigo-500 hover:bg-indigo-800 transition-colors">
              View Pricing
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-12 text-center font-display">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                  <FiMessageCircle className="text-indigo-500" />
                  {faq.q}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 ml-8">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-indigo-600 rounded-3xl p-8 md:p-16 relative overflow-hidden text-center">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-display">
                Join our newsletter
              </h2>
              <p className="text-indigo-100 mb-8 text-lg">
                Get weekly insights on learning, career growth, and the latest tech trends delivered straight to your inbox.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-indigo-200 focus:outline-none focus:bg-white/20 transition-colors"
                />
                <button className="px-8 py-4 rounded-full bg-white text-indigo-600 font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                  Subscribe <FiMail />
                </button>
              </div>
              <p className="text-indigo-200 text-sm mt-4">
                No spam, unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

    </div>
  );
};

export default Homepage;