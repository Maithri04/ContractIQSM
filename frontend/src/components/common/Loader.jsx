import React from "react";

export default function Loader({ size = 18, color = "#1a1a2e" }) {
  return (
    <span
      style={{
        display:     "inline-block",
        width:        size,
        height:       size,
        border:      `2.5px solid #e0d8cc`,
        borderTopColor: color,
        borderRadius: "50%",
        animation:    "ciq-spin 0.75s linear infinite",
        verticalAlign:"middle",
        flexShrink:   0,
      }}
    />
  );
}

// Inject keyframe once
(function() {
  if (typeof document === "undefined") return;
  if (document.getElementById("ciq-spin-kf")) return;
  const s = document.createElement("style");
  s.id = "ciq-spin-kf";
  s.textContent = "@keyframes ciq-spin { to { transform: rotate(360deg); } }";
  document.head.appendChild(s);
})();