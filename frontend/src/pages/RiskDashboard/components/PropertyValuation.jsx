import { LuTrendingUp, LuLayers } from "react-icons/lu";
import { ValuationTrendChart } from "./RiskCharts";
import { formatCurrency } from "../riskDashboardService";

export default function PropertyValuation({ valuation, loading, error }) {
  if (loading) {
    return (
      <div className="rd-card">
        <h3>
          <LuTrendingUp style={{ marginRight: 8, verticalAlign: "middle" }} />
          Property Valuation
        </h3>
        <p className="rd-muted">Loading valuation…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rd-card">
        <h3>
          <LuTrendingUp style={{ marginRight: 8, verticalAlign: "middle" }} />
          Property Valuation
        </h3>
        <p className="rd-error">{error}</p>
      </div>
    );
  }

  if (!valuation) {
    return (
      <div className="rd-card">
        <h3>
          <LuTrendingUp style={{ marginRight: 8, verticalAlign: "middle" }} />
          Property Valuation
        </h3>
        <p className="rd-muted">No valuation data available for this property yet.</p>
      </div>
    );
  }

  const trendPoints = (valuation.comparableValues || []).map((v) => Number(v));

  return (
    <div className="rd-card">
      <h3>
        <LuTrendingUp style={{ marginRight: 8, verticalAlign: "middle" }} />
        Property Valuation
      </h3>
      <p className="rd-muted rd-subtitle">
        Estimated market value based on comparable sales and risk-adjusted pricing.
      </p>

      <div className="rd-valuation-summary">
        <div className="rd-valuation-main">
          <span className="rd-muted">Estimated Value</span>
          <h2>{formatCurrency(valuation.estimatedValue)}</h2>
          <span className="rd-muted">
            Range: {formatCurrency(valuation.lowEstimate)} – {formatCurrency(valuation.highEstimate)}
          </span>
        </div>

        <div className="rd-confidence">
          <LuLayers className="rd-confidence-icon" />
          <div>
            <strong>{valuation.comparableCount ?? 0}</strong>
            <span className="rd-muted">Comparables Used</span>
          </div>
        </div>
      </div>

      {trendPoints.length > 1 && (
        <div className="rd-chart-box">
          <ValuationTrendChart points={trendPoints} />
        </div>
      )}

      {valuation.pricePerSqft && (
        <div className="rd-valuation-footnote rd-muted">
          ≈ ₹{Number(valuation.pricePerSqft).toLocaleString("en-IN")} per sq.ft
        </div>
      )}
    </div>
  );
}