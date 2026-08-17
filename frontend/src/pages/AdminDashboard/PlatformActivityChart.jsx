import { useMemo, useState } from "react";

const keys = {
  "Last 7 Days": "last7Days",
  "Last 30 Days": "last30Days",
  "Last 90 Days": "last90Days",
};

function PlatformActivityChart({ activity = {} }) {
  const [period, setPeriod] = useState("Last 7 Days");

  /*
   * Normalize API data so the chart always gets:
   * {
   *   label: "...",
   *   users: number,
   *   properties: number
   * }
   */
  const data = useMemo(() => {
    const rawData = activity?.[keys[period]];

    if (!Array.isArray(rawData)) {
      return [];
    }

    return rawData.map((item, index) => ({
      label: item?.label ?? item?.date ?? item?.day ?? `Day ${index + 1}`,

      users: Number(
        item?.users ??
          item?.user_count ??
          item?.userCount ??
          item?.users_count ??
          0,
      ),

      properties: Number(
        item?.properties ??
          item?.property_count ??
          item?.propertyCount ??
          item?.properties_count ??
          0,
      ),
    }));
  }, [activity, period]);

  const chart = useMemo(() => {
    const width = 700;
    const height = 245;

    const left = 42;
    const right = 20;
    const top = 20;
    const bottom = 35;

    const chartWidth = width - left - right;
    const chartHeight = height - top - bottom;

    const values = data.flatMap((item) => [
      Number.isFinite(item.users) ? item.users : 0,
      Number.isFinite(item.properties) ? item.properties : 0,
    ]);

    const maxValue = Math.max(0, ...values);

    // Keep at least 1 so the graph doesn't divide by zero.
    const max = Math.max(1, maxValue);

    const getX = (index) => {
      if (data.length < 2) {
        return left + chartWidth / 2;
      }

      return left + (index / (data.length - 1)) * chartWidth;
    };

    const getY = (value) => {
      const safeValue = Number.isFinite(value) ? value : 0;

      return top + chartHeight - (safeValue / max) * chartHeight;
    };

    return {
      width,
      height,
      left,
      right,
      top,
      chartHeight,
      chartWidth,
      max,
      getX,
      getY,
    };
  }, [data]);

  const points = (field) => {
    return data
      .map((item, index) => {
        const value = Number.isFinite(item[field]) ? item[field] : 0;

        return `${chart.getX(index)},${chart.getY(value)}`;
      })
      .join(" ");
  };

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
              {/* Grid + Y axis labels */}
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

              {/* Users line */}
              <polyline
                points={points("users")}
                fill="none"
                stroke="#4F46E5"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Properties line */}
              <polyline
                points={points("properties")}
                fill="none"
                stroke="#22C55E"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Users points */}
              {data.map((item, index) => (
                <circle
                  key={`user-${index}`}
                  cx={chart.getX(index)}
                  cy={chart.getY(item.users)}
                  r="4"
                  fill="#4F46E5"
                />
              ))}

              {/* Property points */}
              {data.map((item, index) => (
                <circle
                  key={`property-${index}`}
                  cx={chart.getX(index)}
                  cy={chart.getY(item.properties)}
                  r="4"
                  fill="#22C55E"
                />
              ))}

              {/* X axis labels */}
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
