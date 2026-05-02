"""
Late Fusion Layer  🔥

Retrieves results independently from text and image indices,
re-ranks using weighted scores, deduplicates, and returns a
merged context string for the LLM prompt.
"""
from typing import List, Tuple, Dict, Any

from loguru import logger

from config.settings import get_settings
from .text_retriever import text_retriever
from .image_retriever import image_retriever


# ── Helpers ─────────────────────────────────────────────────────────────────

def _weighted_results(
    results: List[Tuple[Dict[str, Any], float]], weight: float
) -> List[Tuple[Dict[str, Any], float]]:
    """Scale cosine scores by a pipeline weight."""
    return [(meta, score * weight) for meta, score in results]


def _deduplicate(
    results: List[Tuple[Dict[str, Any], float]]
) -> List[Tuple[Dict[str, Any], float]]:
    """Remove exact-text duplicates, keeping highest score."""
    seen: dict[str, float] = {}
    deduped: List[Tuple[Dict[str, Any], float]] = []
    for meta, score in results:
        key = meta["text"][:120]  # fingerprint on first 120 chars
        if key not in seen or score > seen[key]:
            seen[key] = score
            deduped.append((meta, score))
    return deduped


def _format_context(
    text_results: List[Tuple[Dict[str, Any], float]],
    image_results: List[Tuple[Dict[str, Any], float]],
) -> str:
    """
    Build the final context string injected into the LLM prompt.
    Clearly marks TEXT and IMAGE sections for the model.
    """
    parts: List[str] = []

    if text_results:
        parts.append("=== TEXT (from PDF) ===")
        for i, (meta, score) in enumerate(text_results, 1):
            page = meta.get("page_num", "?")
            parts.append(
                f"[Text {i} | Page {page} | score={score:.3f}]\n{meta['text']}"
            )

    if image_results:
        parts.append("\n=== IMAGE (from screenshot OCR) ===")
        for i, (meta, score) in enumerate(image_results, 1):
            fname = meta.get("file_name", "image")
            parts.append(
                f"[Image {i} | File: {fname} | score={score:.3f}]\n{meta['text']}"
            )

    return "\n\n".join(parts)


# ── Public API ───────────────────────────────────────────────────────────────

class FusionRetriever:
    """
    Late Fusion retriever:
      1. Retrieve from text index
      2. Retrieve from image index
      3. Weight + merge + deduplicate
      4. Return formatted context + structured sources
    """

    def retrieve(self, query: str) -> Dict[str, Any]:
        settings = get_settings()

        # Independent retrieval
        raw_text = text_retriever.retrieve(query, top_k=settings.top_k_text)
        raw_image = image_retriever.retrieve(query, top_k=settings.top_k_image)

        logger.info(
            f"Fusion: {len(raw_text)} text hits, {len(raw_image)} image hits "
            f"for query='{query[:60]}'"
        )

        # Weight each pipeline
        weighted_text = _weighted_results(raw_text, settings.fusion_weight_text)
        weighted_image = _weighted_results(raw_image, settings.fusion_weight_image)

        # Deduplicate within each pool (cross-pool keep separate for context formatting)
        weighted_text = _deduplicate(weighted_text)
        weighted_image = _deduplicate(weighted_image)

        # Sort each pool by score (descending)
        weighted_text.sort(key=lambda x: x[1], reverse=True)
        weighted_image.sort(key=lambda x: x[1], reverse=True)

        # Build structured sources for UI
        sources = []
        for meta, score in weighted_text:
            sources.append(
                {
                    "type": "pdf",
                    "page_num": meta.get("page_num"),
                    "text_snippet": meta["text"][:200],
                    "score": round(score, 4),
                }
            )
        for meta, score in weighted_image:
            sources.append(
                {
                    "type": "image",
                    "file_name": meta.get("file_name"),
                    "text_snippet": meta["text"][:200],
                    "score": round(score, 4),
                }
            )

        context = _format_context(weighted_text, weighted_image)

        return {
            "context": context,
            "sources": sources,
            "text_hits": len(weighted_text),
            "image_hits": len(weighted_image),
        }


fusion_retriever = FusionRetriever()