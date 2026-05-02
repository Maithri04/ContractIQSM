import { useState } from "react";
import { compareContracts } from "../api/compareApi";

const COMPARE_STEPS = [
  "Saving files",
  "Extracting text / OCR",
  "Identifying clauses",
  "Comparing contracts",
  "Generating summary",
  "Done",
];

export function useCompare() {
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState("");
  const [steps,   setSteps]   = useState([]);

  function initSteps() {
    setSteps(
      COMPARE_STEPS.map((label, i) => ({
        label,
        status: i === 0 ? "active" : "pending",
        index:  i,
      }))
    );
  }

  function tickStep(idx) {
    setSteps((prev) =>
      prev.map((s) => {
        if (s.index === idx)     return { ...s, status: "done"   };
        if (s.index === idx + 1) return { ...s, status: "active" };
        return s;
      })
    );
  }

  function clearSteps() {
    setSteps([]);
  }

  function delay(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  async function runCompare(files) {
    const valid = files.filter((f) => f.file);
    if (valid.length < 2) {
      setError("Please upload at least 2 files to compare.");
      return;
    }

    setError("");
    setResult(null);
    initSteps();
    setLoading(true);

    try {
      // Step 0 — Saving files
      tickStep(0);
      await delay(300);

      // Step 1 — Extracting (happens on backend, simulate progress)
      tickStep(1);
      await delay(400);

      // Step 2 — Identifying clauses
      tickStep(2);

      // Step 3 — API call (actual compare)
      tickStep(3);
      const data = await compareContracts(valid);
      setResult(data);

      // Step 4 — Generating summary
      tickStep(4);
      await delay(300);

      // Step 5 — Done
      tickStep(5);

      // Auto-hide steps after 4 seconds
      setTimeout(() => clearSteps(), 4000);

    } catch (e) {
      setError(e.message || "Comparison failed. Please try again.");
      clearSteps();
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setError("");
    clearSteps();
  }

  return { loading, result, error, steps, runCompare, reset };
}