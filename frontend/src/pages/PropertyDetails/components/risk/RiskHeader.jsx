import { LuShieldCheck } from "react-icons/lu";

export default function RiskHeader({ risk }) {
  const level = (risk.overallRisk || "medium").toLowerCase();

  return (
    <div className={`risk-header ${level}`}>
      <div className="risk-title">
        <LuShieldCheck className="risk-icon" />

        <div>
          <h2>Risk Assessment</h2>

          <p>{risk.remarks || "No assessment remarks available"}</p>
        </div>
      </div>

      <span className="risk-badge">{risk.overallRisk || "Unknown"}</span>
    </div>
  );
}
