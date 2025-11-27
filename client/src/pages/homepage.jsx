import React, { useState, useMemo } from 'react';
import HeroSection from './student/herosection';
import Course from './student/Course';
import { useGetPublishCourseQuery } from '@/features/api/courseApi';
import { useLoaduserQuery } from '@/features/api/authApi';
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
} from 'react-icons/fi';

const features = [
  {
    icon: <FiAward className="w-6 h-6" />,
    title: 'Accredited outcomes',
    desc: 'Stackable credentials that unlock roles at top product companies.'
  },
  {
    icon: <FiMessageCircle className="w-6 h-6" />,
    title: 'Mentor office hours',
    desc: 'Live weekly breakdowns, async feedback loops, and design crits.'
  },
  {
    icon: <FiPlayCircle className="w-6 h-6" />,
    title: 'Ritualized shipping',
    desc: 'Weekly demo tapes and progress rituals keep momentum high.'
  },
  {
    icon: <FiGlobe className="w-6 h-6" />,
    title: 'Global community',
    desc: 'Collaborate with builders in 42 countries with moderated pods.'
  },
];

const instructors = [
  { name: 'Jane Doe', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', title: 'Principal Product Engineer · Linear' },
  { name: 'John Smith', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', title: 'Data Science Lead · Spotify' },
  { name: 'Emily Clark', avatar: 'https://randomuser.me/api/portraits/women/68.jpg', title: 'Design Director · Figma' },
];

const faqs = [
  { q: 'How do I enroll in a course?', a: 'Browse a curriculum, hit enroll, and you will be onboarded into the next live sprint instantly.' },
  { q: 'Do I get a certificate after completion?', a: 'Yes. Each programme ships with verified certificates plus portfolio assets.' },
  { q: 'Can I access courses on mobile?', a: 'Absolutely—the entire experience is optimized for desktop, tablet, and mobile.' },
  { q: 'Are there any free courses?', a: 'We host multiple free micro-sprints every month so you can sample the experience before committing.' },
];

const formatINR = (value) => {
  if (!value || Number.isNaN(Number(value))) return '₹ —';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value));
};

const statPills = [
  { label: 'Average completion rate', value: '94%', detail: '+6% QoQ' },
  { label: 'Community messages / week', value: '18K', detail: 'real-time collabs' },
  { label: 'Hiring partners', value: '210+', detail: 'global product teams' },
  { label: 'Scholarships funded', value: '$3.2M', detail: 'creator-first capital' },
];

const journeySteps = [
  {
    title: '01 · Discover',
    caption: 'Baseline your skills with async primers, product briefs, and curated warmups.',
    meta: 'Week 0',
    icon: FiLayers,
  },
  {
    title: '02 · Sprint',
    caption: 'Join live mentor rooms, pair-build micro products, and ship progress reports.',
    meta: 'Weeks 1-4',
    icon: FiPlayCircle,
  },
  {
    title: '03 · Showcase',
    caption: 'Package your builds into case studies, shadow hiring managers, and rehearse interviews.',
    meta: 'Week 5',
    icon: FiTrendingUp,
  },
  {
    title: '04 · Placement',
    caption: 'Tap into referral pods, async mock loops, and matched hiring partners.',
    meta: 'Week 6+',
    icon: FiCompass,
  },
];

const testimonials = [
  {
    quote:
      'I rebuilt my entire workflow through the async + live cadence. The mentor feedback loops mirrored top-tier product orgs.',
    name: 'Riya Mehta',
    title: 'Product Designer · Framer',
    avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
  },
  {
    quote:
      'The weekly demo tapes forced us to ship. I converted two offers within three weeks of showcasing my sprint artifacts.',
    name: 'Marcus Hill',
    title: 'Full-stack Engineer · Vercel',
    avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
  },
  {
    quote:
      'EduLearn feels like a modern studio more than a traditional LMS. Everything is high fidelity—from briefs to critique.',
    name: 'Ananya Rao',
    title: 'AI Researcher · ElevenLabs',
    avatar: 'https://randomuser.me/api/portraits/women/81.jpg',
  },
];

function Homepage() {
  const [search, setSearch] = useState('');
  const { data, isLoading, isError } = useGetPublishCourseQuery();
  const allCourses = Array.isArray(data?.courses) ? data.courses : [];
  const [openFaq, setOpenFaq] = useState(null);
  const { data: userData } = useLoaduserQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const enrolledCourseIds = userData?.user?.enrolledCourses ?? [];

  const isCoursePurchased = (courseId) => enrolledCourseIds.includes(courseId);

  const filteredCourses = useMemo(() => {
    if (!search.trim()) return allCourses;
    const term = search.trim().toLowerCase();
    return allCourses.filter(
      (course) =>
        (course.courseTitle || '').toLowerCase().includes(term) ||
        (course.category || '').toLowerCase().includes(term)
    );
  }, [search, allCourses]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="animate-spin rounded-full h-14 w-14 border-2 border-indigo-200 border-t-indigo-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-rose-500 bg-background">
        Failed to load courses. Please try again later.
      </div>
    );
  }

  const featuredCourses = filteredCourses.slice(0, 4);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-48 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-500/30 via-sky-400/20 to-emerald-400/20 blur-[160px]"
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-[-120px] right-[-80px] h-[360px] w-[360px] rounded-full bg-gradient-to-br from-violet-500/30 via-indigo-500/15 to-transparent blur-[180px]"
        animate={{ scale: [1, 0.9, 1], rotate: [0, 12, -8, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      <HeroSection search={search} setSearch={setSearch} filteredCourses={filteredCourses} />

      <section className="relative z-10 w-full overflow-hidden border-y border-white/70 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60">
        <motion.div
          className="flex min-w-full gap-6 py-5"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        >
          {[...statPills, ...statPills].map((pill, idx) => (
            <div
              key={`${pill.label}-${idx}`}
              className="flex w-64 shrink-0 flex-col rounded-2xl border border-white/70 bg-white/70 px-6 py-4 shadow-lg shadow-slate-900/5 backdrop-blur dark:border-white/10 dark:bg-slate-900/80"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{pill.label}</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">{pill.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-300">{pill.detail}</p>
            </div>
          ))}
        </motion.div>
      </section>

      <main className="relative z-10 w-full space-y-20 px-4 pb-24 pt-16 sm:px-8 lg:px-16">
        <section className="relative w-full overflow-hidden rounded-[36px] border border-white/70 bg-white/95 px-4 py-12 shadow-2xl shadow-indigo-500/5 sm:px-8 lg:px-16 dark:border-white/5 dark:bg-slate-900/70">
          <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(79,70,229,0.08)_0%,_transparent_60%)]" aria-hidden />
          <div className="absolute inset-0 opacity-40 blur-3xl" aria-hidden style={{ backgroundImage: 'linear-gradient(120deg, rgba(129,140,248,0.25), transparent)' }} />
          <div className="relative flex flex-col items-center gap-3 text-center">
            <p className="tag-pill">Why creators trust EduLearn</p>
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white">A studio-grade learning OS</h2>
            <p className="max-w-2xl text-base text-slate-500 dark:text-slate-300">
              Async tapes, live critique rooms, and guided rituals engineered to keep you shipping. Every touchpoint feels like a modern
              product studio—not a dusty LMS.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500 dark:text-slate-300">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 px-4 py-1.5 dark:border-slate-700">
                <FiUsers className="h-4 w-4 text-indigo-500" />
                28K active learners
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 px-4 py-1.5 dark:border-slate-700">
                <FiClock className="h-4 w-4 text-emerald-500" />
                7m mentor response time
              </span>
            </div>
          </div>
          <div className="relative mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: idx * 0.08 }}
                viewport={{ once: true }}
                className="flex flex-col gap-3 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-slate-950/40"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-600">
                  {feature.icon}
                </span>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-300">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="courses-section" className="relative w-full overflow-visible rounded-[32px] border border-white/70 bg-gradient-to-br from-white via-white to-slate-50 px-4 py-10 shadow-2xl shadow-indigo-500/10 sm:px-8 lg:px-16 dark:border-white/10 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
          
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500">
                <FiTrendingUp className="h-4 w-4" /> Curated tracks
              </span>
              <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white">Trending & exclusive launches</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                Pick a cohort, reserve your seat, and get instant access to the async primer so week one starts fast.
              </p>
            </div>
            <a href="/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-400">
              View all courses
              <FiArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="relative mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {featuredCourses.length ? (
              featuredCourses.map((course) => {
                const normalizedCourse = {
                  ...course,
                  courseLevel: course.courseLevel || 'All levels',
                  subTitle:
                    course.subTitle || 'Build real products with mentor critiques and async rituals.',
                };
                return (
                  <Course
                    key={course._id}
                    course={normalizedCourse}
                    isPurchased={isCoursePurchased(course._id)}
                  />
                );
              })
            ) : (
              <div className="col-span-full rounded-3xl border border-dashed border-slate-200/80 p-12 text-center text-slate-500 dark:border-slate-800">
                No courses found matching your search.
              </div>
            )}
          </div>
        </section>

        <section className="relative w-full overflow-hidden rounded-[40px] border border-white/60 bg-white/90 px-4 py-12 shadow-xl shadow-slate-900/5 sm:px-8 lg:px-16 dark:border-white/10 dark:bg-slate-900/70">
          <div className="absolute inset-x-8 top-16 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent dark:via-indigo-500/40" aria-hidden />
          <div className="relative text-center">
            <p className="tag-pill mx-auto">Learning journey</p>
            <h2 className="text-3xl font-semibold">From onboarding to offers</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-500 dark:text-slate-300">
              Each sprint stacks into the next: prep, live execution, showcase, and hiring pods. Nothing is left to chance.
            </p>
          </div>
          <div className="relative mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {journeySteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="flex flex-col gap-3 rounded-3xl border border-white/70 bg-white/80 p-6 dark:border-white/10 dark:bg-slate-950/30"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-500">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-400">
                    <FiClock className="h-4 w-4" /> {step.meta}
                  </div>
                  <h4 className="text-lg font-semibold">{step.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-300">{step.caption}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="relative w-full overflow-hidden rounded-[36px] border border-white/70 bg-white/80 px-4 py-12 shadow-xl shadow-slate-900/10 sm:px-8 lg:px-16 dark:border-white/10 dark:bg-slate-950/40">
          <div className="relative text-center">
            <p className="tag-pill mx-auto">Mentor network</p>
            <h2 className="text-3xl font-semibold">Mentored by elite builders</h2>
            <div className="mt-2 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-300">
              <FiUsers className="h-4 w-4 text-indigo-500" /> 190+ mentors online weekly
            </div>
          </div>
          <div className="relative mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {instructors.map((inst, idx) => (
              <motion.div
                key={inst.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                viewport={{ once: true }}
                className="flex flex-col items-center rounded-3xl border border-white/70 bg-white/70 p-6 text-center shadow-md dark:border-white/10 dark:bg-slate-950/50"
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/40 to-transparent blur-2xl" aria-hidden />
                  <img
                    src={inst.avatar}
                    alt={inst.name}
                    className="relative mx-auto mb-4 h-24 w-24 rounded-full border-2 border-white/80 object-cover shadow-2xl"
                  />
                </div>
                <h4 className="font-semibold text-lg">{inst.name}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-300">{inst.title}</p>
                <button className="mt-5 inline-flex items-center justify-center rounded-full border border-slate-200/60 px-5 py-2 text-sm font-medium text-slate-700 hover:border-indigo-400 hover:text-indigo-500 dark:border-slate-700 dark:text-slate-100">
                  View profile
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="relative w-full overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-br from-slate-900 via-indigo-900 to-black px-4 py-12 text-white shadow-2xl shadow-indigo-500/40 sm:px-8 lg:px-16">
          <div className="absolute inset-0 opacity-20" aria-hidden style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.5), transparent 45%)' }} />
          <div className="relative mb-8 text-center">
            <p className="tag-pill mx-auto bg-white/10 text-white">Proof of momentum</p>
            <h2 className="text-3xl font-semibold">People shipping real work</h2>
          </div>
          <div className="relative grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: idx * 0.12 }}
                viewport={{ once: true }}
                className="flex flex-col gap-4 rounded-3xl border border-white/20 bg-white/5 p-6 backdrop-blur"
              >
                <div className="flex items-center gap-1 text-amber-300">
                  {Array.from({ length: 5 }).map((_, starIdx) => (
                    <FiStar key={starIdx} className="h-4 w-4" />
                  ))}
                </div>
                <p className="text-lg font-medium text-white/95">“{testimonial.quote}”</p>
                <div className="flex items-center gap-3">
                  <img src={testimonial.avatar} alt={testimonial.name} className="h-12 w-12 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-white/70">{testimonial.title}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="relative w-full overflow-hidden rounded-[32px] border border-white/70 bg-white/90 px-4 py-12 shadow-xl shadow-slate-900/10 sm:px-8 lg:px-16 dark:border-white/10 dark:bg-slate-950/40">
          <div className="relative mb-8 text-center">
            <p className="tag-pill mx-auto">Frequently asked questions</p>
            <h2 className="text-3xl font-semibold">Everything you need to know</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <motion.div key={faq.q} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <button
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200/60 bg-white/80 px-6 py-4 text-left dark:border-slate-800 dark:bg-slate-900/60"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  aria-expanded={openFaq === idx}
                  aria-controls={`faq-${idx}`}
                >
                  <span className="font-medium text-slate-900 dark:text-slate-100">{faq.q}</span>
                  <svg
                    className={`h-5 w-5 text-indigo-500 transition-transform ${openFaq === idx ? 'rotate-45' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                {openFaq === idx && (
                  <div
                    id={`faq-${idx}`}
                    className="mt-2 rounded-2xl border border-slate-200/60 bg-white/90 px-6 py-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300"
                  >
                    {faq.a}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <section className="relative z-10 mb-16 w-full overflow-hidden rounded-[40px] border border-white/10 bg-slate-900 px-4 py-12 text-white shadow-2xl shadow-indigo-500/30 sm:px-8 lg:px-16">
        <div className="absolute inset-0 opacity-20" aria-hidden style={{ backgroundImage: 'linear-gradient(120deg, rgba(59,130,246,0.3), transparent)' }} />
        <div className="relative flex flex-col items-start gap-6 text-left">
          <p className="text-sm uppercase tracking-[0.4em] text-white/60">Join the community</p>
          <h3 className="text-3xl md:text-4xl font-semibold leading-tight">Build with engineers, designers, and PMs shipping weekly</h3>
          <p className="max-w-3xl text-base text-white/70">
            Access premium cohorts, async templates, curated hiring partners, and studio-grade critique rooms. Everything you need to push your craft forward.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="/courses"
              className="inline-flex items-center gap-2 rounded-full bg-white/95 px-8 py-3 text-base font-semibold text-slate-900"
            >
              Join the next sprint
              <FiArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/become-instructor"
              className="inline-flex items-center justify-center rounded-full border border-white/60 px-8 py-3 text-base font-semibold text-white"
            >
              Launch your cohort
            </a>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/50 bg-white/70 py-12 text-sm text-slate-500 backdrop-blur dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-400">
        <div className="grid w-full grid-cols-1 gap-8 px-4 sm:px-8 lg:px-16 lg:grid-cols-4">
          <div>
            <div className="text-2xl font-semibold text-slate-900 dark:text-white">EduLearn</div>
            <p className="mt-2">A modern learning platform focused on shipping real products with a global community.</p>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-slate-900 dark:text-white">Company</h4>
            <a href="#" className="block hover:text-indigo-500">About</a>
            <a href="#" className="block hover:text-indigo-500">Careers</a>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-slate-900 dark:text-white">Support</h4>
            <a href="#" className="block hover:text-indigo-500">Help center</a>
            <a href="#" className="block hover:text-indigo-500">Privacy</a>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-slate-900 dark:text-white">Newsletter</h4>
            <form className="flex gap-2">
              <input
                placeholder="Work email"
                className="flex-1 rounded-xl border border-slate-200/60 bg-white/80 px-4 py-2 focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900/60"
              />
              <button className="rounded-xl bg-indigo-600 px-4 py-2 text-white">Join</button>
            </form>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-slate-400">&copy; {new Date().getFullYear()} EduLearn. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Homepage;