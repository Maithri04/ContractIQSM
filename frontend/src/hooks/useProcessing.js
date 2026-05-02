import { useAppContext } from "../context/AppContext";
import { STEPS } from "../utils/constants";

export function useProcessing() {
  const { steps, initSteps, tickStep, clearSteps } = useAppContext();

  function startSteps() {
    initSteps(STEPS);
  }

  // Call after each backend stage completes
  // index: 0=Uploading 1=Extracting 2=Chunking 3=Embedding 4=Storing 5=RiskScore 6=Ready
  function completeStep(index) {
    tickStep(index);
  }

  function finishAll() {
    // tick remaining steps quickly
    STEPS.forEach((_, i) => tickStep(i));
  }

  return { steps, startSteps, completeStep, finishAll, clearSteps };
}