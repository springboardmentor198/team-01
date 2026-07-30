import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LuBadgeCheck,
  LuBriefcaseBusiness,
  LuBuilding2,
  LuFileText,
  LuLandmark,
  LuPlus,
  LuScale,
  LuUpload,
  LuUsers,
  LuEye,
  LuClock,
  LuCircleCheck,
  LuTriangleAlert,
} from "react-icons/lu";
import Layout from "../../components/Layout/Layout";
import { api } from "../../services/api";
import "../Dashboard/Dashboard.css";
import "./RoleDashboard.css";

// TODO: replace with real data once role-specific backend endpoints exist
// (e.g. GET /api/agent/listings, GET /api/legal-reviewer/queue). Left as
// empty arrays (not fake data) rather than hardcoded mock rows.
const emptyAgentData = { activeListings: 0, totalClients: 0, pendingVerification: 0, monthViews: 0, listings: [] };
const emptyLegalData = { pendingReviews: 0, completedReviews: 0, flaggedIssues: 0, activeCases: 0, queue: [] };

const bankContent = {
  title: "Financial Institution Dashboard",
  subtitle: "Review financial due diligence and loan workflows.",
  icon: LuLandmark,
  modules: [
    { label: "Financial Reviews", icon: LuLandmark },
    { label: "Loan Requests", icon: LuBriefcaseBusiness },
    { label: "Verified Properties", icon: LuBuilding2 },
    { label: "Profile", icon: LuBadgeCheck },
  ],
};

function DashboardHeader({ icon: Icon, eyebrow, title, subtitle, action }) {
  return (
    <section className="dashboard-card role-header-card">
      <div className="role-header">
        <span className="role-header-icon">
          <Icon size={26} />
        </span>
        <div>
          <span className="role-header-eyebrow">{eyebrow}</span>
          <h1 className="role-header-title">{title}</h1>
          <p className="role-header-subtitle">{subtitle}</p>
        </div>
      </div>
      {action}
    </section>
  );
}

function AgentDashboard() {
  const [data] = useState(emptyAgentData);

  const stats = [
    { label: "Active Listings", value: data.activeListings, icon: LuBuilding2, color: "#2563EB", bg: "#DBEAFE" },
    { label: "Total Clients", value: data.totalClients, icon: LuUsers, color: "#10B981", bg: "#D1FAE5" },
    { label: "Pending Verification", value: data.pendingVerification, icon: LuClock, color: "#F59E0B", bg: "#FEF3C7" },
    { label: "Views This Month", value: data.monthViews, icon: LuEye, color: "#8B5CF6", bg: "#EDE9FE" },
  ];

  return (
    <div className="dashboard-page">
      <DashboardHeader
        icon={LuBuilding2}
        eyebrow="Agent Workspace"
        title="Agent Dashboard"
        subtitle="Manage your listings and keep clients informed."
        action={
          <button className="role-header-btn" type="button">
            <LuPlus size={16} /> New Listing
          </button>
        }
      />

      <div className="stats-grid">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="stat-card">
              <div className="stat-icon" style={{ background: item.bg, color: item.color }}>
                <Icon size={20} />
              </div>
              <div>
                <p className="stat-label">{item.label}</p>
                <h2 className="stat-value">{item.value}</h2>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-card">
        <div className="card-actions">
          <h3 className="card-title">My Listings</h3>
          <button className="small-primary" type="button">
            <LuUpload size={15} /> Upload Documents
          </button>
        </div>
        <div className="table-wrapper">
          <table className="recent-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Client</th>
                <th>Status</th>
                <th>Views</th>
              </tr>
            </thead>
            <tbody>
              {data.listings.length === 0 && (
                <tr>
                  <td colSpan="4" className="admin-empty-row">No listings yet. Add your first property.</td>
                </tr>
              )}
              {data.listings.map((item, index) => (
                <tr key={index}>
                  <td>{item.property}</td>
                  <td>{item.client}</td>
                  <td><span className={`status-badge ${item.status.toLowerCase()}`}>{item.status}</span></td>
                  <td>{item.views}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dashboard-card quick-actions-card">
        <h3 className="card-title">Quick Actions</h3>
        <div className="quick-actions-grid">
          {[
            { label: "Add Listing", subtitle: "List a new property", icon: LuPlus },
            { label: "Manage Clients", subtitle: "View and message clients", icon: LuUsers },
            { label: "Upload Listings", subtitle: "Bulk upload documents", icon: LuUpload },
            { label: "Verification Status", subtitle: "Track review progress", icon: LuBadgeCheck },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <button key={action.label} className="quick-action-btn" type="button">
                <div className="quick-action-icon">
                  <Icon size={20} />
                </div>
                <div className="quick-action-content">
                  <h4>{action.label}</h4>
                  <p>{action.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LegalReviewerDashboard() {
  const [data] = useState(emptyLegalData);

  const stats = [
    { label: "Pending Reviews", value: data.pendingReviews, icon: LuClock, color: "#F59E0B", bg: "#FEF3C7" },
    { label: "Completed Reviews", value: data.completedReviews, icon: LuCircleCheck, color: "#10B981", bg: "#D1FAE5" },
    { label: "Flagged Issues", value: data.flaggedIssues, icon: LuTriangleAlert, color: "#EF4444", bg: "#FEE2E2" },
    { label: "Active Cases", value: data.activeCases, icon: LuBriefcaseBusiness, color: "#2563EB", bg: "#DBEAFE" },
  ];

  return (
    <div className="dashboard-page">
      <DashboardHeader
        icon={LuScale}
        eyebrow="Legal Workspace"
        title="Legal Reviewer Dashboard"
        subtitle="Organize legal reviews, documents, and active cases."
      />

      <div className="stats-grid">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="stat-card">
              <div className="stat-icon" style={{ background: item.bg, color: item.color }}>
                <Icon size={20} />
              </div>
              <div>
                <p className="stat-label">{item.label}</p>
                <h2 className="stat-value">{item.value}</h2>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-card">
        <h3 className="card-title">Review Queue</h3>
        <div className="table-wrapper">
          <table className="recent-table">
            <thead>
              <tr>
                <th>Property / Document</th>
                <th>Submitted By</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.queue.length === 0 && (
                <tr>
                  <td colSpan="4" className="admin-empty-row">No pending reviews right now.</td>
                </tr>
              )}
              {data.queue.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.submittedBy}</td>
                  <td><span className={`priority-badge ${item.priority.toLowerCase()}`}>{item.priority}</span></td>
                  <td><span className={`status-badge ${item.status.toLowerCase()}`}>{item.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dashboard-card quick-actions-card">
        <h3 className="card-title">Quick Actions</h3>
        <div className="quick-actions-grid">
          {[
            { label: "Legal Reviews", subtitle: "Open review queue", icon: LuScale },
            { label: "Documents", subtitle: "Browse legal documents", icon: LuFileText },
            { label: "Cases", subtitle: "View active cases", icon: LuBriefcaseBusiness },
            { label: "Profile", subtitle: "Manage your profile", icon: LuBadgeCheck },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <button key={action.label} className="quick-action-btn" type="button">
                <div className="quick-action-icon">
                  <Icon size={20} />
                </div>
                <div className="quick-action-content">
                  <h4>{action.label}</h4>
                  <p>{action.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BankDashboard() {
  const Icon = bankContent.icon;
  return (
    <div className="dashboard-page">
      <DashboardHeader
        icon={Icon}
        eyebrow="Bank Workspace"
        title={bankContent.title}
        subtitle={bankContent.subtitle}
      />
      <section className="dashboard-card quick-actions-card">
        <h3 className="card-title">Workspace</h3>
        <div className="quick-actions-grid">
          {bankContent.modules.map((module) => {
            const ModuleIcon = module.icon;
            return (
              <button key={module.label} className="quick-action-btn" type="button">
                <div className="quick-action-icon">
                  <ModuleIcon size={20} />
                </div>
                <div className="quick-action-content">
                  <h4>{module.label}</h4>
                  <p>Open your {module.label.toLowerCase()} workspace</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function RoleDashboard({ role }) {
  const navigate = useNavigate();

  useEffect(() => {
    const user = api.getCurrentUser();
    if (!api.isAuthenticated()) {
      navigate("/login", { replace: true });
      return;
    }

    if (user.profileCompleted !== true || user.role !== role) {
      navigate(
        user.profileCompleted === false ? "/onboarding" : "/dashboard",
        { replace: true }
      );
    }
  }, [navigate, role]);

  const titles = {
    AGENT: "Agent Dashboard",
    LEGAL_REVIEWER: "Legal Dashboard",
    BANK: "Financial Institution Dashboard",
  };

  return (
    <Layout title={titles[role] || "Dashboard"}>
      {role === "AGENT" && <AgentDashboard />}
      {role === "LEGAL_REVIEWER" && <LegalReviewerDashboard />}
      {role === "BANK" && <BankDashboard />}
    </Layout>
  );
}

export default RoleDashboard;
