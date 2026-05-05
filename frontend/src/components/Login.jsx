import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, user } = useUser();
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [mounted, setMounted]   = useState(false);

  useEffect(() => {
    setMounted(true);
    // Removed auto-redirect so the login page is compulsory.
    // We can prefill the previous session's details if available.
    if (user && !user.isGuest && !mounted) {
      if (user.username) setUsername(user.username);
      if (user.email) setEmail(user.email);
    }
  }, [user, mounted]);

  const handleLogin = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    login({ username, email });
    navigate("/dashboard");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0a0f 0%, #0f1623 60%, #0d1117 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');

        @keyframes loginMount {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes floatOrb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(30px, -20px) scale(1.05); }
          66%       { transform: translate(-20px, 15px) scale(0.96); }
        }
        @keyframes inputFocus {
          from { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
          to   { box-shadow: 0 0 0 3px rgba(99,102,241,0.2); }
        }
        .login-card {
          animation: loginMount 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
        }
        .orb1 { animation: floatOrb 8s ease-in-out infinite; }
        .orb2 { animation: floatOrb 11s ease-in-out 2s infinite reverse; }

        .login-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 14px 16px 14px 46px;
          color: #e2e8f0;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .login-input::placeholder { color: rgba(148,163,184,0.4); }
        .login-input:focus {
          border-color: rgba(99,102,241,0.5);
          background: rgba(99,102,241,0.06);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }
        .login-btn {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: white;
          box-shadow: 0 4px 24px rgba(99,102,241,0.35);
          position: relative;
          overflow: hidden;
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 32px rgba(99,102,241,0.45);
        }
        .login-btn:active:not(:disabled) { transform: translateY(0); }
        .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        @keyframes btnShimmer {
          from { left: -100%; }
          to   { left: 200%; }
        }
        .btn-shimmer {
          position: absolute; top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          animation: btnShimmer 1.2s ease infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }
      `}</style>

      {/* Background orbs */}
      <div className="orb1" style={{
        position: "absolute", width: 500, height: 500,
        borderRadius: "50%", top: "-10%", right: "-5%",
        background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%)",
        filter: "blur(60px)", pointerEvents: "none",
      }} />
      <div className="orb2" style={{
        position: "absolute", width: 400, height: 400,
        borderRadius: "50%", bottom: "-15%", left: "-8%",
        background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 65%)",
        filter: "blur(60px)", pointerEvents: "none",
      }} />

      {/* Grid */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.025,
        backgroundImage: `
          linear-gradient(rgba(99,102,241,1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)
        `,
        backgroundSize: "50px 50px",
        pointerEvents: "none",
      }} />

      {/* Card */}
      <div className="login-card" style={{
        width: "100%", maxWidth: 420,
        background: "rgba(15,22,35,0.8)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 24,
        padding: "40px 36px",
        boxShadow: "0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)",
        zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <div style={{
            width: 42, height: 42,
            background: "linear-gradient(135deg, #4f46e5, #818cf8)",
            borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 20px rgba(99,102,241,0.3)",
            flexShrink: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              <rect x="9" y="3" width="6" height="4" rx="1" stroke="white" strokeWidth="1.8"/>
              <path d="M9 12h6M9 16h4" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p style={{ color: "#e2e8f0", fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>ContractIQ</p>
            <p style={{ color: "rgba(148,163,184,0.5)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>Legal Intelligence</p>
          </div>
        </div>

        {/* Heading */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 28, fontWeight: 400, color: "#f1f5f9",
            margin: "0 0 6px", letterSpacing: "-0.02em",
          }}>
            Welcome back
          </h2>
          <p style={{ color: "rgba(148,163,184,0.6)", fontSize: 14, margin: 0 }}>
            Sign in or continue as guest — no account required.
          </p>
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
          {/* Username */}
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="rgba(148,163,184,0.5)" strokeWidth="1.8"/>
                <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke="rgba(148,163,184,0.5)" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </span>
            <input
              className="login-input"
              type="text"
              placeholder="Username (optional)"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="4" width="20" height="16" rx="3" stroke="rgba(148,163,184,0.5)" strokeWidth="1.8"/>
                <path d="M2 8l10 6 10-6" stroke="rgba(148,163,184,0.5)" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </span>
            <input
              className="login-input"
              type="email"
              placeholder="Email address (optional)"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              disabled={loading}
            />
          </div>
        </div>

        {/* Guest hint */}
        <p style={{ color: "rgba(148,163,184,0.4)", fontSize: 12, marginBottom: 20, textAlign: "center" }}>
          Leave fields empty to continue as <span style={{ color: "rgba(148,163,184,0.65)" }}>Guest User</span>
        </p>

        {/* Login button */}
        <button className="login-btn" onClick={handleLogin} disabled={loading}>
          {loading && <div className="btn-shimmer" />}
          {loading
            ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <span className="spinner" /> Signing in…
              </span>
            : "Continue →"
          }
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
          <span style={{ color: "rgba(148,163,184,0.3)", fontSize: 12 }}>or</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
        </div>

        {/* Guest button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%", padding: "13px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
            color: "rgba(148,163,184,0.7)",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14, fontWeight: 500, cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#e2e8f0"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "rgba(148,163,184,0.7)"; }}
        >
          👤 Continue as Guest
        </button>
      </div>
    </div>
  );
}