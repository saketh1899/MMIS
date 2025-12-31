import axios from "axios";

// Smart API URL detection - works in both local and production
// Development: Uses VITE_API_URL from .env.development or defaults to localhost:8000
// Production: Uses VITE_API_URL from .env.production or auto-detects from current domain
const getApiUrl = () => {
  // If VITE_API_URL is set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In production (built app), use relative path /api (Nginx will proxy)
  if (import.meta.env.PROD) {
    return '/api';
  }
  
  // In development, default to localhost
  return 'http://127.0.0.1:8000';
};

const API = axios.create({
  baseURL: getApiUrl(),
  headers: { "Content-Type": "application/json" },
});

// Automatically attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
