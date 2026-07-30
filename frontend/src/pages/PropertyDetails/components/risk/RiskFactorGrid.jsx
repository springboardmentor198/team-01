const factors = [
  ["⚖ Legal", "legalRisk"],
  ["🔑 Ownership", "ownershipRisk"],
  ["🌊 Flood", "floodRisk"],
  ["🌱 Environmental", "environmentalRisk"],
  ["💰 Financial", "financialRisk"],
  ["📈 Market", "marketRisk"],
];

export default function RiskFactorGrid({ risk }) {
  return (
    <div className="risk-grid">
      {factors.map(([name, key]) => (
        <div className="factor-card" key={key}>
          <span>{name}</span>

          <strong>{risk[key] || "Not assessed"}</strong>
        </div>
      ))}
    </div>
  );
}
