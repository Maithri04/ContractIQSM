import React, { useRef, useEffect } from "react";
import Card from "../common/Card";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { useChat } from "../../hooks/useChat";
import { useAppContext } from "../../context/AppContext";

export default function ChatBox() {
  const { uploadResult } = useAppContext();
  const { chatHistory, loading, sendMessage } = useChat();
  const bottomRef = useRef(null);

  const hasUpload = !!uploadResult;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  return (
    <Card>
      {/* Tag */}
      <span className="inline-block text-[10px] font-bold px-3 py-1 rounded-full mb-4"
            style={{ background: "#f7f5f1", border: "1px solid #e0d8cc", color: "#6b7280" }}>
        after upload
      </span>

      <h3 className="font-bold text-base mb-1" style={{ color: "#1a1a2e" }}>
        Ask about the contract
      </h3>
      <p className="text-xs mb-5" style={{ color: "#9ca3af" }}>
        Type a question — the AI answers from the uploaded document.
      </p>
      <div className="h-px mb-4" style={{ background: "#e0d8cc" }} />

      {/* Messages */}
      {chatHistory.length > 0 && (
        <div
          className="mb-4 overflow-y-auto"
          style={{ maxHeight: 320 }}
        >
          {chatHistory.map((msg, i) => (
            <ChatMessage key={i} msg={msg} />
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        loading={loading}
        disabled={!hasUpload}
      />

      {!hasUpload && (
        <p className="text-xs mt-2 text-center" style={{ color: "#d97706" }}>
          ⚠ Upload a contract above before asking questions.
        </p>
      )}
    </Card>
  );
}