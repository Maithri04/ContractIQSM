import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Shield } from "lucide-react";
import Card from "../common/Card";
import RiskBadge from "./RiskBadge";
import RiskGauge, { riskLevelToScore } from "./RiskGauge";
import { useAppContext } from "../../context/AppContext";

// Pick best available risk level:
// 1st: LLM answer from chat (most accurate)
// 2nd: /risk-score API
// 3rd: upload heuristic (fallback)
function useBestRiskLevel() {
  const { chatHistory, riskResult, uploadResult } = useAppContext();
  const llmLevel = [...(chatHistory || [])]
    .reverse()
    .find((m) => m.role === "assistant" && m.risk_level)
    ?.risk_level;
  if (llmLevel) return { level: llmLevel, source: "LLM Analysis" };
  if (riskResult?.success && riskResult?.data?.level)
    return { level: riskResult.data.level, source: "Risk Score API" };
  if (uploadResult?.heuristic_risk)
    return { level: uploadResult.heuristic_risk, source: "Keyword Scan" };
  return { level: null, source: null };
}

export default function RiskCard() {
  const { riskResult, uploadResult } = useAppContext();
  const { level, source } = useBestRiskLevel();
  const [expanded, setExpanded] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    if (!uploadResult) {
      setShowDashboard(false);
      setExpanded(false);
    }
  }, [uploadResult]);

  const score = level ? riskLevelToScore(level) : 0;

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Shield size={16} style={{ color: "#1a1a2e" }} />
        <h3 className="font-bold text-base" style={{ color: "#1a1a2e" }}>
          Risk Score Dashboard
        </h3>
      </div>
      <p className="text-xs mb-1" style={{ color: "#9ca3af" }}>
        {source ? (
          <>
            Score derived from{" "}
            <span className="font-semibold" style={{ color: "#6b7280" }}>{source}</span>
          </>
        ) : (
          "Upload a contract to generate a risk score"
        )}
      </p>
      <p className="text-[10px] mb-5" style={{ color: "#d1d5db" }}>
        1–3 Low · 4–6 Medium · 7 Moderate · 8–10 High
      </p>
      <div className="h-px mb-5" style={{ background: "#e0d8cc" }} />

      {!showDashboard ? (
        <div className="flex justify-center my-6">
          <button
            onClick={() => setShowDashboard(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{ background: "#c8460a", boxShadow: "0 4px 12px rgba(200, 70, 10, 0.3)" }}
          >
            Analyze Risk Score
          </button>
        </div>
      ) : (
        <>
          {/* Speedometer gauge */}
          <RiskGauge score={score} />

          {/* Clause breakdown (if risk-score API returned data) */}
          {riskResult?.success && riskResult?.data?.breakdown?.length > 0 && (
            <>
              <div className="h-px my-5" style={{ background: "#e0d8cc" }} />
              <button
                onClick={() => setExpanded((e) => !e)}
                className="flex items-center gap-1.5 text-xs font-semibold mb-1"
                style={{ color: "#1a1a2e" }}
              >
                {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                {expanded ? "Hide" : "Show"} clause breakdown
              </button>
              {expanded && (
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {riskResult.data.breakdown.map((b, i) => (
                    <div key={i} className="rounded-xl p-3 text-center"
                         style={{ background: "#f7f5f1", border: "1px solid #e0d8cc" }}>
                      <p className="text-[9px] font-bold uppercase tracking-wider mb-1"
                         style={{ color: "#9ca3af" }}>{b.clause}</p>
                      <p className="text-lg font-black"
                         style={{ color: b.found ? "#dc2626" : "#16a34a" }}>
                        {b.found ? `+${b.contribution}` : "✓"}
                      </p>
                      <p className="text-[9px]" style={{ color: "#9ca3af" }}>weight {b.weight}</p>
                      {b.found && b.excerpt && (
                        <p className="text-[9px] mt-2 text-left border-t pt-1 line-clamp-2"
                           style={{ color: "#6b7280", borderColor: "#e0d8cc" }}>{b.excerpt}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Plain-English explanation */}
          {riskResult?.ui_text && (
            <div className="mt-4 px-4 py-3 rounded-xl text-sm"
                 style={{ background: "#f7f5f1", border: "1px solid #e0d8cc", color: "#374151", lineHeight: 1.7 }}>
              {riskResult.ui_text}
            </div>
          )}
        </>
      )}
    </Card>
  );
}