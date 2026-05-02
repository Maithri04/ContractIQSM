import React, { useState, useRef } from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";
import Card from "../common/Card";
import Button from "../common/Button";
import Badge from "../common/Badge";
import Loader from "../common/Loader";
import ResetButton from "../common/ResetButton.js";
import FileUpload from "./FileUpload";
import ImageUpload from "./ImageUpload";
import { useAppContext } from "../../context/AppContext";
import { useUpload } from "../../hooks/useUpload";
import { useReset } from "../../hooks/useReset";

export default function UploadBox() {
  const {
    pdfFile, setPdfFile,
    imageFile, setImageFile,
    uploadResult,
  } = useAppContext();

  const { runUpload } = useUpload();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  // Refs passed to useReset so file inputs clear visually
  const pdfInputRef = useRef();
  const imgInputRef = useRef();

  const { runReset, resetting, resetDone, error: resetError } =
    useReset({ pdfInputRef, imgInputRef });

  async function handleUpload() {
    if (!pdfFile && !imageFile) {
      setError("Please select at least one file.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await runUpload();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      {/* Header row with Reset button top-right */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">📄</span>
            <h2 className="font-bold text-base" style={{ color: "#1a1a2e" }}>
              Upload documents
            </h2>
          </div>
          <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
            Upload a contract PDF and/or a clause screenshot.
          </p>
        </div>

        {/* Reset button — top right */}
        <ResetButton
          onReset={runReset}
          resetting={resetting}
          resetDone={resetDone}
          error={resetError}
        />
      </div>

      <div className="h-px my-4" style={{ background: "#e0d8cc" }} />

      {/* File pickers — pass refs so reset can clear them */}
      <FileUpload
        label="Contract file (PDF / DOCX / TXT)"
        file={pdfFile}
        setFile={setPdfFile}
        inputRef={pdfInputRef}
      />
      <ImageUpload
        label="Clause screenshot"
        file={imageFile}
        setFile={setImageFile}
        inputRef={imgInputRef}
      />

      {/* Upload error */}
      {error && (
        <div
          className="flex items-center gap-2 text-sm px-4 py-3 rounded-xl mb-4"
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

      <Button
        full
        variant="primary"
        onClick={handleUpload}
        disabled={loading || resetting}
      >
        {loading ? (
          <><Loader size={16} color="#fff" /><span>Processing…</span></>
        ) : (
          "⬆ Upload & process"
        )}
      </Button>

      {/* Success banner */}
      {uploadResult && !loading && (
        <div
          className="flex items-center gap-3 mt-4 px-4 py-3 rounded-xl text-sm font-semibold"
          style={{
            background: "#f0fdf4",
            border:     "1px solid #86efac",
            color:      "#14532d",
          }}
        >
          <CheckCircle size={16} className="shrink-0" />
          <span>
            <strong>Success</strong>
            {uploadResult.pdf_chunks   != null && ` — ${uploadResult.pdf_chunks} chunks indexed`}
            {uploadResult.image_chunks != null && ` | Image chunks: ${uploadResult.image_chunks}`}
          </span>
          {uploadResult.heuristic_risk && (
            <span className="flex items-center gap-1 ml-auto whitespace-nowrap">
              Keyword scan: <Badge level={uploadResult.heuristic_risk} />
            </span>
          )}
        </div>
      )}
    </Card>
  );
}