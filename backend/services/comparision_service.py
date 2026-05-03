"""
services/comparison_service.py

Compares multiple uploaded contracts (PDF, DOCX, TXT, or images)
across penalty, termination, and liability clauses.
Images are processed via OCR before comparison.
Returns structured data + human-readable UI text.
"""
from pathlib import Path
from typing import Any, Dict, List

from loguru import logger

from ingestion.pdf_parser      import extract_pdf_pages
from ingestion.image_ocr       import ocr_image_sync as ocr_image
from ingestion.chunker         import chunk_pages, chunk_image_text
from ingestion.cleaner         import clean_text


# ── Clause keyword groups ─────────────────────────────────────────────────────
CLAUSE_KEYWORDS: Dict[str, List[str]] = {
    "penalty": [
        "penalty", "penalize", "fine", "forfeit", "liquidated damages",
        "breach fee", "late fee", "damages", "surcharge",
    ],
    "termination": [
        "terminat", "termination", "notice period", "end of contract",
        "cancel", "rescind", "expir", "exit clause", "early exit",
    ],
    "liability": [
        "liable", "liability", "indemnif", "indemnity", "hold harmless",
        "limit of liability", "consequential", "negligence", "warranty",
    ],
}

RISK_WEIGHTS   = {"penalty": 3, "liability": 3, "termination": 2}
MAX_WEIGHT     = sum(RISK_WEIGHTS.values())  # 8
IMAGE_EXTS     = {".png", ".jpg", ".jpeg", ".tiff", ".tif", ".webp", ".bmp"}
DOCUMENT_EXTS  = {".pdf", ".txt", ".md", ".csv", ".docx"}


# ── Helpers ───────────────────────────────────────────────────────────────────

def _is_image(path: Path) -> bool:
    return path.suffix.lower() in IMAGE_EXTS


def _extract_chunks(path: Path) -> List[Dict]:
    """
    Extract text chunks from any supported file type.
    Images → OCR → chunk_image_text
    Documents → extract_pdf_pages / read_text → chunk_pages
    """
    ext = path.suffix.lower()

    if _is_image(path):
        logger.info(f"[COMPARE] OCR processing: {path.name}")
        ocr_result = ocr_image(path)
        if not ocr_result["text"].strip():
            logger.warning(f"[COMPARE] OCR returned empty text for {path.name}")
            return []
        return chunk_image_text(ocr_result)

    if ext == ".pdf":
        pages = extract_pdf_pages(path)
        if not pages:
            return []
        return chunk_pages(pages)

    # Plaintext fallback: .txt / .md / .csv / .docx etc.
    try:
        if ext == ".docx":
            import docx
            doc   = docx.Document(str(path))
            text  = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
        else:
            text = path.read_text(encoding="utf-8", errors="ignore")

        cleaned = clean_text(text)
        if not cleaned.strip():
            return []
        pages = [{"page_num": 1, "text": cleaned, "char_count": len(cleaned)}]
        return chunk_pages(pages)
    except Exception as exc:
        logger.warning(f"[COMPARE] Text extraction failed for {path.name}: {exc}")
        return []


def _find_clause_excerpt(chunks: List[Dict], clause_type: str) -> str:
    """Return the best matching chunk excerpt for a clause type."""
    keywords = CLAUSE_KEYWORDS[clause_type]
    best, best_hits = "", 0
    for chunk in chunks:
        text_lower = chunk["text"].lower()
        hits = sum(1 for kw in keywords if kw in text_lower)
        if hits > best_hits:
            best_hits = hits
            best = chunk["text"]
    if not best:
        return "Not found"
    return best.strip()[:200] + ("..." if len(best) > 200 else "")


def _compute_risk_score(findings: Dict[str, str]) -> int:
    """Weighted 0-10 risk score from clause findings."""
    earned = sum(
        w for clause, w in RISK_WEIGHTS.items()
        if findings.get(clause, "Not found") != "Not found"
    )
    return round((earned / MAX_WEIGHT) * 10)


def _risk_level(score: int) -> str:
    if score >= 7: return "HIGH"
    if score >= 4: return "MEDIUM"
    return "LOW"


# ── Public entry point ────────────────────────────────────────────────────────

def compare_contracts(file_paths: List[Path]) -> Dict[str, Any]:
    """
    Compare multiple contracts (PDFs, images, text files).

    Parameters
    ----------
    file_paths : list of Path objects

    Returns
    -------
    dict with keys:
      success, data, ui_text, comparison_summary,
      safest_contract, riskiest_contract
    """
    logger.info(f"[COMPARE] Comparing {len(file_paths)} files")
    results = []

    for path in file_paths:
        logger.info(f"[COMPARE] Processing: {path.name}")
        try:
            chunks = _extract_chunks(path)
            if not chunks:
                logger.warning(f"[COMPARE] No chunks from {path.name}, skipping")
                continue

            findings: Dict[str, str] = {
                clause: _find_clause_excerpt(chunks, clause)
                for clause in CLAUSE_KEYWORDS
            }

            score = _compute_risk_score(findings)
            level = _risk_level(score)

            results.append({
                "contract_name": f"Contract {len(results) + 1}",
                "file_type":     "image" if _is_image(path) else "document",
                "penalty":       findings["penalty"],
                "termination":   findings["termination"],
                "liability":     findings["liability"],
                "risk_level":    level,
                "risk_score":    score,
            })

        except Exception as exc:
            logger.exception(f"[COMPARE] Failed for {path.name}: {exc}")
            continue

    if not results:
        return {
            "success":            False,
            "data":               [],
            "ui_text":            "No files could be processed. Please upload valid PDFs or images.",
            "comparison_summary": "",
            "safest_contract":    None,
            "riskiest_contract":  None,
        }

    safest   = min(results, key=lambda x: x["risk_score"])
    riskiest = max(results, key=lambda x: x["risk_score"])

    # Build plain-English summary
    lines = []
    for c in results:
        found = [k for k in ["penalty", "liability", "termination"]
                 if c[k] != "Not found"]
        if found:
            lines.append(
                f"{c['contract_name']} has {c['risk_level']} risk ({c['risk_score']}/10) "
                f"with {', '.join(found)} clauses present."
            )
        else:
            lines.append(
                f"{c['contract_name']} has LOW risk ({c['risk_score']}/10) "
                f"with no major risk clauses detected."
            )

    ui_text = " ".join(lines)

    if safest["contract_name"] != riskiest["contract_name"]:
        comparison_summary = (
            f"{safest['contract_name']} is the safest (score: {safest['risk_score']}/10). "
            f"{riskiest['contract_name']} carries the highest risk (score: {riskiest['risk_score']}/10)."
        )
    else:
        comparison_summary = (
            f"All contracts carry similar risk. "
            f"{safest['contract_name']} scored {safest['risk_score']}/10."
        )

    logger.info(f"[COMPARE] Done: {len(results)} contracts compared")

    return {
        "success":            True,
        "data":               results,
        "ui_text":            ui_text,
        "comparison_summary": comparison_summary,
        "safest_contract":    safest["contract_name"],
        "riskiest_contract":  riskiest["contract_name"],
    }