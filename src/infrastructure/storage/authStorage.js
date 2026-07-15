/**
 * Infrastructure: auth persistence (localStorage adapter).
 */

const USER_KEY = "user";
const TOKEN_KEY = "accessToken";

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function setUser(user) {
  if (!user) {
    localStorage.removeItem(USER_KEY);
    return;
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY) || null;
}

export function setAccessToken(token) {
  if (!token) {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearSession() {
  clearUser();
}
