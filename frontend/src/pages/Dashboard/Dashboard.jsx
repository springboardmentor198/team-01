import { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import RecentSearchesTable from "../../components/RecentSearches/RecentSearchesTable";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { useRecentSearches } from "../../hooks/useRecentSearches";
import "./Dashboard.css";

import {
  LuSearch,
  LuBuilding2,
  LuFileText,
  LuTriangleAlert,
  LuClock,
  LuChartBar,
  LuUpload,
  LuChevronRight,
} from "react-icons/lu";

const quickActions = [
  {
    label: "New Property Search",
    subtitle: "Search a new property",
    icon: LuSearch,
    path: "/property-search",
  },
  {
    label: "Generate Report",
    subtitle: "Create due diligence report",
    icon: LuFileText,
    path: "/reports",
  },
  {
    label: "Compare Properties",
    subtitle: "Compare two properties",
    icon: LuChartBar,
    path: "/compare-properties",
  },
  {
    label: "Upload Documents",
    subtitle: "Upload property documents",
    icon: LuUpload,
    path: "/upload-documents",
  },
];

const emptyDashboardData = {
  totalProperties: 0,
  totalReports: 0,
  highRiskCount: 0,
  pendingReviews: 0,
  recentSearches: [],
  riskBreakdown: [],
  notifications: [],
};

function RiskDonut({ data, total }) {
  const size = 170;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = data.reduce((acc, segment) => {
    const previous = acc[acc.length - 1];
    const before = previous ? previous.after : 0;

    const fraction = total > 0 ? segment.count / total : 0;

    acc.push({
      ...segment,
      dashArray: `${fraction * circumference} ${circumference}`,
      dashOffset: -before * circumference,
      after: before + fraction,
    });

    return acc;
  }, []);

  return (
    <svg width={size} height={size}>
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {segments.map((segment) => (
          <circle
            key={segment.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeDasharray={segment.dashArray}
            strokeDashoffset={segment.dashOffset}
          />
        ))}
      </g>
      <text x="50%" y="47%" textAnchor="middle" className="donut-value">
        {total}
      </text>
      <text x="50%" y="60%" textAnchor="middle" className="donut-label">
        Total
      </text>
    </svg>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(emptyDashboardData);
  const [error, setError] = useState("");
  const {
    searches: recentSearches,
    loading: recentSearchesLoading,
    error: recentSearchesError,
  } = useRecentSearches();

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate("/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const summary = await api.getDashboardSummary();

        setData((prev) => ({
          totalProperties: summary.totalProperties,
          totalReports: summary.totalReports,
          highRiskCount: summary.highRiskProperties,
          pendingReviews: 0,
          riskBreakdown: [
            {
              label: "High Risk",
              count: summary.highRiskProperties,
              color: "#EF4444",
            },
          ],
          notifications: [],
        }));
      } catch (err) {
        setError(err.message || "Unable to load dashboard statistics");
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const stats = [
    {
      label: "Total Properties",
      value: data.totalProperties,
      icon: LuBuilding2,
      color: "#2563EB",
      bg: "#DBEAFE",
    },
    {
      label: "Reports Generated",
      value: data.totalReports,
      icon: LuFileText,
      color: "#10B981",
      bg: "#D1FAE5",
    },
    {
      label: "High Risk",
      value: data.highRiskCount,
      icon: LuTriangleAlert,
      color: "#EF4444",
      bg: "#FEE2E2",
    },
    {
      label: "Pending Reviews",
      value: data.pendingReviews,
      icon: LuClock,
      color: "#F59E0B",
      bg: "#FEF3C7",
    },
  ];

  const riskBreakdown = data.riskBreakdown;
  const notifications = data.notifications;
  const totalProperties = riskBreakdown.reduce(
    (sum, item) => sum + item.count,
    0,
  );

  return (
    <Layout title="Dashboard" showSearch={true}>
      <div className="dashboard-page">
        {error && (
          <div className="demo-data-notice" role="alert">
            {error}
          </div>
        )}
        <div className="stats-grid">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="stat-card">
                <div
                  className="stat-icon"
                  style={{
                    background: item.bg,
                    color: item.color,
                  }}
                >
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
          {/* ================= RECENT SEARCHES ================= */}
          <div className="dashboard-card recent-search-card">
            <h3 className="card-title">Recent Searches</h3>
            <RecentSearchesTable
              searches={recentSearches}
              loading={recentSearchesLoading}
              error={recentSearchesError}
              showStatus={true}
              clickable={true}
              emptyMessage="No searches logged. Use the search bar above to find properties."
            />
          </div>

          {/* ================= RIGHT PANEL ================= */}
          <div className="dashboard-card right-panel">
            <h3 className="card-title">Risk Summary</h3>
            <div className="risk-section">
              <RiskDonut data={riskBreakdown} total={totalProperties} />
              <div className="risk-list">
                {riskBreakdown.map((risk) => (
                  <div key={risk.label} className="risk-item">
                    <span
                      className="risk-dot"
                      style={{
                        background: risk.color,
                      }}
                    ></span>
                    <span>
                      {risk.label} ({risk.count})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <h3 className="card-title" style={{ marginTop: "28px" }}>
              Upcoming Notifications
            </h3>
            <div className="notification-list">
              {notifications.map((item, index) => (
                <div key={index} className="notification-item">
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.subtitle}</p>
                  </div>
                  <LuChevronRight />
                </div>
              ))}
              {notifications.length === 0 && (
                <p style={{ color: "#666", padding: "10px 0" }}>
                  No notifications.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ================= QUICK ACTIONS ================= */}
        <div className="dashboard-card quick-actions-card">
          <h3 className="card-title">Quick Actions</h3>

          <div className="quick-actions-grid">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.label}
                  className="quick-action-btn"
                  onClick={() => navigate(action.path)}
                >
                  <div className="quick-action-icon">
                    <Icon size={20} />
                  </div>

                  <div className="quick-action-content">
                    <h4>{action.label}</h4>
                    <p>{action.subtitle}</p>
                  </div>

                  <LuChevronRight className="quick-action-arrow" size={18} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
