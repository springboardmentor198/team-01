export default function RecommendationCard({ risk }) {
  if (!risk.recommendation) return null;

  return (
    <div className="recommendation-card">
      <h3>✓ Recommendation</h3>

      <p>{risk.recommendation}</p>
    </div>
  );
}
