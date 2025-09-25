import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate, useLocation, NavLink as RouterNavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBookOpen, FiGrid, FiBell, FiLogOut, FiSettings, FiChevronsDown, FiMoon, FiSun, FiBook, FiAward, FiHeart, FiMessageSquare } from 'react-icons/fi';
import { useLogoutUserMutation } from '@/features/api/authApi';
import { useSelector, useDispatch } from 'react-redux';
import { userLoggedOut } from "@/features/authslice";
import { ThemeContext } from '@/extensions/ThemeProvider';

// Utility function to throttle event handling
function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

const menuItems = [
  {
    to: "/dashboard",
    icon: <FiGrid className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-emerald-500" />,
    label: "Dashboard",
  },
  {
    to: "/my-courses",
    icon: <FiBook className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-emerald-500" />,
    label: "My Courses",
    badge: { content: "3", className: "px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-700 font-semibold rounded-full" }
  },
  {
    to: "/messages",
    icon: <FiMessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-emerald-500" />,
    label: "Messages",
    badge: { content: "", className: "h-2 w-2 bg-red-500 rounded-full" }
  },
  {
    to: "/certificates",
    icon: <FiAward className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-emerald-500" />,
    label: "Certificates",
  },
  {
    to: "/favorites",
    icon: <FiHeart className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-emerald-500" />,
    label: "Saved Courses",
  },
];

function StudentNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [logoutUser] = useLogoutUserMutation();
  const userData = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const dropdownRef = useRef(null);
  const { theme, toggleTheme } = useContext(ThemeContext);

  // Handle outside clicks for profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  // Handle navbar background on scroll
  useEffect(() => {
    const handleScroll = throttle(() => {
      setIsScrolled(window.scrollY > 20);
    }, 100);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsProfileDropdownOpen(false);
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
      dispatch(userLoggedOut());
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const renderAuthButtons = () => {
    if (userData && isAuthenticated) {
      return (
        <div className="hidden md:flex items-center space-x-4">
          <button className="relative p-2 text-gray-600 hover:text-emerald-500 transition-colors duration-200">
            <FiBell className="h-6 w-6 dark:text-gray-300" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 border border-white"></span>
          </button>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-gray-100 transition-all duration-200"
            >
              <img
                className="h-9 w-9 rounded-full object-cover ring-2 ring-emerald-500 ring-offset-2 ring-offset-white"
                src={userData?.photoUrl || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1480&auto=format&fit=crop"}
                alt={userData?.name || "User"}
              />
              <span className="text-sm font-semibold text-gray-800 hidden lg:block dark:text-gray-300">{userData?.name || 'User'}</span>
            </button>
            <AnimatePresence>
              {isProfileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-12 right-0 mt-2 w-72 md:w-80 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl py-4 border border-gray-100 dark:border-gray-700"
                >
                  <div className="px-6 flex items-center space-x-4 mb-4">
                    <img
                      className="h-16 w-16 rounded-full object-cover ring-2 ring-emerald-500"
                      src={userData?.photoUrl || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1480&auto=format&fit=crop"}
                      alt="User"
                    />
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 leading-tight">{userData?.name || 'Guest'}</h4>
                      <p className="text-sm text-gray-500">{userData?.email || 'Guest'}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {menuItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="group flex items-center space-x-3 px-6 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-gray-700 hover:text-emerald-700 transition-all duration-200"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        {item.icon}
                        <span className="flex-1 font-medium">{item.label}</span>
                        {item.badge && (
                          <span className={item.badge.className}>{item.badge.content}</span>
                        )}
                      </Link>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 mt-4 pt-4 space-y-1">
                    <Link
                      to="/settings"
                      className="group flex items-center space-x-3 px-6 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-gray-700 hover:text-emerald-700 transition-all duration-200"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <FiSettings className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-emerald-500" />
                      <span className="font-medium">Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="group flex items-center space-x-3 px-6 py-3 text-sm text-red-600 w-full text-left hover:bg-red-50 transition-all duration-200"
                    >
                      <FiLogOut className="w-4 h-4 text-red-600" />
                      <span className="font-medium">Sign out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      );
    }
    return (
      <div className="hidden md:flex items-center space-x-3">
        <Link
          to="/login"
          className="px-6 py-2 border border-emerald-500 text-emerald-600 rounded-full font-semibold hover:bg-emerald-50 transition-colors duration-200"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="px-6 py-2 bg-emerald-500 text-white rounded-full font-semibold hover:bg-emerald-600 transition-colors duration-200 shadow"
        >
          Sign Up
        </Link>
      </div>
    );
  };

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 
      ${isScrolled || isMenuOpen ? 'bg-white/95 dark:bg-gray-900/80 backdrop-blur-md shadow-lg' : 'bg-transparent'} text-gray-800 dark:text-gray-100`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Main Nav */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <FiBook className="w-7 h-7 text-emerald-600" />
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent"
            >
              EduLearn
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center ml-8 space-x-6 text-gray-800 dark:text-gray-100">
            {/* Courses */}
            <RouterNavLink
              to="/courses"
              className={({ isActive }) => `
                flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium
                ${isActive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}
                hover:bg-emerald-50 hover:text-emerald-600
                dark:hover:bg-emerald-900/40 dark:hover:text-emerald-400 transition-colors duration-200
              `}
            >
              <FiBookOpen className="h-5 w-5" />
              <span>Courses</span>
            </RouterNavLink>

            {/* Categories */}
            <div className="relative group">
              <RouterNavLink
                to="/categories"
                className={({ isActive }) => `
                  flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium
                  ${isActive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}
                  hover:bg-emerald-50 hover:text-emerald-600
                  dark:hover:bg-emerald-900/40 dark:hover:text-emerald-400 transition-colors duration-200
                `}
              >
                <FiGrid className="h-5 w-5" />
                <span>Categories</span>
                <FiChevronsDown className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
              </RouterNavLink>

              {/* Dropdown */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 border border-gray-100 dark:border-gray-700"
              >
                {['Web Development', 'Data Science', 'Design', 'Business', 'AI & ML'].map((category) => (
                  <Link
                    key={category}
                    to={`/category/${category.toLowerCase()}`}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-gray-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200"
                  >
                    {category}
                  </Link>
                ))}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Right Side Menu */}
        <div className="flex items-center space-x-4">
          {renderAuthButtons()}
          {/* Desktop theme toggle (always visible on desktop) */}
          <div className="hidden md:flex items-center mr-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-600 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? <FiMoon className="h-6 w-6 text-gray-800 transition-transform duration-300 transform rotate-0" /> : <FiSun className="h-6 w-6 text-yellow-400 transition-transform duration-300 transform rotate-180" />}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-emerald-600 hover:bg-gray-100 focus:outline-none"
            >
              <svg className={`h-6 w-6 transition-transform ${isMenuOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-x-0 top-16 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 shadow-lg"
          >
            <div className="px-4 py-4 space-y-4">
              {userData && (
                <div className="flex items-center space-x-3">
                  <img
                    src={userData?.photoUrl || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1480&auto=format&fit=crop"}
                    alt={userData?.name || "User"}
                    className="h-12 w-12 rounded-full ring-2 ring-emerald-500 ring-offset-2 ring-offset-white object-cover"
                  />
                  <div>
                    <h4 className="text-base font-semibold text-gray-800 dark:text-gray-100">{userData?.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{userData?.email}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {/* Mobile dark mode toggle */}
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                  title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                >
                  {theme === 'light' ? <FiMoon className="h-5 w-5 text-gray-800 transition-transform duration-300 transform rotate-0" /> : <FiSun className="h-5 w-5 text-yellow-400 transition-transform duration-300 transform rotate-180" />}
                  <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>
                <Link to="/courses" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <FiBookOpen className="w-5 h-5" />
                  <span>Courses</span>
                </Link>

                <div className="space-y-2">
                  <button
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      <FiGrid className="w-5 h-5" />
                      <span>Categories</span>
                    </div>
                    <FiChevronsDown className={`w-5 h-5 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isCategoryOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="pl-8 space-y-1 overflow-hidden"
                      >
                        {['Web Development', 'Data Science', 'Design', 'Business', 'AI & ML'].map((category) => (
                          <Link
                            key={category}
                            to={`/category/${category.toLowerCase()}`}
                            className="block px-4 py-2 text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors"
                          >
                            {category}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {userData ? (
                  <>
                    {menuItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        {item.icon}
                        <span className="flex-1 font-medium">{item.label}</span>
                        {item.badge && (
                          <span className={item.badge.className}>{item.badge.content}</span>
                        )}
                      </Link>
                    ))}
                    <Link to="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <FiSettings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      <span className="flex-1 font-medium">Settings</span>
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg">
                      <FiLogOut className="w-5 h-5" />
                      <span>Sign out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="w-full block text-center bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 rounded-lg">
                      <span>Login</span>
                    </Link>
                    <Link to="/register" className="w-full block text-center bg-emerald-500 text-white hover:bg-emerald-600 px-4 py-2 rounded-lg">
                      <span>Sign Up</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default StudentNavbar;