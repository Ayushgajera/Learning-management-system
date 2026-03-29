// components/Navbar.jsx
import { useSelector } from 'react-redux';
import StudentNavbar from './StudentNavbar';
import AdminNavbar from './AdminNavbar';
import SuperAdminNavbar from './SuperAdminNavbar';

const Navbar = () => {
  const { user, loading } = useSelector((state) => state.auth);

  // Jab tak loading ho, kuch mat dikhana
  if (loading) return null;

  // Agar user login nahi hai → Student Navbar
  if (!user) {
    return <StudentNavbar />;
  }

  // Agar user student hai
  if (user.role === 'student') {
    return <StudentNavbar />;
  }

  // Agar user superadmin hai
  if (user.role === 'admin') {
    return <SuperAdminNavbar />;
  }




  // Agar user instructor hai
  if (user.role === 'instructor') {
    return <AdminNavbar />;
  }

  // Default fallback
  return <StudentNavbar />;
};

export default Navbar;
