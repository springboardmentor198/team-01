import { LuTrendingUp, LuGauge } from "react-icons/lu";
import { ValuationTrendChart } from "./RiskCharts";
import { formatCurrency } from "../riskDashboardService";

export default function PropertyValuation({ valuation }) {
  if (!valuation) return null;

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
          <LuGauge className="rd-confidence-icon" />
          <div>
            <strong>{valuation.comparableCount}</strong>
            <span className="rd-muted">Comparables</span>
          </div>
        </div>
      </div>

      <div className="rd-chart-box">
        <ValuationTrendChart points={valuation.comparableValues || []} />
      </div>

      {valuation.pricePerSqft && (
        <div className="rd-valuation-footnote rd-muted">
          ≈ ₹{valuation.pricePerSqft.toLocaleString("en-IN")} per sq.ft
        </div>
      )}
    </div>
  );
}
