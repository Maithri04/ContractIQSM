"""
services/scenario_generator.py

Extracts conditional clauses from a contract and generates
scenario-based questions with pre-computed answers.
Uses the LLM for natural language generation.
"""
import json
import re
from pathlib import Path
from typing import Any, Dict, List

from loguru import logger

from ingestion.pdf_parser import extract_pdf_pages
from ingestion.image_ocr import ocr_image
from ingestion.chunker import chunk_pages
from llm.generator import llm_generator


# Conditional trigger phrases that signal a scenario clause
CONDITIONAL_TRIGGERS = [
    "if ", "in the event", "in case", "should ", "upon ",
    "when ", "where ", "provided that", "unless ", "except ",
    "failure to", "in the event of", "subject to",
]

SCENARIO_SYSTEM_PROMPT = """You are a legal contract analyst. Given contract clause excerpts,
generate exactly 5 practical scenario questions a non-lawyer would ask, and a short plain-English answer for each.

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "questions": ["If you resign before 12 months -> what happens?", "If company terminates -> what happens?"],
  "answers": {
    "If you resign before 12 months -> what happens?": "You must pay a penalty.",
    "If company terminates -> what happens?": "There is no penalty."
  }
}

Rules:
- Questions MUST start with "If" and use an arrow "->" or ask a what-if question.
- Answers must be 1-2 sentences max.
- Use plain language, no legal jargon.
- Base everything only on the provided clauses."""


def _extract_conditional_chunks(chunks: List[Dict]) -> List[str]:
    """Filter chunks that contain conditional/scenario language."""
    conditional = []
    for chunk in chunks:
        text_lower = chunk["text"].lower()
        if any(trigger in text_lower for trigger in CONDITIONAL_TRIGGERS):
            conditional.append(chunk["text"])
    return conditional[:8]  # cap at 8 to stay within token limits


def _build_context(conditional_chunks: List[str]) -> str:
    """Build a compact context string from conditional chunks."""
    joined = "\n\n---\n\n".join(conditional_chunks)
    # Truncate to ~2000 chars to keep LLM prompt manageable
    return joined[:2000] + ("..." if len(joined) > 2000 else "")


def _parse_llm_json(raw: str) -> Dict:
    """Safely parse JSON from LLM response, stripping any markdown fences."""
    # Strip ```json ... ``` fences if present
    cleaned = re.sub(r"```(?:json)?", "", raw).replace("```", "").strip()
    return json.loads(cleaned)


def _fallback_qa(chunks: List[Dict]) -> Dict:
    """Rule-based fallback when LLM fails or returns bad JSON."""
    logger.warning("[SCENARIOS] Using rule-based fallback Q&A")

    qa = {}
    questions = []

    keyword_map = {
        "penalty": (
            "What happens if I breach the contract?",
            "A financial penalty will apply as specified in the penalty clause.",
        ),
        "terminat": (
            "What if the contract is terminated early?",
            "Early termination conditions apply — review the termination clause for notice periods.",
        ),
        "liable": (
            "What if there is a dispute about liability?",
            "The liability clause limits or defines who is responsible for damages.",
        ),
        "confidential": (
            "What if I share confidential information?",
            "Sharing confidential information may result in legal action per the confidentiality clause.",
        ),
        "payment": (
            "What happens if payment is delayed?",
            "Late payment may attract interest or penalties as defined in the payment clause.",
        ),
    }

    full_text = " ".join(c["text"].lower() for c in chunks)
    for keyword, (q, a) in keyword_map.items():
        if keyword in full_text:
            questions.append(q)
            qa[q] = a

    if not questions:
        questions = ["What are the key obligations in this contract?"]
        qa["What are the key obligations in this contract?"] = (
            "Please review the contract document directly for specific obligations."
        )

    return {"questions": questions, "answers": qa}


def generate_scenarios(file_path: Path) -> Dict[str, Any]:
    """
    Extract conditional clauses and generate scenario Q&A.

    Parameters
    ----------
    file_path : Path to uploaded PDF

    Returns
    -------
    dict with keys: success, questions, answers, ui_text
    """
    logger.info(f"[SCENARIOS] Generating for: {file_path.name}")

    try:
        ext = file_path.suffix.lower()
        if ext == ".pdf":
            pages = extract_pdf_pages(file_path)
        else:
            ocr_res = ocr_image(file_path)
            pages = [{"page_num": 1, "text": ocr_res["text"], "char_count": len(ocr_res["text"])}]

        if not pages:
            return _empty_response("No text could be extracted from this PDF.")

        chunks = chunk_pages(pages)
        if not chunks:
            return _empty_response("No clauses could be identified in this document.")

    except Exception as exc:
        logger.exception(f"[SCENARIOS] Extraction failed: {exc}")
        return _empty_response(f"Processing error: {exc}")

    conditional_chunks = _extract_conditional_chunks(chunks)

    if not conditional_chunks:
        logger.warning("[SCENARIOS] No conditional clauses found, using all chunks")
        conditional_chunks = [c["text"] for c in chunks[:5]]

    context = _build_context(conditional_chunks)

    # Try LLM generation
    try:
        prompt = (
            f"{SCENARIO_SYSTEM_PROMPT}\n\n"
            f"Contract clauses:\n{context}"
        )
        raw_response = llm_generator.generate(
            context=context,
            question=prompt,
        )
        parsed = _parse_llm_json(raw_response)
        questions: List[str] = parsed.get("questions", [])
        answers: Dict[str, str] = parsed.get("answers", {})

        if not questions or not answers:
            raise ValueError("LLM returned empty questions/answers")

    except Exception as exc:
        logger.warning(f"[SCENARIOS] LLM generation failed ({exc}), using fallback")
        fallback = _fallback_qa(chunks)
        questions = fallback["questions"]
        answers = fallback["answers"]

    ui_text = (
        f"Found {len(questions)} scenario(s) in this contract. "
        "Click any question below to see what the contract says."
    )

    logger.info(f"[SCENARIOS] Done: {len(questions)} questions generated")

    return {
        "success": True,
        "scenarios": questions,
        "answers": answers,
        "chunks": chunks,
        "ui_text": ui_text,
    }


    return {
        "success": False,
        "scenarios": [],
        "answers": {},
        "chunks": [],
        "ui_text": reason,
    }