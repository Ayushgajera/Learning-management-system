import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate, useLocation, NavLink as RouterNavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBell, FiLogOut, FiMoon, FiSun, FiBook, FiUsers, FiDollarSign,
  FiHome, FiShield, FiUser, FiUserCheck, FiShoppingCart, FiSettings
} from 'react-icons/fi';
import { useLogoutUserMutation } from '@/features/api/authApi';
import { useSelector, useDispatch } from 'react-redux';
import { userLoggedOut } from "@/features/authslice";
import { ThemeContext } from '@/extensions/ThemeProvider';

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
    to: "/superadmin/dashboard",
    icon: <FiHome className="w-4 h-4 text-slate-500 dark:text-slate-300 group-hover:text-rose-500" />,
    label: "Dashboard",
  },
  {
    to: "/superadmin/approvals",
    icon: <FiUserCheck className="w-4 h-4 text-slate-500 dark:text-slate-300 group-hover:text-rose-500" />,
    label: "Approvals",
  },
  {
    to: "/superadmin/users",
    icon: <FiUsers className="w-4 h-4 text-slate-500 dark:text-slate-300 group-hover:text-rose-500" />,
    label: "All Users",
  },
  {
    to: "/superadmin/courses",
    icon: <FiBook className="w-4 h-4 text-slate-500 dark:text-slate-300 group-hover:text-rose-500" />,
    label: "All Courses",
  },
  {
    to: "/superadmin/revenue",
    icon: <FiDollarSign className="w-4 h-4 text-slate-500 dark:text-slate-300 group-hover:text-rose-500" />,
    label: "Revenue",
  },
  {
    to: "/superadmin/purchases",
    icon: <FiShoppingCart className="w-4 h-4 text-slate-500 dark:text-slate-300 group-hover:text-rose-500" />,
    label: "Purchases",
  },
  {
    to: "/superadmin/settings",
    icon: <FiSettings className="w-4 h-4 text-slate-500 dark:text-slate-300 group-hover:text-rose-500" />,
    label: "Settings",
  },
];

function SuperAdminNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const [logoutUser] = useLogoutUserMutation();
  const userData = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const dropdownRef = useRef(null);
  const { theme, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

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
          <button className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-rose-500 dark:hover:text-rose-400 transition-colors duration-200">
            <FiBell className="h-6 w-6" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 border border-white dark:border-slate-900"></span>
          </button>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center space-x-3 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              <img
                className="h-10 w-10 rounded-full object-cover ring-2 ring-rose-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900"
                src={userData?.photoUrl || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1480&auto=format&fit=crop"}
                alt={userData?.name || "User"}
              />
              <div className="hidden lg:flex flex-col items-start">
                <span className="text-sm font-semibold text-gray-800 dark:text-white leading-tight">{userData?.name || 'Admin'}</span>
                <span className="text-xs font-medium text-rose-600 dark:text-rose-400 capitalize">Super Admin</span>
              </div>
            </button>
            <AnimatePresence>
              {isProfileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-12 right-0 mt-2 w-72 md:w-80 rounded-3xl py-5 border border-white/50 dark:border-slate-800/70 shadow-[0_35px_120px_-45px_rgba(15,23,42,0.9)] bg-white dark:bg-slate-900"
                >
                  <div className="px-6 flex items-center space-x-4 mb-4">
                    <img
                      className="h-16 w-16 rounded-full object-cover ring-2 ring-rose-500"
                      src={userData?.photoUrl || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1480&auto=format&fit=crop"}
                      alt="User"
                    />
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{userData?.name || 'Admin'}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{userData?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded-full">
                        Super Admin
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {menuItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="group flex items-center space-x-3 px-6 py-3 text-sm text-slate-600 dark:text-slate-200 hover:bg-rose-50/80 dark:hover:bg-slate-800/60 hover:text-rose-600 dark:hover:text-rose-200 transition-all duration-200"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        {item.icon}
                        <span className="flex-1 font-medium">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 dark:border-slate-700 mt-4 pt-4 space-y-1">
                    <Link
                      to="/profile"
                      className="group flex items-center space-x-3 px-6 py-3 text-sm text-slate-600 dark:text-slate-200 hover:bg-rose-50/80 dark:hover:bg-slate-800/60 hover:text-rose-600 dark:hover:text-rose-200 transition-all duration-200"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <FiUser className="w-4 h-4 text-slate-500 dark:text-slate-300 group-hover:text-rose-500" />
                      <span className="font-medium">Profile</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="group flex items-center space-x-3 px-6 py-3 text-sm text-rose-600 w-full text-left hover:bg-rose-50/80 dark:hover:bg-rose-500/10 transition-all duration-200"
                    >
                      <FiLogOut className="w-4 h-4 text-rose-600" />
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
    return null;
  };

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500
      ${isScrolled || isMenuOpen
          ? 'backdrop-blur-2xl bg-white/80 dark:bg-slate-950/70 border-b border-white/30 dark:border-white/10 shadow-[0_25px_65px_-40px_rgba(15,23,42,0.85)]'
          : 'bg-transparent'} text-slate-900 dark:text-slate-100`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="mx-auto flex h-16 w-full max-w-[1380px] items-center justify-between gap-4">
          {/* Logo and Main Nav */}
          <div className="flex items-center">
            <Link to="/superadmin/dashboard" className="flex items-center space-x-2">
              <FiShield className="w-7 h-7 text-rose-500" />
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-2xl font-bold tracking-tight bg-gradient-to-r from-rose-500 via-red-500 to-orange-400 bg-clip-text text-transparent"
              >
                LearnGPT
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center ml-8 space-x-6 text-slate-700 dark:text-slate-200">
              <RouterNavLink
                to="/superadmin/dashboard"
                className={({ isActive }) => `
                flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-semibold transition-colors duration-200
                ${isActive
                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300'
                    : 'text-slate-600 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'}
              `}
              >
                <FiHome className="h-5 w-5" />
                <span>Dashboard</span>
              </RouterNavLink>

              <RouterNavLink
                to="/superadmin/approvals"
                className={({ isActive }) => `
                flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-semibold transition-colors duration-200
                ${isActive
                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300'
                    : 'text-slate-600 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'}
              `}
              >
                <FiUserCheck className="h-5 w-5" />
                <span>Approvals</span>
              </RouterNavLink>

              <RouterNavLink
                to="/superadmin/users"
                className={({ isActive }) => `
                flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-semibold transition-colors duration-200
                ${isActive
                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300'
                    : 'text-slate-600 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'}
              `}
              >
                <FiUsers className="h-5 w-5" />
                <span>Users</span>
              </RouterNavLink>

              <RouterNavLink
                to="/superadmin/courses"
                className={({ isActive }) => `
                flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-semibold transition-colors duration-200
                ${isActive
                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300'
                    : 'text-slate-600 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'}
              `}
              >
                <FiBook className="h-5 w-5" />
                <span>Courses</span>
              </RouterNavLink>
            </div>
          </div>

          {/* Right Side Menu */}
          <div className="flex items-center space-x-4">
            {renderAuthButtons()}
            <div className="hidden md:flex items-center mr-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-slate-600 dark:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 transition-colors"
                title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? <FiMoon className="h-6 w-6 text-gray-800 transition-transform duration-300 transform rotate-0" /> : <FiSun className="h-6 w-6 text-yellow-400 transition-transform duration-300 transform rotate-180" />}
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:text-rose-600 hover:bg-gray-100 focus:outline-none"
              >
                <svg className={`h-6 w-6 transition-transform ${isMenuOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
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
                    className="h-12 w-12 rounded-full ring-2 ring-rose-500 ring-offset-2 ring-offset-white object-cover"
                  />
                  <div>
                    <h4 className="text-base font-semibold text-gray-800 dark:text-gray-100">{userData?.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{userData?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded-full">
                      Super Admin
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-all duration-300"
                >
                  {theme === 'light' ? <FiMoon className="h-5 w-5 text-gray-800" /> : <FiSun className="h-5 w-5 text-yellow-400" />}
                  <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>

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
                      </Link>
                    ))}
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <FiUser className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      <span className="flex-1 font-medium">Profile</span>
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg">
                      <FiLogOut className="w-5 h-5" />
                      <span>Sign out</span>
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default SuperAdminNavbar;
