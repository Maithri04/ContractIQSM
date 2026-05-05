import React from "react";

const RISK_STYLE = {
  HIGH:    { bg: "#fee2e2", color: "#dc2626" },
  MEDIUM:  { bg: "#fef3c7", color: "#d97706" },
  LOW:     { bg: "#dcfce7", color: "#16a34a" },
  UNKNOWN: { bg: "#f3f4f6", color: "#6b7280" },
};

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
    " " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export default function HistoryCard({ item, onView, onDelete, selected }) {
  const risk  = (item.risk_level || "UNKNOWN").toUpperCase();
  const style = RISK_STYLE[risk] || RISK_STYLE.UNKNOWN;
  const icon  = item.file_type === "image" ? "🖼️" : "📄";

  return (
    <div style={{
      background: "#fff",
      border: selected ? "2px solid #1a1a2e" : "1.5px solid #e0d8cc",
      borderRadius: 16, padding: 16,
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      transition: "all .2s",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        {/* Icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: item.file_type === "image" ? "#eff6ff" : "#f0fdf4",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
        }}>
          {icon}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e", marginBottom: 2,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {item.file_name}
          </p>
          <p style={{ fontSize: 11, color: "#aaa", marginBottom: 6 }}>
            {formatDate(item.uploaded_at)}
          </p>
          <span style={{
            ...style, display: "inline-block",
            padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
          }}>
            {risk}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
          <button onClick={() => onView(item)} style={{
            background: "#1a1a2e", color: "#fff", border: "none",
            borderRadius: 8, padding: "6px 12px", fontSize: 11,
            fontWeight: 600, cursor: "pointer",
          }}>
            👁 View
          </button>
          <button onClick={() => onDelete(item.file_hash)} style={{
            background: "#fee2e2", color: "#dc2626", border: "none",
            borderRadius: 8, padding: "6px 12px", fontSize: 11,
            fontWeight: 600, cursor: "pointer",
          }}>
            🗑 Delete
          </button>
        </div>
      </div>
    </div>
  );
}