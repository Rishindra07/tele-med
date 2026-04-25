import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const apiURL = baseURL.endsWith('/api') || baseURL.endsWith('/api/') ? baseURL : `${baseURL.replace(/\/$/, '')}/api`;
const formattedBaseURL = apiURL.endsWith('/') ? apiURL : `${apiURL}/`;

const API = axios.create({
  baseURL: formattedBaseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response handler
API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (!error.response) {
      return Promise.reject({ message: "Network error. Check internet." });
    }

    if (error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Redirect to login if not already there
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject({
      status: error.response.status,
      message: error.response.data?.message || "Something went wrong",
    });
  }
);

export default API;
