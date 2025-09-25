import { useEffect, useState } from 'react'
import { Button } from '../components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { useLoginUserMutation, useRegisterUserMutation } from '@/features/api/authApi'
import { toast } from 'sonner'
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FiBook } from 'react-icons/fi';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true); // <-- Add this
  const location = useLocation();
  const navigate = useNavigate();
  
  const [signupInput, setSignupInput] = useState({
    name: "",
    email: "",
    password: ""
  })
  const [loginInput, setLoginInput] = useState({
    email: "",
    password: ""
  })

  const isFormIncomplete = isLogin
  ? !loginInput.email || !loginInput.password
  : !signupInput.name || !signupInput.email || !signupInput.password;


  const [registerUser, {
    data: registerData,
    error: registerError,
    isLoading: registerLoading,
    isSuccess: registerSuccess 
  }] = useRegisterUserMutation({
  });

  const [loginUser, {
    data: loginData,
    error: loginError,
    isLoading: loginLoading,
    isSuccess: loginSuccess}] = useLoginUserMutation({
      
    });
 
  const changeHandler = (e) => {
    const { name, value } = e.target
    if (isLogin) {
      setLoginInput(prev => ({
        ...prev,
        [name]: value
      }))
    } else {
      setSignupInput(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }
 const handleSubmit = async (e) => {
  e.preventDefault();
    try {
      if (isLogin) {
        const res = await loginUser(loginInput).unwrap();
        navigate('/'); // Redirect to homepage or dashboard

        console.log("Login Success:", res);
    } else {
      const res = await registerUser(signupInput).unwrap();
      console.log("Register Success:", res);
    }
  } catch (err) {
    console.error("API Error:", err);
  }
};

useEffect(() => {
  if (registerSuccess && registerData) {
    toast.success("Registration successful! Please log in.");
  }
  if(registerError){
    toast.error(registerError.data.message || "Registration failed. Please try again.");
  }
  if (loginSuccess && loginData) {
    toast.success("Login successful! Welcome back.");
    
  }
  if(loginError) {
    toast.error( "Login failed. Please check your credentials.");
  }
}, [loginLoading, registerLoading, loginData, registerData, loginError, registerError]);


  const fadeIn = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: {
      duration: 0.2
    }
  }

  const slideIn = {
    initial: { x: isLogin ? -20 : 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: isLogin ? 20 : -20, opacity: 0 },
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  }

  const containerVariants = {
    initial: { height: isLogin ? "450px" : "520px" },
    animate: { 
      height: isLogin ? "450px" : "520px",
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-gray-50 to-emerald-50 transition-all duration-700">
      {/* Add Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center group">
                <FiBook className="w-8 h-8 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-500 group-hover:text-emerald-700 transition-colors">
                  EduLearn
                </span>
              </Link>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Need help? </span>
              <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Adjust the main content container to account for the fixed navbar */}
      <div className="pt-16 min-h-screen flex items-center justify-center p-4">
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="max-w-md w-full m-4 p-6 bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg 
            border border-gray-100
            hover:shadow-xl hover:shadow-green-100/50 transition-all duration-300 overflow-hidden"
        >
          {/* Toggle Switch */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100/80 p-1.5 rounded-2xl flex gap-1 shadow-inner border border-gray-200/50 backdrop-blur-sm">
              {["Login", "Sign Up"].map((type) => (
                <motion.button
                  key={type}
                  onClick={() => setIsLogin(type === "Login")}
                  className={`relative px-10 py-2.5 rounded-xl text-sm font-medium 
                    transition-colors duration-200 select-none
                    ${(type === "Login" && isLogin) || (type === "Sign Up" && !isLogin)
                      ? 'text-white'
                      : 'text-gray-500 hover:text-gray-700'}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {((type === "Login" && isLogin) || (type === "Sign Up" && !isLogin)) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-400 rounded-xl shadow-md"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30
                      }}
                      style={{ 
                        zIndex: -1,
                      }}
                    />
                  )}
                  <span className="relative z-10">{type}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login-form" : "signup-form"}
              className="space-y-4"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={slideIn}
            >
              {/* Form Header */}
              <motion.div 
                variants={fadeIn}
                className="text-center space-y-1"
              >
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-500">
                  {isLogin ? 'Welcome Back' : 'Join Us'}
                </h2>
                <p className="text-gray-600">
                  {isLogin ? "We're glad to see you again" : "Begin your journey with us"}
                </p>
              </motion.div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <motion.div className="space-y-3">
                  {/* Name field - conditionally rendered */}
                  {!isLogin && (
                    <motion.div
                      variants={fadeIn}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="group"
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        name="name"
                        type="text"
                        required
                        value={signupInput.name}
                        onChange={changeHandler}
                        className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl 
                          bg-gray-50/30 backdrop-blur-sm
                          transition-all duration-200 
                          focus:ring-2 focus:ring-green-500 focus:border-transparent
                          group-hover:border-green-200
                          text-gray-700 placeholder-gray-400"
                        placeholder="Enter your name"
                      />
                    </motion.div>
                  )}

                  {/* Email and Password fields */}
                  <motion.div variants={fadeIn} className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      name="email"
                      type="email"
                      required
                      value={isLogin ? loginInput.email : signupInput.email}
                      onChange={changeHandler}
                      className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl 
                        bg-gray-50/30 backdrop-blur-sm
                        transition-all duration-200 
                        focus:ring-2 focus:ring-green-500 focus:border-transparent
                        group-hover:border-green-200
                        text-gray-700 placeholder-gray-400"
                      placeholder="email@example.com"
                    />
                  </motion.div>

                  <motion.div variants={fadeIn} className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      name="password"
                      type="password"
                      required
                      value={isLogin ? loginInput.password : signupInput.password}
                      onChange={changeHandler}
                      className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl 
                        bg-gray-50/30 backdrop-blur-sm
                        transition-all duration-200 
                        focus:ring-2 focus:ring-green-500 focus:border-transparent
                        group-hover:border-green-200
                        text-gray-700 placeholder-gray-400"
                      placeholder="••••••••"
                    />
                  </motion.div>
                </motion.div>

                <motion.div
                  className="pt-1"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-green-600 to-emerald-500 
                      text-white rounded-xl font-medium 
                      shadow-lg shadow-green-100 
                      hover:shadow-xl hover:shadow-green-200/50 
                      hover:-translate-y-0.5 
                      transition-all duration-200
                      disabled:opacity-50 disabled:cursor-not-allowed
                      disabled:hover:shadow-none disabled:hover:translate-y-0"
                    disabled={isFormIncomplete || (isLogin ? loginLoading : registerLoading)}
                  >
                    {isLogin 
                      ? (loginLoading ? 'Logging in...' : 'Login') 
                      : (registerLoading ? 'Creating Account...' : 'Create Account')}
                  </Button>
                </motion.div>
              </form>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

export default Login