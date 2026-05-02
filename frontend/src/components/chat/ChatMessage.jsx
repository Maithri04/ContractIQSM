import React from "react";
import RiskBadge from "../risk/RiskBadge";

export default function ChatMessage({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      {!isUser && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold mr-2 shrink-0 mt-1"
          style={{ background: "#1a1a2e" }}
        >
          AI
        </div>
      )}
      <div
        className="max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
        style={isUser
          ? { background: "#1a1a2e", color: "#fff",     borderRadius: "16px 16px 4px 16px" }
          : { background: "#f7f5f1", color: "#374151",  border: "1px solid #e0d8cc", borderRadius: "16px 16px 16px 4px" }
        }
      >
        {msg.risk_level && msg.risk_level !== "UNKNOWN" && (
          <div className="mb-2">
            <RiskBadge level={msg.risk_level} />
          </div>
        )}
        <p style={{ whiteSpace: "pre-wrap" }}>{msg.content}</p>
        {msg.sources && msg.sources.length > 0 && msg.risk_level !== "UNKNOWN" && (
          <div className="mt-3 pt-2" style={{ borderTop: "1px solid #e0d8cc" }}>
            <p className="text-[10px] font-bold mb-1" style={{ color: "#9ca3af" }}>Sources</p>
            {msg.sources.slice(0, 3).map((s, i) => (
              <div key={i} className="text-[10px] rounded px-2 py-1 mb-1"
                   style={{ background: "#fff", border: "1px solid #e0d8cc", color: "#6b7280" }}>
                {s.type === "pdf"
                  ? `PDF — Page ${s.page_num || "?"}`
                  : `Image — ${s.file_name || "screenshot"}`
                }
                {" "}(score: {s.score})
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}