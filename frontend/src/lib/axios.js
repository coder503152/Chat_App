import axios from "axios";

// Determine base API URL:
// 1. In development mode: default to local backend "http://localhost:5001/api" (unless VITE_API_URL overrides it)
// 2. In production: use VITE_API_URL if configured, otherwise fallback to the deployed Render backend "https://chat-app-xq7u.onrender.com/api"
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    const cleanUrl = envUrl.replace(/\/+$/, "");
    return cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;
  }
  return import.meta.env.MODE === "development"
    ? "http://localhost:5001/api"
    : "https://chat-app-xq7u.onrender.com/api";
};

export const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});
