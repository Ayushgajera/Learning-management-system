import React, { useState, useRef, useEffect, useMemo } from 'react';
import HeroSection from './student/herosection';
import Course from './student/Course';
import Footer from '../components/Footer';
import { useGetPublishCourseQuery, useGetTopCoursesQuery } from '@/features/api/courseApi';
import { useGetInstructorsQuery } from '@/features/api/authApi';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useInView, animate } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FiAward,
  FiMessageCircle,
  FiGlobe,
  FiPlayCircle,
  FiUsers,
  FiStar,
  FiArrowRight,
  FiCheckCircle,
  FiZap,
  FiCode,
  FiPenTool,
  FiDatabase,
  FiCpu,
  FiLayout,
  FiDollarSign,
  FiMail,
  FiPlus,
  FiCompass,
  FiBookOpen,
  FiTrendingUp,
} from 'react-icons/fi';

// ─── Data ────────────────────────────────────────────

const features = [
  {
    icon: FiAward,
    title: 'Accredited Outcomes',
    desc: 'Earn industry-recognized certificates that unlock roles at top tech companies. Our credentials are trusted by hiring managers worldwide.',
    large: true,
  },
  {
    icon: FiMessageCircle,
    title: 'Expert Mentorship',
    desc: 'Get direct feedback from senior engineers and designers through live sessions.',
    large: false,
  },
  {
    icon: FiPlayCircle,
    title: 'Project-Based Learning',
    desc: 'Build real-world applications and ship them to production every week.',
    large: false,
  },
  {
    icon: FiGlobe,
    title: 'Global Community',
    desc: 'Connect with 50,000+ learners and alumni from 40+ countries. Collaborate on projects and grow your network across the globe.',
    large: true,
  },
];

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Frontend Developer at Razorpay',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    quote: "LearnGPT's Full Stack course helped me land my dream job. The project-based approach made all the difference in my interview prep.",
    rating: 5,
  },
  {
    name: 'James Lee',
    role: 'ML Engineer at Stripe',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop',
    quote: 'The AI & ML track is phenomenal. I went from basics to deploying production models in just three months.',
    rating: 5,
  },
  {
    name: 'Aisha Johnson',
    role: 'UX Designer at Figma',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop',
    quote: 'Expert mentorship made the difference. Getting direct feedback from senior designers accelerated my growth incredibly.',
    rating: 5,
  },
  {
    name: 'Carlos Mendez',
    role: 'DevOps Engineer at Shopify',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
    quote: 'The hands-on labs and real-world projects prepared me for challenges I face daily at work. Worth every penny.',
    rating: 4,
  },
  {
    name: 'Mei Zhang',
    role: 'Data Analyst at Google',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    quote: "The community aspect is underrated. I've made connections that led to my current role through study groups here.",
    rating: 5,
  },
  {
    name: 'David Kim',
    role: 'Software Engineer at Microsoft',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    quote: 'Self-paced learning with lifetime access means I can revisit complex topics anytime. The content is always kept up to date.',
    rating: 5,
  },
];

const faqs = [
  { q: 'How do I get started?', a: 'Simply create an account, browse our catalog, and enroll in any course. You get instant access to all materials.' },
  { q: 'Are the certificates valid?', a: 'Yes, our certificates are recognized by top tech companies and can be added to your LinkedIn profile.' },
  { q: 'Can I learn at my own pace?', a: 'Absolutely. All our courses are self-paced with lifetime access to the content.' },
  { q: 'Is there a refund policy?', a: 'We offer a 30-day money-back guarantee if you are not satisfied with the course content.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards, UPI, net banking, and popular digital wallets through our secure payment partner.' },
  { q: 'Do you offer team or business plans?', a: 'Yes! We offer custom plans for teams and organizations with volume discounts, admin dashboards, and dedicated support.' },
];

const categories = [
  { icon: FiCode, label: 'Development', count: '120+' },
  { icon: FiPenTool, label: 'Design', count: '85+' },
  { icon: FiDatabase, label: 'Data Science', count: '70+' },
  { icon: FiCpu, label: 'AI & ML', count: '60+' },
  { icon: FiLayout, label: 'Marketing', count: '45+' },
  { icon: FiDollarSign, label: 'Business', count: '55+' },
];

const stats = [
  { label: 'Learners Worldwide', end: 50000, suffix: '+', display: '50,000+' },
  { label: 'Expert-Led Courses', end: 200, suffix: '+', display: '200+' },
  { label: 'Completion Rate', end: 95, suffix: '%', display: '95%' },
  { label: 'Average Rating', end: 4.8, suffix: '', display: '4.8', decimals: 1 },
];

const courseTabs = [
  { id: 'featured', label: 'Featured', icon: FiCompass },
  { id: 'top-rated', label: 'Top Rated', icon: FiStar },
  { id: 'new', label: 'New Arrivals', icon: FiZap },
];

// ─── AnimatedCounter Component ────────────────────────────────────

const AnimatedCounter = ({ end, suffix = '', decimals = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const count = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, end, {
        duration: 2,
        ease: [0.25, 0.1, 0.25, 1],
        onUpdate: (v) => {
          if (decimals > 0) {
            setDisplayValue(v.toFixed(decimals));
          } else {
            setDisplayValue(Math.round(v).toLocaleString());
          }
        },
      });
      return controls.stop;
    }
  }, [isInView, end, decimals, count]);

  return (
    <span ref={ref}>
      {displayValue}{suffix}
    </span>
  );
};

// ─── AvatarPlaceholder Component ────────────────────────────────────

const AvatarPlaceholder = ({ name }) => {
  const hue = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % 360;
  }, [name]);

  const initials = useMemo(() => {
    const parts = (name || 'U').trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0][0]?.toUpperCase() || 'U';
  }, [name]);

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center relative"
      style={{
        background: `linear-gradient(135deg, hsl(${hue}, 40%, 20%) 0%, hsl(${(hue + 40) % 360}, 50%, 15%) 100%)`
      }}
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `radial-gradient(circle at 50% 50%, hsl(${hue}, 60%, 50%) 0%, transparent 50%)`
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(255,255,255,0.02)_48%,rgba(255,255,255,0.02)_52%,transparent_52%)] bg-[size:24px_24px]" />
      <span className="relative text-4xl font-bold text-white/60 font-display select-none tracking-wide">
        {initials}
      </span>
      <FiAward className="relative w-4 h-4 text-white/20 mt-2" />
    </div>
  );
};

// ─── Homepage Component ────────────────────────────────────

const Homepage = () => {
  const { data, isLoading } = useGetPublishCourseQuery();
  const { data: topCoursesData, isLoading: topCoursesLoading } = useGetTopCoursesQuery();
  const {
    data: instructorsData,
    isLoading: instructorsLoading,
    refetch: refetchInstructors,
  } = useGetInstructorsQuery(undefined, { refetchOnMountOrArgChange: true });
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('featured');
  const [openFaq, setOpenFaq] = useState(null);
  const navigate = useNavigate();

  const authRole = useSelector((state) => state?.auth?.user?.role);

  const courses = data?.courses || [];
  const topCourses = topCoursesData?.courses || [];
  const apiInstructors = instructorsData?.instructors || [];

  // Fallback: extract unique instructors from already-fetched courses when API endpoint isn't available
  const instructors = apiInstructors.length > 0
    ? apiInstructors
    : (() => {
        const map = new Map();
        courses.forEach((c) => {
          const cr = c.creator;
          if (!cr || !cr._id) return;
          if (!map.has(cr._id)) {
            map.set(cr._id, {
              _id: cr._id,
              name: cr.name || 'Instructor',
              photoUrl: cr.photoUrl || '',
              instructorLevel: cr.instructorLevel || '',
              totalCourses: 0,
              totalStudents: 0,
              avgRating: 0,
              categories: [],
              _ratingSum: 0,
            });
          }
          const inst = map.get(cr._id);
          inst.totalCourses += 1;
          inst.totalStudents += c.enrolledStudents?.length || 0;
          if (c.averageRating) {
            inst._ratingSum += c.averageRating;
          }
          if (c.category && !inst.categories.includes(c.category)) {
            inst.categories.push(c.category);
          }
        });
        return Array.from(map.values()).map((inst) => ({
          ...inst,
          avgRating: inst.totalCourses > 0 ? Math.round((inst._ratingSum / inst.totalCourses) * 10) / 10 : 0,
        })).sort((a, b) => b.totalStudents - a.totalStudents);
      })();

  // Refetch mentors when role changes (prevents stale RTK Query cache after switching roles)
  useEffect(() => {
    if (!refetchInstructors) return;
    refetchInstructors();
  }, [authRole, refetchInstructors]);

  // Rank mentors: higher reputation first, then level, then students, rating, courses
  const rankedInstructors = useMemo(() => {
    const levelPriority = (level) => {
      const v = String(level || '').toLowerCase();
      if (v.includes('top')) return 3;
      if (v.includes('expert') || v.includes('senior')) return 2;
      if (v.includes('intermediate')) return 1;
      return 0;
    };

    return [...(instructors || [])].sort((a, b) => {
      const scoreA = Number(a?.reputationScore || 0);
      const scoreB = Number(b?.reputationScore || 0);
      if (scoreB !== scoreA) return scoreB - scoreA;

      const lvlA = levelPriority(a?.instructorLevel);
      const lvlB = levelPriority(b?.instructorLevel);
      if (lvlB !== lvlA) return lvlB - lvlA;

      const studentsA = Number(a?.totalStudents || 0);
      const studentsB = Number(b?.totalStudents || 0);
      if (studentsB !== studentsA) return studentsB - studentsA;

      const ratingA = Number(a?.avgRating || 0);
      const ratingB = Number(b?.avgRating || 0);
      if (ratingB !== ratingA) return ratingB - ratingA;

      const coursesA = Number(a?.totalCourses || 0);
      const coursesB = Number(b?.totalCourses || 0);
      if (coursesB !== coursesA) return coursesB - coursesA;

      return String(a?.name || '').localeCompare(String(b?.name || ''));
    });
  }, [instructors]);

  // Derive courses for tabs
  const newCourses = [...courses].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const getTabCourses = () => {
    switch (activeTab) {
      case 'top-rated': return topCourses.slice(0, 8);
      case 'new': return newCourses.slice(0, 8);
      default: return courses.slice(0, 8);
    }
  };

  const tabCourses = getTabCourses();
  const tabLoading = activeTab === 'top-rated' ? topCoursesLoading : isLoading;

  // Instructor section parallax
  const instructorRef = useRef(null);
  const { scrollYProgress: instructorProgress } = useScroll({
    target: instructorRef,
    offset: ['start end', 'end start'],
  });
  const glowY = useTransform(instructorProgress, [0, 1], [-100, 100]);

  // Premium easing
  const premiumEase = [0.25, 0.1, 0.25, 1];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-indigo-500/20">

      {/* ═══ Hero Section ═══ */}
      <HeroSection search={search} setSearch={setSearch} courses={courses} />

      {/* ═══ Social Proof Bar ═══ */}
      <section className="py-16 lg:py-20 border-y border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Animated Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, ease: premiumEase }}
                className="text-center"
              >
                <div className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white font-display tracking-[-0.02em]">
                  <AnimatedCounter end={stat.end} suffix={stat.suffix} decimals={stat.decimals || 0} />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Brand Logos */}
          <div className="pt-8 border-t border-slate-200/50 dark:border-slate-800/50">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.2em] text-center mb-8">Trusted by teams at</p>
            <div className="flex flex-wrap justify-center gap-10 md:gap-16">
              {['Netflix', 'Google', 'Amazon', 'Microsoft', 'Spotify'].map((brand, i) => (
                <motion.span
                  key={brand}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="text-xl md:text-2xl font-bold text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 transition-colors duration-500 cursor-default select-none"
                >
                  {brand}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Featured Courses (Tabbed) ═══ */}
      <section id="courses-section" className="py-32 lg:py-40 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-800/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16 lg:mb-20">
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">Explore Catalog</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mt-3 font-display tracking-[-0.02em] text-balance">
              Featured Courses
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mt-4 max-w-2xl mx-auto leading-[1.75]">
              Handpicked by our team of experts to help you master the most in-demand skills.
            </p>
          </div>

          {/* Tab Bar */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center gap-2 p-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
              {courseTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-6 py-2.5 rounded-full text-sm font-semibold transition-colors duration-300 flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Course Grid with Animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: premiumEase }}
            >
              {tabLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <div key={n} className="h-[360px] rounded-3xl skeleton-shimmer" />
                  ))}
                </div>
              ) : tabCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {tabCourses.map((course) => (
                    <Course key={course._id} course={course} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">No courses found</h3>
                  <p className="text-slate-600 dark:text-slate-400 mt-2">Check back soon for new content.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* View All */}
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/courses')}
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 text-slate-900 dark:text-white font-semibold hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-500"
            >
              View All Courses
              <FiArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══ Why LearnGPT — Bento Grid ═══ */}
      <section className="py-32 lg:py-40 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">Why LearnGPT</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mt-3 mb-5 font-display tracking-[-0.02em] text-balance">
              Why Top Learners Choose Us
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-[1.75]">
              A comprehensive learning ecosystem designed to take you from beginner to industry-ready professional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: feature.large ? 40 : 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: premiumEase }}
                className={`${feature.large ? 'md:col-span-2' : ''} p-8 ${feature.large ? 'p-10' : 'p-8'} rounded-3xl border border-slate-200/60 dark:border-slate-800/60 hover:border-indigo-500/20 transition-all duration-500 group ${
                  feature.large
                    ? 'bg-gradient-to-br from-indigo-50/50 to-violet-50/50 dark:from-indigo-950/20 dark:to-violet-950/20'
                    : 'bg-slate-50 dark:bg-slate-800/30'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 group-hover:scale-110 transition-transform duration-500">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 font-display">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-[1.75]">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Categories ═══ */}
      <section className="py-32 lg:py-40 bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 lg:mb-20 gap-6">
            <div>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">Browse Topics</span>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mt-3 font-display tracking-[-0.02em]">Top Categories</h2>
              <p className="text-slate-600 dark:text-slate-400 mt-3 leading-[1.75]">Explore our most popular learning paths</p>
            </div>
            <button
              onClick={() => navigate('/courses')}
              className="group text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-2 transition-colors"
            >
              View All <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>

          <div className="flex gap-5 overflow-x-auto hide-scrollbar pb-4 snap-x snap-mandatory md:grid md:grid-cols-3 lg:grid-cols-6 md:overflow-visible md:pb-0">
            {categories.map((cat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, ease: premiumEase }}
                whileHover={{ y: -6 }}
                className="min-w-[160px] snap-start flex-shrink-0 md:min-w-0 aspect-[3/4] rounded-3xl p-8 flex flex-col items-center justify-center gap-5 cursor-pointer group relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 hover:border-indigo-500/30 transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/0 to-indigo-500/5 group-hover:from-indigo-500/5 group-hover:to-indigo-500/10 transition-all duration-500" />
                <div className="relative z-10 w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-lg shadow-slate-900/5 dark:shadow-slate-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <cat.icon className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="relative z-10 font-bold text-slate-900 dark:text-white text-center">{cat.label}</span>
                <span className="relative z-10 text-xs text-slate-500 dark:text-slate-400 font-medium">{cat.count} Courses</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Instructors ═══ */}
      <section ref={instructorRef} className="py-24 lg:py-32 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <motion.div
          style={{ y: glowY }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-r from-indigo-500/15 via-violet-500/10 to-purple-500/15 rounded-full blur-[120px]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left — Mentor value prop */}
            <div className="lg:col-span-5">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-[0.2em]">World-Class Mentors</span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mt-3 font-display tracking-[-0.02em] text-balance">
                Get feedback that <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">moves you forward</span>
              </h2>
              <p className="text-slate-300/90 mt-5 leading-[1.85] max-w-xl">
                Learn with mentors who ship products, lead teams, and review real code. Ask questions, get actionable guidance, and build faster with confidence.
              </p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: FiMessageCircle, title: 'Direct feedback', desc: 'Get clear next steps on your work.' },
                  { icon: FiCheckCircle, title: 'Project reviews', desc: 'Improve quality before you ship.' },
                  { icon: FiZap, title: 'Faster progress', desc: 'Unblock quickly with expert eyes.' },
                  { icon: FiGlobe, title: 'Global experience', desc: 'Learn patterns used across teams.' },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ delay: 0.1 + idx * 0.06, ease: premiumEase }}
                    className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-indigo-300 mb-3">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="text-sm font-bold text-white">{item.title}</div>
                    <div className="text-xs text-slate-300/80 mt-1 leading-relaxed">{item.desc}</div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate('/courses')}
                  className="group px-6 py-3 rounded-full bg-white/10 border border-white/15 text-white text-sm font-semibold hover:bg-white/20 transition-all duration-300 backdrop-blur-sm flex items-center gap-2"
                >
                  Explore Courses
                  <FiArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                {rankedInstructors.length > 0 && (
                  <div className="px-4 py-3 rounded-full bg-white/5 border border-white/10 text-sm text-slate-200">
                    <span className="font-semibold text-white">{rankedInstructors.length}</span> mentors featured
                  </div>
                )}
              </div>
            </div>

            {/* Right — Mentor cards */}
            <div className="lg:col-span-7">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <div className="text-sm font-semibold text-slate-200">Featured mentors</div>
                  <div className="text-xs text-slate-400 mt-1">A few of the instructors learners love most.</div>
                </div>
                <button
                  onClick={() => navigate('/courses')}
                  className="group shrink-0 text-indigo-300 hover:text-indigo-200 text-sm font-semibold flex items-center gap-2 transition-colors"
                >
                  Meet all
                  <FiArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>

              <div className="md:container md:mx-auto md:px-0 md:max-w-none">
                {((instructorsLoading || isLoading) && rankedInstructors.length === 0) ? (
                  <div className="flex gap-5 overflow-x-auto hide-scrollbar pb-4 snap-x snap-mandatory md:grid md:grid-cols-2 xl:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <div
                        key={n}
                        className="min-w-[280px] w-[80vw] max-w-[360px] md:min-w-0 md:w-auto snap-start flex-shrink-0 rounded-3xl bg-slate-800/50 border border-slate-700/50 overflow-hidden"
                      >
                        <div className="aspect-[4/3] skeleton-shimmer" />
                        <div className="p-6 space-y-4">
                          <div className="h-5 w-2/3 rounded-md skeleton-shimmer" />
                          <div className="h-3.5 w-1/2 rounded-md skeleton-shimmer" />
                          <div className="flex gap-2">
                            <div className="h-6 w-16 rounded-full skeleton-shimmer" />
                            <div className="h-6 w-20 rounded-full skeleton-shimmer" />
                          </div>
                          <div className="flex gap-6 pt-4 border-t border-slate-700/50">
                            <div className="h-4 w-16 rounded-md skeleton-shimmer" />
                            <div className="h-4 w-20 rounded-md skeleton-shimmer" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : rankedInstructors.length > 0 ? (
                  <div className="flex gap-5 overflow-x-auto hide-scrollbar pb-4 snap-x snap-mandatory md:grid md:grid-cols-2 xl:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0">
                    {rankedInstructors.slice(0, 9).map((instructor, idx) => {
                      const isTopInstructor = instructor.instructorLevel === 'Top Instructor';
                      return (
                        <motion.div
                          key={instructor._id}
                          initial={{ opacity: 0, y: 24 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: '-60px' }}
                          transition={{ delay: idx * 0.06, duration: 0.5, ease: premiumEase }}
                          whileHover={{ y: -6, transition: { duration: 0.3, ease: premiumEase } }}
                          className={`min-w-[280px] w-[80vw] max-w-[360px] md:min-w-0 md:w-auto snap-start flex-shrink-0 group relative rounded-3xl overflow-hidden bg-slate-800/50 backdrop-blur-sm border transition-all duration-500 cursor-pointer hover:shadow-[0_22px_60px_-16px_rgba(99,102,241,0.22)] ${
                            isTopInstructor
                              ? 'border-indigo-500/40 shadow-[0_0_30px_rgba(99,102,241,0.12)]'
                              : 'border-slate-700/50 hover:border-indigo-500/30'
                          }`}
                        >
                          {isTopInstructor && (
                            <div
                              className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.10), rgba(139,92,246,0.06), transparent)' }}
                            />
                          )}

                          <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-indigo-600/20 to-violet-600/20">
                            {instructor.photoUrl ? (
                              <img
                                src={instructor.photoUrl}
                                alt={instructor.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                loading="lazy"
                              />
                            ) : (
                              <AvatarPlaceholder name={instructor.name} />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/35 to-transparent" />

                            {isTopInstructor && (
                              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-400/30 flex items-center gap-1.5">
                                <FiAward className="w-3.5 h-3.5 text-amber-400" />
                                <span className="text-xs font-bold text-amber-300">Top Instructor</span>
                              </div>
                            )}
                          </div>

                          <div className="p-6 space-y-4">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="text-lg font-bold text-white font-display leading-tight group-hover:text-indigo-300 transition-colors duration-300">
                                  {instructor.name}
                                </h3>
                                {instructor.instructorLevel && instructor.instructorLevel !== 'New Instructor' && !isTopInstructor && (
                                  <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                                    <FiCheckCircle className="w-3 h-3 text-indigo-400" />
                                    <span className="text-xs font-medium text-indigo-300">{instructor.instructorLevel}</span>
                                  </div>
                                )}
                              </div>

                              {instructor.avgRating > 0 && (
                                <div className="px-2.5 py-1.5 rounded-full bg-black/35 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                                  <FiStar className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                  <span className="text-xs font-bold text-white">{instructor.avgRating}</span>
                                </div>
                              )}
                            </div>

                            {instructor.categories?.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {instructor.categories.slice(0, 3).map((cat) => (
                                  <span
                                    key={cat}
                                    className="px-2.5 py-1 rounded-full text-xs font-medium text-slate-200 bg-white/5 border border-white/10"
                                  >
                                    {cat}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center gap-4 pt-4 border-t border-slate-700/50">
                              {instructor.totalCourses > 0 && (
                                <div className="flex items-center gap-2 text-sm text-slate-200">
                                  <FiBookOpen className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                  <span className="font-semibold">{instructor.totalCourses}</span>
                                  <span className="text-slate-500 text-xs">{instructor.totalCourses === 1 ? 'course' : 'courses'}</span>
                                </div>
                              )}
                              {instructor.totalStudents > 0 && (
                                <div className="flex items-center gap-2 text-sm text-slate-200">
                                  <FiUsers className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                  <span className="font-semibold">
                                    {instructor.totalStudents >= 1000
                                      ? `${(instructor.totalStudents / 1000).toFixed(1)}k`
                                      : instructor.totalStudents}
                                  </span>
                                  <span className="text-slate-500 text-xs">students</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 px-4 rounded-3xl border border-white/10 bg-white/5">
                    <div className="relative mb-8">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center">
                        <FiUsers className="w-8 h-8 text-indigo-400" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                        <FiStar className="w-3 h-3 text-violet-400" />
                      </div>
                      <div className="absolute -bottom-1 -left-3 w-5 h-5 rounded-full bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
                        <FiBookOpen className="w-2.5 h-2.5 text-indigo-400" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 font-display">No Mentors Yet</h3>
                    <p className="text-slate-400 text-sm text-center max-w-sm mb-6 leading-relaxed">
                      Be among the first to share your expertise and help learners around the world grow.
                    </p>
                    <button
                      onClick={() => navigate('/become-instructor')}
                      className="group px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold hover:from-indigo-700 hover:to-violet-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-2"
                    >
                      Become an Instructor
                      <FiArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Become an Instructor ═══ */}
      <section className="py-32 lg:py-40 bg-white dark:bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-violet-50/50 dark:from-indigo-950/20 dark:via-transparent dark:to-violet-950/20" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
            {/* Left — Visual */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: premiumEase }}
              className="lg:w-[45%] w-full"
            >
              <div className="relative">
                <div className="rounded-3xl overflow-hidden border border-slate-200/60 dark:border-slate-800/60 bg-gradient-to-br from-indigo-600 to-violet-700 p-10 lg:p-14">
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                      {[
                        { value: '50K+', label: 'Students Reached', icon: FiUsers },
                        { value: '$10K+', label: 'Avg. Monthly Earnings', icon: FiTrendingUp },
                        { value: '200+', label: 'Active Instructors', icon: FiAward },
                        { value: '4.8', label: 'Avg. Instructor Rating', icon: FiStar },
                      ].map((stat, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2 + idx * 0.1, ease: premiumEase }}
                          className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10"
                        >
                          <stat.icon className="w-6 h-6 text-indigo-200 mb-3" />
                          <div className="text-2xl font-bold text-white">{stat.value}</div>
                          <div className="text-xs text-indigo-200 font-medium mt-1">{stat.label}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Decorative floating badge */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-5 -right-5 px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 hidden sm:flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <FiCheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Application Approved</p>
                    <p className="text-xs text-slate-500">Start teaching today</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Right — Content */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: premiumEase }}
              className="lg:w-[55%]"
            >
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">Share Your Knowledge</span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mt-3 mb-6 font-display tracking-[-0.02em] text-balance">
                Become an Instructor
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-[1.75] mb-8 max-w-lg">
                Turn your expertise into income. Create courses, reach thousands of learners worldwide, and build your personal brand on LearnGPT.
              </p>

              <ul className="space-y-4 mb-10">
                {[
                  'Set your own pricing and keep the majority of revenue',
                  'Access professional content creation tools and support',
                  'Reach a global audience of 50,000+ active learners',
                  'Get detailed analytics and performance insights',
                ].map((item, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + idx * 0.1, ease: premiumEase }}
                    className="flex items-start gap-3"
                  >
                    <FiCheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">{item}</span>
                  </motion.li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/become-instructor')}
                className="group px-10 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold hover:from-indigo-700 hover:to-violet-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-2"
              >
                Apply Now
                <FiArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ Testimonials ═══ */}
      <section className="py-32 lg:py-40 bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-16 lg:mb-20">
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">Student Stories</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mt-3 font-display tracking-[-0.02em] text-balance">
              Loved by Learners Worldwide
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, ease: premiumEase }}
                className="relative p-8 rounded-3xl bg-white dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800/60 hover:border-indigo-500/20 transition-all duration-500"
              >
                {/* Decorative quote */}
                <div className="absolute top-6 right-8 text-7xl font-display text-indigo-500/10 leading-none select-none">&ldquo;</div>

                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <FiStar key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-slate-700 dark:text-slate-300 leading-[1.75] mb-6 relative z-10">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700" loading="lazy" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{t.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA + Newsletter (Merged) ═══ */}
      <section className="py-32 lg:py-40 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-800">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        {/* Floating orbs */}
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 15, 0], x: [0, -15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/5 rounded-full blur-3xl"
        />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
            {/* Left — CTA */}
            <div className="lg:w-[55%] text-center lg:text-left">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-display tracking-[-0.02em] text-balance">
                Ready to Transform Your Career?
              </h2>
              <p className="text-xl text-indigo-100 max-w-xl mx-auto lg:mx-0 mb-10 leading-[1.75]">
                Join thousands of learners who are already building their future with LearnGPT.
                Get unlimited access to all courses today.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => navigate('/register')}
                  className="px-10 py-4 rounded-full bg-white text-indigo-700 font-bold text-lg hover:bg-indigo-50 transition-colors duration-300 shadow-[0_20px_60px_-15px_rgba(255,255,255,0.3)]"
                >
                  Get Started for Free
                </button>
                <button className="px-10 py-4 rounded-full bg-transparent text-white font-bold text-lg border border-white/30 hover:bg-white/10 transition-colors duration-300 backdrop-blur-sm">
                  View Plans
                </button>
              </div>
            </div>

            {/* Right — Newsletter */}
            <div className="lg:w-[45%] w-full">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-3 font-display">Join our newsletter</h3>
                <p className="text-indigo-100 mb-6 leading-[1.75]">
                  Get weekly insights on learning, career growth, and the latest tech trends.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-indigo-200 focus:outline-none focus:bg-white/15 focus:border-white/40 transition-all duration-300"
                  />
                  <button className="px-8 py-4 rounded-full bg-white text-indigo-700 font-bold hover:bg-indigo-50 transition-colors duration-300 flex items-center justify-center gap-2 whitespace-nowrap">
                    Subscribe <FiMail className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-indigo-200/60 text-sm mt-4">
                  No spam, unsubscribe at any time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FAQ (Accordion) ═══ */}
      <section className="py-32 lg:py-40 bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-20">
            {/* Left — Heading */}
            <div className="lg:w-[40%] lg:sticky lg:top-32 self-start">
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">Support</span>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mt-3 mb-5 font-display tracking-[-0.02em]">
                Frequently Asked Questions
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-[1.75] mb-8">
                Everything you need to know about LearnGPT. Can&apos;t find an answer? Reach out to our support team.
              </p>
              <button className="group inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                <FiMessageCircle className="w-5 h-5" />
                Contact Support
                <FiArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>

            {/* Right — Accordion */}
            <div className="lg:w-[60%]">
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {faqs.map((faq, idx) => (
                  <div key={idx}>
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full flex justify-between items-center py-6 text-left group"
                    >
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white pr-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {faq.q}
                      </h3>
                      <motion.div
                        animate={{ rotate: openFaq === idx ? 45 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex-shrink-0"
                      >
                        <FiPlus className="w-5 h-5 text-indigo-500" />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {openFaq === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: premiumEase }}
                          className="overflow-hidden"
                        >
                          <p className="pb-6 text-slate-600 dark:text-slate-400 leading-[1.75]">{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <Footer />

    </div>
  );
};

export default Homepage;
