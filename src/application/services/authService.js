import apiClient from "../../infrastructure/http/apiClient";
import {
  setUser,
  setAccessToken,
  clearSession,
  getUser,
} from "../../infrastructure/storage/authStorage";
import { ROLE_LANDING } from "../../domain/roles";
import { isMockEnabled } from "../../infrastructure/mock/installMockApi";

/**
 * Application: authentication use-cases.
 */

export async function login({ email, password, role }) {
  if (!email || !password) {
    throw new Error("Vui lòng nhập đầy đủ thông tin.");
  }
  if (password.length < 6) {
    throw new Error("Mật khẩu phải có ít nhất 6 ký tự.");
  }

  const res = await apiClient.post("/api/auth/login", {
    email,
    password,
    role,
  });
  const payload = res.data || {};
  const user = {
    id: payload.id ?? payload.userId ?? 12,
    name: payload.name || email.split("@")[0],
    email: payload.email || email,
    role: payload.role || role || "Customer",
    phone: payload.phone,
    avatarUrl: payload.avatarUrl,
  };
  if (payload.accessToken || payload.token) {
    setAccessToken(payload.accessToken || payload.token);
  } else if (isMockEnabled()) {
    setAccessToken("mock-token");
  }
  setUser(user);
  return { user, landing: ROLE_LANDING[user.role] || "/" };
}

export async function register(payload) {
  const res = await apiClient.post("/api/auth/register", payload);
  return res.data;
}

export async function forgotPassword(email) {
  const res = await apiClient.post("/api/auth/forgot-password", { email });
  return res.data;
}

export function logout() {
  clearSession();
}

export function currentUser() {
  return getUser();
}
