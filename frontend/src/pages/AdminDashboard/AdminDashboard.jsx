import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LuShieldCheck } from "react-icons/lu";

import Layout from "../../components/Layout/Layout";
import { api } from "../../services/api";

import AdminDashboardHeader from "./AdminDashboardHeader";
import AdminStatCard from "./AdminStatCard";
import PlatformActivityChart from "./PlatformActivityChart";
import VerificationSummary from "./VerificationSummary";
import RecentActivity from "./RecentActivity";
import ProfessionalDistribution from "./ProfessionalDistribution";
import RecentPropertyApprovals from "./RecentPropertyApprovals";
import SupportOverview from "./SupportOverview";
import SystemMetrics from "./SystemMetrics";

import "./AdminDashboard.css";

import { dashboardStats } from "../../data/adminDashboardMockData";

function AdminDashboard() {
  const navigate = useNavigate();

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

  return (
    <Layout title="Admin Dashboard" variant="admin">
      <main className="admin-dashboard">
        {/* ===================================================
            HEADER
        ==================================================== */}
        <AdminDashboardHeader />

        {/* ===================================================
            STATISTICS
        ==================================================== */}
        <section className="admin-stats-grid" aria-label="Platform statistics">
          {dashboardStats.map((stat) => (
            <AdminStatCard
              key={stat.id}
              title={stat.title}
              value={stat.value}
              trend={stat.trend}
              trendType={stat.trendType}
              subtitle={stat.subtitle}
              icon={stat.icon}
              iconClass={stat.iconClass}
            />
          ))}
        </section>

        {/* ===================================================
            MAIN DASHBOARD GRID
        ==================================================== */}
        <section className="admin-dashboard-grid">
          {/* Platform activity */}
          <PlatformActivityChart />

          {/* Verification summary */}
          <VerificationSummary />
        </section>

        {/* ===================================================
            ACTIVITY + PROFESSIONAL DISTRIBUTION
        ==================================================== */}
        <section className="admin-dashboard-grid">
          {/* Recent activity */}
          <RecentActivity />

          {/* Professional distribution */}
          <ProfessionalDistribution />
        </section>

        {/* ===================================================
            PROPERTY APPROVALS + SUPPORT
        ==================================================== */}
        <section className="admin-dashboard-grid">
          {/* Recent property approvals */}
          <RecentPropertyApprovals />

          {/* Support overview */}
          <SupportOverview />
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
              All systems operational
            </div>
          </div>

          <SystemMetrics />
        </section>
      </main>
    </Layout>
  );
}

export default AdminDashboard;
