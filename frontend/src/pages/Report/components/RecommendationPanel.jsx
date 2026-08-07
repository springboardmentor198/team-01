import {
  LuShieldAlert,
  LuTriangleAlert,
  LuCircleCheck,
  LuInfo,
} from "react-icons/lu";

function RecommendationBadge({ level, children }) {
  return (
    <span className={`report-badge recommendation-badge ${level}`}>
      {children}
    </span>
  );
}

/**
 * RecommendationPanel — displays all recommendations received from the
 * backend using Critical / Warning / Success badges matching the theme.
 */
export default function RecommendationPanel({ risk, report }) {
  const overallRisk = (risk?.overallRisk || "").toLowerCase();

  const riskLevel =
    overallRisk.includes("high") ||
    overallRisk.includes("critical") ||
    overallRisk.includes("severe")
      ? "critical"
      : overallRisk.includes("medium") ||
          overallRisk.includes("moderate") ||
          overallRisk.includes("warning")
        ? "warning"
        : overallRisk.includes("low") ||
            overallRisk.includes("safe") ||
            overallRisk.includes("good")
          ? "success"
          : "info";

  const recommendations = [];

  if (risk?.complienceStatus || risk?.complianceStatus) {
    const compliance = risk?.complianceStatus || risk?.complienceStatus;
    const level = String(compliance).toLowerCase().includes("non")
      ? "critical"
      : "success";
    recommendations.push({
      level,
      icon: level === "critical" ? LuTriangleAlert : LuCircleCheck,
      title: "Compliance Status",
      text: compliance,
    });
  }

  if (risk?.recommendation) {
    const text = String(risk.recommendation).toLowerCase();
    const level =
      text.includes("high") || text.includes("critical")
        ? "critical"
        : text.includes("review") ||
            text.includes("caution") ||
            text.includes("warning")
          ? "warning"
          : riskLevel === "success"
            ? "success"
            : "info";
    recommendations.push({
      level,
      icon:
        level === "critical"
          ? LuTriangleAlert
          : level === "success"
            ? LuCircleCheck
            : LuInfo,
      title: "Recommendation",
      text: risk.recommendation,
    });
  }

  if (risk?.criticalIssues) {
    recommendations.push({
      level: "critical",
      icon: LuTriangleAlert,
      title: "Critical Issues",
      text: risk.criticalIssues,
    });
  }

  if (risk?.missingDocuments) {
    recommendations.push({
      level: "warning",
      icon: LuInfo,
      title: "Missing Documents",
      text: risk.missingDocuments,
    });
  }

  if (report?.executiveSummary && !risk?.recommendation) {
    recommendations.push({
      level: riskLevel,
      icon: LuShieldAlert,
      title: "Executive Recommendation",
      text: report.executiveSummary,
    });
  }

  if (!recommendations.length) {
    recommendations.push({
      level: "info",
      icon: LuShieldAlert,
      title: "Overall Recommendation",
      text: "No explicit recommendation was returned by the backend for this property.",
    });
  }

  return (
    <section className="report-card recommendation-panel">
      <h2>Recommendations</h2>
      <div className="recommendation-list">
        {recommendations.map((rec, index) => {
          const Icon = rec.icon;
          return (
            <div
              key={`${rec.title}-${index}`}
              className={`recommendation-item ${rec.level}`}
            >
              <div className="recommendation-item-icon">
                <Icon />
              </div>
              <div className="recommendation-item-body">
                <div className="recommendation-item-head">
                  <strong>{rec.title}</strong>
                  <RecommendationBadge level={rec.level}>
                    {rec.level === "critical"
                      ? "Critical"
                      : rec.level === "warning"
                        ? "Warning"
                        : rec.level === "success"
                          ? "Success"
                          : "Info"}
                  </RecommendationBadge>
                </div>
                <p>{rec.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
