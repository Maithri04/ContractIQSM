import React from "react";
import { RotateCcw, CheckCircle, AlertTriangle } from "lucide-react";
import Loader from "./Loader";

export default function ResetButton({ onReset, resetting, resetDone, error }) {
  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={onReset}
        disabled={resetting}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
        style={{
          background:  resetting ? "#f3f4f6" : "#fff",
          border:      "1.5px solid #e0d8cc",
          color:       resetting ? "#9ca3af" : "#374151",
          cursor:      resetting ? "not-allowed" : "pointer",
        }}
      >
        {resetting
          ? <><Loader size={14} color="#9ca3af" /> Resetting…</>
          : <><RotateCcw size={14} /> Reset</>
        }
      </button>

      {/* Success message */}
      {resetDone && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
          style={{
            background: "#f0fdf4",
            border:     "1px solid #86efac",
            color:      "#15803d",
          }}
        >
          <CheckCircle size={13} />
          System reset. You can upload a new contract.
        </div>
      )}

      {/* Error message */}
      {error && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
          style={{
            background: "#fef2f2",
            border:     "1px solid #fca5a5",
            color:      "#b91c1c",
          }}
        >
          <AlertTriangle size={13} />
          {error}
        </div>
      )}
    </div>
  );
}