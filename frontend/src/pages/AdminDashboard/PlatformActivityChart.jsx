import { useMemo, useState } from "react";

const keys = {
  "Last 7 Days": "last7Days",
  "Last 30 Days": "last30Days",
  "Last 90 Days": "last90Days",
};

function PlatformActivityChart({ activity = {} }) {
  const [period, setPeriod] = useState("Last 7 Days");

  const data = activity[keys[period]] || [];

  const chart = useMemo(() => {
    const width = 700;
    const height = 245;
    const left = 42;
    const right = 20;
    const top = 20;
    const bottom = 35;

    const chartWidth = width - left - right;
    const chartHeight = height - top - bottom;

    const max = Math.max(
      1,
      ...data.flatMap((item) => [item.users, item.properties]),
    );

    const getX = (index) =>
      data.length < 2
        ? left + chartWidth / 2
        : left + (index / (data.length - 1)) * chartWidth;

    const getY = (value) => top + chartHeight - (value / max) * chartHeight;

    return {
      width,
      height,
      left,
      right,
      top,
      chartHeight,
      max,
      getX,
      getY,
    };
  }, [data]);

  const points = (field) =>
    data
      .map((item, index) => `${chart.getX(index)},${chart.getY(item[field])}`)
      .join(" ");

  return (
    <article className="admin-dashboard-card">
      <div className="admin-dashboard-card-header">
        <div>
          <h2 className="admin-dashboard-card-title">
            Platform Activity Overview
          </h2>

          <p className="admin-dashboard-card-subtitle">
            New users and properties created on the platform
          </p>
        </div>

        <select
          className="admin-dashboard-select"
          value={period}
          onChange={(event) => setPeriod(event.target.value)}
        >
          {Object.keys(keys).map((label) => (
            <option key={label} value={label}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {data.length === 0 ? (
        <div className="admin-dashboard-empty">
          No activity data is available for this period.
        </div>
      ) : (
        <>
          <div className="admin-chart-legend">
            <div className="admin-chart-legend-item">
              <span
                className="admin-chart-legend-dot"
                style={{ background: "#4F46E5" }}
              />
              Users
            </div>

            <div className="admin-chart-legend-item">
              <span
                className="admin-chart-legend-dot"
                style={{ background: "#22C55E" }}
              />
              Properties
            </div>
          </div>

          <div className="admin-activity-chart">
            <svg
              viewBox={`0 0 ${chart.width} ${chart.height}`}
              width="100%"
              height="230"
              preserveAspectRatio="none"
              role="img"
              aria-label="Platform activity chart"
            >
              {[0, 0.25, 0.5, 0.75, 1].map((part) => {
                const value = Math.round(chart.max * part);
                const y = chart.getY(value);

                return (
                  <g key={part}>
                    <line
                      x1={chart.left}
                      x2={chart.width - chart.right}
                      y1={y}
                      y2={y}
                      stroke="#EEF2F7"
                    />

                    <text
                      x={chart.left - 10}
                      y={y + 4}
                      textAnchor="end"
                      fill="#94A3B8"
                      fontSize="10"
                    >
                      {value}
                    </text>
                  </g>
                );
              })}

              <polyline
                points={points("users")}
                fill="none"
                stroke="#4F46E5"
                strokeWidth="3"
              />

              <polyline
                points={points("properties")}
                fill="none"
                stroke="#22C55E"
                strokeWidth="3"
              />

              {data.map((item, index) => (
                <text
                  key={`${item.label}-${index}`}
                  x={chart.getX(index)}
                  y={chart.height - 10}
                  textAnchor="middle"
                  fill="#94A3B8"
                  fontSize="10"
                >
                  {item.label}
                </text>
              ))}
            </svg>
          </div>
        </>
      )}
    </article>
  );
}

export default PlatformActivityChart;
