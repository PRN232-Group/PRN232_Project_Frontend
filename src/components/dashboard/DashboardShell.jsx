import { Layout, Menu, Grid, Drawer, Button } from "antd";
import { useEffect, useState, useContext, useMemo } from "react";
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
  HighlightOutlined,
  MessageOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  LogoutOutlined,
  MenuOutlined,
  SettingOutlined,
  ShopOutlined,
  TeamOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import UserContext from "../../contexts/UserContext";
import { logout } from "../../application/services/authService";
import { permissionService } from "../../application/services";
import {
  normalizeRole,
  filterMenuByPermissions,
} from "../../domain/roles";
import { setUser as persistUser } from "../../infrastructure/storage/authStorage";

const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const SUB_SYSTEM = "sub-system";
const SUB_CATALOG = "sub-catalog";
const SUB_SALES = "sub-sales";
const ADMIN_SUB_KEYS = [SUB_SYSTEM, SUB_CATALOG, SUB_SALES];

/** Flatten leaf keys; recurse into children */
function flattenMenuKeys(items) {
  const keys = [];
  for (const item of items) {
    if (Array.isArray(item.children)) {
      keys.push(...flattenMenuKeys(item.children));
    } else if (item.key && item.type !== "divider") {
      keys.push(item.key);
    }
  }
  return keys;
}

function findSubmenuForPath(items, pathname) {
  for (const item of items) {
    if (!Array.isArray(item.children)) continue;
    const hit = flattenMenuKeys(item.children).some(
      (k) => pathname === k || pathname.startsWith(`${k}/`)
    );
    if (hit) return item.key;
  }
  return null;
}

const MENUS = {
  admin: {
    title: "Admin",
    items: [
      {
        key: "/admin",
        icon: <DashboardOutlined />,
        label: <Link to="/admin">Tổng quan</Link>,
      },
      {
        key: SUB_SYSTEM,
        icon: <SettingOutlined />,
        label: "Hệ thống",
        children: [
          {
            key: "/admin/users",
            icon: <UserOutlined />,
            label: <Link to="/admin/users">Người dùng</Link>,
          },
          {
            key: "/admin/roles",
            icon: <SafetyOutlined />,
            label: <Link to="/admin/roles">Phân quyền</Link>,
          },
          {
            key: "/admin/contents",
            icon: <FileTextOutlined />,
            label: <Link to="/admin/contents">Nội dung</Link>,
          },
          {
            key: "/admin/system-logs",
            icon: <HistoryOutlined />,
            label: <Link to="/admin/system-logs">Nhật ký hệ thống</Link>,
          },
        ],
      },
      {
        key: SUB_CATALOG,
        icon: <ShopOutlined />,
        label: "Catalog",
        children: [
          {
            key: "/manager/categories",
            icon: <AppstoreOutlined />,
            label: <Link to="/manager/categories">Danh mục</Link>,
          },
          {
            key: "/manager/products",
            icon: <ShoppingOutlined />,
            label: <Link to="/manager/products">Sản phẩm</Link>,
          },
          {
            key: "/manager/designs",
            icon: <PictureOutlined />,
            label: <Link to="/manager/designs">Concept thiết kế</Link>,
          },
          {
            key: "/manager/prices",
            icon: <DollarOutlined />,
            label: <Link to="/manager/prices">Bảng giá</Link>,
          },
          {
            key: "/manager/best-selling",
            icon: <RiseOutlined />,
            label: <Link to="/manager/best-selling">Bán chạy</Link>,
          },
          {
            key: "/manager/revenue",
            icon: <BarChartOutlined />,
            label: <Link to="/manager/revenue">Doanh thu</Link>,
          },
          {
            key: "/manager/orders",
            icon: <FileDoneOutlined />,
            label: <Link to="/manager/orders">Đơn hàng (QL)</Link>,
          },
        ],
      },
      {
        key: SUB_SALES,
        icon: <TeamOutlined />,
        label: "Kinh doanh",
        children: [
          {
            key: "/sales/orders",
            icon: <FileDoneOutlined />,
            label: <Link to="/sales/orders">Đơn hàng</Link>,
          },
          {
            key: "/sales/quotations",
            icon: <FileTextOutlined />,
            label: <Link to="/sales/quotations">Báo giá</Link>,
          },
          {
            key: "/sales/design-requests",
            icon: <HighlightOutlined />,
            label: <Link to="/sales/design-requests">Yêu cầu thiết kế</Link>,
          },
          {
            key: "/sales/chat",
            icon: <MessageOutlined />,
            label: <Link to="/sales/chat">Chăm sóc khách</Link>,
          },
        ],
      },
    ],
  },
  manager: {
    title: "Quản lý",
    items: [
      {
        key: "/manager",
        icon: <DashboardOutlined />,
        label: <Link to="/manager">Tổng quan</Link>,
      },
      {
        key: "/manager/products",
        icon: <ShoppingOutlined />,
        label: <Link to="/manager/products">Sản phẩm</Link>,
      },
      {
        key: "/manager/designs",
        icon: <PictureOutlined />,
        label: <Link to="/manager/designs">Concept thiết kế</Link>,
      },
      {
        key: "/manager/categories",
        icon: <AppstoreOutlined />,
        label: <Link to="/manager/categories">Danh mục</Link>,
      },
      {
        key: "/manager/prices",
        icon: <DollarOutlined />,
        label: <Link to="/manager/prices">Bảng giá</Link>,
      },
      {
        key: "/manager/best-selling",
        icon: <RiseOutlined />,
        label: <Link to="/manager/best-selling">Bán chạy</Link>,
      },
      {
        key: "/manager/revenue",
        icon: <BarChartOutlined />,
        label: <Link to="/manager/revenue">Doanh thu</Link>,
      },
      {
        key: "/manager/orders",
        icon: <FileDoneOutlined />,
        label: <Link to="/manager/orders">Đơn hàng</Link>,
      },
    ],
  },
  sales: {
    title: "Kinh doanh",
    items: [
      {
        key: "/sales",
        icon: <DashboardOutlined />,
        label: <Link to="/sales">Tổng quan</Link>,
      },
      {
        key: "/sales/orders",
        icon: <FileDoneOutlined />,
        label: <Link to="/sales/orders">Đơn hàng</Link>,
      },
      {
        key: "/sales/quotations",
        icon: <FileTextOutlined />,
        label: <Link to="/sales/quotations">Báo giá</Link>,
      },
      {
        key: "/sales/design-requests",
        icon: <HighlightOutlined />,
        label: <Link to="/sales/design-requests">Yêu cầu thiết kế</Link>,
      },
      {
        key: "/sales/chat",
        icon: <MessageOutlined />,
        label: <Link to="/sales/chat">Chăm sóc khách</Link>,
      },
    ],
  },
};

function BrandBlock({ collapsed, title }) {
  return (
    <div
      className="dash-brand"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: collapsed ? "18px 0" : "18px 20px",
        justifyContent: collapsed ? "center" : "flex-start",
      }}
    >
      <span className="dash-brand-mark">IS</span>
      {!collapsed && (
        <div style={{ lineHeight: 1.1, minWidth: 0 }}>
          <div className="dash-brand-name">Interior Studio</div>
          <div className="dash-brand-sub">{title}</div>
        </div>
      )}
    </div>
  );
}

const DashboardShell = ({ section = "admin" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const screens = useBreakpoint();
  const isMobile = !screens.lg;
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openKeys, setOpenKeys] = useState([]);

  const roleKey = normalizeRole(user?.role);
  const hasSubmenus = roleKey === "admin";
  const config = useMemo(() => {
    if (roleKey === "admin") return MENUS.admin;
    return MENUS[section] || MENUS.admin;
  }, [roleKey, section]);

  const filteredItems = useMemo(
    () => filterMenuByPermissions(config.items, user?.permissions),
    [config.items, user?.permissions]
  );

  const itemKeys = useMemo(
    () => flattenMenuKeys(filteredItems),
    [filteredItems]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await permissionService.getMine();
        const pageKeys = res.data?.pageKeys || [];
        if (cancelled) return;
        setUser((prev) => {
          if (!prev) return prev;
          const same =
            Array.isArray(prev.permissions) &&
            prev.permissions.length === pageKeys.length &&
            prev.permissions.every((k, i) => k === pageKeys[i]);
          if (same) return prev;
          const next = { ...prev, permissions: pageKeys };
          persistUser(next);
          return next;
        });
      } catch {
        /* keep cached */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [location.pathname, setUser]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!hasSubmenus) {
      setOpenKeys([]);
      return;
    }
    const active = findSubmenuForPath(filteredItems, location.pathname);
    setOpenKeys(active ? [active] : []);
  }, [location.pathname, hasSubmenus, filteredItems]);

  const selectedKey =
    itemKeys
      .filter(
        (k) =>
          location.pathname === k || location.pathname.startsWith(`${k}/`)
      )
      .sort((a, b) => b.length - a.length)[0] || location.pathname;

  const handleOpenChange = (keys) => {
    const opened = keys.filter((k) => ADMIN_SUB_KEYS.includes(k));
    const latestOpened = opened.find((k) => !openKeys.includes(k));
    if (latestOpened) {
      setOpenKeys([latestOpened]);
      return;
    }
    setOpenKeys(opened.slice(-1));
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate("/login");
  };

  const menuItems = [
    ...filteredItems,
    {
      type: "divider",
      style: { borderColor: "rgba(255,255,255,0.12)", margin: "8px 12px" },
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  const siderWidth = 250;
  const collapsedWidth = 80;
  const collapsedNow = isMobile ? false : collapsed;
  const contentMargin = isMobile ? 0 : collapsedNow ? collapsedWidth : siderWidth;

  const sideMenu = (
    <>
      <BrandBlock collapsed={!isMobile && collapsedNow} title={config.title} />
      <Menu
        className="dash-side-menu"
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        openKeys={hasSubmenus && !collapsedNow ? openKeys : []}
        onOpenChange={hasSubmenus ? handleOpenChange : undefined}
        inlineCollapsed={!isMobile && collapsedNow}
        items={menuItems}
        style={{
          background: "transparent",
          borderInlineEnd: 0,
          padding: "0 8px 16px",
        }}
        onClick={() => isMobile && setDrawerOpen(false)}
      />
    </>
  );

  return (
    <Layout
      className="dash-shell"
      style={{ minHeight: "100vh", background: "var(--cream)" }}
    >
      {!isMobile && (
        <Sider
          width={siderWidth}
          collapsedWidth={collapsedWidth}
          collapsed={collapsedNow}
          trigger={null}
          className="dash-sider"
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
          {sideMenu}
        </Sider>
      )}

      <Drawer
        placement="left"
        open={isMobile && drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={Math.min(
          280,
          typeof window !== "undefined" ? window.innerWidth * 0.86 : 280
        )}
        styles={{
          body: { padding: 0, background: "#2c2723" },
          header: { display: "none" },
        }}
        className="dash-drawer"
      >
        {sideMenu}
      </Drawer>

      <Layout
        style={{
          marginLeft: contentMargin,
          transition: "margin-left var(--transition)",
          background: "var(--cream)",
          minHeight: "100vh",
          maxWidth: "100%",
        }}
      >
        <header className="dash-topbar">
          <Button
            type="text"
            className="dash-menu-btn"
            aria-label={isMobile ? "Mở menu" : "Bật/tắt menu"}
            onClick={() =>
              isMobile ? setDrawerOpen(true) : setCollapsed((c) => !c)
            }
            icon={
              isMobile ? (
                <MenuOutlined />
              ) : collapsedNow ? (
                <MenuUnfoldOutlined />
              ) : (
                <MenuFoldOutlined />
              )
            }
          />
          <div className="dash-topbar-title">
            {config.title} · Interior Studio
          </div>
          <Link to="/" className="dash-home-link">
            ← Về trang chủ
          </Link>
        </header>

        <Content className="dash-content">
          <div className="dash-panel">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardShell;
