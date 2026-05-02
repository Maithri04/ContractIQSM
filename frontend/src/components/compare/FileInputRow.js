import React, { useRef } from "react";
import { FileText, Image, X } from "lucide-react";

const IMAGE_EXTS = ["png", "jpg", "jpeg", "webp", "bmp", "tiff"];

function getFileType(file) {
  if (!file) return null;
  const ext = file.name.split(".").pop().toLowerCase();
  return IMAGE_EXTS.includes(ext) ? "image" : "document";
}

function getLabel(file, index) {
  if (!file) return null;
  const type = getFileType(file);
  const ext  = file.name.split(".").pop().toUpperCase();
  if (type === "image") return `Image ${String.fromCharCode(65 + index)} (${ext})`;
  return `Contract ${String.fromCharCode(65 + index)} (${ext})`;
}

export default function FileInputRow({ entry, index, onChange, onRemove, canRemove }) {
  const inputRef = useRef();
  const fileType = getFileType(entry.file);
  const label    = getLabel(entry.file, index);

  function handleChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const type = getFileType(file);
    onChange(entry.id, file, type);
  }

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 hover:scale-[1.01]"
      style={{
        background:   "#ffffff",
        borderColor:  entry.file ? "#86efac" : "#e0d8cc",
        boxShadow:    "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      {/* Slot label */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
        style={{ background: "#1a1a2e", color: "#fff" }}
      >
        {String.fromCharCode(65 + index)}
      </div>

      {/* Choose button */}
      <button
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shrink-0 transition-all duration-200 hover:opacity-90"
        style={{ background: "#1a1a2e" }}
      >
        {fileType === "image" ? <Image size={14} /> : <FileText size={14} />}
        {entry.file ? "Change" : "Choose file or image"}
      </button>

      {/* File name display */}
      <div
        className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-sm truncate border"
        style={
          entry.file
            ? { background: "#f0fdf4", borderColor: "#86efac", color: "#15803d" }
            : { background: "#f7f5f1", borderColor: "#e0d8cc", color: "#9ca3af" }
        }
      >
        {entry.file ? (
          <>
            {fileType === "image"
              ? <Image size={13} style={{ color: "#16a34a", flexShrink: 0 }} />
              : <FileText size={13} style={{ color: "#16a34a", flexShrink: 0 }} />
            }
            <span className="truncate font-semibold">{entry.file.name}</span>
            <span
              className="ml-auto shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: fileType === "image" ? "#eff6ff" : "#f0fdf4",
                color:      fileType === "image" ? "#1d4ed8" : "#15803d",
              }}
            >
              {label}
            </span>
          </>
        ) : (
          <span>No file chosen</span>
        )}
      </div>

      {/* Remove button */}
      {canRemove && (
        <button
          onClick={() => onRemove(entry.id)}
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-150"
          style={{ color: "#9ca3af" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
          title="Remove"
        >
          <X size={15} />
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt,image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}