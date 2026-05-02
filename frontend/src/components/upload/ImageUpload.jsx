import React, { useRef } from "react";
import { Image, X } from "lucide-react";

export default function ImageUpload({
  label,
  file,
  setFile,
  inputRef: externalRef,
}) {
  const internalRef = useRef();
  const ref = externalRef || internalRef;

  return (
    <div className="mb-5">
      <p className="text-sm font-semibold mb-2" style={{ color: "#374151" }}>
        {label}{" "}
        <span className="font-normal text-xs" style={{ color: "#9ca3af" }}>(optional)</span>
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => ref.current?.click()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 shrink-0"
          style={{ background: "#1a1a2e" }}
        >
          <Image size={14} />
          Choose image
        </button>

        <div
          className="flex-1 px-4 py-2.5 rounded-xl text-sm truncate border"
          style={
            file
              ? { background: "#f0fdf4", borderColor: "#86efac", color: "#16a34a", fontWeight: 600 }
              : { background: "#f7f5f1", borderColor: "#e0d8cc", color: "#9ca3af" }
          }
        >
          {file ? file.name : "No file chosen"}
        </div>

        {file && (
          <button
            onClick={() => { setFile(null); ref.current.value = ""; }}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <X size={15} />
          </button>
        )}

        <input
          ref={ref}
          type="file"
          accept=".png,.jpg,.jpeg,.webp,.bmp"
          className="hidden"
          onChange={(e) => setFile(e.target.files[0] || null)}
        />
      </div>
    </div>
  );
}