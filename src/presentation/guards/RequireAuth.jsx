import { Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import UserContext from "../../contexts/UserContext";
import {
  canAccessSection,
  canAccessPage,
  normalizeRole,
  ROLE_LANDING,
} from "../../domain/roles";

/**
 * Route guard — authenticated; section by role; deep pages by permissions.
 * Trang chủ + tổng quan luôn được; còn lại theo RolePermissions.
 */
export default function RequireAuth({ section, children }) {
  const { user } = useContext(UserContext);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (section && !canAccessSection(user.role, section)) {
    const key = normalizeRole(user.role);
    const landing = ROLE_LANDING[key] || "/";
    return <Navigate to={landing} replace />;
  }

  if (!canAccessPage(location.pathname, user.permissions)) {
    const key = normalizeRole(user.role);
    const landing = ROLE_LANDING[key] || "/";
    return <Navigate to={landing} replace />;
  }

  return children;
}
