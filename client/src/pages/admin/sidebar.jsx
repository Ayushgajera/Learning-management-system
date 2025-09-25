import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiBook, FiMenu, FiX, FiUsers, FiDollarSign, FiCreditCard } from 'react-icons/fi';

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
      icon: <FiHome className="w-5 h-5" />
    },
    {
      path: '/admin/courses',
      name: 'Courses',
      icon: <FiBook className="w-5 h-5" />
    },
    {
      path: '/admin/users',
      name: 'Manage Users',
      icon: <FiUsers className="w-5 h-5" />
    },
    {
      path: '/admin/revenue',
      name: 'Revenue',
      icon: <FiDollarSign className="w-5 h-5" />
    },
    {
      path: '/admin/wallet',
      name: 'Wallet',
      icon: <FiCreditCard className="w-5 h-5" />
    }
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
      <aside className="hidden lg:flex h-screen w-64 flex-col fixed left-0 top-0 bottom-0 bg-white dark:bg-gray-800/60 border-r border-gray-200 dark:border-gray-700 z-30 shadow-xl">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <Link
            to="/admin/dashboard"
            className="flex items-center space-x-2"
          >
            <FiBook className="w-8 h-8 text-emerald-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600
              bg-clip-text text-transparent">
              EduAdmin
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActivePath(item.path)
                  ? 'bg-emerald-50 text-emerald-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
                }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl bg-white border border-gray-200 shadow-lg
            text-gray-600 hover:text-emerald-600 focus:outline-none focus:ring-2
            focus:ring-emerald-500 focus:ring-offset-2"
        >
          {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
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
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800/80 border-r border-gray-200 dark:border-gray-700
                overflow-y-auto shadow-2xl"
            >
              {/* Logo */}
              <div className="p-6 border-b border-gray-200">
                <Link
                  to="/admin/dashboard"
                  className="flex items-center space-x-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FiBook className="w-8 h-8 text-emerald-600" />
                  <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600
                    bg-clip-text text-transparent">
                    EduAdmin
                  </span>
                </Link>
              </div>

              {/* Navigation */}
              <nav className="p-4 space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                      ${isActivePath(item.path)
                        ? 'bg-emerald-50 text-emerald-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
                      }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;
