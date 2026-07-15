/**
 * Install axios adapter that serves mock JSON when mock mode is on.
 *
 * Turn OFF later:
 *   1. Set VITE_USE_MOCK=false and set VITE_API_BASE_URL to real API
 *   2. Optionally delete folder src/infrastructure/mock/
 *   3. Remove the installMockApi() call from main.jsx
 */
import { handleMockRequest } from "./handlers";

/**
 * Mock is ON when:
 * - VITE_USE_MOCK=true, OR
 * - VITE_USE_MOCK unset and no VITE_API_BASE_URL (Vercel / preview without backend)
 *
 * Explicit VITE_USE_MOCK=false always disables mock.
 */
export const isMockEnabled = () => {
  const flag = String(import.meta.env.VITE_USE_MOCK ?? "")
    .trim()
    .toLowerCase();
  if (flag === "true") return true;
  if (flag === "false") return false;
  const api = String(import.meta.env.VITE_API_BASE_URL || "").trim();
  return !api;
};

export function installMockApi(apiClient) {
  if (!isMockEnabled()) return false;

  apiClient.defaults.adapter = async (config) => {
    try {
      const result = await handleMockRequest(config);
      return {
        data: result.data,
        status: result.status || 200,
        statusText: "OK",
        headers: result.headers || { "content-type": "application/json" },
        config,
        request: {},
      };
    } catch (err) {
      return Promise.reject(err);
    }
  };

  if (typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.info(
      "%c[Interior Studio] MOCK API ON — set VITE_USE_MOCK=false + VITE_API_BASE_URL để dùng API thật",
      "color:#b0784f;font-weight:bold"
    );
    window.__IS_MOCK__ = true;
  }

  return true;
}
