const normalizeBaseUrl = (value) => {
    if (!value) return value;
    return String(value).trim().replace(/\/+$/, "");
};

const config = {
    // Prefer VITE_API_URL going forward; keep VITE_SERVER_URL for backward compatibility.
    API_BASE_URL: normalizeBaseUrl(
        import.meta.env.VITE_API_URL ||
        import.meta.env.VITE_SERVER_URL ||
        "https://learning-management-system-20d6.onrender.com"
    ),
};

export default config;
