import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { api } from "../../services/api";

function Layout({ title, showSearch = false, children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        if (api.isAuthenticated()) {
          const profile = await api.getUserProfile();
          const localStatus = localStorage.getItem("status");
          const localRole = localStorage.getItem("role");
          const localProfileCompleted = localStorage.getItem("profileCompleted");

          if (
            profile.status !== localStatus ||
            profile.role !== localRole ||
            String(profile.profileCompleted) !== localProfileCompleted
          ) {
            localStorage.setItem("status", profile.status);
            localStorage.setItem("role", profile.role);
            localStorage.setItem("profileCompleted", String(profile.profileCompleted));

            // Redirect to appropriate dashboard on status change to ACTIVE
            if (profile.status === "ACTIVE" && localStatus === "PENDING") {
              const dashboardPaths = {
                BUYER: "/buyer/dashboard",
                AGENT: "/agent/dashboard",
                LEGAL_REVIEWER: "/legal/dashboard",
                BANK: "/bank/dashboard",
              };
              navigate(dashboardPaths[profile.role] || "/dashboard", { replace: true });
              return;
            }
          }

          if (profile.status === "PENDING" && profile.role !== "ADMIN") {
            navigate("/pending", { replace: true });
          }
        }
      } catch (err) {
        // Fallback to local storage if profile API fails
        const user = api.getCurrentUser();
        if (user && user.status === "PENDING" && user.role !== "ADMIN") {
          navigate("/pending", { replace: true });
        }
      }
    };

    checkUserStatus();
  }, [navigate]);

  return (
    <div className="page-container">

      <Sidebar />

      <main className="main-content">

        <Navbar title={title} showSearch={showSearch} />

        <div className="page-wrapper">

          {children}

        </div>

      </main>

    </div>
  );
}

export default Layout;