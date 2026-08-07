import RiskHeader from "../../PropertyDetails/components/risk/RiskHeader";
import RiskScoreCard from "../../PropertyDetails/components/risk/RiskScoreCard";
import RiskFactorGrid from "../../PropertyDetails/components/risk/RiskFactorGrid";
import ComplianceCard from "../../PropertyDetails/components/risk/ComplianceCard";
import CriticalIssues from "../../PropertyDetails/components/risk/CriticalIssues";
import RecommendationCard from "../../PropertyDetails/components/risk/RecommendationCard";
import { RiskGauge } from "./RiskCharts";
import "../../PropertyDetails/PropertyDetails.css";

export default function RiskOverview({ risk, loading, error }) {
  if (loading) {
    return (
      <div className="details-card">
        <h3>Risk Assessment</h3>
        <p>Loading assessment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="details-card">
        <h3>Risk Assessment</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!risk) return null;

  const level = (risk.overallRisk || "medium").toLowerCase();

  return (
    <div className="risk-container">
      <RiskHeader risk={risk} />

      <div className="rd-gauge-row">
        <div className="rd-gauge-card">
          <RiskGauge score={risk.riskScore ?? 0} level={level} />
        </div>
        <RiskScoreCard risk={risk} />
      </div>

      <RiskFactorGrid risk={risk} />
      <ComplianceCard risk={risk} />
      <CriticalIssues risk={risk} />
      <RecommendationCard risk={risk} />
    </div>
  );
}