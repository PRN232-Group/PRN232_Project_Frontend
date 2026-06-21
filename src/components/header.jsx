import { useEffect, useRef, useState, useContext } from "react";
import { useLocation, Link } from "react-router-dom";
import UserContext from "../contexts/UserContext";

const Header = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const [showUserMenu, setShowUserMenu] = useState(false);
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

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  // =========================
  // MENU CONFIG BY ROLE
  // =========================

  // 🔥 FIXED: chỉ giữ route có thật
  const publicMenu = [
    { label: "Trang chủ", href: "/" },
    { label: "Sản phẩm", href: "/products" },
    { label: "Thiết kế 3D", href: "/design" },
  ];

  const customerMenu = [
    { label: "Sản phẩm", href: "/products" },
    { label: "Giỏ hàng", href: "/cart" },
    { label: "Đơn hàng", href: "/orders" },
    { label: "Chat", href: "/chat" },
  ];

  const salesMenu = [
    { label: "Dashboard Sales", href: "/sales" },
    { label: "Yêu cầu báo giá", href: "/sales/quotation-request" },
    { label: "Duyệt báo giá", href: "/sales/quotation-approval" },
    { label: "Quản lý đơn hàng", href: "/sales/orders" },
    { label: "Chat khách hàng", href: "/sales/chat" },
  ];

  const productionMenu = [
    { label: "Dashboard SX", href: "/production" },
    { label: "Danh sách đơn SX", href: "/production/orders" },
    { label: "Tiến độ", href: "/production/progress" },
    { label: "Cập nhật giao hàng", href: "/production/delivery" },
  ];

  const managerMenu = [
    { label: "Dashboard", href: "/manager" },
    { label: "Sản phẩm", href: "/manager/products" },
    { label: "Giá", href: "/manager/prices" },
    { label: "Đơn hàng", href: "/manager/orders" },
    { label: "Doanh thu", href: "/manager/revenue" },
  ];

  // ❌ ADMIN KHÔNG HIỂN THỊ TRONG HEADER
  const adminMenu = [];

  const getMenu = () => {
    if (!user) return publicMenu;

    switch (user.role) {
      case "ADMIN":
        return adminMenu;
      case "MANAGER":
        return managerMenu;
      case "SALES":
        return salesMenu;
      case "PRODUCTION":
        return productionMenu;
      default:
        return [...publicMenu, ...customerMenu];
    }
  };

  const menuItems = getMenu();

  return (
    <header className="bg-white/70 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 shadow-sm">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 shadow-md" />
          <span className="text-xl font-semibold text-gray-800">
            Interior Studio
          </span>
        </Link>

        {/* MENU */}
        <ul className="hidden md:flex items-center gap-6">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className={`text-sm font-medium relative transition ${
                  currentPath === item.href
                    ? "text-amber-600"
                    : "text-gray-600 hover:text-amber-600"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          {/* CTA */}
          <Link
            to="/consultation"
            className="hidden md:inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2 rounded-full text-sm font-medium"
          >
            Đặt tư vấn
          </Link>

          {/* AUTH */}
          {user ? (
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 text-white text-sm"
              >
                <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold">
                  {(user?.name || user?.email || "U")[0].toUpperCase()}
                </div>
                {user?.name || user?.email}
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-3 w-52 bg-white border rounded-xl shadow-lg overflow-hidden">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 hover:bg-gray-50"
                  >
                    Hồ sơ
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <Link
                to="/login"
                className="px-4 py-2 bg-gray-900 text-white rounded-full"
              >
                Đăng nhập
              </Link>

              <Link
                to="/register"
                className="px-4 py-2 border rounded-full"
              >
                Đăng ký
              </Link>
            </div>
          )}

        </div>
      </nav>
    </header>
  );
};

export default Header;