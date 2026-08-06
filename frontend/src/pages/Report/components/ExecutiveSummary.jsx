import {
  LuFileText,
  LuMapPin,
  LuCalendarDays,
  LuShieldAlert,
} from "react-icons/lu";

const riskClass = (value) => (value || "unknown").toLowerCase();

function Badge({ children }) {
  return (
    <span className={`report-badge ${riskClass(children)}`}>
      {children || "—"}
    </span>
  );
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Executive Summary — displays key report metadata returned by the backend.
 * All values are derived dynamically from the API response (no hardcoding).
 */
export default function ExecutiveSummary({ report, property, risk }) {
  const propertyName = property?.propertyCode || "Property Report";
  const propertyId = report?.propertyId ?? property?.propertyId ?? "—";
  const generatedDate =
    report?.createdAt || risk?.reviewedAt || risk?.createdAt || null;
  const overallRisk = risk?.overallRisk || "Not Assessed";
  const overallRecommendation =
    risk?.recommendation ||
    report?.executiveSummary ||
    "No recommendation available.";

  return (
    <section className="report-card executive-summary">
      <div className="executive-summary-head">
        <div className="executive-title">
          <LuFileText className="executive-icon" />
          <div>
            <p className="report-eyebrow">Executive Summary</p>
            <h2>{propertyName}</h2>
          </div>
        </div>
        <Badge>{overallRisk}</Badge>
      </div>

      <div className="executive-meta">
        <div className="executive-meta-item">
          <LuMapPin />
          <span>Property ID</span>
          <strong>{propertyId}</strong>
        </div>
        <div className="executive-meta-item">
          <LuCalendarDays />
          <span>Report Generation Date</span>
          <strong>{formatDate(generatedDate)}</strong>
        </div>
        <div className="executive-meta-item">
          <LuShieldAlert />
          <span>Overall Risk Level</span>
          <strong>{overallRisk}</strong>
        </div>
      </div>

      <div className="executive-recommendation">
        <span>Overall Recommendation</span>
        <p>{overallRecommendation}</p>
      </div>
    </section>
  );
}
