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
  LuTrash2,
  LuBell,
  LuArrowUpRight,
} from "react-icons/lu";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

/* =========================================================
   QUICK ACTIONS
   These are UI/navigation labels, not backend data.
   ========================================================= */

const quickActions = [
  {
    label: "New Search",
    subtitle: "Search a property",
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
    label: "Compare",
    subtitle: "Compare properties",
    icon: LuChartBar,
    path: "/compare-properties",
  },
  {
    label: "Upload",
    subtitle: "Upload documents",
    icon: LuUpload,
    path: "/upload-documents",
  },
];

/* =========================================================
   COLORS ONLY
   These don't represent hardcoded data.
   ========================================================= */

const RISK_COLORS = {
  LOW: "#22C55E",
  MEDIUM: "#F59E0B",
  HIGH: "#EF4444",
  CRITICAL: "#7F1D1D",
};

const emptyDashboardData = {
  totalProperties: 0,
  totalReports: 0,
  highRiskCount: 0,
  pendingReviews: 0,
};

export default function Dashboard() {
  const navigate = useNavigate();

  /* =======================================================
     STATE
     ======================================================= */

  const [dashboardData, setDashboardData] = useState(emptyDashboardData);

  const [recentSearches, setRecentSearches] = useState([]);

  const [notifications, setNotifications] = useState([]);

  const [riskDistribution, setRiskDistribution] = useState({
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  });

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /* =======================================================
     LOAD DASHBOARD DATA
     
     IMPORTANT:
     All dashboard data continues to come from backend.
     ======================================================= */

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [summary, searches, notificationResponse, risks] =
        await Promise.all([
          api.getDashboardSummary(),

          api.getRecentSearches(),

          api.getNotifications({
            page: 0,
            size: 5,
          }),

          api.getDashboardRiskDistribution(),
        ]);

      /* -----------------------------------------------
         DASHBOARD SUMMARY
         ----------------------------------------------- */

      setDashboardData({
        totalProperties: summary?.totalProperties ?? 0,

        totalReports: summary?.totalReports ?? summary?.reportsGenerated ?? 0,

        highRiskCount: summary?.highRiskProperties ?? 0,

        pendingReviews: summary?.pendingReviews ?? 0,
      });

      setRiskDistribution({
        low: risks?.low ?? 0,
        medium: risks?.medium ?? 0,
        high: risks?.high ?? 0,
        critical: risks?.critical ?? 0,
      });

      /* -----------------------------------------------
         RECENT SEARCHES
         ----------------------------------------------- */

      setRecentSearches(Array.isArray(searches) ? searches : []);

      /* -----------------------------------------------
         NOTIFICATIONS
         ----------------------------------------------- */

      if (Array.isArray(notificationResponse)) {
        setNotifications(notificationResponse);
      } else if (Array.isArray(notificationResponse?.content)) {
        setNotifications(notificationResponse.content);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Dashboard loading failed:", err);

      setError(err?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  /* =======================================================
     DELETE ONE RECENT SEARCH
     ======================================================= */

  const handleDeleteSearch = useCallback(async (searchId) => {
    if (!api.isAuthenticated() || searchId == null) {
      return;
    }

    try {
      await api.deleteSearchHistory(searchId);

      setRecentSearches((prev) =>
        prev.filter((item) => item.searchId !== searchId),
      );
    } catch (err) {
      console.warn("Failed to delete search history entry:", err);
    }
  }, []);

  /* =======================================================
     CLEAR ALL SEARCHES
     ======================================================= */

  const handleClearSearches = useCallback(async () => {
    if (!api.isAuthenticated()) {
      return;
    }

    try {
      await api.clearSearchHistory();

      setRecentSearches([]);
    } catch (err) {
      console.warn("Failed to clear search history:", err);
    }
  }, []);

  /* =======================================================
     AUTH + INITIAL LOAD
     ======================================================= */

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate("/login");
      return;
    }

    const timer = setTimeout(() => {
      loadDashboard();
    }, 0);

    return () => clearTimeout(timer);
  }, [navigate, loadDashboard]);

  /* =======================================================
     STATUS DATA
     
     These values come directly from dashboardData,
     which itself comes from the backend.
     ======================================================= */

  const statusData = [
    {
      name: "Properties",
      value: dashboardData.totalProperties,
    },
    {
      name: "Reports",
      value: dashboardData.totalReports,
    },
    {
      name: "Pending",
      value: dashboardData.pendingReviews,
    },
  ];

  /* =======================================================
     HIGH-RISK DATA
     
     IMPORTANT:
     We only know highRiskProperties from the current
     Dashboard API response.

     We DO NOT invent Medium/Low values.
     ======================================================= */

  const riskData = [
    { name: "Low", value: riskDistribution.low, color: RISK_COLORS.LOW },
    {
      name: "Medium",
      value: riskDistribution.medium,
      color: RISK_COLORS.MEDIUM,
    },
    { name: "High", value: riskDistribution.high, color: RISK_COLORS.HIGH },
    {
      name: "Critical",
      value: riskDistribution.critical,
      color: RISK_COLORS.CRITICAL,
    },
  ];

  /* =======================================================
     STAT CARDS
     
     All values are backend values.
     ======================================================= */

  const stats = [
    {
      label: "Total Properties",
      value: dashboardData.totalProperties,
      icon: LuBuilding2,
      color: "#2563EB",
      background: "#EFF6FF",
    },

    {
      label: "Reports Generated",
      value: dashboardData.totalReports,
      icon: LuFileText,
      color: "#059669",
      background: "#ECFDF5",
    },

    {
      label: "High Risk Properties",
      value: dashboardData.highRiskCount,
      icon: LuTriangleAlert,
      color: "#DC2626",
      background: "#FEF2F2",
    },

    {
      label: "Pending Reviews",
      value: dashboardData.pendingReviews,
      icon: LuClock,
      color: "#D97706",
      background: "#FFFBEB",
    },
  ];

  /* =======================================================
     LOADING
     ======================================================= */

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner" />

          <span>Loading dashboard...</span>
        </div>
      </Layout>
    );
  }

  /* =======================================================
     MAIN UI
     ======================================================= */

  return (
    <Layout title="Dashboard" showSearch={true}>
      <div className="dashboard-page">
        {/* =================================================
            WELCOME HEADER
            ================================================= */}

        <section className="dashboard-welcome">
          <div>
            <span className="welcome-eyebrow">PROPERTY OVERVIEW</span>

            <h1>
              Welcome back, Buyer <span className="welcome-emoji">👋</span>
            </h1>

            <p>Here's what's happening with your properties today.</p>
          </div>

          <button
            type="button"
            className="notification-top-btn"
            onClick={() => navigate("/notifications")}
            aria-label="Open notifications"
          >
            {/* <LuBell size={21} />

            {notifications.length > 0 && (
              <span className="notification-count">{notifications.length}</span>
            )} */}
          </button>
        </section>

        {/* =================================================
            ERROR
            ================================================= */}

        {error && (
          <div className="dashboard-error" role="alert">
            <LuTriangleAlert size={18} />

            <span>{error}</span>
          </div>
        )}

        {/* =================================================
            STAT CARDS
            ================================================= */}

        <section className="stats-grid">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div key={stat.label} className="stat-card">
                <div
                  className="stat-icon"
                  style={{
                    background: stat.background,
                    color: stat.color,
                  }}
                >
                  <Icon size={22} />
                </div>

                <div className="stat-content">
                  <span>{stat.label}</span>

                  <strong>{stat.value}</strong>

                  <small>
                    <LuArrowUpRight size={13} />
                    Current overview
                  </small>
                </div>
              </div>
            );
          })}
        </section>

        {/* =================================================
            MAIN CONTENT GRID
            ================================================= */}

        <section className="dashboard-main-grid">
          {/* ===============================================
              RISK OVERVIEW
              =============================================== */}

          <div className="dashboard-card risk-overview-card">
            <div className="card-header">
              <div>
                <span className="card-eyebrow">ANALYTICS</span>

                <h2 className="card-title">Risk Overview</h2>

                <p className="card-subtitle">
                  Current risk information from your property portfolio
                </p>
              </div>

              <div className="card-status">Live</div>
            </div>

            <div className="risk-overview-content">
              {/* -----------------------------------------
                  RISK DISTRIBUTION
                  ----------------------------------------- */}

              <div className="risk-donut-area">
                <div className="chart-heading">High Risk Properties</div>

                <div className="pie-chart-container">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={riskData}
                        cx="50%"
                        cy="50%"
                        innerRadius={62}
                        outerRadius={88}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {riskData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>

                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="donut-center">
                    <strong>{dashboardData.highRiskCount}</strong>

                    <span>High + Critical</span>
                  </div>
                </div>

                <div className="risk-list">
                  {riskData.map((risk) => (
                    <div className="risk-item" key={risk.name}>
                      <span
                        className="risk-dot"
                        style={{ background: risk.color }}
                      />
                      <span>{risk.name}</span>
                      <strong>{risk.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* -----------------------------------------
                  OVERVIEW ANALYTICS
                  ----------------------------------------- */}

              <div className="analytics-area">
                <div className="chart-heading">Overview Analytics</div>

                <div className="bar-chart-container">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                      data={statusData}
                      margin={{
                        top: 15,
                        right: 10,
                        left: 5,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />

                      <XAxis dataKey="name" axisLine={false} tickLine={false} />

                      <YAxis
                        allowDecimals={false}
                        axisLine={false}
                        tickLine={false}
                        width={35}
                      />

                      <Tooltip />

                      <Bar
                        dataKey="value"
                        fill="#2563EB"
                        radius={[8, 8, 2, 2]}
                        barSize={45}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* ===============================================
              RECENT SEARCHES
              =============================================== */}

          <div className="dashboard-card recent-search-card">
            <div className="card-header compact-header">
              <div>
                <span className="card-eyebrow">ACTIVITY</span>

                <h2 className="card-title">Recent Searches</h2>
              </div>

              {recentSearches.length > 0 && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={handleClearSearches}
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="recent-search-list">
              {recentSearches.length > 0 ? (
                recentSearches.slice(0, 5).map((item, index) => {
                  /*
                   * IMPORTANT:
                   * These values come from the
                   * backend response.
                   */

                  const propertyName =
                    item.propertyName ||
                    item.propertyTitle ||
                    item.propertyCode ||
                    item.property ||
                    "N/A";

                  const propertyType = item.propertyType || item.type || "N/A";

                  const riskLevel = item.riskLevel || item.risk || "Unrated";

                  return (
                    <div
                      key={item.searchId ?? index}
                      className="recent-search-item"
                      onClick={() => {
                        if (item.propertyId) {
                          navigate(`/property/${item.propertyId}`);
                        } else {
                          navigate("/property-search", {
                            state: {
                              search: propertyName,
                            },
                          });
                        }
                      }}
                    >
                      {/* PROPERTY ICON */}

                      <div className="recent-property-image">
                        <LuBuilding2 size={21} />
                      </div>

                      {/* PROPERTY DATA */}

                      <div className="recent-property-info">
                        <h4>{propertyName}</h4>

                        <p>
                          {propertyType}

                          {item.city ? ` • ${item.city}` : ""}
                        </p>

                        <span
                          className={`risk-badge ${String(
                            riskLevel,
                          ).toLowerCase()}`}
                        >
                          {riskLevel}
                        </span>
                      </div>

                      {/* TIME + DELETE */}

                      <div className="recent-search-meta">
                        <span>{formatVisitedTime(item.searchedAt)}</span>

                        <button
                          type="button"
                          className="delete-search-btn"
                          title="Delete search"
                          aria-label="Delete search"
                          onClick={(event) => {
                            event.preventDefault();

                            event.stopPropagation();

                            handleDeleteSearch(item.searchId);
                          }}
                        >
                          <LuTrash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                /* -----------------------------------------
                   EMPTY STATE
                   ----------------------------------------- */

                <div className="recent-empty">
                  <LuSearch size={28} />

                  <h4>No recent searches</h4>

                  <p>Your recent property searches will appear here.</p>

                  <button
                    type="button"
                    onClick={() => navigate("/property-search")}
                  >
                    Start Searching
                  </button>
                </div>
              )}
            </div>

            {/* VIEW ALL */}

            {recentSearches.length > 5 && (
              <button
                type="button"
                className="view-more-btn"
                onClick={() => navigate("/property-search")}
              >
                View All Searches
                <LuChevronRight size={16} />
              </button>
            )}
          </div>
        </section>

        {/* =================================================
            LOWER GRID
            ================================================= */}

        <section className="dashboard-lower-grid">
          {/* ===============================================
              NOTIFICATIONS
              =============================================== */}

          <div className="dashboard-card notifications-card">
            <div className="card-header">
              <div>
                <span className="card-eyebrow">UPDATES</span>

                <h2 className="card-title">Recent Notifications</h2>
              </div>

              <button
                type="button"
                className="view-all-link"
                onClick={() => navigate("/notifications")}
              >
                View All
                <LuChevronRight size={15} />
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
                    {/* <div className="notification-icon">
                      <LuBell size={17} />
                    </div> */}

                    <div className="notification-content">
                      <h4>{notification.title || "Notification"}</h4>

                      <p>
                        {notification.message || notification.subtitle || ""}
                      </p>
                    </div>

                    <LuChevronRight className="notification-arrow" size={18} />
                  </div>
                ))
              ) : (
                <div className="notification-empty">
                  {/* <LuBell size={25} /> */}

                  <p>No new notifications.</p>

                  <button
                    type="button"
                    onClick={() => navigate("/notifications")}
                  >
                    View Notifications
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ===============================================
              QUICK ACTIONS
              =============================================== */}

          <div className="dashboard-card quick-actions-card">
            <div className="card-header">
              <div>
                <span className="card-eyebrow">SHORTCUTS</span>

                <h2 className="card-title">Quick Actions</h2>
              </div>
            </div>

            <div className="quick-actions-grid">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <button
                    type="button"
                    key={action.label}
                    className="quick-action-btn"
                    onClick={() => navigate(action.path)}
                  >
                    <div className="quick-action-icon">
                      <Icon size={21} />
                    </div>

                    <div className="quick-action-content">
                      <h4>{action.label}</h4>

                      <p>{action.subtitle}</p>
                    </div>

                    <LuChevronRight className="quick-action-arrow" size={17} />
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* =================================================
            RECENTLY SEARCHED PROPERTIES
             
            IMPORTANT:
            This is NOT a separate fake dataset.
            It simply presents the same backend
            recentSearches data in another visual format.
            ================================================= */}

        {recentSearches.length > 0 && (
          <section className="dashboard-card recently-viewed-card">
            <div className="card-header">
              <div>
                <span className="card-eyebrow">YOUR ACTIVITY</span>

                <h2 className="card-title">Recently Searched Properties</h2>

                <p className="card-subtitle">
                  Properties from your recent search history
                </p>
              </div>

              <button
                type="button"
                className="view-all-link"
                onClick={() => navigate("/property-search")}
              >
                Explore
                <LuChevronRight size={15} />
              </button>
            </div>

            <div className="recently-viewed-grid">
              {recentSearches.slice(0, 5).map((item, index) => {
                const propertyName =
                  item.propertyName ||
                  item.propertyTitle ||
                  item.propertyCode ||
                  item.property ||
                  "N/A";

                const propertyType = item.propertyType || item.type || "N/A";

                return (
                  <div
                    key={item.searchId ?? index}
                    className="viewed-property-card"
                    onClick={() => {
                      if (item.propertyId) {
                        navigate(`/property/${item.propertyId}`);
                      } else {
                        navigate("/property-search", {
                          state: {
                            search: propertyName,
                          },
                        });
                      }
                    }}
                  >
                    <div className="viewed-property-image">
                      <LuBuilding2 size={25} />
                    </div>

                    <div className="viewed-property-info">
                      <h4>{propertyName}</h4>

                      <p>
                        {propertyType}

                        {item.city ? ` • ${item.city}` : ""}
                      </p>

                      <span>{formatVisitedTime(item.searchedAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
