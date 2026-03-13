import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiLinkedin, FiInstagram, FiMail, FiMapPin, FiPhone } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pt-20 pb-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Gradient Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent mb-16" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                E
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                LearnGPT
              </span>
            </Link>
            <p className="text-slate-600 dark:text-slate-400 leading-[1.75]">
              Empowering learners worldwide with cutting-edge skills and expert mentorship.
            </p>
            <div className="flex gap-3">
              {[FiTwitter, FiGithub, FiLinkedin, FiInstagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-all duration-300"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Platform</h3>
            <ul className="space-y-5">
              {['Browse Courses', 'Mentorship', 'Pricing', 'For Business', 'Become an Instructor'].map((item) => (
                <li key={item}>
                  <Link to="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:translate-x-1 inline-block transition-all duration-300">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Resources</h3>
            <ul className="space-y-5">
              {['Blog', 'Careers', 'Help Center', 'Terms of Service', 'Privacy Policy'].map((item) => (
                <li key={item}>
                  <Link to="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:translate-x-1 inline-block transition-all duration-300">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Contact</h3>
            <ul className="space-y-5">
              <li className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                <FiMapPin className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                <span>123 Innovation Dr,<br />Tech Valley, CA 94043</span>
              </li>
              <li className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <FiMail className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <span>hello@learngpt.com</span>
              </li>
              <li className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <FiPhone className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 dark:text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} LearnGPT Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-500">
            <Link to="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300">Privacy</Link>
            <Link to="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300">Terms</Link>
            <Link to="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
