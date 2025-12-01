import Loader from "../components/Loader";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function RoleRoute({ children, allowedRole, redirectTo = "/unauthorized" }) {
    const { isAuthenticated, role, loading, user } = useSelector((state) => state.auth);
    const effectiveRole = role ?? user?.role ?? null;

    // 🔹 Wait until role is loaded to avoid flicker
    if (loading || effectiveRole === null) return <Loader />;

    if (!isAuthenticated) return <Navigate to="/login" />;

    if (allowedRole && effectiveRole !== allowedRole) return <Navigate to={redirectTo} />;

    return children;
}
