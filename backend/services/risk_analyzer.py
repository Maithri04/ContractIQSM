"""
Risk level extraction from LLM response text.
Parses the structured output for risk level and key risk titles.
"""
import re
from typing import Dict, Any


# Risk keywords for heuristic pre-screening
HIGH_RISK_KEYWORDS = [
    "termination", "penalty", "penalt", "forfeit", "liquidated damages",
    "breach", "indemnif", "liable", "liability", "lawsuit", "litigation",
    "arbitration", "non-compete", "non compete", "restraint of trade",
]
MEDIUM_RISK_KEYWORDS = [
    "notice period", "confidential", "intellectual property", "ip rights",
    "non-disclosure", "nda", "assignment", "exclusivity", "auto-renew",
    "automatic renewal", "price escalation",
]


def extract_risk_level(llm_response: str) -> str:
    """
    Extract risk level string from LLM output.
    Returns 'HIGH', 'MEDIUM', 'LOW', or 'UNKNOWN'.
    """
    match = re.search(
        r"Overall Risk Level[:\s]*(HIGH|MEDIUM|LOW)", llm_response, re.IGNORECASE
    )
    if match:
        return match.group(1).upper()
    return "UNKNOWN"


def heuristic_risk_score(text: str) -> str:
    """
    Fast keyword-based pre-screening before the LLM call.
    Useful for UI indicators while waiting for LLM.
    """
    text_lower = text.lower()
    high_hits = sum(1 for kw in HIGH_RISK_KEYWORDS if kw in text_lower)
    medium_hits = sum(1 for kw in MEDIUM_RISK_KEYWORDS if kw in text_lower)

    if high_hits >= 2:
        return "HIGH"
    elif high_hits == 1 or medium_hits >= 2:
        return "MEDIUM"
    elif medium_hits == 1:
        return "LOW"
    return "UNKNOWN"


def parse_risk_response(llm_response: str, sources: list) -> Dict[str, Any]:
    """
    Parse the structured LLM output into a clean dict for the API response.
    """
    risk_level = extract_risk_level(llm_response)

    # Extract summary block
    summary_match = re.search(
        r"📌\s*Summary[:\s]*(.*?)(?=⚠️|📄|💡|\Z)", llm_response, re.DOTALL
    )
    summary = summary_match.group(1).strip() if summary_match else ""

    # Extract recommendation
    rec_match = re.search(
        r"💡\s*Recommendation[:\s]*(.*?)(?=\Z)", llm_response, re.DOTALL
    )
    recommendation = rec_match.group(1).strip() if rec_match else ""

    return {
        "answer": llm_response,
        "risk_level": risk_level,
        "summary": summary,
        "recommendation": recommendation,
        "sources": sources,
    }