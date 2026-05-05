import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

export default function ProfileModal({ isOpen, onClose }) {
  const { user, logout, getInitials } = useUser();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/login");
  };

  if (!isOpen) return null;

  const formatDate = (iso) => {
    if (!iso) return "—";
    try {
      return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
      }).format(new Date(iso));
    } catch { return iso; }
  };

  return (
    <>
      <style>{`
        @keyframes backdropIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes drawerIn    { from { opacity: 0; transform: translateX(-16px) scale(0.97); } to { opacity: 1; transform: translateX(0) scale(1); } }
        @keyframes drawerOut   { from { opacity: 1; transform: translateX(0) scale(1); } to { opacity: 0; transform: translateX(-16px) scale(0.97); } }
        .profile-drawer {
          animation: drawerIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .profile-drawer.exit {
          animation: drawerOut 0.2s ease both;
        }
        .profile-backdrop {
          animation: backdropIn 0.2s ease both;
        }
        .profile-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
        }
        .logout-btn {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid rgba(239,68,68,0.2);
          background: rgba(239,68,68,0.06);
          color: rgba(248,113,113,0.9);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .logout-btn:hover {
          background: rgba(239,68,68,0.12);
          border-color: rgba(239,68,68,0.3);
          color: #f87171;
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="profile-backdrop"
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(4px)",
          zIndex: 100,
        }}
      />

      {/* Drawer */}
      <div
        className={`profile-drawer ${!visible ? "exit" : ""}`}
        style={{
          position: "fixed",
          bottom: 80, left: 16,
          width: 280,
          background: "rgba(13,17,23,0.95)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          padding: 20,
          zIndex: 101,
          boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <span style={{ color: "rgba(148,163,184,0.5)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 }}>
            Profile
          </span>
          <button
            onClick={onClose}
            style={{
              width: 26, height: 26, borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)",
              color: "rgba(148,163,184,0.6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: 14,
            }}
          >
            ✕
          </button>
        </div>

        {/* Avatar + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <div style={{
            width: 52, height: 52,
            background: "linear-gradient(135deg, #4f46e5, #818cf8)",
            borderRadius: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 700, color: "white",
            flexShrink: 0,
            boxShadow: "0 0 16px rgba(99,102,241,0.3)",
          }}>
            {getInitials()}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 15, margin: 0, letterSpacing: "-0.01em" }}>
              {user?.username || "Guest User"}
            </p>
            <p style={{ color: "rgba(148,163,184,0.5)", fontSize: 12, margin: "2px 0 0" }}>
              {user?.isGuest ? "Guest session" : "Signed in"}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginBottom: 16 }} />

        {/* Info rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
          {/* Email */}
          <div className="profile-row">
            <span style={{ color: "rgba(99,102,241,0.7)", flexShrink: 0 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M2 8l10 6 10-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </span>
            <div style={{ minWidth: 0 }}>
              <p style={{ color: "rgba(148,163,184,0.4)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Email</p>
              <p style={{ color: user?.email ? "#cbd5e1" : "rgba(148,163,184,0.3)", fontSize: 13, margin: "2px 0 0", fontStyle: user?.email ? "normal" : "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.email || "Not provided"}
              </p>
            </div>
          </div>

          {/* Username */}
          <div className="profile-row">
            <span style={{ color: "rgba(99,102,241,0.7)", flexShrink: 0 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </span>
            <div style={{ minWidth: 0 }}>
              <p style={{ color: "rgba(148,163,184,0.4)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Username</p>
              <p style={{ color: user?.username && !user?.isGuest ? "#cbd5e1" : "rgba(148,163,184,0.3)", fontSize: 13, margin: "2px 0 0", fontStyle: (!user?.username || user?.isGuest) ? "italic" : "normal" }}>
                {user?.username && !user?.isGuest ? user.username : "Not provided"}
              </p>
            </div>
          </div>

          {/* Login time */}
          <div className="profile-row">
            <span style={{ color: "rgba(99,102,241,0.7)", flexShrink: 0 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </span>
            <div style={{ minWidth: 0 }}>
              <p style={{ color: "rgba(148,163,184,0.4)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Session started</p>
              <p style={{ color: "#cbd5e1", fontSize: 12, margin: "2px 0 0" }}>
                {formatDate(user?.loginAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button className="logout-btn" onClick={handleLogout}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Sign out
        </button>
      </div>
    </>
  );
}