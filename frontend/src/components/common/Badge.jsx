import React from "react";
import { RISK_META } from "../../utils/constants";

export default function Badge({ level }) {
  const lvl  = (level || "UNKNOWN").toUpperCase();
  const meta = RISK_META[lvl] || RISK_META.UNKNOWN;
  return (
    <span
      style={{
        background: meta.bg,
        color:      meta.text,
        border:     `1px solid ${meta.border}`,
      }}
      className="inline-block px-3 py-0.5 rounded-full text-xs font-bold"
    >
      {meta.label}
    </span>
  );
}