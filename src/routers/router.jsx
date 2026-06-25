import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";

import RootLayout from "../layout/RootLayout";

const Loading = () => <div>Loading...</div>;

/* ===========================
   AUTH
=========================== */
const LoginPage = lazy(() => import("../pages/customer/LoginPage"));
const RegisterPage = lazy(() => import("../pages/customer/RegisterPage"));

/* ===========================
   CUSTOMER
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
   ADMIN
=========================== */
const AdminPage = lazy(() => import("../pages/admin/AdminPage"));
const AdminDashboardPage = lazy(() => import("../pages/admin/AdminDashboardPage"));
const UserManagementPage = lazy(() => import("../pages/admin/UserManagementPage"));
const RoleManagementPage = lazy(() => import("../pages/admin/RoleManagementPage"));
const CategoryManagementPage = lazy(() => import("../pages/admin/CategoryManagementPage"));
const ContentManagementPage = lazy(() => import("../pages/admin/ContentManagementPage"));
const SystemLogPage = lazy(() => import("../pages/admin/SystemLogPage"));

export const router = createBrowserRouter([
  /* ===========================
     PUBLIC ROUTES (KHÔNG layout)
  =========================== */
  {
    path: "/login",
    element: (
      <Suspense fallback={<Loading />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: "/register",
    element: (
      <Suspense fallback={<Loading />}>
        <RegisterPage />
      </Suspense>
    ),
  },

  /* ===========================
     CUSTOMER ROUTES
  =========================== */
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

  /* ===========================
     ADMIN ROUTES
  =========================== */
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