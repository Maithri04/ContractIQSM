import React from "react";
import { CheckCircle } from "lucide-react";
import { useAppContext } from "../../context/AppContext";

export default function ProcessingSteps() {
  const { steps } = useAppContext();
  if (!steps || steps.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 rounded-2xl p-5 min-w-[210px]"
      style={{ background: "#1a1a2e", boxShadow: "0 8px 32px rgba(0,0,0,0.35)" }}
    >
      {/* Header */}
      <p className="text-[10px] font-bold uppercase tracking-widest mb-4"
         style={{ color: "#6b7280" }}>
        PROCESSING
      </p>

      {/* Steps */}
      <ul className="space-y-2.5">
        {steps.map((step, i) => (
          <li key={i} className="flex items-center gap-3">
            {/* Icon */}
            {step.status === "done" ? (
              <CheckCircle size={16} style={{ color: "#16a34a", flexShrink: 0 }} />
            ) : step.status === "active" ? (
              <ActiveDot index={i} />
            ) : (
              <PendingDot index={i} />
            )}

            {/* Label */}
            <span
              className="text-sm"
              style={{
                color: step.status === "done"
                  ? "#ffffff"
                  : step.status === "active"
                  ? "#d1d5db"
                  : "#4b5563",
                fontWeight: step.status !== "pending" ? 600 : 400,
              }}
            >
              {step.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ActiveDot({ index }) {
  return (
    <span
      style={{
        width:           16,
        height:          16,
        borderRadius:    "50%",
        background:      "#c8460a",
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        flexShrink:      0,
        fontSize:        9,
        color:           "#fff",
        fontWeight:      700,
      }}
    >
      {index + 1}
    </span>
  );
}

function PendingDot({ index }) {
  return (
    <span
      style={{
        width:           16,
        height:          16,
        borderRadius:    "50%",
        border:          "1.5px solid #374151",
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        flexShrink:      0,
        fontSize:        9,
        color:           "#4b5563",
        fontWeight:      700,
      }}
    >
      {index + 1}
    </span>
  );
}