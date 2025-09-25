import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate, useLocation, NavLink as RouterNavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiBookOpen, FiGrid, FiUser, FiBell, FiLogOut, FiEdit2, FiSettings, FiHome, FiDollarSign, FiMoon, FiSun } from 'react-icons/fi';
import { FiBook, FiAward, FiBarChart2, FiHeart, FiDownload, FiCalendar, FiMessageSquare } from 'react-icons/fi';
import { useLogoutUserMutation } from '@/features/api/authApi';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUser, userLoggedOut } from "@/features/authslice"; // adjust path if needed
import axios from 'axios';
import { ThemeContext } from '@/extensions/ThemeProvider';

const menuItems = [
  {
    to: "/profile",
    icon: <FiBarChart2 className="w-4 h-4 text-green-600" />,
    label: "profile",
    bgColor: "bg-green-100"
  },
  {
    to: "admin/dashboard",
    icon: <FiHome className="w-4 h-4 text-emerald-600" />,
    label: "Dashboard",
    bgColor: "bg-emerald-100",
    badge: {
      content: "3",
      className: "px-2 py-0.5 text-xs bg-green-100 text-green-600 rounded-full"
    }
  },
  {
    to: "/messages",
    icon: <FiBook className="w-4 h-4 text-green-600" />,
    label: " Courses",
    bgColor: "bg-green-100",
    badge: {
      content: "",
      className: "h-2 w-2 bg-red-500 rounded-full"
    }
  },
  {
    to: "/messages",
    icon: <FiUser className="w-4 h-4 text-green-600" />,
    label: " Students",
    bgColor: "bg-green-100",
    badge: {
      content: "",
      className: "h-2 w-2 bg-red-500 rounded-full"
    }
  },

];

// Add this utility function at the top of your file
function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

function AdminNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const [logoutUser, { data, isLoading }] = useLogoutUserMutation();
  const userData = useSelector((state) => state.auth.user);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  // Refs for outside click detection
  const profileDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Role-based menu items
  const isAdmin = userData?.role === 'admin';
  const isInstructor = userData?.role === 'instructor';
  const isStudent = userData?.role === 'student';

  // Add Become Instructor button for students
  const handleBecomeInstructor = () => {
    navigate('/become-instructor');
  };

  const [loading, setLoading] = useState(false);

  const handleBecomeStudent = async () => {
  try {
    setLoading(true);
    await axios.patch(
      'http://localhost:8000/api/v1/user/become-student',
      {},
      { withCredentials: true } // ✅ send cookies/session
    );
    await dispatch(fetchUser());
    navigate('/');
  } catch (err) {
    console.error(err.response?.data || err.message);
    alert('Failed to become a student. Please try again.');
  } finally {
    setLoading(false);
  }
};


  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
      // Add error toast here if you have a toast system
    }
  }
  // Handle navbar background on scroll
  useEffect(() => {
    const handleScroll = throttle(() => {
      setIsScrolled(window.scrollY > 20);
    }, 100); // Only run every 100ms

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Handle outside clicks for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add effect to close menus on route change
  useEffect(() => {
    setIsProfileDropdownOpen(false);
    setIsMenuOpen(false);
    setIsCategoryOpen(false);
  }, [location.pathname]);

  // Modify the menu item click handler
  const handleMenuItemClick = (path) => {
    navigate(path);
    setIsProfileDropdownOpen(false);
    setIsMenuOpen(false);
  };

  // Update the menu items rendering in profile dropdown
  const renderMenuItems = menuItems
    .filter(item => {
      // Example: Only show Dashboard for admin/instructor
      if (item.to === '/my-courses' && !isAdmin && !isInstructor) return false;
      // Only show Students for admin
      if (item.label.trim() === 'Students' && !isAdmin) return false;
      // Only show Courses for admin/instructor
      if (item.label.trim() === 'Courses' && !isAdmin && !isInstructor) return false;
      return true;
    })
    .map((item, index) => (
      <button
        key={index}
        onClick={() => handleMenuItemClick(item.to)}
        className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 dark:text-gray-200
          hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200 w-full text-left"
      >
        <div className={`p-2 rounded-lg ${item.bgColor} dark:bg-gray-600`}>{item.icon}</div>
        <span className="flex-1">{item.label}</span>
        {item.badge && (
          <span className={item.badge.className}>{item.badge.content}</span>
        )}
      </button>
    ));

  // Right side menu renderer
  const renderAuthButtons = () => {
    if (userData && isAuthenticated) {
      return (
        <div className="hidden md:flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200">
            <FiBell className="h-6 w-6" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-700/80
                transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
            >
              <img
                className="h-9 w-9 rounded-full ring-2 ring-green-500 object-cover"
                src={userData?.photoUrl || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1480&auto=format&fit=crop"}
                alt={userData?.name || "User"}
              />
              <div className="text-left">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{userData?.name || 'User'}</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {userData?.role ? (
                    <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-semibold">
                      {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
                    </span>
                  ) : 'Student'}
                </p>
              </div>
            </button>

            <AnimatePresence>
                {isProfileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="fixed right-4 mt-2 w-[320px] bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl py-3 border border-gray-200/50 dark:border-gray-700/50 profile-dropdown overflow-y-auto z-[100]"
                  style={{
                    maxHeight: 'calc(100vh - 80px)',
                    top: '64px'
                  }}
                >
                  {/* User Info Section - Enhanced */}
                  <div className="px-4 py-3">
                    <div className="flex items-start space-x-4">
                      <div className="relative group">
                        <img
                          className="h-16 w-16 rounded-xl ring-2 ring-green-500/30 object-cover group-hover:ring-green-500 transition-all duration-200"
                          src={userData?.photoUrl || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1480&auto=format&fit=crop"}
                          alt="User"
                        />

                      </div>
                      <div className="flex-1">
                        <h4 className="text-base text-lg font-semibold text-gray-800 dark:text-gray-100">{userData?.name || 'Guest'}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{userData?.email || 'Guest'}</p>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <span className='text-[14px] font-medium text-gray-900 dark:text-gray-100'>{userData?.role}</span>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats - Enhanced */}
                  <div className="grid grid-cols-3 gap-1 px-3 ">
                    <div className="flex flex-col items-center p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                      <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-lg">
                        <FiBook className="w-3 h-3 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="text-md font-semibold text-gray-800 dark:text-gray-200">12</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Courses</p>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                      <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-lg">
                        <FiDollarSign className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <p className="text-md font-semibold text-gray-800 dark:text-gray-200">$4500</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Revenue</p>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                      <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-lg ">
                        <FiAward className="w-3 h-3 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="text-md font-semibold text-gray-800 dark:text-gray-200">8</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Certificates</p>
                    </div>
                  </div>

                  {/* Menu Items - Enhanced */}
                  <div className="px-2">
                    {renderMenuItems}
                  </div>

                  {/* Footer Actions - Enhanced */}
                  <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2 px-2">

                    <button onClick={handleLogout}
                      className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm text-red-600 dark:text-red-400 w-full
                        hover:bg-red-50 dark:hover:bg-red-900/50 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200"
                    >
                      <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/50">
                        <FiLogOut className="w-4 h-4" />
                      </div>
                      <span>Sign out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Show Become Instructor for students only */}
          {isStudent && (
            <button
              type="button"
              onClick={handleBecomeStudent}
              disabled={loading}
              className="block text-emerald-700 text-center px-4 py-2 border-2 border-emerald-500 font-bold text-md rounded-lg hover:bg-emerald-100 border-emerald transition"
            >
              {loading ? 'Processing...' : 'Become a Student'}
            </button>

          )}
        </div>
      );
    }

    return (
      <div className="hidden md:flex items-center space-x-3">
        <Link
          to="/login"
          className="px-4 py-2 border border-green-600 text-green-600 dark:text-green-400 bg-white dark:bg-gray-800 rounded-lg font-semibold hover:bg-green-50 dark:hover:bg-green-900/50 hover:text-green-700 dark:hover:text-green-300 transition-colors duration-200"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 shadow"
        >
          Sign Up
        </Link>
      </div>
    );
  };

  // Mobile menu renderer
  const renderMobileAuth = () => {
    if (userData) {
      return (
        <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-4">
          <div className="flex items-center space-x-3 mb-4">
            <img
              src={userData?.photoUrl || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1480&auto=format&fit=crop"}
              alt={userData?.name || "User"}
              className="h-12 w-12 rounded-full ring-2 ring-green-500"
            />
            <div>
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{userData?.name}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">{userData?.email}</p>
            </div>
          </div>

          <div className="space-y-1">
            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="mobile-nav-link w-full"
            >
              {theme === 'light' ? <FiMoon className="w-5 h-5" /> : <FiSun className="w-5 h-5" />}
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
            <Link to="/settings" className="mobile-nav-link">
              <FiSettings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
            <button
              onClick={handleLogout}
              className="mobile-nav-link w-full text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/50"
            >
              <FiLogOut className="w-5 h-5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-4 space-y-2">
        {/* Mobile Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="mobile-nav-link w-full"
        >
          {theme === 'light' ? <FiMoon className="w-5 h-5" /> : <FiSun className="w-5 h-5" />}
          <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>
        <Link
          to="/login"
          className="mobile-nav-link"
        >
          <FiUser className="w-5 h-5" />
          <span>Login</span>
        </Link>
        <Link
          to="/register"
          className="mobile-nav-link bg-green-600 text-white hover:bg-green-700"
        >
          <FiUser className="w-5 h-5" />
          <span>Sign Up</span>
        </Link>
      </div>
    );
  };


  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 text-gray-800 dark:text-gray-100
      ${isScrolled || isMenuOpen ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Main Nav */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <FiBook className="w-8 h-8 text-emerald-600" />
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent"
              >
                EduLearn
              </motion.div>
            </Link>


            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-between ml-8 space-x-1">
              <NavLink to="/courses" className='text-md'>
                <FiBookOpen className="mr-2" />
                Courses
              </NavLink>
              <button onClick={handleBecomeStudent} className="block text-emerald-700 dark:text-emerald-400 text-center px-4 py-2 border-2 border-emerald-500 dark:border-emerald-400 font-bold text-md rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition">
                Become a Student
              </button>
            </div>
          </div>



          {/* Right Side Menu */}
          <div className="flex items-center space-x-3">
            {/* Theme toggle (desktop) */}
            <div className="hidden md:flex items-center">
              <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
                {theme === 'light' ? <FiSun className="w-5 h-5 text-gray-700" /> : <FiMoon className="w-5 h-5 text-yellow-400" />}
              </button>
            </div>
            {renderAuthButtons()}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
            >
              <svg className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`} fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`} fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden fixed inset-x-0 top-16 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-100 dark:border-gray-700 shadow-lg"
          >


            {/* Mobile Navigation */}
            <div className="px-4 py-3 space-y-1">
              <Link to="/courses" className="mobile-nav-link">
                <FiBookOpen className="w-5 h-5" />
                <span>Courses</span>
              </Link>

              {/* Mobile Categories Accordion */}
              <div className="space-y-2">
                <button
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="mobile-nav-link w-full flex justify-between"
                >
                  <div className="flex items-center">
                    <FiGrid className="w-5 h-5" />
                    <span>Categories</span>
                  </div>
                  <svg
                    className={`w-5 h-5 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''
                      }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {isCategoryOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pl-9 space-y-1"
                    >
                      {['Web Development', 'Design', 'Business', 'Marketing'].map((category) => (
                        <Link
                          key={category}
                          to={`/category/${category.toLowerCase()}`}
                          className="block py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
                        >
                          {category}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Items */}
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.to}
                  className="mobile-nav-link"
                >
                  <div className={`p-2 rounded-lg ${item.bgColor} dark:bg-gray-600`}>
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`ml-auto ${item.badge.className}`}>
                      {item.badge.content}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            {/* Mobile User Section */}
            {renderMobileAuth()}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// Helper component for nav links
const NavLink = ({ children, to, className = "" }) => {
  return (
    <RouterNavLink
      to={to}
      className={({ isActive }) => `
        flex items-center px-3 py-2 rounded-lg text-sm font-medium
        ${isActive ? 'text-green-600 bg-green-50' : 'text-gray-700'} 
        hover:text-green-600 hover:bg-green-50 transition-colors duration-200 
        ${className}
      `}
    >
      {children}
    </RouterNavLink>
  );
};

export default AdminNavbar;
