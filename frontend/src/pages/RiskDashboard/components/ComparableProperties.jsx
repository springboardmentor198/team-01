import { LuBuilding2, LuMapPin } from "react-icons/lu";
import { ComparablePriceBars } from "./RiskCharts";
import { formatCurrency } from "../riskDashboardService";

const RISK_BADGE_CLASS = {
  Low: "low",
  Medium: "medium",
  High: "high",
};

export default function ComparableProperties({ items }) {
  if (!items || !items.length) return null;

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
        {items.map((item) => (
          <div key={item.id} className="rd-comp-item">
            <div className="rd-comp-item-header">
              <strong>{item.name}</strong>
              <span className={`risk-badge ${RISK_BADGE_CLASS[item.risk] || "medium"}`}>
                {item.risk}
              </span>
            </div>

            <div className="rd-comp-item-meta">
              <span>
                <LuMapPin style={{ verticalAlign: "middle", marginRight: 4 }} />
                {item.city} · {item.distanceKm} km away
              </span>
              <span>{item.area.toLocaleString("en-IN")} sq.ft</span>
            </div>

            <div className="rd-comp-item-price">
              <strong>{formatCurrency(item.price)}</strong>
              <span className="rd-muted"> · ₹{item.pricePerSqft.toLocaleString("en-IN")}/sq.ft</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}