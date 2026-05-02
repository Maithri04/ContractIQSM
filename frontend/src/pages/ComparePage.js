import React, { useState } from "react";
import { Plus, GitCompareArrows, AlertTriangle, Info, CheckCircle } from "lucide-react";
import FileInputRow    from "../components/compare/FileInputRow.js";
import ComparisonTable from "../components/compare/ComparisonTable.js";
import Loader          from "../components/common/Loader";
import { useCompare }  from "../hooks/useCompare.js";

const MAX_FILES = 5;

function makeEntry() {
  return { id: crypto.randomUUID(), file: null, type: null };
}

// ── Top-right processing steps panel ──────────────────────────────
function ProcessingSteps({ steps }) {
  if (!steps || steps.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 rounded-2xl p-5 min-w-[210px]"
      style={{
        background:  "#1a1a2e",
        boxShadow:   "0 8px 32px rgba(0,0,0,0.35)",
      }}
    >
      <p
        className="text-[10px] font-bold uppercase tracking-widest mb-4"
        style={{ color: "#6b7280" }}
      >
        PROCESSING
      </p>

      <ul className="space-y-2.5">
        {steps.map((step, i) => (
          <li key={i} className="flex items-center gap-3">
            {/* Icon */}
            {step.status === "done" ? (
              <CheckCircle
                size={16}
                style={{ color: "#16a34a", flexShrink: 0 }}
              />
            ) : step.status === "active" ? (
              <span
                style={{
                  width:           16,
                  height:          16,
                  borderRadius:    "50%",
                  background:      "#c8460a",
                  display:         "flex",
                  alignItems:      "center",
                  justifyContent:  "center",
                  flexShrink:      0,
                  fontSize:        9,
                  color:           "#fff",
                  fontWeight:      700,
                }}
              >
                {i + 1}
              </span>
            ) : (
              <span
                style={{
                  width:           16,
                  height:          16,
                  borderRadius:    "50%",
                  border:          "1.5px solid #374151",
                  display:         "flex",
                  alignItems:      "center",
                  justifyContent:  "center",
                  flexShrink:      0,
                  fontSize:        9,
                  color:           "#4b5563",
                  fontWeight:      700,
                }}
              >
                {i + 1}
              </span>
            )}

            {/* Label */}
            <span
              className="text-sm"
              style={{
                color:      step.status === "done"   ? "#ffffff"
                          : step.status === "active" ? "#d1d5db"
                          :                           "#4b5563",
                fontWeight: step.status !== "pending" ? 600 : 400,
              }}
            >
              {step.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────
export default function ComparePage() {
  const [entries, setEntries] = useState([makeEntry(), makeEntry()]);
  const { loading, result, error, steps, runCompare, reset } = useCompare();

  function handleChange(id, file, type) {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, file, type } : e))
    );
  }

  function handleRemove(id) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    reset();
  }

  function handleAdd() {
    if (entries.length < MAX_FILES) {
      setEntries((prev) => [...prev, makeEntry()]);
      reset();
    }
  }

  async function handleCompare() {
    await runCompare(entries);
  }

  const filledCount = entries.filter((e) => e.file).length;

  return (
    <>
      {/* Fixed top-right steps tracker */}
      <ProcessingSteps steps={steps} />

      <div
        className="min-h-screen py-8 px-4"
        style={{ background: "#f0ede6" }}
      >
        <div className="max-w-3xl mx-auto space-y-5">

          {/* ── Header ── */}
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: "#1a1a2e" }}>
              Compare Contracts
            </h1>
            <p className="text-sm mt-1" style={{ color: "#9ca3af" }}>
              Compare clauses across documents and images — PDFs, DOCX, TXT, and screenshots.
            </p>
          </div>

          {/* ── Upload card ── */}
          <div
            className="bg-white rounded-2xl p-6"
            style={{ border: "1px solid #e0d8cc", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}
          >
            {/* Card header */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <GitCompareArrows size={17} style={{ color: "#1a1a2e" }} />
                <h2 className="font-bold text-base" style={{ color: "#1a1a2e" }}>
                  Upload files to compare
                </h2>
              </div>
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: "#f7f5f1", border: "1px solid #e0d8cc", color: "#6b7280" }}
              >
                {filledCount} / {MAX_FILES} files
              </span>
            </div>
            <p className="text-xs mb-5" style={{ color: "#9ca3af" }}>
              Upload 2–5 contracts (PDF / DOCX / TXT / image). All inputs are treated uniformly.
            </p>
            <div className="h-px mb-5" style={{ background: "#e0d8cc" }} />

            {/* Info tip */}
            <div
              className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs mb-5"
              style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1d4ed8" }}
            >
              <Info size={13} className="shrink-0 mt-0.5" />
              <span>
                Images are processed via OCR and compared on equal footing with documents.
                File type is auto-detected from extension.
              </span>
            </div>

            {/* File input rows */}
            <div className="space-y-3 mb-4">
              {entries.map((entry, i) => (
                <FileInputRow
                  key={entry.id}
                  entry={entry}
                  index={i}
                  onChange={handleChange}
                  onRemove={handleRemove}
                  canRemove={entries.length > 2}
                />
              ))}
            </div>

            {/* Add file button */}
            {entries.length < MAX_FILES && (
              <button
                onClick={handleAdd}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 mb-5"
                style={{
                  border:     "2px dashed #e0d8cc",
                  color:      "#6b7280",
                  background: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#1a1a2e";
                  e.currentTarget.style.color       = "#1a1a2e";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e0d8cc";
                  e.currentTarget.style.color       = "#6b7280";
                }}
              >
                <Plus size={15} />
                Add Another File or Image
              </button>
            )}

            {/* Validation error */}
            {error && (
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm mb-4"
                style={{
                  background: "#fef2f2",
                  border:     "1px solid #fca5a5",
                  color:      "#7f1d1d",
                }}
              >
                <AlertTriangle size={14} />
                {error}
              </div>
            )}

            {/* Compare button */}
            <button
              onClick={handleCompare}
              disabled={loading || filledCount < 2}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200"
              style={{
                background: loading || filledCount < 2 ? "#9ca3af" : "#16a34a",
                cursor:     loading || filledCount < 2 ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <>
                  <Loader size={16} color="#fff" />
                  Analyzing documents and images…
                </>
              ) : (
                <>
                  <GitCompareArrows size={16} />
                  Compare Contracts
                </>
              )}
            </button>

            {filledCount < 2 && !loading && (
              <p className="text-center text-xs mt-2" style={{ color: "#d97706" }}>
                Upload at least 2 files to enable comparison.
              </p>
            )}
          </div>

          {/* ── Results ── */}
          {result?.success && (
            <div
              className="bg-white rounded-2xl p-6"
              style={{ border: "1px solid #e0d8cc", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}
            >
              <div className="flex items-center gap-2 mb-5">
                <span className="text-base">📊</span>
                <h2 className="font-bold text-base" style={{ color: "#1a1a2e" }}>
                  Comparison Results
                </h2>
              </div>
              <ComparisonTable result={result} />
            </div>
          )}

        </div>
      </div>
    </>
  );
}