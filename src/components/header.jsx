import { useEffect, useRef, useState, useContext } from "react";
import { useLocation, Link } from "react-router-dom";
import UserContext from "../contexts/UserContext";

/* Normalize any role casing (e.g. "User", "MANAGER") to a known key */
const normalizeRole = (role) => {
  const r = (role || "").toString().trim().toLowerCase();
  if (["sales", "sale"].includes(r)) return "sales";
  if (["production", "factory"].includes(r)) return "production";
  if (["manager", "management"].includes(r)) return "manager";
  if (["admin", "administrator"].includes(r)) return "admin";
  return "customer";
};

/* Role-specific workspace links shown inside the user dropdown */
const WORKSPACE = {
  customer: {
    title: "Tài khoản của tôi",
    links: [
      { label: "Giỏ hàng", href: "/cart" },
      { label: "Đơn hàng của tôi", href: "/orders" },
      { label: "Tin nhắn", href: "/chat" },
    ],
  },
  sales: {
    title: "Khu vực Kinh doanh",
    links: [
      { label: "Bảng điều khiển", href: "/sales" },
      { label: "Đơn hàng", href: "/sales/orders" },
      { label: "Yêu cầu báo giá", href: "/sales/quotations" },
      { label: "Chăm sóc khách", href: "/sales/chat" },
    ],
  },
  production: {
    title: "Khu vực Sản xuất",
    links: [
      { label: "Bảng điều khiển", href: "/production" },
      { label: "Lệnh sản xuất", href: "/production/orders" },
      { label: "Tiến độ", href: "/production/progress" },
      { label: "Giao hàng", href: "/production/delivery" },
    ],
  },
  manager: {
    title: "Khu vực Quản lý",
    links: [
      { label: "Bảng điều khiển", href: "/manager" },
      { label: "Sản phẩm", href: "/manager/products" },
      { label: "Đơn hàng", href: "/manager/orders" },
      { label: "Doanh thu", href: "/manager/revenue" },
    ],
  },
  admin: {
    title: "Khu vực Quản trị",
    links: [
      { label: "Bảng điều khiển", href: "/admin" },
      { label: "Người dùng", href: "/admin/users" },
      { label: "Phân quyền", href: "/admin/roles" },
      { label: "Nhật ký hệ thống", href: "/admin/system-logs" },
    ],
  },
};

const ROLE_LABEL = {
  customer: "Khách hàng",
  sales: "Nhân viên Kinh doanh",
  production: "Nhân viên Sản xuất",
  manager: "Quản lý",
  admin: "Quản trị viên",
};

const Header = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef(null);

  const { user, setUser } = useContext(UserContext);
  const roleKey = user ? normalizeRole(user.role) : null;
  const workspace = roleKey ? WORKSPACE[roleKey] : null;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // close menus on route change
  useEffect(() => {
    setShowMobileMenu(false);
    setShowUserMenu(false);
  }, [currentPath]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  // Main nav stays clean: public links, plus quick shopping links for customers.
  const publicMenu = [
    { label: "Trang chủ", href: "/" },
    { label: "Sản phẩm", href: "/products" },
    { label: "Thiết kế 3D", href: "/design" },
  ];
  const customerExtra = [
    { label: "Giỏ hàng", href: "/cart" },
    { label: "Đơn hàng", href: "/orders" },
  ];
  const menuItems =
    roleKey === "customer" ? [...publicMenu, ...customerExtra] : publicMenu;

  const displayName = user?.name || (user?.email ? user.email.split("@")[0] : "Tài khoản");
  const initial = (displayName || "U")[0].toUpperCase();

  const linkClass = (href) =>
    `whitespace-nowrap text-sm font-medium transition-colors duration-200 ${
      currentPath === href
        ? "text-[var(--clay-dark)]"
        : "text-[var(--body)] hover:text-[var(--clay)]"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[#f7f4efcc] backdrop-blur-md">
      <nav className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 md:px-6">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[var(--clay)] to-[var(--clay-dark)] font-serif text-sm font-bold text-white shadow-[var(--shadow-clay)]">
            IS
          </span>
          <span className="hidden font-serif text-xl font-semibold tracking-tight text-[var(--ink)] sm:inline">
            Interior Studio
          </span>
        </Link>

        {/* DESKTOP MENU (centered) */}
        <ul className="hidden items-center justify-center gap-8 md:flex">
          {menuItems.map((item) => (
            <li key={item.href} className="flex items-center">
              <Link to={item.href} className={linkClass(item.href)}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* RIGHT */}
        <div className="flex items-center justify-end gap-3">
          {user ? (
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setShowUserMenu((p) => !p)}
                className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-white py-1.5 pl-1.5 pr-3 text-sm text-[var(--ink)] shadow-[var(--shadow-sm)] transition hover:border-[var(--clay)]"
                aria-haspopup="true"
                aria-expanded={showUserMenu}
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[var(--clay)] to-[var(--clay-dark)] text-xs font-bold text-white">
                  {initial}
                </span>
                <span className="hidden max-w-[120px] truncate font-medium sm:inline">
                  {displayName}
                </span>
                <i className="fa-solid fa-chevron-down text-[10px] text-[var(--muted)]" />
              </button>

              {showUserMenu && (
                <div className="anim-fade-in absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow-md)]">
                  {/* account summary */}
                  <div className="flex items-center gap-3 border-b border-[var(--line)] bg-[var(--clay-tint)] px-4 py-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[var(--clay)] to-[var(--clay-dark)] text-sm font-bold text-white">
                      {initial}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-[var(--ink)]">
                        {displayName}
                      </div>
                      <div className="truncate text-xs text-[var(--body)]">
                        {user?.email}
                      </div>
                      <span className="mt-0.5 inline-block rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--clay-dark)]">
                        {ROLE_LABEL[roleKey]}
                      </span>
                    </div>
                  </div>

                  {/* workspace / role links */}
                  {workspace && (
                    <div className="py-1">
                      <div className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                        {workspace.title}
                      </div>
                      {workspace.links.map((l) => (
                        <Link
                          key={l.href}
                          to={l.href}
                          className="block px-4 py-2 text-sm text-[var(--body)] transition hover:bg-[var(--clay-tint)] hover:text-[var(--clay-dark)]"
                        >
                          {l.label}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* profile + logout */}
                  <div className="border-t border-[var(--line)] py-1">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-[var(--body)] transition hover:bg-[var(--clay-tint)]"
                    >
                      Hồ sơ cá nhân
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm font-medium text-[var(--danger)] transition hover:bg-[#fbeceb]"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden gap-2 sm:flex">
              <Link
                to="/login"
                className="rounded-full bg-[var(--clay)] px-5 py-2 text-sm font-medium text-white shadow-[var(--shadow-clay)] transition hover:-translate-y-0.5 hover:bg-[var(--clay-dark)]"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="rounded-full border border-[var(--line)] bg-white px-5 py-2 text-sm font-medium text-[var(--body)] transition hover:border-[var(--clay)] hover:text-[var(--clay)]"
              >
                Đăng ký
              </Link>
            </div>
          )}

          {/* MOBILE TOGGLE */}
          <div className="md:hidden">
          <button
            onClick={() => setShowMobileMenu((p) => !p)}
            className="grid h-10 w-10 place-items-center rounded-lg border border-[var(--line)] bg-white text-[var(--ink)] transition hover:border-[var(--clay)]"
            aria-label="Menu"
            aria-expanded={showMobileMenu}
          >
            <span className="relative block h-4 w-5">
              <span
                className={`absolute left-0 block h-0.5 w-5 bg-current transition-all duration-300 ${
                  showMobileMenu ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-1.5 block h-0.5 w-5 bg-current transition-all duration-200 ${
                  showMobileMenu ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 block h-0.5 w-5 bg-current transition-all duration-300 ${
                  showMobileMenu ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </span>
          </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU PANEL */}
      <div
        className={`overflow-hidden border-t border-[var(--line)] bg-[#f7f4ef] transition-[max-height,opacity] duration-300 md:hidden ${
          showMobileMenu ? "max-h-[640px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="flex flex-col gap-1 px-4 py-3">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  currentPath === item.href
                    ? "bg-[var(--clay-tint)] text-[var(--clay-dark)]"
                    : "text-[var(--body)] hover:bg-[var(--clay-tint)]"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}

          {/* role workspace links on mobile */}
          {workspace && (
            <li className="mt-2 border-t border-[var(--line)] pt-2">
              <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                {workspace.title}
              </div>
              {workspace.links.map((l) => (
                <Link
                  key={l.href}
                  to={l.href}
                  className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    currentPath === l.href
                      ? "bg-[var(--clay-tint)] text-[var(--clay-dark)]"
                      : "text-[var(--body)] hover:bg-[var(--clay-tint)]"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </li>
          )}

          {user ? (
            <li className="mt-2 border-t border-[var(--line)] pt-2">
              <Link
                to="/profile"
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--body)] transition hover:bg-[var(--clay-tint)]"
              >
                Hồ sơ cá nhân
              </Link>
              <button
                onClick={handleLogout}
                className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[var(--danger)] transition hover:bg-[#fbeceb]"
              >
                Đăng xuất
              </button>
            </li>
          ) : (
            <li className="mt-2 flex gap-2 border-t border-[var(--line)] pt-3">
              <Link
                to="/login"
                className="flex-1 rounded-full bg-[var(--clay)] px-4 py-2 text-center text-sm font-medium text-white"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="flex-1 rounded-full border border-[var(--line)] bg-white px-4 py-2 text-center text-sm font-medium text-[var(--body)]"
              >
                Đăng ký
              </Link>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
};

export default Header;
