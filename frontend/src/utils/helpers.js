export function scoreColor(score) {
  if (score >= 7) return "#dc2626";
  if (score >= 4) return "#d97706";
  return "#16a34a";
}

export function riskLevel(score) {
  if (score >= 7) return "HIGH";
  if (score >= 4) return "MEDIUM";
  return "LOW";
}