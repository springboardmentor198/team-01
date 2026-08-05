// Temporary data layer for Comparable Properties + Property Valuation.
// Backend endpoints for these are in progress. Functions below return
// deterministic sample data (same property -> same numbers every time)
// so the UI is stable to build/demo against in the meantime.
//
// TODO: once the backend ships /api/comparable-properties and
// /api/valuation, replace the bodies of getComparableProperties() and
// getPropertyValuation() with real `api.get...()` calls — the function
// names and return shapes are already designed to match, so nothing else
// in RiskDashboard.jsx or its child components should need to change.

// Simple seeded PRNG so the same property always renders the same mock data.
function seededRandom(seed) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function seedFromId(id) {
  const str = String(id ?? "0");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash) || 1;
}

const NAME_PREFIXES = ["Maple", "Sunset", "Harbor", "Cedar", "Willow", "Riverside", "Hilltop", "Orchard"];
const NAME_SUFFIXES = ["Residency", "Heights", "Enclave", "Court", "Villas", "Apartments", "Estate"];

export function getComparableProperties(property) {
  if (!property) return [];
  const rand = seededRandom(seedFromId(property.id));
  const basePrice = 4000000 + Math.floor(rand() * 6000000);
  const baseArea = 1200 + Math.floor(rand() * 1800);

  return Array.from({ length: 3 }).map((_, i) => {
    const priceDelta = (rand() - 0.5) * 0.25;
    const areaDelta = (rand() - 0.5) * 0.3;
    const price = Math.round(basePrice * (1 + priceDelta));
    const area = Math.round(baseArea * (1 + areaDelta));
    const distance = (0.4 + rand() * 3.2).toFixed(1);
    const riskLevels = ["Low", "Medium", "High"];

    return {
      id: `${property.id}-cmp-${i}`,
      name: `${NAME_PREFIXES[Math.floor(rand() * NAME_PREFIXES.length)]} ${NAME_SUFFIXES[Math.floor(rand() * NAME_SUFFIXES.length)]}`,
      city: property.city || "Nearby",
      distanceKm: distance,
      area,
      price,
      pricePerSqft: Math.round(price / area),
      risk: riskLevels[Math.floor(rand() * riskLevels.length)],
    };
  });
}

export function getPropertyValuation(property, riskScore) {
  if (!property) return null;
  const rand = seededRandom(seedFromId(property.id) + 99);
  const estimated = 4200000 + Math.floor(rand() * 5800000);
  const spread = 0.06 + rand() * 0.06;

  const riskPenalty = typeof riskScore === "number" ? Math.min(riskScore, 100) * 0.15 : 10;
  const confidence = Math.max(60, Math.round(92 - riskPenalty - rand() * 6));

  const trend = Array.from({ length: 6 }).map((_, i) => {
    const drift = 1 + (i - 5) * 0.012 + (rand() - 0.5) * 0.02;
    return Math.round(estimated * drift);
  });
  trend.push(estimated);

  return {
    estimatedValue: estimated,
    lowEstimate: Math.round(estimated * (1 - spread)),
    highEstimate: Math.round(estimated * (1 + spread)),
    confidence,
    pricePerSqft: property.area ? Math.round(estimated / property.area) : null,
    trend,
  };
}

export function formatCurrency(value) {
  if (value === null || value === undefined) return "—";
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  return `₹${value.toLocaleString("en-IN")}`;
}