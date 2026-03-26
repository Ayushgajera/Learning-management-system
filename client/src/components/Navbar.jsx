// components/Navbar.jsx
import { useSelector } from 'react-redux';
import StudentNavbar from './StudentNavbar';
import AdminNavbar from './AdminNavbar';
import SuperAdminNavbar from './SuperAdminNavbar';

const Navbar = () => {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) return null;

  if (!user) {
    return <StudentNavbar />;
  }

  if (user.role === 'admin') {
    return <SuperAdminNavbar />;
  }

  if (user.role === 'instructor') {
    return <AdminNavbar />;
  }

  // student or default
  return <StudentNavbar />;
};

export default Navbar;
