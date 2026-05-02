import React from "react";

export default function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-2xl border p-6 ${className}`}
      style={{ borderColor: "#e0d8cc", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}
    >
      {children}
    </div>
  );
}