import { useAppContext } from "../context/AppContext";
import { uploadFiles }   from "../api/uploadApi";
import { getRiskScore }  from "../api/riskApi";
import { updateHistory } from "../api/historyApi";
import { useProcessing } from "./useProcessing";

export function useUpload() {
  const {
    pdfFile, imageFile,
    setUploadResult, setRiskResult,
  } = useAppContext();

  const { startSteps, completeStep, clearSteps } = useProcessing();

  async function runUpload() {
    if (!pdfFile && !imageFile) throw new Error("Select at least one file.");

    startSteps();

    // Step 0 — Uploading
    completeStep(0);
    const res = await uploadFiles({ pdfFile, imageFile });
    setUploadResult(res);

    // Step 1 — Extracting text (complete after upload returns)
    completeStep(1);

    // Step 2 — Chunking
    await delay(300);
    completeStep(2);

    // Step 3 — Embedding
    await delay(300);
    completeStep(3);

    // Step 4 — Storing
    await delay(300);
    completeStep(4);

    // Step 5 — Risk score (call /risk-score if PDF present)
    if (pdfFile) {
      try {
        const risk = await getRiskScore(pdfFile);
        setRiskResult(risk);
        if (res?.result?.file_hash) {
          await updateHistory(res.result.file_hash, {
            risk_level: risk.data?.level || "UNKNOWN",
            analysis: risk
          });
        }
      } catch (_) {
        // non-fatal — risk score optional
      }
    }
    completeStep(5);

    // Step 6 — Ready
    await delay(200);
    completeStep(6);

    // Auto-hide tracker after 4 s
    setTimeout(() => clearSteps(), 4000);

    return res;
  }

  return { runUpload };
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}