import { useEffect, useRef, useState, useContext } from "react";
import UserContext from "../contexts/UserContext";

const Header = () => {
  const currentPath = window.location.pathname;
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dropdownRef = useRef(null);

  const { user } = useContext(UserContext);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Bộ sưu tập", href: "/collection" },
    { label: "Thiết kế 3D", href: "/design-3d" },
    { label: "Dự án", href: "/projects" },
    { label: "Cửa hàng", href: "/shop" },
    { label: "Liên hệ", href: "/contact" },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

        {/* Logo */}
        <a href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 shadow-md" />
          <span className="text-xl font-semibold tracking-wide text-gray-800">
            Interior Studio
          </span>
        </a>

        {/* Menu */}
        <ul className="hidden md:flex items-center gap-8">
          {menuItems.map((item) => {
            const isActive = item.href === currentPath;

            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={`text-sm font-medium transition ${
                    isActive
                      ? "text-amber-600"
                      : "text-gray-600 hover:text-amber-600"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>

        {/* Right side */}
        <div className="flex items-center gap-4">

          {/* CTA */}
          <a
            href="/consultation"
            className="hidden md:inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:shadow-lg transition"
          >
            Đặt tư vấn
          </a>

          {user ? (
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition"
              >
                {user?.name}
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white border rounded-xl shadow-lg overflow-hidden">
                  <a
                    href="/profile"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Hồ sơ
                  </a>

                  <a
                    href="/orders"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Đơn hàng
                  </a>

                  <button
                    onClick={() => {
                      localStorage.removeItem("user");
                      window.location.href = "/";
                    }}
                    className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a
              href="/login"
              className="px-4 py-2 rounded-full bg-gray-900 text-white text-sm hover:bg-black transition"
            >
              Đăng nhập
            </a>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;