import axios from "axios";

function normalizeApiBaseUrl(rawUrl) {
  if (!rawUrl) return "http://localhost:4000/api";

  try {
    const parsed = new URL(rawUrl);
    const path = parsed.pathname.replace(/\/+$/, "");

    if (!path || path === "") {
      parsed.pathname = "/api";
    } else if (!path.endsWith("/api")) {
      parsed.pathname = `${path}/api`;
    } else {
      parsed.pathname = path;
    }

    return parsed.toString().replace(/\/$/, "");
  } catch (error) {
    return rawUrl;
  }
}

const api = axios.create({
  baseURL: normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL)
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("gigshield_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
