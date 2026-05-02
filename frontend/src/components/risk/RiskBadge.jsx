import React from "react";
import { RISK_META } from "../../utils/constants";

export default function RiskBadge({ level }) {
  const lvl  = (level || "UNKNOWN").toUpperCase();
  const meta = RISK_META[lvl] || RISK_META.UNKNOWN;
  return (
    <span
      className="inline-block px-3 py-1 rounded-full text-xs font-bold"
      style={{
        background: meta.bg,
        color:      meta.text,
        border:     `1px solid ${meta.border}`,
      }}
    >
      Risk: {meta.label}
    </span>
  );
}