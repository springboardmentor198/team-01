import {
  LuServer,
  LuDatabase,
  LuActivity,
  LuShieldCheck,
  LuCloud,
} from "react-icons/lu";

const metrics = [
  {
    id: "api",
    label: "API Response",
    value: "128 ms",
    trend: "Healthy",
    trendType: "up",
    icon: LuActivity,
  },
  {
    id: "database",
    label: "Database",
    value: "99.98%",
    trend: "Uptime",
    trendType: "up",
    icon: LuDatabase,
  },
  {
    id: "server",
    label: "Server Health",
    value: "98.6%",
    trend: "Healthy",
    trendType: "up",
    icon: LuServer,
  },
  {
    id: "security",
    label: "Security",
    value: "Protected",
    trend: "Secure",
    trendType: "up",
    icon: LuShieldCheck,
  },
  {
    id: "storage",
    label: "Storage Used",
    value: "64%",
    trend: "36% Free",
    trendType: "warning",
    icon: LuCloud,
  },
];

function SystemMetrics() {
  return (
    <section className="admin-system-metrics-section">
      <div className="admin-system-metrics">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div className="admin-system-metric" key={metric.id}>
              {/* Icon */}
              <div className="admin-system-metric-icon">
                <Icon size={17} />
              </div>

              {/* Information */}
              <div>
                <p className="admin-system-metric-label">{metric.label}</p>

                <p className="admin-system-metric-value">{metric.value}</p>
              </div>

              {/* Status */}
              <span className={`admin-system-metric-trend ${metric.trendType}`}>
                {metric.trend}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default SystemMetrics;
