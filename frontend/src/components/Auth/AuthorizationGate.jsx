import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { api } from "../../services/api";

const dashboardPaths = {
  BUYER: "/buyer/dashboard",
  AGENT: "/agent/dashboard",
  LEGAL_REVIEWER: "/legal/dashboard",
  BANK: "/bank/dashboard",
  ADMIN: "/admin/dashboard",
};

const roleForPath = (path) => {
  if (path.startsWith("/admin")) return "ADMIN";
  if (path.startsWith("/buyer") || path === "/dashboard") return "BUYER";
  if (path.startsWith("/agent")) return "AGENT";
  if (path.startsWith("/legal")) return "LEGAL_REVIEWER";
  if (path.startsWith("/bank")) return "BANK";
  return null;
};

export default function AuthorizationGate() {
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    if (!api.isAuthenticated()) { setFailed(true); return undefined; }
    api.refreshCurrentUser().then((value) => active && setProfile(value)).catch(() => active && setFailed(true));
    return () => { active = false; };
  }, [location.pathname]);

  if (failed) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!profile) return null;
  if (profile.status !== "ACTIVE" && profile.role !== "ADMIN") return <Navigate to="/pending" replace />;

  const requiredRole = roleForPath(location.pathname);
  if (requiredRole && profile.role !== requiredRole) {
    return <Navigate to={dashboardPaths[profile.role] || "/login"} replace />;
  }
  return <Outlet />;
}
