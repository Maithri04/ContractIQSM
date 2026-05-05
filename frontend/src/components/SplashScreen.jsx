import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SplashScreen() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("enter"); // enter → hold → exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("exit"), 3400);
    const t2 = setTimeout(() => navigate("/login"), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [navigate]);

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "linear-gradient(135deg, #0a0a0f 0%, #172135ff 50%, #0a0a0f 100%)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');

        @keyframes splashEnter {
          from { opacity: 0; transform: scale(0.88) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes splashExit {
          from { opacity: 1; transform: scale(1)    translateY(0); }
          to   { opacity: 0; transform: scale(1.06) translateY(-8px); }
        }
        @keyframes ringPulse {
          0%   { transform: scale(1);    opacity: 0.6; }
          50%  { transform: scale(1.12); opacity: 0.2; }
          100% { transform: scale(1),    opacity: 0.6; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes dotBlink {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50%       { opacity: 1;   transform: scale(1.1); }
        }
        @keyframes gridFade {
          from { opacity: 0; }
          to   { opacity: 0.035; }
        }
        .splash-content {
          animation: splashEnter 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .splash-content.exit {
          animation: splashExit 0.5s cubic-bezier(0.4, 0, 1, 1) both;
        }
        .ring-pulse {
          animation: ringPulse 2s ease-in-out infinite;
        }
        .shimmer-text {
          background: linear-gradient(
            90deg,
            #e2e8f0 0%, #e2e8f0 30%,
            #ffffff 50%,
            #e2e8f0 70%, #e2e8f0 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 2.5s linear infinite;
        }
        .grid-bg {
          animation: gridFade 1s ease 0.3s both;
        }
        .dot1 { animation: dotBlink 1.2s ease-in-out 0.1s infinite; }
        .dot2 { animation: dotBlink 1.2s ease-in-out 0.3s infinite; }
        .dot3 { animation: dotBlink 1.2s ease-in-out 0.5s infinite; }
      `}</style>

      {/* Grid background */}
      <div className="grid-bg" style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(99,102,241,0.15) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,102,241,0.15) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
      }} />

      {/* Glow orb */}
      <div style={{
        position: "absolute",
        width: 400, height: 400,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
        filter: "blur(40px)",
      }} />

      {/* Main content */}
      <div className={`splash-content ${phase === "exit" ? "exit" : ""}`}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32, zIndex: 10 }}
      >
        {/* Logo mark */}
        <div style={{ position: "relative" }}>
          {/* Pulse ring */}
          <div className="ring-pulse" style={{
            position: "absolute", inset: -16,
            borderRadius: "50%",
            border: "1px solid rgba(99,102,241,0.4)",
          }} />
          {/* Icon */}
          <div style={{
            width: 80, height: 80,
            background: "linear-gradient(135deg, #4f46e5, #818cf8)",
            borderRadius: 24,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 40px rgba(99,102,241,0.4), 0 0 80px rgba(99,102,241,0.15)",
          }}>
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              <rect x="9" y="3" width="6" height="4" rx="1" stroke="white" strokeWidth="1.8"/>
              <path d="M9 12h6M9 16h4" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* App name */}
        <div style={{ textAlign: "center" }}>
          <h1 className="shimmer-text" style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 48, fontWeight: 400,
            letterSpacing: "-0.02em",
            margin: 0, lineHeight: 1,
          }}>
            ContractIQ
          </h1>
          <p style={{
            color: "rgba(148,163,184,0.7)",
            fontSize: 13, letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginTop: 10, fontWeight: 500,
          }}>
            Legal Intelligence Platform
          </p>
        </div>

        {/* Loading dots */}
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          {["dot1","dot2","dot3"].map(cls => (
            <div key={cls} className={cls} style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "rgba(99,102,241,0.8)",
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}