import { useEffect, useRef, useState, useContext } from "react";
import { useLocation, Link } from "react-router-dom";
import UserContext from "../contexts/UserContext";

const Header = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef(null);

  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [currentPath]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  const publicMenu = [
    { label: "Trang chủ", href: "/" },
    { label: "Sản phẩm", href: "/products" },
    { label: "Thiết kế 3D", href: "/design" },
  ];

  const customerMenu = [
    { label: "Giỏ hàng", href: "/cart" },
    { label: "Đơn hàng", href: "/orders" },
    { label: "Chat", href: "/chat" },
  ];

  const salesMenu = [
    { label: "Sales Dashboard", href: "/sales" },
    { label: "Yêu cầu báo giá", href: "/sales/quotations" },
    { label: "Duyệt báo giá", href: "/sales/quotation-approval" },
    { label: "Quản lý đơn hàng", href: "/sales/orders" },
    { label: "Chat khách hàng", href: "/sales/chat" },
  ];

  const productionMenu = [
    { label: "SX Dashboard", href: "/production" },
    { label: "Đơn sản xuất", href: "/production/orders" },
    { label: "Tiến độ", href: "/production/progress" },
    { label: "Giao hàng", href: "/production/delivery" },
  ];

  const managerMenu = [
    { label: "Manager Dashboard", href: "/manager" },
    { label: "Sản phẩm", href: "/manager/products" },
    { label: "Giá", href: "/manager/prices" },
    { label: "Đơn hàng", href: "/manager/orders" },
    { label: "Doanh thu", href: "/manager/revenue" },
  ];

  const getMenu = () => {
    if (!user) return publicMenu;
    const roleMenus = {
      CUSTOMER: customerMenu,
      SALES: salesMenu,
      PRODUCTION: productionMenu,
      MANAGER: managerMenu,
      ADMIN: [],
    };
    return [...publicMenu, ...(roleMenus[user.role] || customerMenu)];
  };

  const menuItems = getMenu();

  const linkClass = (href) =>
    `text-sm font-medium transition-colors duration-200 ${
      currentPath === href
        ? "text-[var(--clay-dark)]"
        : "text-[var(--body)] hover:text-[var(--clay)]"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[#f7f4efcc] backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6 md:py-4">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[var(--clay)] to-[var(--clay-dark)] font-serif text-sm font-bold text-white shadow-[var(--shadow-clay)]">
            IS
          </span>
          <span className="font-serif text-xl font-semibold tracking-tight text-[var(--ink)]">
            Interior Studio
          </span>
        </Link>

        {/* DESKTOP MENU */}
        <ul className="hidden items-center gap-7 md:flex">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link to={item.href} className={linkClass(item.href)}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {user ? (
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-full bg-[var(--ink)] py-1.5 pl-1.5 pr-4 text-sm text-white transition hover:opacity-90"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--clay)] text-xs font-bold text-white">
                  {(user?.name || user?.email || "U")[0].toUpperCase()}
                </span>
                <span className="hidden max-w-[120px] truncate sm:inline">
                  {user?.name || user?.email}
                </span>
              </button>

              {showUserMenu && (
                <div className="anim-fade-in absolute right-0 mt-3 w-52 overflow-hidden rounded-xl border border-[var(--line)] bg-white shadow-[var(--shadow-md)]">
                  <Link
                    to="/profile"
                    className="block px-4 py-2.5 text-sm text-[var(--body)] transition hover:bg-[var(--clay-tint)]"
                  >
                    Hồ sơ
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-sm text-[var(--danger)] transition hover:bg-[#fbeceb]"
                  >
                    Đăng xuất
                  </button>
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
          <button
            onClick={() => setShowMobileMenu((p) => !p)}
            className="grid h-10 w-10 place-items-center rounded-lg border border-[var(--line)] bg-white text-[var(--ink)] transition hover:border-[var(--clay)] md:hidden"
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
      </nav>

      {/* MOBILE MENU PANEL */}
      <div
        className={`overflow-hidden border-t border-[var(--line)] bg-[#f7f4ef] transition-[max-height,opacity] duration-300 md:hidden ${
          showMobileMenu ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0"
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
          {!user && (
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
