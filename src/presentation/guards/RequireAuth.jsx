import { Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import UserContext from "../../contexts/UserContext";
import { canAccessSection, normalizeRole, ROLE_LANDING } from "../../domain/roles";

/**
 * Route guard — authenticated users only; section must be allowed for role.
 * Admin may enter admin | manager | sales.
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

  return children;
}
