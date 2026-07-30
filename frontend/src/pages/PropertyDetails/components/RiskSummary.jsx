import { useEffect, useState } from "react";
import { LuShieldCheck } from "react-icons/lu";
import { api } from "../../../services/api";

export default function RiskSummary({ propertyId }) {
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    api
      .getRiskSummary(propertyId)
      .then((data) => {
        setRisk(data);
      })
      .catch((e) => {
        console.error(e);
        setError(e.message || "Failed to load risk summary");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [propertyId]);

  if (loading) {
    return (
      <div className="details-card">
        <h3>Risk Summary</h3>
        <p className="no-data">Loading risk assessment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="details-card">
        <h3>Risk Summary</h3>
        <p className="no-data">{error}</p>
      </div>
    );
  }

  if (!risk) {
    return (
      <div className="details-card">
        <h3>Risk Summary</h3>
        <p className="no-data">No risk summary available for this property.</p>
      </div>
    );
  }

  const level = (risk.overallRisk || "medium").toLowerCase();

  return (
    <>
      <div className={`risk-card border-${level}`}>
        <div className="risk-left">
          <LuShieldCheck className={`risk-icon text-${level}`} />

          <div>
            <h3>Risk Summary</h3>
            <p>{risk.remarks || "No assessment remarks have been recorded."}</p>
          </div>
        </div>

        <span className={`risk-level ${level}`}>
          {risk.overallRisk || "Unrated"} · Score {risk.riskScore ?? "—"}
        </span>
      </div>

      <div className="risk-factors">
        <div>
          <span>Flood Risk</span>
          <strong>{risk.floodRisk || "—"}</strong>
        </div>

        <div>
          <span>Legal Risk</span>
          <strong>{risk.legalRisk || "—"}</strong>
        </div>

        <div>
          <span>Environmental Risk</span>
          <strong>{risk.environmentalRisk || "—"}</strong>
        </div>
      </div>
    </>
  );
}
