import { useEffect, useState } from "react";
import { api } from "../../../services/api";

import RiskHeader from "./risk/RiskHeader";
import RiskScoreCard from "./risk/RiskScoreCard";
import RiskFactorGrid from "./risk/RiskFactorGrid";
import ComplianceCard from "./risk/ComplianceCard";
import CriticalIssues from "./risk/CriticalIssues";
import RecommendationCard from "./risk/RecommendationCard";

export default function RiskSummary({ propertyId }) {
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getRiskSummary(propertyId)
      .then((data) => {
        setRisk(data);
      })
      .catch((err) => {
        setError(err.message || "Failed to load risk");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [propertyId]);

  if (loading)
    return (
      <div className="details-card">
        <h3>Risk Assessment</h3>
        <p>Loading assessment...</p>
      </div>
    );

  if (error)
    return (
      <div className="details-card">
        <h3>Risk Assessment</h3>
        <p>{error}</p>
      </div>
    );

  if (!risk)
    return (
      <div className="details-card">
        <h3>Risk Assessment</h3>
        <p>No risk data available</p>
      </div>
    );

  return (
    <div className="risk-container">
      <RiskHeader risk={risk} />

      <RiskScoreCard risk={risk} />

      <RiskFactorGrid risk={risk} />

      <ComplianceCard risk={risk} />

      <CriticalIssues risk={risk} />

      <RecommendationCard risk={risk} />
    </div>
  );
}
