/**
 * Install axios adapter that serves mock JSON when mock mode is on.
 *
 * Bật mock: VITE_USE_MOCK=true
 * Tắt mock (API thật): VITE_USE_MOCK=false + VITE_API_BASE_URL
 */
import { handleMockRequest } from "./handlers";

/** Chỉ bật khi VITE_USE_MOCK=true tường minh — không auto-fallback. */
export const isMockEnabled = () => {
  const flag = String(import.meta.env.VITE_USE_MOCK ?? "")
    .trim()
    .toLowerCase();
  return flag === "true";
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
