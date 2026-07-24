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
  return ROLE_KEYS.CUSTOMER;
}

/** Section path prefix allowed for a role key */
export const ROLE_SECTIONS = Object.freeze({
  customer: [],
  sales: ["sales"],
  manager: ["manager"],
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

/**
 * Hiển thị số “ngưỡng+” cho stats storefront.
 * Ví dụ: 13 → "10+", 6 → "5+", 5 → "5", 120 → "100+"
 */
export function formatCountThreshold(n) {
  const count = Number(n) || 0;
  const thresholds = [10000, 1000, 100, 50, 10, 5];
  for (const t of thresholds) {
    if (count > t) return `${t}+`;
  }
  return String(count);
}

/** Còn hàng khi stock > 0 (hoặc cờ inStock) */
export function isProductInStock(p) {
  if (!p) return false;
  if (p.inStock === false) return false;
  if (p.inStock === true) return true;
  if (p.stock != null && p.stock !== "") return Number(p.stock) > 0;
  return true;
}

/** % giảm so với giá thị trường */
export function discountPct(price, marketPrice) {
  const p = Number(price) || 0;
  const m = Number(marketPrice) || 0;
  if (!m || m <= p) return 0;
  return Math.round(((m - p) / m) * 100);
}

/** Hierarchy: Customer < Sales < Manager < Admin */
export const ROLE_RANK = Object.freeze({
  Customer: 1,
  Sales: 2,
  Manager: 3,
  Admin: 4,
});

export function roleRank(role) {
  const canonical =
    role === ROLES.CUSTOMER ||
    role === ROLES.SALES ||
    role === ROLES.MANAGER ||
    role === ROLES.ADMIN
      ? role
      : ({
          customer: ROLES.CUSTOMER,
          sales: ROLES.SALES,
          manager: ROLES.MANAGER,
          admin: ROLES.ADMIN,
        }[normalizeRole(role)] || ROLES.CUSTOMER);
  return ROLE_RANK[canonical] || 0;
}

/** Actor may manage target only if target rank is strictly lower */
export function canManageUser(actor, target) {
  if (!actor || !target) return false;
  if (actor.id != null && target.id != null && Number(actor.id) === Number(target.id)) {
    return false;
  }
  return roleRank(actor.role) > roleRank(target.role);
}

/** Roles actor may assign (strictly below own rank) */
export function assignableRoles(actorRole) {
  const actorLevel = roleRank(actorRole);
  return Object.values(ROLES).filter((r) => ROLE_RANK[r] < actorLevel);
}

/**
 * Trang luôn mở (không cần trong RolePermissions):
 * trang chủ + tổng quan admin/manager/sales.
 */
export const ALWAYS_ALLOWED_PATHS = Object.freeze([
  "/",
  "/admin",
  "/manager",
  "/sales",
]);

export function isAlwaysAllowedPath(pathname) {
  const path = (pathname || "/").split("?")[0].replace(/\/$/, "") || "/";
  return ALWAYS_ALLOWED_PATHS.includes(path);
}

/** pageKey khớp exact hoặc là prefix của pathname (vd /sales/design-requests/3) */
export function pathMatchesPageKey(pathname, pageKey) {
  const path = (pathname || "/").split("?")[0];
  const key = pageKey || "";
  if (!key) return false;
  return path === key || path.startsWith(`${key}/`);
}

export function canAccessPage(pathname, permissions) {
  if (isAlwaysAllowedPath(pathname)) return true;
  const path = (pathname || "/").split("?")[0];
  if (path === "/sales/quotation-approval" || path.startsWith("/sales/quotation-approval/")) {
    return canAccessPage("/sales/quotations", permissions);
  }
  if (path === "/manager/orders" || path.startsWith("/manager/orders/")) {
    const list = Array.isArray(permissions) ? permissions : [];
    if (list.some((k) => String(k).startsWith("/manager"))) return true;
    return canAccessPage("/sales/orders", permissions);
  }
  const list = Array.isArray(permissions) ? permissions : [];
  return list.some((k) => pathMatchesPageKey(pathname, k));
}

export function filterMenuByPermissions(items, permissions) {
  const list = Array.isArray(permissions) ? permissions : [];
  const walk = (nodes) =>
    (nodes || [])
      .map((item) => {
        if (Array.isArray(item.children)) {
          const children = walk(item.children);
          if (children.length === 0) return null;
          return { ...item, children };
        }
        if (item.type === "divider") return item;
        const key = item.key;
        if (!key || typeof key !== "string" || key.startsWith("sub-")) return item;
        if (isAlwaysAllowedPath(key)) return item;
        if (list.some((k) => pathMatchesPageKey(key, k) || pathMatchesPageKey(k, key))) {
          return item;
        }
        return null;
      })
      .filter(Boolean);

  return walk(items);
}
