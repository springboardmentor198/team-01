import { useState, useEffect, useCallback } from "react";
import Layout from "../../components/Layout/Layout";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { formatVisitedTime } from "../../utils/searchUtils";
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
};

function RiskDonut({ total }) {
  const size = 170;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;

  return (
    <svg width={size} height={size}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#E5E7EB"
        strokeWidth={strokeWidth}
      />

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

  const [dashboardData, setDashboardData] = useState(emptyDashboardData);

  const [recentSearches, setRecentSearches] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);

      const [summary, searches, notificationResponse] = await Promise.all([
        api.getDashboardSummary(),
        api.getRecentSearches(),
        api.getNotifications({ page: 0, size: 5 }),
      ]);

      setDashboardData({
        totalProperties: summary.totalProperties ?? 0,
        totalReports: summary.totalReports ?? summary.reportsGenerated ?? 0,
        highRiskCount: summary.highRiskProperties ?? 0,
        pendingReviews: summary.pendingReviews ?? 0,
      });

      setRecentSearches(Array.isArray(searches) ? searches : []);

      if (Array.isArray(notificationResponse)) {
        setNotifications(notificationResponse);
      } else if (notificationResponse?.content) {
        setNotifications(notificationResponse.content);
      } else {
        setNotifications([]);
      }

      setError("");
    } catch (err) {
      setError(err.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteSearch = useCallback(async (searchId) => {
    if (!api.isAuthenticated() || searchId == null) return;
    try {
      await api.deleteSearchHistory(searchId);
      setRecentSearches((prev) =>
        prev.filter((item) => item.searchId !== searchId),
      );
    } catch (err) {
      console.warn("Failed to delete search history entry", err);
    }
  }, []);

  const handleClearSearches = useCallback(async () => {
    if (!api.isAuthenticated()) return;
    try {
      await api.clearSearchHistory();
      setRecentSearches([]);
    } catch (err) {
      console.warn("Failed to clear search history", err);
    }
  }, []);

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate("/login");
      return;
    }

    loadDashboard();
  }, [navigate, loadDashboard]);

  const stats = [
    {
      label: "Total Properties",
      value: dashboardData.totalProperties,
      icon: LuBuilding2,
      color: "#2563EB",
      bg: "#DBEAFE",
    },
    {
      label: "Reports Generated",
      value: dashboardData.totalReports,
      icon: LuFileText,
      color: "#10B981",
      bg: "#D1FAE5",
    },
    {
      label: "High Risk",
      value: dashboardData.highRiskCount,
      icon: LuTriangleAlert,
      color: "#EF4444",
      bg: "#FEE2E2",
    },
    {
      label: "Pending Reviews",
      value: dashboardData.pendingReviews,
      icon: LuClock,
      color: "#F59E0B",
      bg: "#FEF3C7",
    },
  ];

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="loading-container">Loading Dashboard...</div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard" showSearch={true}>
      <div className="dashboard-page">
        {error && (
          <div className="demo-data-notice" role="alert">
            {error}
          </div>
        )}

        {/* ================= KPI CARDS ================= */}

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
            <div className="dashboard-notification-header recent-search-header">
              <h3 className="card-title">Recent Searches</h3>

              {recentSearches.length > 0 && (
                <button
                  className="recent-search-clear-all"
                  onClick={handleClearSearches}
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="table-wrapper recent-search-scroll">
              <table className="recent-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Type</th>
                    <th>City</th>
                    <th>Risk</th>
                    <th>Visited</th>
                    <th className="recent-actions-header">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {recentSearches.length > 0 ? (
                    recentSearches.map((item, index) => (
                      <tr
                        key={item.searchId ?? index}
                        className="recent-search-row"
                        onClick={() =>
                          item.propertyId
                            ? navigate(`/property/${item.propertyId}`)
                            : navigate("/property-search", {
                                state: {
                                  search:
                                    item.propertyName ||
                                    item.propertyTitle ||
                                    item.query ||
                                    item.searchText,
                                },
                              })
                        }
                      >
                        <td className="recent-property-cell">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.propertyName || item.property || ""}
                              className="recent-property-thumb"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          )}
                          <span className="recent-property-name">
                            {item.propertyName ||
                              item.propertyTitle ||
                              item.propertyCode ||
                              item.property ||
                              "N/A"}
                          </span>
                        </td>

                        <td>{item.propertyType || item.type || "N/A"}</td>

                        <td>{item.city || "—"}</td>

                        <td>
                          <span
                            className={`risk-badge ${(
                              item.riskLevel ||
                              item.risk ||
                              "low"
                            ).toLowerCase()}`}
                          >
                            {item.riskLevel || item.risk || "Unrated"}
                          </span>
                        </td>

                        <td className="recent-visited-time">
                          {formatVisitedTime(item.searchedAt)}
                        </td>

                        <td className="recent-actions-cell">
                          <button
                            type="button"
                            className="recent-search-delete"
                            title="Delete this search"
                            aria-label="Delete this search"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              handleDeleteSearch(item.searchId);
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        style={{
                          textAlign: "center",
                          padding: "20px",
                          color: "#64748B",
                        }}
                      >
                        No recent searches available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ================= RIGHT PANEL ================= */}

          <div className="dashboard-card right-panel">
            <h3 className="card-title">Risk Summary</h3>

            <div className="risk-section">
              <RiskDonut total={dashboardData.highRiskCount} />

              <div className="risk-list">
                <div className="risk-item">
                  <span
                    className="risk-dot"
                    style={{
                      background: "#EF4444",
                    }}
                  ></span>

                  <span>High Risk ({dashboardData.highRiskCount})</span>
                </div>

                <div className="risk-item">
                  <span
                    className="risk-dot"
                    style={{
                      background: "#10B981",
                    }}
                  ></span>

                  <span>
                    Total Properties ({dashboardData.totalProperties})
                  </span>
                </div>

                <div className="risk-item">
                  <span
                    className="risk-dot"
                    style={{
                      background: "#3B82F6",
                    }}
                  ></span>

                  <span>Reports ({dashboardData.totalReports})</span>
                </div>
              </div>
            </div>

            <div
              className="dashboard-notification-header"
              style={{ marginTop: "28px" }}
            >
              <h3 className="card-title">Notifications</h3>

              <button
                className="view-all-link"
                onClick={() => navigate("/notifications")}
              >
                View All
              </button>
            </div>

            <div className="notification-list">
              {notifications.length > 0 ? (
                notifications.slice(0, 3).map((notification, index) => (
                  <div
                    key={notification.id ?? index}
                    className="notification-item"
                    onClick={() => navigate("/notifications")}
                  >
                    <div>
                      <h4>{notification.title || "Notification"}</h4>

                      <p>
                        {notification.message ||
                          notification.subtitle ||
                          "No description"}
                      </p>
                    </div>

                    <LuChevronRight />
                  </div>
                ))
              ) : (
                <div className="empty-notification-state">
                  <p>No new notifications.</p>

                  <button
                    className="view-all-btn"
                    onClick={() => navigate("/notifications")}
                  >
                    View All Notifications
                  </button>
                </div>
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
