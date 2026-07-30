export default function ComplianceCard({ risk }) {
  return (
    <div className="compliance-card">
      <h3>Compliance Status</h3>

      <p>{risk.complianceStatus || "Pending verification"}</p>

      {risk.reviewedAt && (
        <p>Last reviewed: {new Date(risk.reviewedAt).toLocaleDateString()}</p>
      )}
    </div>
  );
}
