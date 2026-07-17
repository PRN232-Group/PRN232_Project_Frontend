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

export async function login({ email, password }) {
  if (!email || !password) {
    throw new Error("Vui lòng nhập đầy đủ thông tin.");
  }
  if (password.length < 6) {
    throw new Error("Mật khẩu phải có ít nhất 6 ký tự.");
  }

  try {
    const res = await apiClient.post("/api/auth/login", { email, password });
    const payload = res.data || {};
    const user = {
      id: payload.id ?? payload.userId,
      name: payload.name || email.split("@")[0],
      email: payload.email || email,
      role: payload.role || "Customer",
      phone: payload.phone,
      avatarUrl: payload.avatarUrl,
      permissions: Array.isArray(payload.permissions) ? payload.permissions : [],
    };
    if (payload.accessToken || payload.token) {
      setAccessToken(payload.accessToken || payload.token);
    } else if (isMockEnabled()) {
      setAccessToken("mock-token");
    }
    setUser(user);
    return { user, landing: ROLE_LANDING[user.role] || "/" };
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      "Đăng nhập thất bại.";
    throw new Error(msg);
  }
}

/** Bước 1: gửi OTP — chưa tạo user trên DB */
export async function requestRegister(payload) {
  const res = await apiClient.post("/api/auth/register/request", payload);
  return res.data;
}

/** Bước 2: verify OTP → tạo user */
export async function verifyRegister({ email, otp }) {
  const res = await apiClient.post("/api/auth/register/verify", { email, otp });
  return res.data;
}

export async function forgotPassword(email) {
  const res = await apiClient.post("/api/auth/forgot-password", { email });
  return res.data;
}

export async function verifyForgotOtp({ email, otp }) {
  const res = await apiClient.post("/api/auth/forgot-password/verify", {
    email,
    otp,
  });
  return res.data;
}

export async function resetPassword({
  email,
  resetToken,
  newPassword,
  confirmPassword,
}) {
  const res = await apiClient.post("/api/auth/reset-password", {
    email,
    resetToken,
    newPassword,
    confirmPassword,
  });
  return res.data;
}

export function logout() {
  clearSession();
}

export function currentUser() {
  return getUser();
}
