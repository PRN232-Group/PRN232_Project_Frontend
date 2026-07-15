/**
 * Install axios adapter that serves mock JSON when VITE_USE_MOCK=true.
 *
 * Turn OFF later:
 *   1. Set VITE_USE_MOCK=false (or remove from .env.local)
 *   2. Optionally delete folder src/infrastructure/mock/
 *   3. Remove the installMockApi() call from main.jsx
 */
import { handleMockRequest } from "./handlers";

export const isMockEnabled = () =>
  String(import.meta.env.VITE_USE_MOCK || "").toLowerCase() === "true";

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
      "%c[Interior Studio] MOCK API ON — set VITE_USE_MOCK=false để dùng API thật",
      "color:#b0784f;font-weight:bold"
    );
    window.__IS_MOCK__ = true;
  }

  return true;
}
