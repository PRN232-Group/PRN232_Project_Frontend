import { Layout, Menu, Grid } from "antd";
import { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  DashboardOutlined,
  UserOutlined,
  SafetyOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  HistoryOutlined,
  ShoppingOutlined,
  DollarOutlined,
  RiseOutlined,
  BarChartOutlined,
  FileDoneOutlined,
  CheckSquareOutlined,
  HighlightOutlined,
  MessageOutlined,
  ToolOutlined,
  CarOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;

/* Menu configuration per back-office section */
const MENUS = {
  admin: {
    title: "Admin",
    items: [
      { key: "/admin", icon: <DashboardOutlined />, label: <Link to="/admin">Tổng quan</Link> },
      { key: "/admin/users", icon: <UserOutlined />, label: <Link to="/admin/users">Người dùng</Link> },
      { key: "/admin/roles", icon: <SafetyOutlined />, label: <Link to="/admin/roles">Phân quyền</Link> },
      { key: "/admin/categories", icon: <AppstoreOutlined />, label: <Link to="/admin/categories">Danh mục</Link> },
      { key: "/admin/contents", icon: <FileTextOutlined />, label: <Link to="/admin/contents">Nội dung</Link> },
      { key: "/admin/system-logs", icon: <HistoryOutlined />, label: <Link to="/admin/system-logs">Nhật ký hệ thống</Link> },
    ],
  },
  manager: {
    title: "Quản lý",
    items: [
      { key: "/manager", icon: <DashboardOutlined />, label: <Link to="/manager">Tổng quan</Link> },
      { key: "/manager/products", icon: <ShoppingOutlined />, label: <Link to="/manager/products">Sản phẩm</Link> },
      { key: "/manager/orders", icon: <FileDoneOutlined />, label: <Link to="/manager/orders">Đơn hàng</Link> },
      { key: "/manager/prices", icon: <DollarOutlined />, label: <Link to="/manager/prices">Bảng giá</Link> },
      { key: "/manager/best-selling", icon: <RiseOutlined />, label: <Link to="/manager/best-selling">Bán chạy</Link> },
      { key: "/manager/revenue", icon: <BarChartOutlined />, label: <Link to="/manager/revenue">Doanh thu</Link> },
    ],
  },
  sales: {
    title: "Kinh doanh",
    items: [
      { key: "/sales", icon: <DashboardOutlined />, label: <Link to="/sales">Tổng quan</Link> },
      { key: "/sales/orders", icon: <FileDoneOutlined />, label: <Link to="/sales/orders">Đơn hàng</Link> },
      { key: "/sales/quotations", icon: <FileTextOutlined />, label: <Link to="/sales/quotations">Yêu cầu báo giá</Link> },
      { key: "/sales/quotation-approval", icon: <CheckSquareOutlined />, label: <Link to="/sales/quotation-approval">Duyệt báo giá</Link> },
      { key: "/sales/design-requests", icon: <HighlightOutlined />, label: <Link to="/sales/design-requests">Yêu cầu thiết kế</Link> },
      { key: "/sales/chat", icon: <MessageOutlined />, label: <Link to="/sales/chat">Chăm sóc khách</Link> },
    ],
  },
  production: {
    title: "Sản xuất",
    items: [
      { key: "/production", icon: <DashboardOutlined />, label: <Link to="/production">Tổng quan</Link> },
      { key: "/production/orders", icon: <ToolOutlined />, label: <Link to="/production/orders">Lệnh sản xuất</Link> },
      { key: "/production/progress", icon: <RiseOutlined />, label: <Link to="/production/progress">Tiến độ</Link> },
      { key: "/production/delivery", icon: <CarOutlined />, label: <Link to="/production/delivery">Giao hàng</Link> },
    ],
  },
};

const DashboardShell = ({ section = "admin" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.lg;
  const [collapsed, setCollapsed] = useState(false);

  const config = MENUS[section] || MENUS.admin;

  // pick the deepest matching key so nested routes stay highlighted
  const selectedKey =
    config.items
      .map((i) => i.key)
      .filter((k) => location.pathname === k || location.pathname.startsWith(k + "/"))
      .sort((a, b) => b.length - a.length)[0] || location.pathname;

  const items = [
    ...config.items,
    { type: "divider", style: { borderColor: "rgba(255,255,255,0.12)", margin: "8px 12px" } },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: () => {
        localStorage.removeItem("user");
        navigate("/login");
      },
    },
  ];

  const collapsedNow = isMobile ? true : collapsed;
  const siderWidth = 250;
  const collapsedWidth = isMobile ? 0 : 80;

  return (
    <Layout style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <Sider
        width={siderWidth}
        collapsedWidth={collapsedWidth}
        collapsed={collapsedNow}
        trigger={null}
        style={{
          background: "#2c2723",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 20,
          overflow: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: collapsedNow ? "18px 0" : "18px 20px",
            justifyContent: collapsedNow ? "center" : "flex-start",
          }}
        >
          <span
            style={{
              display: "grid",
              placeItems: "center",
              height: 40,
              width: 40,
              minWidth: 40,
              borderRadius: 12,
              fontWeight: 700,
              color: "#fff",
              background: "linear-gradient(135deg, #b0784f, #8a5b34)",
            }}
          >
            IS
          </span>
          {!collapsedNow && (
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>
                Interior Studio
              </div>
              <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>
                {config.title}
              </div>
            </div>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={items}
          style={{ background: "transparent", borderInlineEnd: 0, padding: "0 8px" }}
        />
      </Sider>

      <Layout
        style={{
          marginLeft: isMobile ? 0 : collapsedNow ? collapsedWidth : siderWidth,
          transition: "margin-left 0.25s ease",
          background: "var(--cream)",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 22px",
            background: "var(--surface)",
            borderBottom: "1px solid var(--line)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label="Bật/tắt menu"
            style={{
              display: isMobile ? "none" : "grid",
              placeItems: "center",
              width: 40,
              height: 40,
              borderRadius: 10,
              border: "1px solid var(--line)",
              background: "var(--cream)",
              color: "var(--ink)",
            }}
          >
            {collapsedNow ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>
          <div style={{ fontWeight: 600, color: "var(--ink)" }}>
            {config.title} · Interior Studio
          </div>
          <Link
            to="/"
            style={{ marginLeft: "auto", color: "var(--clay-dark)", fontWeight: 600 }}
          >
            ← Về trang chủ
          </Link>
        </div>

        <Content style={{ padding: "clamp(16px,3vw,28px)" }}>
          <div
            style={{
              background: "var(--surface)",
              borderRadius: 20,
              border: "1px solid var(--line)",
              boxShadow: "var(--shadow-sm)",
              padding: "clamp(16px,3vw,28px)",
              minHeight: "70vh",
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardShell;
