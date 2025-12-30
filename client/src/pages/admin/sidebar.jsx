import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome,
  FiBook,
  FiMenu,
  FiX,
  FiUsers,
  FiDollarSign,
  FiCreditCard,
  FiChevronRight,
  FiAward
} from 'react-icons/fi';

function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Mobile menu ko tab band karein jab route badal jaye
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Badi screens par mobile menu ko band karein
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    {
      path: '/admin/dashboard',
      name: 'Dashboard',
      description: 'Overview & pulse',
      icon: <FiHome className="h-5 w-5" />,
    },
    {
      path: '/admin/courses',
      name: 'Courses',
      description: 'Catalog & drafts',
      icon: <FiBook className="h-5 w-5" />,
    },
    {
      path: '/admin/users',
      name: 'Manage Users',
      description: 'Learners & mentors',
      icon: <FiUsers className="h-5 w-5" />,
    },
    {
      path: '/admin/revenue',
      name: 'Revenue',
      description: 'Earning streams',
      icon: <FiDollarSign className="h-5 w-5" />,
    },
    {
      path: '/admin/wallet',
      name: 'Wallet',
      description: 'Payout hub',
      icon: <FiCreditCard className="h-5 w-5" />,
    },
    {
      path: '/admin/reputation',
      name: 'My Reputation',
      description: 'Levels & Score',
      icon: <FiAward className="h-5 w-5" />,
    },
  ];


  const isActivePath = (path) => location.pathname.startsWith(path);

  // Mobile menu animation ke liye variants
  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" }
  };

  // Backdrop animation ke liye variants
  const backdropVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 z-30 h-screen w-72 flex-col border-r border-gray-200/60 bg-white/95 px-5 pb-6 pt-8 text-slate-900 shadow-xl dark:border-slate-800/80 dark:bg-slate-900/80 dark:text-white mt-10">
        <div className="rounded-3xl border border-gray-200/60 bg-white p-4 dark:border-slate-800/70 dark:bg-slate-900">
          <Link to="/admin/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-sky-400 text-white shadow-lg">
              <FiBook className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xl font-semibold tracking-tight bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-400 bg-clip-text text-transparent">EduLearn</p>
              <p className="text-[11px] uppercase  text-slate-400 dark:text-white/70">instructor</p>
            </div>
          </Link>
        </div>

        <nav className="mt-6 flex-1 space-y-3 overflow-y-auto pr-1">
          {menuItems.map((item) => {
            const active = isActivePath(item.path);
            return (
              <motion.div key={item.path} whileHover={{ x: 4 }}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all duration-200 ${active
                    ? 'border-transparent bg-gradient-to-r from-indigo-500/90 via-violet-500/80 to-sky-400/80 text-white shadow-lg shadow-indigo-500/30'
                    : 'border-gray-200/60 bg-white/70 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-white/70'
                    }`}
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${active
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800/80 dark:text-white/70'
                      }`}
                  >
                    {item.icon}
                  </span>
                  <div className="flex-1 text-left">
                    <p className={`text-sm font-semibold ${active ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{item.name}</p>
                    <p className={`text-xs ${active ? 'text-white/80' : 'text-slate-500 dark:text-white/60'}`}>{item.description}</p>
                  </div>
                  <FiChevronRight className={`h-4 w-4 ${active ? 'text-white' : 'text-slate-300 dark:text-white/40'}`} />
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 hidden z-50 ">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl bg-white border border-gray-200 shadow-lg
            text-gray-600 hover:text-emerald-600 focus:outline-none focus:ring-2
            focus:ring-emerald-500 focus:ring-offset-2"
        >
          {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6 " />}
        </button>
      </div>

      {/* Mobile Sidebar with AnimatePresence */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={backdropVariants}
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />

            {/* Sidebar */}
            <motion.aside
              initial="closed"
              animate="open"
              exit="closed"
              variants={sidebarVariants}
              transition={{ type: "spring", damping: 24, stiffness: 240 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 overflow-y-auto border-r border-gray-200/60 bg-white/95 px-5 pb-6 pt-6 text-slate-900 shadow-2xl dark:border-slate-800/80 dark:bg-slate-900/90 dark:text-white"
            >
              <div className="rounded-3xl border border-gray-200/60 bg-white p-4 dark:border-slate-800/70 dark:bg-slate-900">
                <Link
                  to="/admin/dashboard"
                  className="flex items-center gap-3 overflow-hidden"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-sky-400 text-white shadow-lg">
                    <FiBook className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold tracking-tight bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-400 bg-clip-text text-transparent">
                      EduLearn
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.4em] text-slate-400 dark:text-white/70">Instructor</p>
                  </div>
                </Link>
              </div>

              <nav className="mt-5 space-y-3">
                {menuItems.map((item) => {
                  const active = isActivePath(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-200 ${active
                        ? 'border-transparent bg-gradient-to-r from-indigo-500/90 via-violet-500/80 to-sky-400/80 text-white shadow-lg shadow-indigo-500/30'
                        : 'border-gray-200/60 bg-white/70 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-white/70'
                        }`}
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800/80 dark:text-white/70">
                        {item.icon}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.name}</p>
                        <p className="text-xs text-slate-500 dark:text-white/60">{item.description}</p>
                      </div>
                      <FiChevronRight className="h-4 w-4 text-slate-300 dark:text-white/40" />
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;
