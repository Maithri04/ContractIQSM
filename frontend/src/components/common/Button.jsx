import React from "react";

const variants = {
  primary:   { background: "#1a1a2e", color: "#fff" },
  orange:    { background: "#c8460a", color: "#fff" },
  green:     { background: "#16a34a", color: "#fff" },
  outline:   { background: "#fff",    color: "#1a1a2e", border: "2px solid #1a1a2e" },
  ghost:     { background: "transparent", color: "#1a1a2e" },
};

export default function Button({ children, variant = "primary", onClick, disabled, full, className = "", type = "button" }) {
  const style = variants[variant] || variants.primary;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={`
        ${full ? "w-full" : ""}
        flex items-center justify-center gap-2
        px-5 py-3 rounded-xl font-semibold text-sm
        transition-all duration-200 cursor-pointer
        ${disabled ? "opacity-40 cursor-not-allowed" : "hover:opacity-90 active:scale-[0.98]"}
        ${className}
      `}
    >
      {children}
    </button>
  );
}