import { useMemo, useState } from "react";
import { LuChevronDown } from "react-icons/lu";

const activityData = {
  "Last 7 Days": [
    { day: "Mon", users: 420, properties: 180 },
    { day: "Tue", users: 520, properties: 230 },
    { day: "Wed", users: 470, properties: 210 },
    { day: "Thu", users: 680, properties: 290 },
    { day: "Fri", users: 620, properties: 340 },
    { day: "Sat", users: 760, properties: 390 },
    { day: "Sun", users: 710, properties: 360 },
  ],

  "Last 30 Days": [
    { day: "Week 1", users: 2400, properties: 950 },
    { day: "Week 2", users: 3100, properties: 1200 },
    { day: "Week 3", users: 3600, properties: 1450 },
    { day: "Week 4", users: 4200, properties: 1700 },
  ],

  "Last 90 Days": [
    { day: "Month 1", users: 9800, properties: 4100 },
    { day: "Month 2", users: 12400, properties: 5300 },
    { day: "Month 3", users: 15100, properties: 6800 },
  ],
};

function PlatformActivityChart() {
  const [period, setPeriod] = useState("Last 7 Days");

  const data = activityData[period];

  const chart = useMemo(() => {
    const width = 700;
    const height = 245;

    const paddingLeft = 42;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 35;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const maxValue =
      Math.ceil(
        Math.max(...data.map((item) => Math.max(item.users, item.properties))) /
          100,
      ) * 100;

    const getX = (index) => {
      if (data.length === 1) {
        return paddingLeft + chartWidth / 2;
      }

      return paddingLeft + (index / (data.length - 1)) * chartWidth;
    };

    const getY = (value) => {
      return paddingTop + chartHeight - (value / maxValue) * chartHeight;
    };

    const usersPoints = data
      .map((item, index) => `${getX(index)},${getY(item.users)}`)
      .join(" ");

    const propertyPoints = data
      .map((item, index) => `${getX(index)},${getY(item.properties)}`)
      .join(" ");

    return {
      width,
      height,
      paddingLeft,
      paddingRight,
      paddingTop,
      paddingBottom,
      chartHeight,
      maxValue,
      getX,
      getY,
      usersPoints,
      propertyPoints,
    };
  }, [data]);

  const yAxisValues = [
    chart.maxValue,
    Math.round(chart.maxValue * 0.75),
    Math.round(chart.maxValue * 0.5),
    Math.round(chart.maxValue * 0.25),
    0,
  ];

  return (
    <article className="admin-dashboard-card">
      {/* Card header */}
      <div className="admin-dashboard-card-header">
        <div>
          <h2 className="admin-dashboard-card-title">
            Platform Activity Overview
          </h2>

          <p className="admin-dashboard-card-subtitle">
            User and property activity across the platform
          </p>
        </div>

        <div className="admin-chart-period">
          <select
            className="admin-dashboard-select"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
          >
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
          </select>

          <LuChevronDown className="admin-chart-select-icon" size={14} />
        </div>
      </div>

      {/* Legend */}
      <div className="admin-chart-legend">
        <div className="admin-chart-legend-item">
          <span
            className="admin-chart-legend-dot"
            style={{ background: "#4F46E5" }}
          />

          <span>Users</span>
        </div>

        <div className="admin-chart-legend-item">
          <span
            className="admin-chart-legend-dot"
            style={{ background: "#22C55E" }}
          />

          <span>Properties</span>
        </div>
      </div>

      {/* Chart */}
      <div className="admin-activity-chart">
        <svg
          viewBox={`0 0 ${chart.width} ${chart.height}`}
          width="100%"
          height="300"
          preserveAspectRatio="none"
          role="img"
          aria-label="Platform activity chart"
        >
          {/* Horizontal grid lines */}
          {yAxisValues.map((value, index) => {
            const y = chart.getY(value);

            return (
              <g key={value}>
                <line
                  x1={chart.paddingLeft}
                  x2={chart.width - chart.paddingRight}
                  y1={y}
                  y2={y}
                  stroke="#EEF2F7"
                  strokeWidth="1"
                />

                <text
                  x={chart.paddingLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="#94A3B8"
                  fontSize="10"
                >
                  {value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                </text>
              </g>
            );
          })}

          {/* Users line */}
          <polyline
            points={chart.usersPoints}
            fill="none"
            stroke="#4F46E5"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Properties line */}
          <polyline
            points={chart.propertyPoints}
            fill="none"
            stroke="#22C55E"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* User points */}
          {data.map((item, index) => (
            <circle
              key={`user-${item.day}`}
              cx={chart.getX(index)}
              cy={chart.getY(item.users)}
              r="4"
              fill="#FFFFFF"
              stroke="#4F46E5"
              strokeWidth="2"
            />
          ))}

          {/* Property points */}
          {data.map((item, index) => (
            <circle
              key={`property-${item.day}`}
              cx={chart.getX(index)}
              cy={chart.getY(item.properties)}
              r="4"
              fill="#FFFFFF"
              stroke="#22C55E"
              strokeWidth="2"
            />
          ))}

          {/* X-axis labels */}
          {data.map((item, index) => (
            <text
              key={`label-${item.day}`}
              x={chart.getX(index)}
              y={chart.height - 10}
              textAnchor="middle"
              fill="#94A3B8"
              fontSize="10"
            >
              {item.day}
            </text>
          ))}
        </svg>
      </div>
    </article>
  );
}

export default PlatformActivityChart;
