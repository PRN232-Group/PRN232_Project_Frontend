import React, { useContext } from "react";
import { Link } from "react-router-dom";
import "../styles/footer.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import UserContext from "../contexts/UserContext";
import { normalizeRole, ROLE_LANDING, ROLE_LABEL } from "../domain/roles";

const EXPLORE_BY_ROLE = {
  guest: [
    { label: "Sản phẩm", to: "/products" },
    { label: "Concept thiết kế", to: "/design" },
    { label: "Cảm hứng", to: "/blog" },
    { label: "Đăng nhập", to: "/login" },
    { label: "Đăng ký", to: "/register" },
  ],
  customer: [
    { label: "Sản phẩm", to: "/products" },
    { label: "Concept thiết kế", to: "/design" },
    { label: "Cảm hứng", to: "/blog" },
    { label: "Giỏ hàng", to: "/cart" },
    { label: "Đơn hàng của tôi", to: "/orders" },
    { label: "Báo giá của tôi", to: "/my-quotations" },
    { label: "Hỗ trợ", to: "/chat" },
  ],
  sales: [
    { label: "Bảng điều khiển", to: "/sales" },
    { label: "Đơn hàng KD", to: "/sales/orders" },
    { label: "Báo giá", to: "/sales/quotations" },
    { label: "Yêu cầu thiết kế", to: "/sales/design-requests" },
    { label: "Chăm sóc khách", to: "/sales/chat" },
  ],
  manager: [
    { label: "Bảng điều khiển", to: "/manager" },
    { label: "Sản phẩm", to: "/manager/products" },
    { label: "Concept thiết kế", to: "/manager/designs" },
    { label: "Danh mục", to: "/manager/categories" },
    { label: "Doanh thu", to: "/manager/revenue" },
  ],
  admin: [
    { label: "Bảng điều khiển", to: "/admin" },
    { label: "Người dùng", to: "/admin/users" },
    { label: "Nội dung / Blog", to: "/admin/contents" },
    { label: "Concept thiết kế", to: "/manager/designs" },
  ],
};

function Footer() {
  const { user } = useContext(UserContext);
  const roleKey = user ? normalizeRole(user.role) : "guest";
  const explore = EXPLORE_BY_ROLE[roleKey] || EXPLORE_BY_ROLE.guest;
  const workspaceHome = user ? ROLE_LANDING[roleKey] || "/" : "/login";

  return (
    <footer className="main-footer-bg">
      <div className="main-footer-container">
        <div className="main-footer-logo-block">
          <div className="main-footer-logo">
            <span
              className="main-footer-logo-mark"
              aria-hidden
            >
              IS
            </span>
            <span className="main-footer-brand">Interior Studio</span>
          </div>
          <p className="main-footer-desc">
            Không gian sống hiện đại, tinh tế và ấm áp — thiết kế riêng cho tổ
            ấm của bạn.
          </p>
          {user && roleKey !== "customer" && (
            <Link to={workspaceHome} className="main-footer-cta">
              Vào khu vực {ROLE_LABEL[roleKey]} →
            </Link>
          )}
        </div>

        <div className="main-footer-menu-block">
          <div className="main-footer-menu-title">
            {roleKey === "guest" || roleKey === "customer"
              ? "Khám phá"
              : "Lối tắt làm việc"}
          </div>
          <ul className="main-footer-menu">
            {explore.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="main-footer-contact-block">
          <div className="main-footer-menu-title">Liên hệ</div>
          <div className="main-footer-contact-item">
            <i className="fa-solid fa-location-dot" />
            <span>Ho Chi Minh City, Vietnam</span>
          </div>
          <div className="main-footer-contact-item">
            <i className="fa-solid fa-phone" />
            <a href="tel:+84900000000">+84 900 000 000</a>
          </div>
          <div className="main-footer-contact-item">
            <i className="fa-solid fa-envelope" />
            <a href="mailto:contact@interiorstudio.com">
              contact@interiorstudio.com
            </a>
          </div>
        </div>
      </div>

      <div className="main-footer-copyright">
        © {new Date().getFullYear()} Interior Studio. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
