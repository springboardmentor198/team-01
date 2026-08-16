import {
  LuHeadphones,
  LuCircleAlert,
  LuClock3,
  LuCircleCheck,
} from "react-icons/lu";
import { useNavigate } from "react-router-dom";

const supportData = [
  {
    label: "Open",
    count: 24,
    percentage: 48,
    className: "open",
    color: "#4F46E5",
  },
  {
    label: "In Progress",
    count: 15,
    percentage: 30,
    className: "progress",
    color: "#F59E0B",
  },
  {
    label: "Resolved",
    count: 11,
    percentage: 22,
    className: "resolved",
    color: "#22C55E",
  },
];

function SupportOverview() {
  const navigate = useNavigate();
  const totalTickets = supportData.reduce(
    (total, item) => total + item.count,
    0,
  );

  /*
   * Donut segments:
   * Open        = 48%
   * In Progress = 30%
   * Resolved    = 22%
   */
  const donutBackground = `
    conic-gradient(
      #4F46E5 0% 48%,
      #F59E0B 48% 78%,
      #22C55E 78% 100%
    )
  `;

  return (
    <article className="admin-dashboard-card">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="admin-dashboard-card-header">
        <div>
          <h2 className="admin-dashboard-card-title">Support Overview</h2>

          <p className="admin-dashboard-card-subtitle">
            Current support ticket status
          </p>
        </div>

        <LuHeadphones size={19} color="#4F46E5" />
      </div>

      {/* =====================================================
          SUPPORT CONTENT
      ====================================================== */}
      <div className="admin-support-content">
        {/* Donut */}
        <div
          className="admin-support-chart"
          style={{
            background: donutBackground,
            borderRadius: "50%",
          }}
        >
          {/* Inner circle */}
          <div
            style={{
              position: "absolute",
              inset: "21%",
              background: "#ffffff",
              borderRadius: "50%",
            }}
          />

          {/* Center */}
          <div className="admin-support-center">
            <span className="admin-support-total">{totalTickets}</span>

            <span className="admin-support-label">Total Tickets</span>
          </div>
        </div>

        {/* Legend */}
        <div className="admin-support-legend">
          {supportData.map((item) => (
            <div className="admin-support-legend-item" key={item.label}>
              <span
                className="admin-support-dot"
                style={{
                  background: item.color,
                }}
              />

              <span className="admin-support-name">{item.label}</span>

              <span className="admin-support-count">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* =====================================================
          TICKET SUMMARY
      ====================================================== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "8px",
          marginTop: "4px",
        }}
      >
        <div
          style={{
            padding: "10px",
            borderRadius: "8px",
            background: "#F8FAFC",
          }}
        >
          <LuCircleAlert size={14} color="#4F46E5" />

          <p
            style={{
              margin: "6px 0 0",
              color: "#94A3B8",
              fontSize: "9px",
            }}
          >
            Open
          </p>

          <strong
            style={{
              display: "block",
              marginTop: "2px",
              color: "#172554",
              fontSize: "13px",
            }}
          >
            24
          </strong>
        </div>

        <div
          style={{
            padding: "10px",
            borderRadius: "8px",
            background: "#F8FAFC",
          }}
        >
          <LuClock3 size={14} color="#F59E0B" />

          <p
            style={{
              margin: "6px 0 0",
              color: "#94A3B8",
              fontSize: "9px",
            }}
          >
            In Progress
          </p>

          <strong
            style={{
              display: "block",
              marginTop: "2px",
              color: "#172554",
              fontSize: "13px",
            }}
          >
            15
          </strong>
        </div>

        <div
          style={{
            padding: "10px",
            borderRadius: "8px",
            background: "#F8FAFC",
          }}
        >
          <LuCircleCheck size={14} color="#22C55E" />

          <p
            style={{
              margin: "6px 0 0",
              color: "#94A3B8",
              fontSize: "9px",
            }}
          >
            Resolved
          </p>

          <strong
            style={{
              display: "block",
              marginTop: "2px",
              color: "#172554",
              fontSize: "13px",
            }}
          >
            11
          </strong>
        </div>
      </div>

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <button type="button" className="admin-support-button" onClick={() => navigate("/admin/support-tickets")}>
        Manage support tickets
      </button>
    </article>
  );
}

export default SupportOverview;
