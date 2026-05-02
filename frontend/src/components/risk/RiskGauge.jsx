import React, { useEffect, useState } from "react";

// Score rules:
// 1-3  → LOW      (green)
// 4-6  → MEDIUM   (yellow)
// 7    → MODERATE (orange)
// 8-10 → HIGH     (red)

const ZONES = [
  { label: "Low",      color: "#16a34a", from: 0,   to: 3   },
  { label: "Medium",   color: "#eab308", from: 3,   to: 6   },
  { label: "Moderate", color: "#f97316", from: 6,   to: 7   },
  { label: "High",     color: "#dc2626", from: 7,   to: 10  },
];

// Map risk level string → score number
export function riskLevelToScore(level) {
  switch ((level || "").toUpperCase()) {
    case "LOW":      return 2;
    case "MEDIUM":   return 5;
    case "MODERATE": return 7;
    case "HIGH":     return 9;
    default:         return 0;
  }
}

function scoreToColor(score) {
  if (score <= 3)  return "#16a34a";
  if (score <= 6)  return "#eab308";
  if (score === 7) return "#f97316";
  return "#dc2626";
}

function scoreToLabel(score) {
  if (score <= 3)  return "LOW RISK";
  if (score <= 6)  return "MEDIUM RISK";
  if (score === 7) return "MODERATE RISK";
  return "HIGH RISK";
}

// Convert score (0-10) → angle in degrees
// Gauge sweeps from -180° (left) to 0° (right) = 180° total
function scoreToAngle(score) {
  const clamped = Math.max(0, Math.min(10, score));
  return -90 + (clamped / 10) * 180;
}

// Polar → cartesian (cx=200, cy=200, r=150)
function polar(angleDeg, r = 150, cx = 200, cy = 200) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

// Build SVG arc path for a zone segment
function arcPath(fromScore, toScore, outerR = 150, innerR = 100) {
  const startAngle = -90 + (fromScore / 10) * 180;
  const endAngle   = -90 + (toScore   / 10) * 180;

  const o1 = polar(startAngle, outerR);
  const o2 = polar(endAngle,   outerR);
  const i1 = polar(endAngle,   innerR);
  const i2 = polar(startAngle, innerR);

  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${o1.x} ${o1.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${i2.x} ${i2.y}`,
    "Z",
  ].join(" ");
}

export default function RiskGauge({ score = 0 }) {
  const [animated, setAnimated] = useState(0);

  // Animate needle from 0 to score on mount / score change
  useEffect(() => {
    setAnimated(0);
    const start = performance.now();
    const duration = 1200;

    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3); // ease-out-cubic
      setAnimated(ease * score);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [score]);

  const needleAngle = scoreToAngle(animated);
  const color       = scoreToColor(score);
  const label       = scoreToLabel(score);

  // Needle tip & base
  const tip  = polar(needleAngle, 128);
  const baseL = polar(needleAngle + 90, 12);
  const baseR = polar(needleAngle - 90, 12);

  // Tick marks
  const ticks = Array.from({ length: 11 }, (_, i) => {
    const angle = -90 + (i / 10) * 180;
    const inner = polar(angle, 156);
    const outer = polar(angle, 168);
    return { inner, outer, label: i, angle };
  });

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-row items-center justify-between w-full">
        {/* ── Left side: Text Score ── */}
        <div className="flex flex-col items-center justify-center w-1/3 px-2">
          <div className="flex items-baseline gap-1">
            <span className="text-[56px] font-black leading-none" style={{ color }}>
              {score}
            </span>
            <span className="text-xl font-bold" style={{ color: "#9ca3af" }}>
              /10
            </span>
          </div>
          <div
            className="text-sm font-bold mt-3 text-center"
            style={{ color, letterSpacing: "1px" }}
          >
            {label}
          </div>
          <div
            className="text-[10px] font-bold mt-1 text-center"
            style={{ color: "#9ca3af", letterSpacing: "1.5px" }}
          >
            RISK SCORE
          </div>
        </div>

        {/* ── Right side: Speedometer ── */}
        <div className="w-2/3 max-w-[280px] flex justify-center">
          <svg
            viewBox="30 40 340 180"
            className="w-full"
            style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.10))" }}
          >
            <defs>
              {/* Glossy overlay gradient */}
              <radialGradient id="gloss" cx="50%" cy="30%" r="60%">
                <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0"    />
              </radialGradient>

              {/* Needle gradient */}
              <linearGradient id="needle-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#1a1a2e" />
                <stop offset="100%" stopColor="#374151" />
              </linearGradient>

              {/* Drop shadow filter */}
              <filter id="shadow">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
              </filter>
            </defs>

            {/* ── Background disc ── */}
            <circle cx="200" cy="200" r="170" fill="#f8f8f6" filter="url(#shadow)" />
            <circle cx="200" cy="200" r="170" fill="url(#gloss)" />

            {/* ── Grey track (full semicircle) ── */}
            <path d={arcPath(0, 10, 152, 98)} fill="#e5e7eb" />

            {/* ── Coloured zone arcs ── */}
            {ZONES.map((z) => (
              <path
                key={z.label}
                d={arcPath(z.from, z.to, 150, 100)}
                fill={z.color}
                opacity="0.92"
              />
            ))}

            {/* ── Inner white donut (clean look) ── */}
            <circle cx="200" cy="200" r="98"  fill="white" />
            <circle cx="200" cy="200" r="170" fill="none" stroke="#e5e7eb" strokeWidth="1" />

            {/* ── Tick marks ── */}
            {ticks.map((t, i) => (
              <g key={i}>
                <line
                  x1={t.inner.x} y1={t.inner.y}
                  x2={t.outer.x} y2={t.outer.y}
                  stroke="#9ca3af"
                  strokeWidth={i % 5 === 0 ? 2.5 : 1}
                />
              </g>
            ))}

            {/* ── Zone labels ── */}
            {[
              { score: 1.5, text: "Low" },
              { score: 4.5, text: "Med" },
              { score: 6.5, text: "Mod" },
              { score: 8.5, text: "High" },
            ].map(({ score: s, text }) => {
              const angle = -90 + (s / 10) * 180;
              const pos   = polar(angle, 124);
              return (
                <text
                  key={text}
                  x={pos.x} y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="11"
                  fontWeight="700"
                  fill="#6b7280"
                  fontFamily="'Segoe UI', sans-serif"
                >
                  {text}
                </text>
              );
            })}

            {/* ── Needle ── */}
            <polygon
              points={`${tip.x},${tip.y} ${baseL.x},${baseL.y} ${baseR.x},${baseR.y}`}
              fill="url(#needle-grad)"
              style={{ transition: "all 0.05s linear" }}
            />

            {/* ── Needle centre cap ── */}
            <circle cx="200" cy="200" r="14" fill="#1a1a2e" />
            <circle cx="200" cy="200" r="7"  fill="#c8460a" />
            <circle cx="200" cy="200" r="3"  fill="white"   />

            {/* ── Scale labels: 0 and 10 ── */}
            <text x="52"  y="208" textAnchor="middle" fontSize="12" fill="#9ca3af" fontWeight="700">0</text>
            <text x="348" y="208" textAnchor="middle" fontSize="12" fill="#9ca3af" fontWeight="700">10</text>
          </svg>
        </div>
      </div>

      {/* ── Zone legend ── */}
      <div className="flex gap-4 mt-6 flex-wrap justify-center w-full">
        {ZONES.map((z) => (
          <div key={z.label} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: z.color }}
            />
            <span className="text-[10px] font-semibold" style={{ color: "#6b7280" }}>
              {z.label} ({z.from === 0 ? "1" : z.from}–{z.to})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}