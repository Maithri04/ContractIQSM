import React, { createContext, useContext, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [uploadResult, setUploadResult] = useState(null);  // upload API response
  const [riskResult,   setRiskResult]   = useState(null);  // risk-score API response
  const [pdfFile,      setPdfFile]      = useState(null);  // File object
  const [imageFile,    setImageFile]    = useState(null);  // File object
  const [steps,        setSteps]        = useState([]);    // [{label, status}] "pending"|"active"|"done"
  const [chatHistory,  setChatHistory]  = useState([]);    // [{role,content,risk_level,sources}]

  function initSteps(labels) {
    setSteps(labels.map((label, i) => ({
      label,
      status: i === 0 ? "active" : "pending",
      index: i,
    })));
  }

  function tickStep(idx) {
    setSteps((prev) =>
      prev.map((s) => {
        if (s.index === idx)     return { ...s, status: "done" };
        if (s.index === idx + 1) return { ...s, status: "active" };
        return s;
      })
    );
  }

  function clearSteps() { setSteps([]); }

  function addChat(msg) { setChatHistory((h) => [...h, msg]); }

  function resetAll() {
    setUploadResult(null);
    setRiskResult(null);
    setPdfFile(null);
    setImageFile(null);
    setSteps([]);
    setChatHistory([]);
  }

  return (
    <AppContext.Provider value={{
      uploadResult, setUploadResult,
      riskResult,   setRiskResult,
      pdfFile,      setPdfFile,
      imageFile,    setImageFile,
      steps,        initSteps, tickStep, clearSteps,
      chatHistory,  addChat, setChatHistory,
      resetAll,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}