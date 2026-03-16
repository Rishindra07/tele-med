import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000, // 10 sec network timeout
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

    return Promise.reject({
      status: error.response.status,
      message: error.response.data?.message || "Something went wrong",
    });
  }
);

export default API;
