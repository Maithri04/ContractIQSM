import React, { useState } from "react";
import { AppProvider }       from "./context/AppContext";
import UploadAnalyzePage     from "./pages/UploadAnalyzePage";
import ComparePage           from "./pages/ComparePage";
import ScenarioPage          from "./pages/ScenarioPage";
import "./styles/tailwind.css";

const NAV = [
  { id: "upload",  label: "Upload & Analyze",  icon: "📄" },
  { id: "compare", label: "Compare Contracts",  icon: "🔍" },
  { id: "scenarios", label: "If-Then Scenarios", icon: "⚡" },
];

function Sidebar({ activePage, setActivePage }) {
  return (
    <div
      className="fixed left-0 top-0 h-screen w-64 z-30 flex flex-col"
      style={{ background: "#1a1a2e", boxShadow: "2px 0 16px rgba(0,0,0,0.18)" }}
    >
      {/* Logo */}
      <div
        className="px-6 py-7"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
            style={{ background: "#c8460a" }}
          >
            🛡
          </div>
          <div>
            <p className="text-white font-extrabold text-base leading-tight">
              ContractIQ
            </p>
            <p
              className="text-[10px] font-medium tracking-wide"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              AI Legal Assistant
            </p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        {NAV.map(({ id, label, icon }) => {
          const active = activePage === id;
          return (
            <button
              key={id}
              onClick={() => setActivePage(id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-left"
              style={{
                background: active ? "rgba(255,255,255,0.10)" : "transparent",
                color:      active ? "#ffffff"                : "rgba(255,255,255,0.50)",
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = "transparent";
              }}
            >
              <span className="text-base">{icon}</span>
              <span className="flex-1">{label}</span>
              {active && (
                <span style={{ color: "rgba(255,255,255,0.30)", fontSize: 12 }}>›</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="px-5 py-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <p className="text-[10px] font-semibold" style={{ color: "rgba(255,255,255,0.25)" }}>
          ContractIQ v1.0 · AI Legal Risk Analyzer
        </p>
      </div>
    </div>
  );
}

function Inner() {
  const [activePage, setActivePage] = useState("upload");

  return (
    <div className="min-h-screen" style={{ background: "#f0ede6" }}>
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="md:ml-64">
        {activePage === "upload"  && <UploadAnalyzePage />}
        {activePage === "compare" && <ComparePage />}
        {activePage === "scenarios" && <ScenarioPage />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Inner />
    </AppProvider>
  );
}