import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { askQuestion }   from "../api/askApi";

export function useChat() {
  const { chatHistory, addChat } = useAppContext();
  const [loading, setLoading]    = useState(false);
  const [error,   setError]      = useState("");

  async function sendMessage(question) {
    if (!question.trim()) return;
    setError("");
    addChat({ role: "user", content: question });
    setLoading(true);
    try {
      const data = await askQuestion(question);
      addChat({
        role:       "assistant",
        content:    data.answer || data.summary || "No answer returned.",
        risk_level: data.risk_level,
        sources:    data.sources || [],
      });
    } catch (e) {
      setError(e.message);
      addChat({ role: "assistant", content: `Error: ${e.message}` });
    } finally {
      setLoading(false);
    }
  }

  return { chatHistory, loading, error, sendMessage };
}