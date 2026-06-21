import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";

import RootLayout from "../layout/RootLayout";
import AdminPage from "../pages/admin/AdminPage";

const Loading = () => <div>Loading...</div>;

/* ===========================
   Customer Pages
=========================== */

const HomePage = lazy(() => import("../pages/customer/HomePage"));
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
const ProductReviewPage = lazy(() => import("../pages/customer/ProductReviewPage"));

/* ===========================
   Sales
=========================== */

const SalesDashboardPage = lazy(() => import("../pages/sales/SalesDashboardPage"));
const QuotationRequestPage = lazy(() => import("../pages/sales/QuotationRequestPage"));
const DesignRequestDetailPage = lazy(() => import("../pages/sales/DesignRequestDetailPage"));
const QuotationApprovalPage = lazy(() => import("../pages/sales/QuotationApprovalPage"));
const CustomerChatManagementPage = lazy(() => import("../pages/sales/CustomerChatManagementPage"));
const SalesOrderManagementPage = lazy(() => import("../pages/sales/SalesOrderManagementPage"));

/* ===========================
   Production
=========================== */

const ProductionDashboardPage = lazy(() => import("../pages/production/ProductionDashboardPage"));
const ProductionOrderListPage = lazy(() => import("../pages/production/ProductionOrderListPage"));
const ProductionProgressPage = lazy(() => import("../pages/production/ProductionProgressPage"));
const ProductionOrderDetailPage = lazy(() => import("../pages/production/ProductionOrderDetailPage"));
const DeliveryUpdatePage = lazy(() => import("../pages/production/DeliveryUpdatePage"));

/* ===========================
   Manager
=========================== */

const ManagerDashboardPage = lazy(() => import("../pages/manager/ManagerDashboardPage"));
const ProductManagementPage = lazy(() => import("../pages/manager/ProductManagementPage"));
const PriceManagementPage = lazy(() => import("../pages/manager/PriceManagementPage"));
const OrderManagementPage = lazy(() => import("../pages/manager/OrderManagementPage"));
const RevenueReportPage = lazy(() => import("../pages/manager/RevenueReportPage"));
const BestSellingProductsPage = lazy(() => import("../pages/manager/BestSellingProductsPage"));

/* ===========================
   Admin
=========================== */

const AdminDashboardPage = lazy(() => import("../pages/admin/AdminDashboardPage"));
const UserManagementPage = lazy(() => import("../pages/admin/UserManagementPage"));
const RoleManagementPage = lazy(() => import("../pages/admin/RoleManagementPage"));
const CategoryManagementPage = lazy(() => import("../pages/admin/CategoryManagementPage"));
const ContentManagementPage = lazy(() => import("../pages/admin/ContentManagementPage"));
const SystemLogPage = lazy(() => import("../pages/admin/SystemLogPage"));

/* ===========================
   Router
=========================== */

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: "products",
        element: (
          <Suspense fallback={<Loading />}>
            <ProductListPage />
          </Suspense>
        ),
      },
      {
        path: "products/:id",
        element: (
          <Suspense fallback={<Loading />}>
            <ProductDetailPage />
          </Suspense>
        ),
      },
      {
        path: "search",
        element: (
          <Suspense fallback={<Loading />}>
            <ProductSearchPage />
          </Suspense>
        ),
      },
      {
        path: "design",
        element: (
          <Suspense fallback={<Loading />}>
            <InteriorDesignPage />
          </Suspense>
        ),
      },
      {
        path: "profile",
        element: (
          <Suspense fallback={<Loading />}>
            <ProfilePage />
          </Suspense>
        ),
      },
      {
        path: "cart",
        element: (
          <Suspense fallback={<Loading />}>
            <CartPage />
          </Suspense>
        ),
      },
      {
        path: "checkout",
        element: (
          <Suspense fallback={<Loading />}>
            <CheckoutPage />
          </Suspense>
        ),
      },
      {
        path: "orders",
        element: (
          <Suspense fallback={<Loading />}>
            <OrderListPage />
          </Suspense>
        ),
      },
      {
        path: "orders/:id",
        element: (
          <Suspense fallback={<Loading />}>
            <OrderDetailPage />
          </Suspense>
        ),
      },
      {
        path: "chat",
        element: (
          <Suspense fallback={<Loading />}>
            <CustomerChatPage />
          </Suspense>
        ),
      },
      {
        path: "review",
        element: (
          <Suspense fallback={<Loading />}>
            <ProductReviewPage />
          </Suspense>
        ),
      },
    ],
  },

  /* SALES */
  {
    path: "/sales",
    element: <AdminPage />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <SalesDashboardPage />
          </Suspense>
        ),
      },
      {
        path: "quotation-requests",
        element: (
          <Suspense fallback={<Loading />}>
            <QuotationRequestPage />
          </Suspense>
        ),
      },
      {
        path: "design-request/:id",
        element: (
          <Suspense fallback={<Loading />}>
            <DesignRequestDetailPage />
          </Suspense>
        ),
      },
      {
        path: "quotation-approval",
        element: (
          <Suspense fallback={<Loading />}>
            <QuotationApprovalPage />
          </Suspense>
        ),
      },
      {
        path: "chat-management",
        element: (
          <Suspense fallback={<Loading />}>
            <CustomerChatManagementPage />
          </Suspense>
        ),
      },
      {
        path: "orders",
        element: (
          <Suspense fallback={<Loading />}>
            <SalesOrderManagementPage />
          </Suspense>
        ),
      },
    ],
  },

  /* PRODUCTION */
  {
    path: "/production",
    element: <AdminPage />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <ProductionDashboardPage />
          </Suspense>
        ),
      },
      {
        path: "orders",
        element: (
          <Suspense fallback={<Loading />}>
            <ProductionOrderListPage />
          </Suspense>
        ),
      },
      {
        path: "progress",
        element: (
          <Suspense fallback={<Loading />}>
            <ProductionProgressPage />
          </Suspense>
        ),
      },
      {
        path: "orders/:id",
        element: (
          <Suspense fallback={<Loading />}>
            <ProductionOrderDetailPage />
          </Suspense>
        ),
      },
      {
        path: "delivery",
        element: (
          <Suspense fallback={<Loading />}>
            <DeliveryUpdatePage />
          </Suspense>
        ),
      },
    ],
  },

  /* MANAGER */
  {
    path: "/manager",
    element: <AdminPage />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <ManagerDashboardPage />
          </Suspense>
        ),
      },
      {
        path: "products",
        element: (
          <Suspense fallback={<Loading />}>
            <ProductManagementPage />
          </Suspense>
        ),
      },
      {
        path: "prices",
        element: (
          <Suspense fallback={<Loading />}>
            <PriceManagementPage />
          </Suspense>
        ),
      },
      {
        path: "orders",
        element: (
          <Suspense fallback={<Loading />}>
            <OrderManagementPage />
          </Suspense>
        ),
      },
      {
        path: "revenue-report",
        element: (
          <Suspense fallback={<Loading />}>
            <RevenueReportPage />
          </Suspense>
        ),
      },
      {
        path: "best-selling-products",
        element: (
          <Suspense fallback={<Loading />}>
            <BestSellingProductsPage />
          </Suspense>
        ),
      },
    ],
  },

  /* ADMIN */
  {
    path: "/admin",
    element: <AdminPage />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <AdminDashboardPage />
          </Suspense>
        ),
      },
      {
        path: "users",
        element: (
          <Suspense fallback={<Loading />}>
            <UserManagementPage />
          </Suspense>
        ),
      },
      {
        path: "roles",
        element: (
          <Suspense fallback={<Loading />}>
            <RoleManagementPage />
          </Suspense>
        ),
      },
      {
        path: "categories",
        element: (
          <Suspense fallback={<Loading />}>
            <CategoryManagementPage />
          </Suspense>
        ),
      },
      {
        path: "contents",
        element: (
          <Suspense fallback={<Loading />}>
            <ContentManagementPage />
          </Suspense>
        ),
      },
      {
        path: "system-logs",
        element: (
          <Suspense fallback={<Loading />}>
            <SystemLogPage />
          </Suspense>
        ),
      },
    ],
  },
]);