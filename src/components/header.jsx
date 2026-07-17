import { useEffect, useRef, useState, useContext } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import UserContext from "../contexts/UserContext";
import { normalizeRole, ROLE_LABEL, ROLE_LANDING } from "../domain/roles";
import { logout as logoutUseCase } from "../application/services/authService";
import "../styles/site-header.css";

const WORKSPACE = {
  customer: {
    title: "Tài khoản của tôi",
    links: [
      { label: "Giỏ hàng", href: "/cart" },
      { label: "Đơn hàng của tôi", href: "/orders" },
      { label: "Báo giá của tôi", href: "/my-quotations" },
      { label: "Hỗ trợ / Tin nhắn", href: "/chat" },
    ],
  },
  sales: {
    title: "Khu vực Kinh doanh",
    links: [
      { label: "Bảng điều khiển", href: "/sales" },
      { label: "Đơn hàng", href: "/sales/orders" },
      { label: "Báo giá", href: "/sales/quotations" },
      { label: "Yêu cầu thiết kế", href: "/sales/design-requests" },
      { label: "Chăm sóc khách", href: "/sales/chat" },
    ],
  },
  manager: {
    title: "Khu vực Quản lý",
    links: [
      { label: "Bảng điều khiển", href: "/manager" },
      { label: "Sản phẩm", href: "/manager/products" },
      { label: "Concept thiết kế", href: "/manager/designs" },
      { label: "Danh mục", href: "/manager/categories" },
      { label: "Doanh thu", href: "/manager/revenue" },
    ],
  },
  admin: {
    title: "Khu vực Quản trị",
    links: [
      { label: "Bảng điều khiển", href: "/admin" },
      { label: "Người dùng", href: "/admin/users" },
      { label: "Concept thiết kế", href: "/manager/designs" },
      { label: "Sản phẩm (QL)", href: "/manager/products" },
    ],
  },
};

function IconBag({ className = "" }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function IconMenu({ open }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      {open ? (
        <path
          d="M6 6l12 12M18 6L6 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M4 7h16M4 12h16M4 17h16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

function readCartCount() {
  try {
    const local = JSON.parse(localStorage.getItem("cart") || "[]");
    if (Array.isArray(local) && local.length) {
      return local.reduce((s, i) => s + (Number(i.quantity) || 1), 0);
    }
  } catch {
    /* ignore */
  }
  return Number(localStorage.getItem("cartCount") || 0);
}

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const dropdownRef = useRef(null);

  const { user, setUser } = useContext(UserContext);
  const roleKey = user ? normalizeRole(user.role) : null;
  const isCustomer = !user || roleKey === "customer";
  const workspace = roleKey ? WORKSPACE[roleKey] : null;
  const workspaceHome = roleKey ? ROLE_LANDING[roleKey] || "/" : "/";

  useEffect(() => {
    const sync = () => setCartCount(readCartCount());
    sync();
    window.addEventListener("cart-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("cart-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setShowMobileMenu(false);
    setShowUserMenu(false);
  }, [currentPath]);

  const handleLogout = () => {
    logoutUseCase();
    setUser(null);
    window.location.href = "/";
  };

  const menuItems = isCustomer
    ? [
        { label: "Trang chủ", href: "/" },
        { label: "Sản phẩm", href: "/products" },
        { label: "Concept thiết kế", href: "/design" },
        { label: "Cảm hứng", href: "/blog" },
        ...(user ? [{ label: "Đơn hàng", href: "/orders" }] : []),
      ]
    : [
        { label: "Trang chủ", href: "/" },
        { label: "Khu vực làm việc", href: workspaceHome },
        ...(workspace?.links.slice(0, 2) || []),
      ];

  const displayName =
    user?.name || (user?.email ? user.email.split("@")[0] : "Tài khoản");
  const initial = (displayName || "U")[0].toUpperCase();

  const isActive = (href) =>
    currentPath === href ||
    (href !== "/" && currentPath.startsWith(href + "/"));

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="site-brand">
          <span className="site-brand-mark">IS</span>
          <span className="site-brand-name">Interior Studio</span>
        </Link>

        <nav className="site-nav-desktop" aria-label="Menu chính">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`site-nav-link${isActive(item.href) ? " is-active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="site-header-actions">
          {isCustomer && (
            <button
              type="button"
              className="site-icon-btn"
              onClick={() => navigate("/cart")}
              aria-label="Giỏ hàng"
              title="Giỏ hàng"
            >
              <IconBag />
              {cartCount > 0 && (
                <span className="site-cart-badge">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>
          )}

          {user ? (
            <div className="site-user" ref={dropdownRef}>
              <button
                type="button"
                className="site-user-btn"
                onClick={() => setShowUserMenu((p) => !p)}
                aria-expanded={showUserMenu}
                aria-haspopup="true"
              >
                <span className="site-avatar">{initial}</span>
                <span className="site-user-name">{displayName}</span>
                <span className="site-chevron" aria-hidden>
                  ▾
                </span>
              </button>

              {showUserMenu && (
                <div className="site-dropdown">
                  <div className="site-dropdown-head">
                    <span className="site-avatar lg">{initial}</span>
                    <div className="site-dropdown-meta">
                      <strong>{displayName}</strong>
                      <span>{user?.email}</span>
                      <em>{ROLE_LABEL[roleKey]}</em>
                    </div>
                  </div>
                  {workspace && (
                    <div className="site-dropdown-section">
                      <p>{workspace.title}</p>
                      {workspace.links.map((l) => (
                        <Link key={l.href} to={l.href}>
                          {l.label}
                        </Link>
                      ))}
                    </div>
                  )}
                  <div className="site-dropdown-foot">
                    <Link to="/profile">Hồ sơ cá nhân</Link>
                    <button type="button" onClick={handleLogout}>
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="site-auth-desktop">
              <Link to="/login" className="site-btn site-btn-primary">
                Đăng nhập
              </Link>
              <Link to="/register" className="site-btn site-btn-ghost">
                Đăng ký
              </Link>
            </div>
          )}

          <button
            type="button"
            className="site-icon-btn site-burger"
            onClick={() => setShowMobileMenu((p) => !p)}
            aria-label="Menu"
            aria-expanded={showMobileMenu}
          >
            <IconMenu open={showMobileMenu} />
          </button>
        </div>
      </div>

      <div
        className={`site-mobile-panel${showMobileMenu ? " is-open" : ""}`}
        id="site-mobile-nav"
      >
        {menuItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={isActive(item.href) ? "is-active" : undefined}
          >
            {item.label}
          </Link>
        ))}

        {workspace && (
          <>
            <p className="site-mobile-label">{workspace.title}</p>
            {workspace.links.map((l) => (
              <Link key={l.href} to={l.href}>
                {l.label}
              </Link>
            ))}
          </>
        )}

        {user ? (
          <>
            <Link to="/profile">Hồ sơ cá nhân</Link>
            <button type="button" className="site-mobile-logout" onClick={handleLogout}>
              Đăng xuất
            </button>
          </>
        ) : (
          <div className="site-auth-mobile">
            <Link to="/login" className="site-btn site-btn-primary">
              Đăng nhập
            </Link>
            <Link to="/register" className="site-btn site-btn-ghost">
              Đăng ký
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
