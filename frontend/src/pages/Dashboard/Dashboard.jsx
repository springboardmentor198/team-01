import Layout from "../../components/Layout/Layout";
import { useNavigate } from "react-router-dom";
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

const stats = [
  {
    label: "Total Properties",
    value: 128,
    icon: LuBuilding2,
    color: "#2563EB",
    bg: "#DBEAFE",
  },
  {
    label: "Reports Generated",
    value: 54,
    icon: LuFileText,
    color: "#10B981",
    bg: "#D1FAE5",
  },
  {
    label: "High Risk",
    value: 12,
    icon: LuTriangleAlert,
    color: "#EF4444",
    bg: "#FEE2E2",
  },
  {
    label: "Pending Reviews",
    value: 8,
    icon: LuClock,
    color: "#F59E0B",
    bg: "#FEF3C7",
  },
];

const recentSearches = [
  {
    property: "24 Lakeview Street",
    type: "Residential",
    risk: "Medium",
    status: "Completed",
  },
  {
    property: "18 Green Avenue",
    type: "Commercial",
    risk: "Low",
    status: "Pending",
  },
  {
    property: "Palm Residency",
    type: "Residential",
    risk: "High",
    status: "Reviewing",
  },
  {
    property: "Skyline Towers",
    type: "Commercial",
    risk: "Low",
    status: "Completed",
  },
  {
    property: "Maple Heights",
    type: "Residential",
    risk: "Low",
    status: "In Progress",
  },
  {
    property: "Sunrise Villas",
    type: "Residential",
    risk: "Medium",
    status: "Pending",
  },
];

const riskBreakdown = [
  {
    label: "Low Risk",
    count: 68,
    color: "#22C55E",
  },
  {
    label: "Medium Risk",
    count: 32,
    color: "#F59E0B",
  },
  {
    label: "High Risk",
    count: 20,
    color: "#EF4444",
  },
  {
    label: "Critical",
    count: 8,
    color: "#991B1B",
  },
];

const notifications = [
  {
    title: "Report Ready",
    subtitle: "24 Lakeview Street",
  },
  {
    title: "Property Tax Update",
    subtitle: "Palm Residency",
  },
  {
    title: "Permit Expiry Alert",
    subtitle: "18 Green Avenue",
  },
];

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
    path: "#",
  },
  {
    label: "Compare Properties",
    subtitle: "Compare properties",
    icon: LuChartBar,
    path: "#",
  },
  {
    label: "Upload Documents",
    subtitle: "Add documents",
    icon: LuUpload,
    path: "#",
  },
];

function RiskDonut({ data, total }) {
  const size = 170;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = data.reduce((acc, segment) => {
    const previous = acc[acc.length - 1];
    const before = previous ? previous.after : 0;

    const fraction = segment.count / total;

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

      <text
        x="50%"
        y="47%"
        textAnchor="middle"
        className="donut-value"
      >
        {total}
      </text>

      <text
        x="50%"
        y="60%"
        textAnchor="middle"
        className="donut-label"
      >
        Total
      </text>

    </svg>
  );
}

export default function Dashboard() {

  const navigate = useNavigate();

  const totalProperties = riskBreakdown.reduce(
    (sum, item) => sum + item.count,
    0
  );

  return (

    <Layout title="Dashboard" showSearch={true}>

      <div className="dashboard-page">

        <div className="stats-grid">

          {stats.map((item) => {

            const Icon = item.icon;

            return (

              <div
                key={item.label}
                className="stat-card"
              >

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

                  <p className="stat-label">
                    {item.label}
                  </p>

                  <h2 className="stat-value">
                    {item.value}
                  </h2>

                </div>

              </div>

            );

          })}

        </div>

                <div className="dashboard-content">

          {/* ================= RECENT SEARCHES ================= */}

          <div className="dashboard-card recent-search-card">

            <h3 className="card-title">
              Recent Searches
            </h3>

            <div className="table-wrapper">

              <table className="recent-table">

                <thead>

                  <tr>

                    <th>Property</th>
                    <th>Type</th>
                    <th>Risk</th>
                    <th>Status</th>

                  </tr>

                </thead>

                <tbody>

                  {recentSearches.map((item) => (

                    <tr key={item.property}>

                      <td>{item.property}</td>

                      <td>{item.type}</td>

                      <td>

                        <span
                          className={`risk-badge ${item.risk.toLowerCase()}`}
                        >
                          {item.risk}
                        </span>

                      </td>

                      <td>{item.status}</td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* ================= RIGHT PANEL ================= */}

          <div className="dashboard-card right-panel">

            <h3 className="card-title">
              Risk Summary
            </h3>

            <div className="risk-section">

              <RiskDonut
                data={riskBreakdown}
                total={totalProperties}
              />

              <div className="risk-list">

                {riskBreakdown.map((risk) => (

                  <div
                    key={risk.label}
                    className="risk-item"
                  >

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

            <h3
              className="card-title"
              style={{ marginTop: "28px" }}
            >
              Upcoming Notifications
            </h3>

            <div className="notification-list">

              {notifications.map((item) => (

                <div
                  key={item.title}
                  className="notification-item"
                >

                  <div>

                    <h4>{item.title}</h4>

                    <p>{item.subtitle}</p>

                  </div>

                  <LuChevronRight />

                </div>

              ))}

            </div>

          </div>

        </div>

                {/* ================= QUICK ACTIONS ================= */}

        <div className="dashboard-card quick-actions-card">

          <h3 className="card-title">
            Quick Actions
          </h3>

          <div className="quick-actions-grid">

            {quickActions.map((action) => {

              const Icon = action.icon;

              return (

                <button
                  key={action.label}
                  className="quick-action-btn"
                  onClick={() => {
                    if (action.path !== "#") {
                      navigate(action.path);
                    }
                  }}
                >

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

    </Layout>

  );

}