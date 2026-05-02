import { useAppContext } from "../context/AppContext";

export function useRisk() {
  const { riskResult } = useAppContext();
  return { riskResult };
}