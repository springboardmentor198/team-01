function AdminStatCard({
  title,
  value,
  trend,
  trendType = "positive",
  subtitle,
  icon: Icon,
  iconClass = "blue",
}) {
  return (
    <article className="admin-stat-card">
      <div className={`admin-stat-icon ${iconClass}`}>
        {Icon && <Icon size={22} strokeWidth={2} />}
      </div>

      <div className="admin-stat-content">
        <p className="admin-stat-label">{title}</p>

        <h2 className="admin-stat-value">{value}</h2>

        <div className="admin-stat-footer">
          {trend && (
            <span className={`admin-stat-trend ${trendType}`}>
              {trendType === "positive" && "↑ "}
              {trendType === "negative" && "↓ "}
              {trend}
            </span>
          )}

          {subtitle && <span className="admin-stat-subtitle">{subtitle}</span>}
        </div>
      </div>
    </article>
  );
}

export default AdminStatCard;
