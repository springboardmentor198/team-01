export default function RiskScoreCard({ risk }) {
  return (
    <div className="risk-score-card">
      <div>
        <h4>Risk Score</h4>

        <div className="score">
          {risk.riskScore ?? "--"}

          <span>/100</span>
        </div>
      </div>

      <div>
        <h4>Risk Trend</h4>

        <p>{risk.riskTrend || "Stable"}</p>
      </div>

      <div>
        <h4>Reviewed By</h4>

        <p>{risk.reviewedBy || "Not reviewed"}</p>
      </div>
    </div>
  );
}
