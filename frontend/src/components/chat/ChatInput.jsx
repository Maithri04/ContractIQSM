import React, { useState } from "react";
import { Send } from "lucide-react";
import Loader from "../common/Loader";

export default function ChatInput({ onSend, loading, disabled }) {
  const [value, setValue] = useState("");

  function handleSend() {
    if (!value.trim() || loading || disabled) return;
    onSend(value.trim());
    setValue("");
  }

  return (
    <div className="flex gap-2 mt-3">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
        placeholder={disabled ? "Upload a contract first…" : "e.g. What are the penalty clauses? Is this contract risky?"}
        disabled={disabled}
        className="flex-1 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
        style={{
          border:      "1.5px solid #e0d8cc",
          background:  disabled ? "#f7f5f1" : "#fff",
          color:       "#374151",
        }}
      />
      <button
        onClick={handleSend}
        disabled={loading || disabled || !value.trim()}
        className="px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all duration-200"
        style={{
          background: "#c8460a",
          color:      "#fff",
          opacity:    (loading || disabled || !value.trim()) ? 0.4 : 1,
        }}
      >
        {loading ? <Loader size={15} color="#fff" /> : <Send size={15} />}
      </button>
    </div>
  );
}