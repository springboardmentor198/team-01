export default function CriticalIssues({ risk }) {
  if (!risk.criticalIssues) return null;

  return (
    <div className="issues-card">
      <h3>⚠ Critical Issues</h3>

      <p>{risk.criticalIssues}</p>
    </div>
  );
}
