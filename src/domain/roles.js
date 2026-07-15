/**
 * Domain: role identity & navigation rules (pure, no I/O).
 */

export const ROLES = Object.freeze({
  CUSTOMER: "Customer",
  SALES: "Sales",
  MANAGER: "Manager",
  ADMIN: "Admin",
});

/** Canonical keys used by UI shells / menus */
export const ROLE_KEYS = Object.freeze({
  CUSTOMER: "customer",
  SALES: "sales",
  MANAGER: "manager",
  ADMIN: "admin",
});

export const ROLE_LABEL = Object.freeze({
  customer: "Khách hàng",
  sales: "Nhân viên Kinh doanh",
  manager: "Quản lý",
  admin: "Quản trị viên",
});

export const ROLE_LANDING = Object.freeze({
  Customer: "/",
  Sales: "/sales",
  Manager: "/manager",
  Admin: "/admin",
  customer: "/",
  sales: "/sales",
  manager: "/manager",
  admin: "/admin",
});

/** Maps any casing / alias → role key used by Header & DashboardShell */
export function normalizeRole(role) {
  const r = (role || "").toString().trim().toLowerCase();
  if (["sales", "sale"].includes(r)) return ROLE_KEYS.SALES;
  if (["manager", "management"].includes(r)) return ROLE_KEYS.MANAGER;
  if (["admin", "administrator"].includes(r)) return ROLE_KEYS.ADMIN;
  // Legacy production → manager workspace
  if (["production", "factory"].includes(r)) return ROLE_KEYS.MANAGER;
  return ROLE_KEYS.CUSTOMER;
}

/** Section path prefix allowed for a role key */
export const ROLE_SECTIONS = Object.freeze({
  customer: [],
  sales: ["sales"],
  manager: ["manager"],
  // Admin = full Sales + Quản lý + Admin
  admin: ["admin", "manager", "sales"],
});

export function canAccessSection(role, section) {
  const key = normalizeRole(role);
  const allowed = ROLE_SECTIONS[key] || [];
  return allowed.includes(section);
}

export function formatVnd(n) {
  return `${Number(n || 0).toLocaleString("vi-VN")} ₫`;
}

/** % giảm so với giá thị trường */
export function discountPct(price, marketPrice) {
  const p = Number(price) || 0;
  const m = Number(marketPrice) || 0;
  if (!m || m <= p) return 0;
  return Math.round(((m - p) / m) * 100);
}
