import React from "react";

const RISK_STYLE = {
  HIGH:    { background: "#fee2e2", color: "#dc2626", border: "#fca5a5" },
  MEDIUM:  { background: "#fef3c7", color: "#d97706", border: "#fcd34d" },
  LOW:     { background: "#dcfce7", color: "#16a34a", border: "#86efac" },
  UNKNOWN: { background: "#f3f4f6", color: "#6b7280", border: "#d1d5db" },
};

function RiskBadge({ level }) {
  const lvl   = (level || "UNKNOWN").toUpperCase();
  const style = RISK_STYLE[lvl] || RISK_STYLE.UNKNOWN;
  return (
    <span
      className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold"
      style={{
        background: style.background,
        color:      style.color,
        border:     `1px solid ${style.border}`,
      }}
    >
      {lvl}
    </span>
  );
}

function ClauseCell({ text }) {
  const absent = !text || text === "Not found";
  return (
    <td
      className="px-4 py-3 text-sm align-top"
      style={{ borderBottom: "1px solid #f0ede6", maxWidth: 200 }}
    >
      <span
        className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-1"
        style={absent
          ? { background: "#dcfce7", color: "#16a34a" }
          : { background: "#fee2e2", color: "#dc2626" }
        }
      >
        {absent ? "Not found" : "Present"}
      </span>
      {!absent && (
        <p className="text-[11px] mt-1 leading-relaxed line-clamp-3"
           style={{ color: "#6b7280" }}>
          {text}
        </p>
      )}
    </td>
  );
}

export default function ComparisonTable({ result }) {
  if (!result?.success || !result?.data?.length) return null;

  const contracts  = result.data;
  const clauseCols = ["penalty", "termination", "liability"];

  return (
    <div className="space-y-5">
      {/* Summary bar */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "#f7f5f1", border: "1px solid #e0d8cc" }}
      >
        <p className="text-sm font-semibold mb-2" style={{ color: "#1a1a2e" }}>
          📊 Comparison Summary
        </p>
        <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>
          {result.ui_text}
        </p>
        {result.comparison_summary && (
          <p className="text-xs mt-2 font-semibold" style={{ color: "#6b7280" }}>
            {result.comparison_summary}
          </p>
        )}

        {/* Safest / Riskiest badges */}
        <div className="flex gap-3 mt-3 flex-wrap">
          {result.safest_contract && (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{ background: "#dcfce7", border: "1px solid #86efac", color: "#15803d" }}
            >
              🏆 Safest: {result.safest_contract}
            </div>
          )}
          {result.riskiest_contract &&
           result.riskiest_contract !== result.safest_contract && (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#b91c1c" }}
            >
              ⚠ Riskiest: {result.riskiest_contract}
            </div>
          )}
        </div>
      </div>

      {/* Comparison table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid #e0d8cc", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr style={{ background: "#1a1a2e" }}>
                <th className="text-left px-4 py-3 text-xs font-bold text-white rounded-tl-xl"
                    style={{ minWidth: 130 }}>
                  Contract
                </th>
                {clauseCols.map((col) => (
                  <th key={col}
                      className="text-left px-4 py-3 text-xs font-bold text-white capitalize"
                      style={{ minWidth: 160 }}>
                    {col}
                  </th>
                ))}
                <th className="text-left px-4 py-3 text-xs font-bold text-white rounded-tr-xl"
                    style={{ minWidth: 90 }}>
                  Risk
                </th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((row, i) => (
                <tr
                  key={i}
                  className="transition-colors duration-150"
                  style={{ background: i % 2 === 0 ? "#ffffff" : "#faf8f4" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f0fdf4")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? "#ffffff" : "#faf8f4")}
                >
                  {/* Contract name */}
                  <td className="px-4 py-3 align-top"
                      style={{ borderBottom: "1px solid #f0ede6" }}>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                        style={{ background: "#1a1a2e", color: "#fff" }}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-xs font-bold" style={{ color: "#1a1a2e" }}>
                        {row.contract_name}
                      </span>
                    </div>
                  </td>

                  {/* Clause cells */}
                  {clauseCols.map((col) => (
                    <ClauseCell key={col} text={row[col]} />
                  ))}

                  {/* Risk */}
                  <td className="px-4 py-3 align-top"
                      style={{ borderBottom: "1px solid #f0ede6" }}>
                    <RiskBadge level={row.risk_level} />
                    <p className="text-[10px] mt-1" style={{ color: "#9ca3af" }}>
                      {row.risk_score}/10
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}