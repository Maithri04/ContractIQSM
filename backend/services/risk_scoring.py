"""
services/risk_scoring.py

Computes a weighted risk score (0–10) from a contract's clauses.
Weights: penalty=3, liability=3, termination=2.
Returns structured data + human-readable UI text.
"""
from pathlib import Path
from typing import Any, Dict, List

from loguru import logger

from ingestion.pdf_parser import extract_pdf_pages
from ingestion.chunker import chunk_pages


CLAUSE_CONFIG: Dict[str, Dict] = {
    "penalty": {
        "weight": 3,
        "keywords": [
            "penalty", "penalize", "fine", "forfeit", "liquidated damages",
            "breach fee", "late fee", "damages",
        ],
        "label": "Penalty Clause",
    },
    "liability": {
        "weight": 3,
        "keywords": [
            "liable", "liability", "indemnif", "indemnity", "hold harmless",
            "limit of liability", "consequential", "negligence",
        ],
        "label": "Liability Clause",
    },
    "termination": {
        "weight": 2,
        "keywords": [
            "terminat", "termination", "notice period", "end of contract",
            "cancel", "rescind", "expir", "exit clause",
        ],
        "label": "Termination Clause",
    },
}

MAX_WEIGHT = sum(c["weight"] for c in CLAUSE_CONFIG.values())  # 8


def _find_clause(chunks: List[Dict], keywords: List[str]) -> tuple[bool, str]:
    """
    Search chunks for keyword matches.
    Returns (found: bool, excerpt: str).
    """
    best_chunk = ""
    best_hits = 0
    for chunk in chunks:
        text_lower = chunk["text"].lower()
        hits = sum(1 for kw in keywords if kw in text_lower)
        if hits > best_hits:
            best_hits = hits
            best_chunk = chunk["text"]
    if not best_chunk:
        return False, "Not detected in this contract."
    excerpt = best_chunk.strip()[:250]
    return True, excerpt + ("..." if len(best_chunk) > 250 else "")


def score_contract(file_path: Path) -> Dict[str, Any]:
    """
    Analyze a single contract and return a weighted risk score.

    Parameters
    ----------
    file_path : Path to the uploaded PDF

    Returns
    -------
    dict with keys: success, data (score, level, breakdown), ui_text
    """
    logger.info(f"[RISK SCORE] Scoring: {file_path.name}")

    try:
        pages = extract_pdf_pages(file_path)
        if not pages:
            return _empty_response("No text could be extracted from this PDF.")

        chunks = chunk_pages(pages)
        if not chunks:
            return _empty_response("No clauses could be identified in this document.")

    except Exception as exc:
        logger.exception(f"[RISK SCORE] Extraction failed: {exc}")
        return _empty_response(f"Processing error: {exc}")

    breakdown = []
    total_score_earned = 0

    for clause_key, config in CLAUSE_CONFIG.items():
        found, excerpt = _find_clause(chunks, config["keywords"])
        contribution = config["weight"] if found else 0
        total_score_earned += contribution
        breakdown.append({
            "clause": config["label"],
            "weight": config["weight"],
            "found": found,
            "excerpt": excerpt,
            "contribution": contribution,
        })

    # Scale to 0–10
    score = round((total_score_earned / MAX_WEIGHT) * 10)
    level = _risk_level(score)

    # Build UI text
    found_clauses = [b["clause"] for b in breakdown if b["found"]]
    missing_clauses = [b["clause"] for b in breakdown if not b["found"]]

    if found_clauses:
        risk_detail = f"Major risks include: {', '.join(found_clauses)}."
    else:
        risk_detail = "No major risk clauses were detected."

    if missing_clauses:
        safe_detail = f"The following clauses were not found: {', '.join(missing_clauses)}."
    else:
        safe_detail = ""

    term_b = next((b for b in breakdown if "Termination" in b["clause"]), None)
    term_note = ""
    if term_b and term_b["found"]:
        term_note = " The termination condition is moderate."

    ui_text = (
        f"This contract has a {level} risk ({score}/10). "
        f"{risk_detail} {safe_detail}{term_note}"
    ).strip()

    logger.info(f"[RISK SCORE] Done: score={score} level={level}")

    return {
        "success": True,
        "data": {
            "score": score,
            "level": level,
            "breakdown": breakdown,
        },
        "ui_text": ui_text,
        "summary": ui_text,
    }


def _risk_level(score: int) -> str:
    if score >= 7:
        return "HIGH"
    if score >= 4:
        return "MEDIUM"
    return "LOW"


def _empty_response(reason: str) -> Dict[str, Any]:
    return {
        "success": False,
        "data": {
            "score": 0,
            "level": "UNKNOWN",
            "breakdown": [],
        },
        "ui_text": reason,
        "summary": reason,
    }