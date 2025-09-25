import Loader from "../components/Loader";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function RoleRoute({ children, allowedRole }) {
    const { isAuthenticated, role, loading } = useSelector((state) => state.auth);

    // 🔹 Wait until role is loaded to avoid flicker
    if (loading || role === null) return <Loader />;

    if (!isAuthenticated) return <Navigate to="/login" />;

    if (role !== allowedRole) return <Navigate to="/unauthorized" />;

    return children;
}
