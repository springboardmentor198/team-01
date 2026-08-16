import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuShieldCheck } from "react-icons/lu";

import Layout from "../../components/Layout/Layout";
import { api } from "../../services/api";

import AdminStatCard from "./AdminStatCard";
import PlatformActivityChart from "./PlatformActivityChart";
import VerificationSummary from "./VerificationSummary";
import RecentActivity from "./RecentActivity";
import ProfessionalDistribution from "./ProfessionalDistribution";
import RecentPropertyApprovals from "./RecentPropertyApprovals";
import SupportOverview from "./SupportOverview";
import SystemMetrics from "./SystemMetrics";

import "./AdminDashboard.css";

import { LuUsers, LuBadgeCheck, LuClipboardList, LuUserCheck, LuHeadphones } from "react-icons/lu";

function AdminDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  /*
   * ---------------------------------------------------------
   * ADMIN AUTHENTICATION
   * ---------------------------------------------------------
   *
   * Keep the existing protection from your old dashboard.
   *
   * Only authenticated ADMIN users can access this page.
   */
  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    const currentUser = api.getCurrentUser();

    if (!currentUser || currentUser.role !== "ADMIN") {
      navigate("/dashboard", {
        replace: true,
      });
    }
  }, [navigate]);

  useEffect(() => {
    let active = true;
    Promise.all([api.getAdminDashboard(), api.getNotificationCount().catch(() => 0)])
      .then(([data, notificationCount]) => {
        if (active) setDashboard({ ...data, notificationCount: Number(notificationCount) || 0 });
      })
      .catch((loadError) => active && setError(loadError.message || "Unable to load dashboard data."));
    return () => { active = false; };
  }, []);

  const stats = dashboard ? [
    ["total-users", "Total Users", dashboard.stats.totalUsers, LuUsers, "purple"],
    ["verified-professionals", "Verified Professionals", dashboard.stats.verifiedProfessionals, LuBadgeCheck, "green"],
    ["pending-approvals", "Pending Approvals", dashboard.stats.pendingApprovals, LuClipboardList, "orange"],
    ["active-users", "Active Users", dashboard.stats.activeUsers, LuUserCheck, "blue"],
    ["open-tickets", "Open Tickets", dashboard.stats.openTickets, LuHeadphones, "red"],
  ] : [];

  return (
    <Layout title="Admin Dashboard" variant="admin">
      <main className="admin-dashboard">
        {error && <div className="admin-dashboard-empty" role="alert">{error}</div>}
        {!dashboard && !error && <div className="admin-dashboard-loading">Loading dashboard data…</div>}

        {dashboard && <>
        {/* ===================================================
            STATISTICS
        ==================================================== */}
        <section className="admin-stats-grid" aria-label="Platform statistics">
          {stats.map(([id, title, value, icon, iconClass]) => (
            <AdminStatCard
              key={id} title={title} value={Number(value).toLocaleString()} icon={icon} iconClass={iconClass}
            />
          ))}
        </section>

        {/* ===================================================
            MAIN DASHBOARD GRID
        ==================================================== */}
        <section className="admin-dashboard-grid">
          {/* Platform activity */}
          <PlatformActivityChart activity={dashboard.activity} />

          {/* Verification summary */}
          <VerificationSummary data={dashboard.verification} />
        </section>

        {/* ===================================================
            ACTIVITY + PROFESSIONAL DISTRIBUTION
        ==================================================== */}
        <section className="admin-dashboard-grid">
          {/* Recent activity */}
          <RecentActivity activities={dashboard.recentActivity} />

          {/* Professional distribution */}
          <ProfessionalDistribution professionals={dashboard.professionals} />
        </section>

        {/* ===================================================
            PROPERTY APPROVALS + SUPPORT
        ==================================================== */}
        <section className="admin-dashboard-grid">
          {/* Recent property approvals */}
          <RecentPropertyApprovals properties={dashboard.recentProperties} />

          {/* Support overview */}
          <SupportOverview data={dashboard.support} />
        </section>

        {/* ===================================================
            SYSTEM METRICS
        ==================================================== */}
        <section
          className="admin-dashboard-card"
          style={{
            marginBottom: "20px",
          }}
        >
          <div className="admin-dashboard-card-header">
            <div>
              <h2 className="admin-dashboard-card-title">System Overview</h2>

              <p className="admin-dashboard-card-subtitle">
                Current platform infrastructure and security status
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#16A34A",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              <LuShieldCheck size={15} />
              Live system metrics
            </div>
          </div>

          <SystemMetrics />
        </section>
        </>}
      </main>
    </Layout>
  );
}

export default AdminDashboard;
