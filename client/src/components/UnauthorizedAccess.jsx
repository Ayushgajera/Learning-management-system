import { FiLock, FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function UnauthorizedAccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full flex flex-col items-center">
        <div className="bg-emerald-100 rounded-full p-4 mb-4">
          <FiLock className="text-emerald-600 w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Unauthorized Access</h1>
        <p className="text-gray-600 mb-6 text-center">
          Sorry, you do not have permission to view this page.<br />
          Please login with the correct account or contact support if you believe this is a mistake.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium shadow hover:bg-emerald-700 transition"
        >
          <FiArrowLeft className="w-5 h-5" />
          Go to Login
        </button>
      </div>
    </div>
  );
}