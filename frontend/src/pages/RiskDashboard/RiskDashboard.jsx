import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuShieldAlert } from "react-icons/lu";
import Layout from "../../components/Layout/Layout";
import { api } from "../../services/api";
import RiskOverview from "./components/RiskOverview";
import ComparableProperties from "./components/ComparableProperties";
import PropertyValuation from "./components/PropertyValuation";
import { getComparableProperties, getPropertyValuation } from "./riskDashboardService";
import "./RiskDashboard.css";

// ---- TEMPORARY MOCK DATA ----
// Backend risk-summary endpoint/DB setup is not yet stable in all environments.
// Using mock properties + mock risk data here so this page is demoable and
// doesn't break for anyone testing before the backend is fully wired up.
// TODO: once api.getProperties() / api.getRiskSummary() are confirmed working,
// delete this block and restore the real fetch logic (see git history /
// ask Member 1 for the original version).

const MOCK_PROPERTIES = [
  { id: 1, address: "12 Palm Residency", city: "Bangalore", area: 1450 },
  { id: 2, address: "45 Riverside Apartments", city: "Mumbai", area: 1800 },
  { id: 3, address: "Green Valley Farmhouse", city: "Jaipur", area: 3200 },
];

const MOCK_RISK = {
  1: {
    overallRisk: "Medium",
    riskScore: 58,
    remarks: "Moderate risk due to pending tax verification and nearby flood zone history.",
    floodRisk: "Medium",
    legalRisk: "Low",
    environmentalRisk: "Medium",
    financialRisk: "Low",
    marketRisk: "Medium",
    ownershipRisk: "Low",
    reviewedBy: "Agent Priya Sharma",
    reviewedAt: "2026-07-28T10:00:00",
    complianceStatus: "Under Review",
    criticalIssues: "Property tax records for 2025 not yet verified.",
    recommendation: "Proceed with caution; request updated tax clearance certificate before closing.",
    riskTrend: "Stable",
  },
  2: {
    overallRisk: "Low",
    riskScore: 22,
    remarks: "Clean legal history, low flood exposure, verified ownership chain.",
    floodRisk: "Low",
    legalRisk: "Low",
    environmentalRisk: "Low",
    financialRisk: "Low",
    marketRisk: "Low",
    ownershipRisk: "Low",
    reviewedBy: "Agent Rohan Mehta",
    reviewedAt: "2026-07-30T14:00:00",
    complianceStatus: "Approved",
    criticalIssues: "",
    recommendation: "No blockers identified; safe to proceed.",
    riskTrend: "Improving",
  },
  3: {
    overallRisk: "High",
    riskScore: 81,
    remarks: "Disputed boundary lines and unresolved zoning classification.",
    floodRisk: "High",
    legalRisk: "High",
    environmentalRisk: "Medium",
    financialRisk: "Medium",
    marketRisk: "High",
    ownershipRisk: "High",
    reviewedBy: "Legal Reviewer Anita Rao",
    reviewedAt: "2026-08-01T09:30:00",
    complianceStatus: "Rejected",
    criticalIssues: "Boundary dispute with adjacent landowner is unresolved. Zoning reclassification pending.",
    recommendation: "Do not proceed until legal dispute is resolved and zoning is confirmed.",
    riskTrend: "Worsening",
  },
};
// ---- END TEMPORARY MOCK DATA ----

export default function RiskDashboard() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(String(MOCK_PROPERTIES[0].id));

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  const selectedProperty = useMemo(
    () => MOCK_PROPERTIES.find((p) => String(p.id) === String(selectedId)),
    [selectedId],
  );

  const risk = MOCK_RISK[selectedId];

  const comparables = useMemo(
    () => getComparableProperties(selectedProperty),
    [selectedProperty],
  );

  const valuation = useMemo(
    () => getPropertyValuation(selectedProperty, risk?.riskScore),
    [selectedProperty, risk],
  );

  if (!api.isAuthenticated()) return null;

  return (
    <Layout title="Risk Dashboard">
      <div className="rd-page">
        <div className="rd-header rd-card">
          <h2>
            <LuShieldAlert />
            Risk Dashboard
          </h2>
          <p>Review risk score, comparable properties, and estimated valuation for any property.</p>
        </div>

        <div className="rd-card rd-selector">
          <label htmlFor="rd-property-select">Property</label>
          <select
            id="rd-property-select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {MOCK_PROPERTIES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.address}, {p.city}
              </option>
            ))}
          </select>
        </div>

        <RiskOverview risk={risk} loading={false} error="" />

        <div className="rd-grid">
          <ComparableProperties items={comparables} />
          <PropertyValuation valuation={valuation} />
        </div>
      </div>
    </Layout>
  );
}