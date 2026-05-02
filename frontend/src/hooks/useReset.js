import { useState, useRef } from "react";
import { resetSystem } from "../api/resetApi";
import { useAppContext } from "../context/AppContext";

export function useReset({ pdfInputRef, imgInputRef } = {}) {
  const {
    setPdfFile,
    setImageFile,
    setUploadResult,
    setRiskResult,
    clearSteps,
    setChatHistory,   // we'll add this to context below
  } = useAppContext();

  const [resetting, setResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [error,     setError]     = useState("");

  async function runReset() {
    setResetting(true);
    setResetDone(false);
    setError("");

    try {
      // 1 — Call backend to wipe FAISS indexes
      await resetSystem();

      // 2 — Clear all React state
      setPdfFile(null);
      setImageFile(null);
      setUploadResult(null);
      setRiskResult(null);
      clearSteps();
      if (setChatHistory) setChatHistory([]);

      // 3 — Clear file input DOM elements visually
      if (pdfInputRef?.current) pdfInputRef.current.value = "";
      if (imgInputRef?.current) imgInputRef.current.value = "";

      setResetDone(true);

      // Auto-hide success message after 3 s
      setTimeout(() => setResetDone(false), 3000);
    } catch (e) {
      setError(e.message || "Reset failed. Please try again.");
    } finally {
      setResetting(false);
    }
  }

  return { runReset, resetting, resetDone, error };
}