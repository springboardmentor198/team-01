import { useMemo } from "react";

const verificationData = [
  {
    label: "Approved",
    value: 72,
    count: 1195,
    className: "approved",
  },
  {
    label: "Pending",
    value: 18,
    count: 299,
    className: "pending",
  },
  {
    label: "Rejected",
    value: 10,
    count: 165,
    className: "rejected",
  },
];

function VerificationSummary() {
  const total = useMemo(
    () => verificationData.reduce((sum, item) => sum + item.count, 0),
    [],
  );

  /*
   * Creates a conic-gradient for the donut chart.
   *
   * The percentages are:
   * Approved = 72%
   * Pending  = 18%
   * Rejected = 10%
   */
  const donutBackground = `
    conic-gradient(
      #22c55e 0% 72%,
      #f59e0b 72% 90%,
      #ef4444 90% 100%
    )
  `;

  return (
    <article className="admin-dashboard-card">
      {/* ---------------------------------------------------
          HEADER
      --------------------------------------------------- */}
      <div className="admin-dashboard-card-header">
        <div>
          <h2 className="admin-dashboard-card-title">Verification Summary</h2>

          <p className="admin-dashboard-card-subtitle">
            Current professional verification status
          </p>
        </div>
      </div>

      {/* ---------------------------------------------------
          CONTENT
      --------------------------------------------------- */}
      <div className="admin-verification-content">
        {/* Donut chart */}
        <div
          className="admin-verification-chart"
          style={{
            background: donutBackground,
            borderRadius: "50%",
          }}
          aria-label={`Verification summary with ${total} total professionals`}
        >
          {/* White center */}
          <div
            style={{
              position: "absolute",
              inset: "20%",
              background: "#ffffff",
              borderRadius: "50%",
            }}
          />

          {/* Center text */}
          <div className="admin-verification-center">
            <span className="admin-verification-total">
              {total.toLocaleString()}
            </span>

            <span className="admin-verification-label">Total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="admin-verification-legend">
          {verificationData.map((item) => (
            <div className="admin-verification-legend-item" key={item.label}>
              <span
                className={`admin-verification-dot ${item.className}`}
                style={{
                  background:
                    item.className === "approved"
                      ? "#22c55e"
                      : item.className === "pending"
                        ? "#f59e0b"
                        : "#ef4444",
                }}
              />

              <span className="admin-verification-name">{item.label}</span>

              <span className="admin-verification-count">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

export default VerificationSummary;
