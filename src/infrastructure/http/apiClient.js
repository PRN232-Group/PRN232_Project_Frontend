/**
 * Infrastructure: single HTTP client for the whole app.
 * Presentation & Application layers must use this — never raw axios with hard-coded hosts.
 */
import axios from "axios";
import { getAccessToken, clearSession } from "../storage/authStorage";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const contentType = response?.headers?.["content-type"] || "";
    const data = response?.data;
    const looksLikeHtml =
      typeof data === "string" &&
      (contentType.includes("text/html") || data.trimStart().startsWith("<"));
    if (looksLikeHtml) {
      return Promise.reject(new Error("Backend unavailable (received HTML)."));
    }
    return response;
  },
  (error) => {
    if (error?.response?.status === 401) {
      clearSession();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
