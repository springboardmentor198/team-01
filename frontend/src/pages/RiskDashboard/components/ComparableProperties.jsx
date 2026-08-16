import { LuBuilding2 } from "react-icons/lu";
import { ComparablePriceBars } from "./RiskCharts";
import { formatCurrency } from "../riskDashboardService";

const RISK_BADGE_CLASS = {
  low: "low",
  medium: "medium",
  high: "high",
  critical: "high",
};

export default function ComparableProperties({ items, loading, error }) {
  if (loading) {
    return (
      <div className="rd-card">
        <h3>
          <LuBuilding2 style={{ marginRight: 8, verticalAlign: "middle" }} />
          Comparable Properties
        </h3>
        <p className="rd-muted">Loading comparable properties…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rd-card">
        <h3>
          <LuBuilding2 style={{ marginRight: 8, verticalAlign: "middle" }} />
          Comparable Properties
        </h3>
        <p className="rd-error">{error}</p>
      </div>
    );
  }

  if (!items || !items.length) {
    return (
      <div className="rd-card">
        <h3>
          <LuBuilding2 style={{ marginRight: 8, verticalAlign: "middle" }} />
          Comparable Properties
        </h3>
        <p className="rd-muted">No comparable properties found for this property yet.</p>
      </div>
    );
  }

  return (
    <div className="rd-card">
      <h3>
        <LuBuilding2 style={{ marginRight: 8, verticalAlign: "middle" }} />
        Comparable Properties
      </h3>
      <p className="rd-muted rd-subtitle">
        Similar properties nearby, based on location, size, and type.
      </p>

      <div className="rd-chart-box">
        <ComparablePriceBars items={items} />
      </div>

      <div className="rd-comp-list">
        {items.map((item) => {
          const riskKey = (item.overallRisk || "medium").toLowerCase();
          return (
            <div key={item.propertyId} className="rd-comp-item">
              <div className="rd-comp-item-header">
                <strong>{item.propertyCode || `Property #${item.propertyId}`}</strong>
                <span className={`risk-badge ${RISK_BADGE_CLASS[riskKey] || "medium"}`}>
                  {item.overallRisk || "—"}
                </span>
              </div>

              <div className="rd-comp-item-meta">
                <span>{item.city || "—"}</span>
                <span>
                  {item.areaSqft ? `${Number(item.areaSqft).toLocaleString("en-IN")} sq.ft` : "—"}
                </span>
              </div>

              <div className="rd-comp-item-price">
                <strong>{formatCurrency(item.estimatedPrice)}</strong>
                {item.pricePerSqft && (
                  <span className="rd-muted"> · ₹{Number(item.pricePerSqft).toLocaleString("en-IN")}/sq.ft</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}