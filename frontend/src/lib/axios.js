import axios from "axios";

// Determine base API URL:
// 1. Prefer VITE_API_URL environment variable if set (e.g. in Vercel production: https://chat-app-xq7u.onrender.com/api)
// 2. Otherwise default to localhost:5001/api in development, or fallback to /api
const getBaseURL = () => {
  const rawUrl = import.meta.env.VITE_API_URL;
  if (rawUrl) {
    const cleanUrl = rawUrl.replace(/\/+$/, "");
    return cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;
  }
  return import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api";
};

export const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});
