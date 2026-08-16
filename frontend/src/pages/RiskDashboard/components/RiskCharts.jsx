// Small dependency-free SVG charts for the Risk Dashboard.
// Kept intentionally simple (no Recharts/Chart.js) per project scope.

const LEVEL_COLORS = {
  low: "#16A34A",
  medium: "#D97706",
  high: "#DC2626",
  critical: "#DC2626",
};

export function RiskGauge({ score = 0, level = "medium", size = 160 }) {
  const clamped = Math.max(0, Math.min(100, score ?? 0));
  const radius = size / 2 - 12;
  const circumference = Math.PI * radius; // half circle
  const offset = circumference * (1 - clamped / 100);
  const color = LEVEL_COLORS[level] || LEVEL_COLORS.medium;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
      <path
        d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
        fill="none"
        stroke="#E5E7EB"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path
        d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset .6s ease" }}
      />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="28" fontWeight="700" fill="#111827">
        {Math.round(clamped)}
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" fontSize="12" fill="#6B7280">
        Risk Score
      </text>
    </svg>
  );
}

export function ValuationTrendChart({ points = [], width = 480, height = 180 }) {
  if (!points.length) return null;

  const padding = { top: 16, right: 16, bottom: 28, left: 16 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const coords = points.map((val, i) => {
    const x = points.length > 1
      ? padding.left + (i / (points.length - 1)) * chartWidth
      : padding.left + chartWidth / 2;
    const y = padding.top + chartHeight - ((val - min) / range) * chartHeight;
    return [x, y];
  });

  const linePath = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  const areaPath = `${linePath} L ${coords[coords.length - 1][0]} ${padding.top + chartHeight} L ${coords[0][0]} ${padding.top + chartHeight} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="valuationFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E2B4D" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#1E2B4D" stopOpacity="0" />
        </linearGradient>
      </defs>

      <path d={areaPath} fill="url(#valuationFill)" />
      <path d={linePath} fill="none" stroke="#1E2B4D" strokeWidth="2.5" />

      {coords.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i === coords.length - 1 ? 5 : 3.5}
          fill={i === coords.length - 1 ? "#1E2B4D" : "#fff"}
          stroke="#1E2B4D"
          strokeWidth="2"
        />
      ))}

      {coords.map(([x], i) => (
        <text key={i} x={x} y={height - 6} textAnchor="middle" fontSize="10" fill="#9CA3AF">
          Comp {i + 1}
        </text>
      ))}
    </svg>
  );
}

export function ComparablePriceBars({ items = [], width = 480, height = 200 }) {
  if (!items.length) return null;

  const padding = { top: 28, right: 10, bottom: 36, left: 10 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const barGap = 20;
  const barWidth = (chartWidth - barGap * (items.length - 1)) / items.length;
  const maxPrice = Math.max(...items.map((i) => Number(i.estimatedPrice) || 0));

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
      {items.map((item, i) => {
        const price = Number(item.estimatedPrice) || 0;
        const barHeight = maxPrice ? (price / maxPrice) * chartHeight : 0;
        const x = padding.left + i * (barWidth + barGap);
        const y = padding.top + chartHeight - barHeight;
        const label = item.propertyCode || `#${item.propertyId}`;

        return (
          <g key={item.propertyId}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx="6"
              fill={i === 0 ? "#1E2B4D" : "#93A5C9"}
            />
            <text
              x={x + barWidth / 2}
              y={y - 8}
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              fill="#374151"
            >
              ₹{(price / 100000).toFixed(1)}L
            </text>
            <text
              x={x + barWidth / 2}
              y={height - 12}
              textAnchor="middle"
              fontSize="10"
              fill="#6B7280"
            >
              {label.length > 14 ? label.slice(0, 13) + "…" : label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}