import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

import RootLayout from "../layout/RootLayout";
import DashboardShell from "../components/dashboard/DashboardShell";
import Loading from "../components/Loading";
import RequireAuth from "../presentation/guards/RequireAuth";

const BackOffice = ({ section }) => (
  <RequireAuth section={section}>
    <DashboardShell section={section} />
  </RequireAuth>
);

const load = (Comp) => (
  <Suspense fallback={<Loading />}>
    <Comp />
  </Suspense>
);

/* ===== AUTH ===== */
const LoginPage = lazy(() => import("../pages/customer/loginPage"));
const RegisterPage = lazy(() => import("../pages/customer/registerPage"));
const ForgotPasswordPage = lazy(() => import("../pages/customer/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("../pages/customer/ResetPasswordPage"));

/* ===== CUSTOMER ===== */
const HomePage = lazy(() => import("../pages/customer/homePage"));
const ProfilePage = lazy(() => import("../pages/customer/ProfilePage"));
const ProductListPage = lazy(() => import("../pages/customer/ProductListPage"));
const ProductDetailPage = lazy(() => import("../pages/customer/ProductDetailPage"));
const ProductSearchPage = lazy(() => import("../pages/customer/ProductSearchPage"));
const InteriorDesignPage = lazy(() => import("../pages/customer/InteriorDesignPage"));
const CartPage = lazy(() => import("../pages/customer/CartPage"));
const CheckoutPage = lazy(() => import("../pages/customer/CheckoutPage"));
const OrderListPage = lazy(() => import("../pages/customer/OrderListPage"));
const OrderDetailPage = lazy(() => import("../pages/customer/OrderDetailPage"));
const CustomerChatPage = lazy(() => import("../pages/customer/CustomerChatPage"));
const MyQuotationsPage = lazy(() => import("../pages/customer/MyQuotationsPage"));
const MyDesignRequestsPage = lazy(() =>
  import("../pages/customer/MyDesignRequestsPage")
);
const ProductReviewPage = lazy(() => import("../pages/customer/ProductReviewPage"));
const BlogListPage = lazy(() =>
  import("../pages/customer/BlogPages").then((m) => ({ default: m.BlogListPage }))
);
const BlogDetailPage = lazy(() =>
  import("../pages/customer/BlogPages").then((m) => ({ default: m.BlogDetailPage }))
);

/* ===== ADMIN ===== */
const AdminDashboardPage = lazy(() => import("../pages/admin/adminDashboardPage"));
const UserManagementPage = lazy(() => import("../pages/admin/UserManagementPage"));
const RoleManagementPage = lazy(() => import("../pages/admin/RoleManagementPage"));
const CategoryManagementPage = lazy(() => import("../pages/admin/CategoryManagementPage"));
const ContentManagementPage = lazy(() => import("../pages/admin/ContentManagementPage"));
const SystemLogPage = lazy(() => import("../pages/admin/SystemLogPage"));

/* ===== MANAGER ===== */
const ManagerDashboardPage = lazy(() => import("../pages/manager/ManagerDashboardPage"));
const ProductManagementPage = lazy(() => import("../pages/manager/ProductManagementPage"));
const DesignManagementPage = lazy(() => import("../pages/manager/DesignManagementPage"));
const PriceManagementPage = lazy(() => import("../pages/manager/PriceManagementPage"));
const BestSellingProductsPage = lazy(() => import("../pages/manager/BestSellingProductsPage"));
const RevenueReportPage = lazy(() => import("../pages/manager/RevenueReportPage"));
const OrderManagementPage = lazy(() => import("../pages/manager/OrderManagementPage"));

/* ===== SALES ===== */
const SalesDashboardPage = lazy(() => import("../pages/sales/SalesDashboardPage"));
const SalesOrderManagementPage = lazy(() => import("../pages/sales/SalesOrderManagementPage"));
const QuotationRequestPage = lazy(() => import("../pages/sales/QuotationRequestPage"));
const QuotationApprovalPage = lazy(() => import("../pages/sales/QuotationApprovalPage"));
const DesignRequestDetailPage = lazy(() => import("../pages/sales/DesignRequestDetailPage"));
const CustomerChatManagementPage = lazy(() => import("../pages/sales/CustomerChatManagementPage"));

export const router = createBrowserRouter([
  /* ===== PUBLIC ===== */
  { path: "/login", element: load(LoginPage) },
  { path: "/register", element: load(RegisterPage) },
  { path: "/forgot-password", element: load(ForgotPasswordPage) },
  { path: "/reset-password", element: load(ResetPasswordPage) },

  /* ===== CUSTOMER ===== */
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: load(HomePage) },
      { path: "products", element: load(ProductListPage) },
      { path: "products/:id", element: load(ProductDetailPage) },
      { path: "search", element: load(ProductSearchPage) },
      { path: "design", element: load(InteriorDesignPage) },
      { path: "blog", element: load(BlogListPage) },
      { path: "blog/:slug", element: load(BlogDetailPage) },
      { path: "profile", element: load(ProfilePage) },
      { path: "cart", element: load(CartPage) },
      { path: "checkout", element: load(CheckoutPage) },
      { path: "orders", element: load(OrderListPage) },
      { path: "orders/:id", element: load(OrderDetailPage) },
      { path: "chat", element: load(CustomerChatPage) },
      { path: "my-quotations", element: load(MyQuotationsPage) },
      { path: "my-design-requests", element: load(MyDesignRequestsPage) },
      { path: "review", element: load(ProductReviewPage) },
      { path: "products/:id/review", element: load(ProductReviewPage) },
    ],
  },

  /* ===== ADMIN ===== */
  {
    path: "/admin",
    element: <BackOffice section="admin" />,
    children: [
      { index: true, element: load(AdminDashboardPage) },
      { path: "users", element: load(UserManagementPage) },
      { path: "roles", element: load(RoleManagementPage) },
      { path: "categories", element: load(CategoryManagementPage) },
      { path: "contents", element: load(ContentManagementPage) },
      { path: "system-logs", element: load(SystemLogPage) },
      {
        path: "orders",
        element: <Navigate to="/sales/orders" replace />,
      },
    ],
  },

  /* ===== MANAGER ===== */
  {
    path: "/manager",
    element: <BackOffice section="manager" />,
    children: [
      { index: true, element: load(ManagerDashboardPage) },
      { path: "products", element: load(ProductManagementPage) },
      { path: "designs", element: load(DesignManagementPage) },
      { path: "categories", element: load(CategoryManagementPage) },
      { path: "prices", element: load(PriceManagementPage) },
      { path: "best-selling", element: load(BestSellingProductsPage) },
      { path: "revenue", element: load(RevenueReportPage) },
      { path: "orders", element: load(OrderManagementPage) },
    ],
  },

  /* ===== SALES ===== */
  {
    path: "/sales",
    element: <BackOffice section="sales" />,
    children: [
      { index: true, element: load(SalesDashboardPage) },
      { path: "orders", element: load(SalesOrderManagementPage) },
      { path: "quotations", element: load(QuotationRequestPage) },
      { path: "quotation-approval", element: load(QuotationApprovalPage) },
      { path: "design-requests", element: load(DesignRequestDetailPage) },
      { path: "design-requests/:id", element: load(DesignRequestDetailPage) },
      { path: "chat", element: load(CustomerChatManagementPage) },
    ],
  },
]);
