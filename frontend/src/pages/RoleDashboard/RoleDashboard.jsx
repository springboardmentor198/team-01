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
  LuCircleCheck,
  LuTriangleAlert,
  LuFileCheck,
  LuFileClock,
  LuFileWarning,
  LuGavel,
  LuDownload,
} from "react-icons/lu";
import Layout from "../../components/Layout/Layout";
import { api } from "../../services/api";
import "../Dashboard/Dashboard.css";
import "./RoleDashboard.css";
const emptyAgentData = {
  totalProperties: 0,
  pendingDocuments: 0,
  pendingPermits: 0,
  propertiesSold: 0,
  recentProperties: [],
  pendingTasks: [],
  recentActivities: [],
};
const mockLegalData = {
  pendingReviews: 8,
  completedReviews: 24,
  highRiskCases: 3,
  documentsReviewedToday: 11,
  pendingQueue: [
    { property: "Oakwood Residency, Unit 4B", owner: "Meera Nair", priority: "High", assignedDate: "28 Jul 2026", status: "In Review" },
    { property: "Green Valley Plot 12", owner: "Arjun Malhotra", priority: "Medium", assignedDate: "27 Jul 2026", status: "Pending" },
    { property: "Sunrise Apartments, Flat 9C", owner: "Priya Sharma", priority: "High", assignedDate: "27 Jul 2026", status: "In Review" },
    { property: "Lakeview Villa 3", owner: "Rahul Verma", priority: "Low", assignedDate: "26 Jul 2026", status: "Pending" },
    { property: "Silver Pines, Unit 2A", owner: "Ananya Iyer", priority: "Medium", assignedDate: "25 Jul 2026", status: "Pending" },
  ],
  riskDistribution: [
    { label: "High", value: 3, color: "#DC2626" },
    { label: "Medium", value: 9, color: "#B45309" },
    { label: "Low", value: 12, color: "#15803D" },
  ],
  recentlyReviewed: [
    { property: "Maple Court, Unit 7", result: "Approved", completedTime: "2 hours ago" },
    { property: "Birchwood Estate 5", result: "Flagged", completedTime: "5 hours ago" },
    { property: "Cedar Heights, Unit 1B", result: "Approved", completedTime: "Yesterday" },
    { property: "Riverside Plot 22", result: "Rejected", completedTime: "Yesterday" },
  ],
  dueToday: { reviewsPending: 3, highPriorityReviews: 2 },
};
const mockBankData = {
  pendingLoanRequests: 14,
  approvedLoans: 46,
  rejectedLoans: 5,
  averageRiskScore: 62,
  loanQueue: [
    { applicant: "Kavya Reddy", property: "Oakwood Residency, Unit 4B", loanAmount: "₹42,00,000", riskScore: 28, status: "Pending" },
    { applicant: "Vikram Chandra", property: "Green Valley Plot 12", loanAmount: "₹78,50,000", riskScore: 61, status: "Pending" },
    { applicant: "Sneha Kulkarni", property: "Sunrise Apartments, Flat 9C", loanAmount: "₹35,00,000", riskScore: 22, status: "Approved" },
    { applicant: "Rohan Deshmukh", property: "Lakeview Villa 3", loanAmount: "₹1,10,00,000", riskScore: 84, status: "Rejected" },
    { applicant: "Ishita Bhatt", property: "Silver Pines, Unit 2A", loanAmount: "₹56,20,000", riskScore: 47, status: "Pending" },
  ],
  riskDistribution: [
    { label: "Low", value: 21, color: "#15803D" },
    { label: "Medium", value: 18, color: "#B45309" },
    { label: "High", value: 7, color: "#DC2626" },
  ],
  latestReports: [
    { name: "Q3 Loan Portfolio Summary", date: "28 Jul 2026", size: "1.2 MB" },
    { name: "Green Valley Plot 12 — Valuation Report", date: "26 Jul 2026", size: "480 KB" },
    { name: "Risk Analysis — July 2026", date: "22 Jul 2026", size: "860 KB" },
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
function DonutChart({ data, size = 160, strokeWidth = 22, centerLabel = "Total" }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashes = data.map((d) => (total ? d.value / total : 0) * circumference);
  const segments = data.map((d, i) => ({
    ...d,
    dash: dashes[i],
    gap: circumference - dashes[i],
    offset: -dashes.slice(0, i).reduce((sum, v) => sum + v, 0),
  }));

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#F1F5F9"
          strokeWidth={strokeWidth}
        />
        {segments.map((d) =>
          d.value ? (
            <circle
              key={d.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${d.dash} ${d.gap}`}
              strokeDashoffset={d.offset}
            />
          ) : null
        )}
      </g>
      <text x="50%" y="46%" textAnchor="middle" className="donut-value">{total}</text>
      <text x="50%" y="62%" textAnchor="middle" className="donut-label">{centerLabel}</text>
    </svg>
  );
}

function RiskDistributionCard({ title, data, centerLabel }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  return (
    <div className="dashboard-card">
      <h3 className="card-title">{title}</h3>
      <div className="risk-section">
        <DonutChart data={data} centerLabel={centerLabel} />
        <div className="risk-list">
          {data.map((d) => (
            <div key={d.label} className="risk-item">
              <span className="risk-dot" style={{ background: d.color }} />
              <span>{d.label}</span>
              <strong style={{ marginLeft: "auto" }}>
                {d.value} {total ? `(${Math.round((d.value / total) * 100)}%)` : ""}
              </strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function statusBadgeClass(status) {
  return `status-badge ${status.toLowerCase().replace(/\s+/g, "-")}`;
}

function priorityBadgeClass(priority) {
  return `priority-badge ${priority.toLowerCase()}`;
}

function AgentDashboard() {
  const navigate = useNavigate();
  const [data] = useState(emptyAgentData);

  const comingSoon = (feature) => {
    window.alert(`${feature} isn't built yet — check back soon!`);
  };

  const stats = [
    { label: "Total Properties", value: data.totalProperties, icon: LuBuilding2, color: "#2563EB", bg: "#DBEAFE" },
    { label: "Pending Documents", value: data.pendingDocuments, icon: LuFileText, color: "#F59E0B", bg: "#FEF3C7" },
    { label: "Pending Permits", value: data.pendingPermits, icon: LuFileCheck, color: "#EF4444", bg: "#FEE2E2" },
    { label: "Properties Sold", value: data.propertiesSold, icon: LuBadgeCheck, color: "#10B981", bg: "#D1FAE5" },
  ];

  return (
    <div className="dashboard-page">
      <DashboardHeader
        icon={LuBuilding2}
        eyebrow="Agent Workspace"
        title="Agent Dashboard"
        subtitle="Manage property records and keep documentation up to date."
        action={
          <button className="role-header-btn" type="button" onClick={() => comingSoon("Adding a new property")}>
            <LuPlus size={16} /> Add Property
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
        <h3 className="card-title">Recent Properties</h3>
        <div className="table-wrapper">
          <table className="recent-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {data.recentProperties.length === 0 && (
                <tr>
                  <td colSpan="4" className="admin-empty-row">No properties yet. Add your first property.</td>
                </tr>
              )}
              {data.recentProperties.map((item, index) => (
                <tr key={index}>
                  <td>{item.property}</td>
                  <td>{item.owner}</td>
                  <td><span className={statusBadgeClass(item.status)}>{item.status}</span></td>
                  <td>{item.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-card">
          <h3 className="card-title">Pending Tasks</h3>
          <div className="notification-list">
            {["Upload Sale Deed", "Upload Tax Records", "Update Ownership", "Upload Permit"].map((task) => (
              <div key={task} className="notification-item">
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <LuFileText size={18} />
                  <h4 style={{ margin: 0 }}>{task}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <h3 className="card-title">Recent Activities</h3>
          <div className="notification-list">
            {["Property Created", "Document Uploaded", "Permit Added", "Ownership Updated"].map((activity) => (
              <div key={activity} className="notification-item">
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <LuFileCheck size={18} />
                  <h4 style={{ margin: 0 }}>{activity}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-card quick-actions-card">
        <h3 className="card-title">Quick Actions</h3>
        <div className="quick-actions-grid">
          {[
            { label: "Add Property", subtitle: "Create a new property record", icon: LuPlus, onClick: () => comingSoon("Add Property") },
            { label: "Upload Documents", subtitle: "Attach property documents", icon: LuUpload, onClick: () => navigate("/upload-documents") },
            { label: "Generate Report", subtitle: "Create due diligence report", icon: LuFileText, onClick: () => navigate("/reports") },
            { label: "Add Permit", subtitle: "Record a new permit", icon: LuFileCheck, onClick: () => comingSoon("Add Permit") },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <button key={action.label} className="quick-action-btn" type="button" onClick={action.onClick}>
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
  const navigate = useNavigate();
  const [data] = useState(mockLegalData);

  const comingSoon = (feature) => {
    window.alert(`${feature} isn't built yet — check back soon!`);
  };

  const stats = [
    { label: "Pending Reviews", value: data.pendingReviews, icon: LuFileClock, color: "#F59E0B", bg: "#FEF3C7" },
    { label: "Completed Reviews", value: data.completedReviews, icon: LuCircleCheck, color: "#10B981", bg: "#D1FAE5" },
    { label: "High Legal Risk Cases", value: data.highRiskCases, icon: LuTriangleAlert, color: "#EF4444", bg: "#FEE2E2" },
    { label: "Documents Reviewed Today", value: data.documentsReviewedToday, icon: LuFileCheck, color: "#2563EB", bg: "#DBEAFE" },
  ];

  return (
    <div className="dashboard-page">
      <p className="demo-data-notice">
        Showing demo data 
      </p>

      <DashboardHeader
        icon={LuScale}
        eyebrow="Legal Workspace"
        title="Legal Reviewer Dashboard"
        subtitle="Review documents, assess legal risk, and manage active cases."
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

      <div className="dashboard-content">
        <div className="dashboard-card">
          <h3 className="card-title">Pending Legal Reviews</h3>
          <div className="table-wrapper">
            <table className="recent-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Owner</th>
                  <th>Priority</th>
                  <th>Assigned Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.pendingQueue.length === 0 && (
                  <tr>
                    <td colSpan="5" className="admin-empty-row">No pending reviews right now.</td>
                  </tr>
                )}
                {data.pendingQueue.map((item, index) => (
                  <tr key={index}>
                    <td>{item.property}</td>
                    <td>{item.owner}</td>
                    <td><span className={priorityBadgeClass(item.priority)}>{item.priority}</span></td>
                    <td>{item.assignedDate}</td>
                    <td><span className={statusBadgeClass(item.status)}>{item.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <RiskDistributionCard title="Legal Risk Distribution" data={data.riskDistribution} centerLabel="Cases" />
      </div>

      <div className="dashboard-content">
        <div className="dashboard-card">
          <h3 className="card-title">Recently Reviewed Properties</h3>
          <div className="table-wrapper">
            <table className="recent-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Review Result</th>
                  <th>Completed Time</th>
                </tr>
              </thead>
              <tbody>
                {data.recentlyReviewed.map((item, index) => (
                  <tr key={index}>
                    <td>{item.property}</td>
                    <td><span className={statusBadgeClass(item.result)}>{item.result}</span></td>
                    <td>{item.completedTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-card">
          <h3 className="card-title">Due Today</h3>
          <div className="notification-list">
            <div className="notification-item">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <LuFileClock size={18} />
                <h4 style={{ margin: 0 }}>{data.dueToday.reviewsPending} Reviews Pending</h4>
              </div>
            </div>
            <div className="notification-item">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <LuFileWarning size={18} />
                <h4 style={{ margin: 0 }}>{data.dueToday.highPriorityReviews} High Priority Reviews</h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-card quick-actions-card">
        <h3 className="card-title">Quick Actions</h3>
        <div className="quick-actions-grid">
          {[
            { label: "Start Review", subtitle: "Open the next pending review", icon: LuFileClock, onClick: () => comingSoon("Start Review") },
            { label: "Approve Documents", subtitle: "Approve reviewed documents", icon: LuCircleCheck, onClick: () => comingSoon("Approve Documents") },
            { label: "Reject Documents", subtitle: "Reject documents with issues", icon: LuTriangleAlert, onClick: () => comingSoon("Reject Documents") },
            { label: "Generate Legal Report", subtitle: "Create a legal summary report", icon: LuFileText, onClick: () => navigate("/reports") },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <button key={action.label} className="quick-action-btn" type="button" onClick={action.onClick}>
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
  const navigate = useNavigate();
  const [data] = useState(mockBankData);

  const comingSoon = (feature) => {
    window.alert(`${feature} isn't built yet — check back soon!`);
  };

  const stats = [
    { label: "Pending Loan Requests", value: data.pendingLoanRequests, icon: LuBriefcaseBusiness, color: "#2563EB", bg: "#DBEAFE" },
    { label: "Approved Loans", value: data.approvedLoans, icon: LuCircleCheck, color: "#10B981", bg: "#D1FAE5" },
    { label: "Rejected Loans", value: data.rejectedLoans, icon: LuTriangleAlert, color: "#EF4444", bg: "#FEE2E2" },
    { label: "Average Risk Score", value: data.averageRiskScore, icon: LuGavel, color: "#8B5CF6", bg: "#EDE9FE" },
  ];

  return (
    <div className="dashboard-page">
      <p className="demo-data-notice">
        Showing demo data
      </p>

      <DashboardHeader
        icon={LuLandmark}
        eyebrow="Financial Institution Workspace"
        title="Financial Institution Dashboard"
        subtitle="Review loan eligibility and financial risk for properties in the queue."
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

      <div className="dashboard-content">
        <div className="dashboard-card">
          <h3 className="card-title">Loan Queue</h3>
          <div className="table-wrapper">
            <table className="recent-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Property</th>
                  <th>Loan Amount</th>
                  <th>Risk Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.loanQueue.length === 0 && (
                  <tr>
                    <td colSpan="5" className="admin-empty-row">No loan requests to review right now.</td>
                  </tr>
                )}
                {data.loanQueue.map((item, index) => (
                  <tr key={index}>
                    <td>{item.applicant}</td>
                    <td>{item.property}</td>
                    <td>{item.loanAmount}</td>
                    <td>{item.riskScore}</td>
                    <td><span className={statusBadgeClass(item.status)}>{item.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <RiskDistributionCard title="Financial Risk Distribution" data={data.riskDistribution} centerLabel="Loans" />
      </div>

      <div className="dashboard-card">
        <h3 className="card-title">Latest Financial Reports</h3>
        <div className="notification-list">
          {data.latestReports.map((report) => (
            <div
              key={report.name}
              className="notification-item"
              onClick={() => navigate("/reports")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <LuFileText size={18} />
                <div>
                  <h4 style={{ margin: 0 }}>{report.name}</h4>
                  <p>{report.date} · {report.size}</p>
                </div>
              </div>
              <LuDownload size={16} />
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-card quick-actions-card">
        <h3 className="card-title">Quick Actions</h3>
        <div className="quick-actions-grid">
          {[
            { label: "Approve Loan", subtitle: "Approve the selected loan request", icon: LuCircleCheck, onClick: () => comingSoon("Approve Loan") },
            { label: "Reject Loan", subtitle: "Reject the selected loan request", icon: LuTriangleAlert, onClick: () => comingSoon("Reject Loan") },
            { label: "View Risk Report", subtitle: "Open the full risk breakdown", icon: LuGavel, onClick: () => comingSoon("View Risk Report") },
            { label: "Export Report", subtitle: "Download report as PDF", icon: LuDownload, onClick: () => navigate("/reports") },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <button key={action.label} className="quick-action-btn" type="button" onClick={action.onClick}>
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