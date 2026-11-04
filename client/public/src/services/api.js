import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 15000
});

// Attach admin JWT automatically.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle expired admin sessions.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      localStorage.getItem("adminToken")
    ) {
      localStorage.removeItem("adminToken");

      if (window.location.pathname.startsWith("/admin")) {
        window.location.href = "/admin/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;