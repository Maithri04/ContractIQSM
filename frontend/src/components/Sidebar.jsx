import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import ProfileModal from "./ProfileModal";

const NAV = [
  { id: "upload",  label: "Upload & Analyze",  icon: "📄" },
  { id: "compare", label: "Compare Contracts",  icon: "🔍" },
  { id: "scenarios", label: "If-Then Scenarios", icon: "⚡" },
  { id: "history", label: "History", icon: "🕐" },
];

export default function Sidebar({ activePage, setActivePage }) {
  const { user, getInitials } = useUser();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <>
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

        {/* Footer / Profile */}
        <div className="mt-auto">
          <div
            className="px-5 py-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
          >
            <p className="text-[10px] font-semibold mb-3" style={{ color: "rgba(255,255,255,0.25)" }}>
              ContractIQ v1.0 · AI Legal Risk Analyzer
            </p>
            
            {/* User Profile Section */}
            <div 
              className="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => setIsProfileModalOpen(true)}
              style={{ border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}
            >
              <div style={{
                width: 32, height: 32,
                background: "linear-gradient(135deg, #4f46e5, #818cf8)",
                borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: "white",
                flexShrink: 0
              }}>
                {getInitials()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-semibold truncate">
                  {user?.username || "Guest User"}
                </p>
                <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {user?.isGuest ? "Guest" : "View Profile"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </>
  );
}
