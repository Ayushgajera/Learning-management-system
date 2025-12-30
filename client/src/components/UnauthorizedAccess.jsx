import { motion } from "framer-motion";
import { FiLock, FiArrowLeft, FiLogIn, FiShield, FiKey, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function UnauthorizedAccess() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 relative overflow-hidden font-sans selection:bg-indigo-500/20">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            x: [0, 100, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/10 to-transparent rounded-full blur-[100px]"
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-white/80 dark:bg-slate-900/80 border border-white/20 dark:border-slate-800/50 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden group">

          {/* Subtle Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          {/* Advanced Icon Composition */}
          <motion.div variants={itemVariants} className="relative z-10 mb-8 h-32 flex items-center justify-center">
            <div className="relative">
              {/* Floating Shield */}
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 transform rotate-45"
              >
                <FiLock className="w-10 h-10 text-white transform -rotate-45" />
              </motion.div>

              {/* Orbiting Elements */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 left-0 -inset-4 border border-indigo-500/30 rounded-full border-dashed"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 left-0 -inset-8 border border-purple-500/20 rounded-full"
              >
                <div className="absolute top-0 left-1/2 w-3 h-3 bg-purple-500 rounded-full blur-sm" />
              </motion.div>
            </div>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3 font-display text-center tracking-tight">
            Login Required
          </motion.h1>

          <motion.p variants={itemVariants} className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed text-center text-lg">
            This page is exclusive to our members. Please sign in to unlock this content.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col gap-3">

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/login")}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
            >
              <FiLogIn className="w-5 h-5" />
              Login Now
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(-1)}
              className="w-full py-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 group/btn"
            >
              <FiArrowLeft className="w-5 h-5 group-hover/btn:-translate-x-1 transition-transform" />
              Go Back
            </motion.button>
          </motion.div>

          {/* <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center text-xs text-slate-400 dark:text-slate-500 font-mono">
            <span>MEMBERS ONLY</span>
            <span className="flex items-center gap-1"><FiKey className="text-indigo-500"/> Auth Required</span>
          </div> */}
        </div>
      </motion.div>
    </div>
  );
}