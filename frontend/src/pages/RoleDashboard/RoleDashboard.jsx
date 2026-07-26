import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LuBadgeCheck,
  LuBriefcaseBusiness,
  LuBuilding2,
  LuFileText,
  LuLandmark,
  LuScale,
  LuUpload,
  LuUsers,
} from "react-icons/lu";
import Layout from "../../components/Layout/Layout";
import { api } from "../../services/api";
import "../Dashboard/Dashboard.css";

const dashboardContent = {
  AGENT: {
    title: "Agent Dashboard",
    subtitle: "Manage listings and keep your clients informed.",
    icon: LuBuilding2,
    modules: [
      { label: "Properties", icon: LuBuilding2 },
      { label: "Clients", icon: LuUsers },
      { label: "Upload Listings", icon: LuUpload },
      { label: "Verification Status", icon: LuBadgeCheck },
    ],
  },
  LEGAL_REVIEWER: {
    title: "Legal Dashboard",
    subtitle: "Organize legal reviews, documents, and active cases.",
    icon: LuScale,
    modules: [
      { label: "Legal Reviews", icon: LuScale },
      { label: "Documents", icon: LuFileText },
      { label: "Cases", icon: LuBriefcaseBusiness },
      { label: "Profile", icon: LuBadgeCheck },
    ],
  },
  BANK: {
    title: "Financial Institution Dashboard",
    subtitle: "Review financial due diligence and loan workflows.",
    icon: LuLandmark,
    modules: [
      { label: "Financial Reviews", icon: LuLandmark },
      { label: "Loan Requests", icon: LuBriefcaseBusiness },
      { label: "Verified Properties", icon: LuBuilding2 },
      { label: "Profile", icon: LuBadgeCheck },
    ],
  },
};

function RoleDashboard({ role }) {
  const navigate = useNavigate();
  const content = dashboardContent[role];
  const Icon = content.icon;

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

  return (
    <Layout title={content.title}>
      <div className="dashboard-page">
        <section className="dashboard-card quick-actions-card">
          <div className="verification-header">
            <span className="verification-icon">
              <Icon size={25} />
            </span>
            <div>
              <span className="verification-eyebrow">{content.title}</span>
              <h1>{content.title}</h1>
              <p>{content.subtitle}</p>
            </div>
          </div>
        </section>

        <section className="dashboard-card quick-actions-card">
          <h3 className="card-title">Workspace</h3>
          <div className="quick-actions-grid">
            {content.modules.map((module) => {
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
    </Layout>
  );
}

export default RoleDashboard;
