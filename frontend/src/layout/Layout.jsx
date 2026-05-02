import React from "react";

// Simple wrapper — extend this if you add a sidebar later
export default function Layout({ children }) {
  return (
    <div style={{ minHeight: "100vh", background: "#f0ede6" }}>
      {children}
    </div>
  );
}