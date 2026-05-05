import React, { useState, useEffect } from "react";
import { getFileUrl, generateSummary } from "../../api/historyApi";

const RISK_STYLE = {
  HIGH:    { bg: "#fee2e2", color: "#dc2626", border: "#fca5a5" },
  MEDIUM:  { bg: "#fef3c7", color: "#d97706", border: "#fcd34d" },
  LOW:     { bg: "#dcfce7", color: "#16a34a", border: "#86efac" },
  UNKNOWN: { bg: "#f3f4f6", color: "#6b7280", border: "#ddd" },
};

function scoreColor(s) {
  if (s >= 7) return "#dc2626";
  if (s >= 4) return "#d97706";
  return "#16a34a";
}

export default function HistoryDetails({ item, detail, loading, onClose, onUpdate }) {
  const [generating, setGenerating] = useState(false);
  const [localDetail, setLocalDetail] = useState(detail);

  useEffect(() => {
    setLocalDetail(detail);
  }, [detail]);

  if (!item) return null;

  const fileUrl = getFileUrl(item.file_hash);
  const analysis = localDetail?.analysis || {};
  const actualRisk = analysis.data?.level || localDetail?.risk_level || item.risk_level || "UNKNOWN";
  const risk       = actualRisk.toUpperCase();
  const rs         = RISK_STYLE[risk] || RISK_STYLE.UNKNOWN;

  return (
    <div style={{
      background: "#fff", borderRadius: 18,
      border: "1.5px solid #e0d8cc",
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        background: "#1a1a2e", padding: "14px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <p style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{item.file_name}</p>
          <p style={{ color: "#9ca3af", fontSize: 11, marginTop: 2 }}>
            {item.file_type === "image" ? "🖼️ Image" : "📄 PDF"} &bull; {risk}
          </p>
        </div>
        <button onClick={onClose} style={{
          background: "#2d2d4e", color: "#fff", border: "none",
          borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer",
        }}>
          ✕ Close
        </button>
      </div>

      <div style={{ padding: 20 }}>

        {loading && (
          <div style={{ textAlign: "center", padding: 40, color: "#888" }}>
            ⏳ Loading details...
          </div>
        )}

        {!loading && (
          <>
            {/* File Preview */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 10 }}>
                File Preview
              </p>
              {item.file_type === "image" ? (
                <img src={fileUrl} alt={item.file_name}
                  style={{ width: "100%", maxHeight: 300, objectFit: "contain", borderRadius: 10, border: "1px solid #e0d8cc" }} />
              ) : (
                <iframe src={fileUrl} title={item.file_name}
                  style={{ width: "100%", height: 300, border: "1px solid #e0d8cc", borderRadius: 10 }} />
              )}
            </div>

            <div style={{ height: 1, background: "#ede9e1", margin: "16px 0" }} />

            {/* Risk Score */}
            {localDetail && (
              <>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 10 }}>
                  Risk Score &nbsp;
                  <span style={{ background: "#f0fdf4", color: "#16a34a", fontSize: 10, padding: "1px 6px", borderRadius: 4 }}>
                    ⚡ Loaded from cache
                  </span>
                </p>

                {analysis.data?.score != null && (
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                    <div style={{
                      width: 70, height: 70, borderRadius: "50%", flexShrink: 0,
                      border: `5px solid ${scoreColor(analysis.data.score)}`,
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ fontSize: 22, fontWeight: 800, color: scoreColor(analysis.data.score) }}>{analysis.data.score}</span>
                      <span style={{ fontSize: 9, color: "#aaa" }}>/ 10</span>
                    </div>
                    <div>
                      <span style={{
                        ...rs, display: "inline-block",
                        padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                        border: `1px solid ${rs.border}`,
                      }}>
                        {risk}
                      </span>
                      <p style={{ fontSize: 12, color: "#555", marginTop: 6, lineHeight: 1.6 }}>
                        {analysis.ui_text || ""}
                      </p>
                    </div>
                  </div>
                )}

                <div style={{ height: 1, background: "#ede9e1", margin: "16px 0" }} />

                {/* Summary */}
                {analysis.summary ? (
                  <>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 8 }}>
                      Summary
                    </p>
                    <div style={{ background: "#f7f5f1", borderRadius: 10, padding: 14, fontSize: 13, color: "#333", lineHeight: 1.7, marginBottom: 16 }}>
                      {analysis.summary}
                    </div>
                  </>
                ) : (
                  <div style={{ marginBottom: 16 }}>
                    <button 
                      disabled={generating}
                      onClick={async () => {
                        setGenerating(true);
                        try {
                           const res = await generateSummary(item.file_hash);
                           setLocalDetail(res);
                           if (onUpdate) onUpdate(res);
                        } catch (e) {
                           alert("Failed to generate summary");
                        }
                        setGenerating(false);
                      }}
                      style={{ background: "#1a1a2e", color: "#fff", padding: "8px 16px", borderRadius: 8, fontSize: 13, cursor: generating ? "not-allowed" : "pointer", border: "none" }}>
                      {generating ? "Generating Summary..." : "Generate Summary & Analysis"}
                    </button>
                  </div>
                )}

                {/* Clause Breakdown */}
                {analysis.data?.breakdown?.length > 0 && (
                  <>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 8 }}>
                      Clause Breakdown
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                      {analysis.data.breakdown.map((b, i) => (
                        <div key={i} style={{
                          background: "#f7f5f1", border: "1px solid #e0d8cc",
                          borderRadius: 10, padding: 12, textAlign: "center",
                        }}>
                          <p style={{ fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: ".5px" }}>{b.clause}</p>
                          <p style={{ fontSize: 18, fontWeight: 800, color: b.found ? scoreColor(b.contribution * 3) : "#16a34a", margin: "4px 0" }}>
                            {b.found ? `+${b.contribution}` : "✓ Clear"}
                          </p>
                          <p style={{ fontSize: 10, color: "#aaa" }}>weight {b.weight}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {!localDetail && !loading && (
              <div style={{ textAlign: "center", padding: 20, color: "#aaa", fontSize: 13 }}>
                No analysis data available for this file.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}