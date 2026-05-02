"""
Clause-aware text chunker.

Strategy
--------
1. Try to split on numbered / titled clause headings (Clause 1, Section 2, ARTICLE I …)
2. Fall back to paragraph-level chunking
3. Final fallback: sliding-window token chunks

Each chunk carries metadata: page_num, chunk_index, source_type.
"""
import re
from typing import List, Dict, Any

from loguru import logger


# ── Clause heading patterns ────────────────────────────────────────────────
CLAUSE_PATTERNS = [
    # "1. Termination" / "1.1 Penalties"
    re.compile(r"^\s*(\d+(\.\d+)*)\s+[A-Z][A-Za-z\s\-:]{3,60}$", re.MULTILINE),
    # "CLAUSE 1" / "SECTION 2" / "ARTICLE III"
    re.compile(
        r"^\s*(CLAUSE|SECTION|ARTICLE|SCHEDULE|ANNEXURE|EXHIBIT)\s+[\dIVXivx]+",
        re.MULTILINE | re.IGNORECASE,
    ),
    # All-caps headings: "TERMINATION AND PENALTIES"
    re.compile(r"^\s*[A-Z][A-Z\s\-]{5,60}$", re.MULTILINE),
    # High priority clauses
    re.compile(r"^\s*(penalty|termination|liability|indemnification)\b.*$", re.MULTILINE | re.IGNORECASE),
]

MAX_CHUNK_CHARS = 1200
OVERLAP_CHARS = 150


def _split_on_clauses(text: str) -> List[str]:
    """
    Attempt to split text on detected clause headings.
    Returns a list of clause strings (each starts with the heading).
    """
    positions = set()
    for pattern in CLAUSE_PATTERNS:
        for match in pattern.finditer(text):
            positions.add(match.start())

    if not positions:
        return []

    sorted_pos = sorted(positions)
    chunks = []
    for i, start in enumerate(sorted_pos):
        end = sorted_pos[i + 1] if i + 1 < len(sorted_pos) else len(text)
        chunk = text[start:end].strip()
        if len(chunk) > 30:  # ignore tiny slivers
            chunks.append(chunk)

    return chunks


def _split_on_paragraphs(text: str) -> List[str]:
    """Split on double newlines (paragraphs)."""
    return [p.strip() for p in re.split(r"\n{2,}", text) if p.strip()]


def _sliding_window(text: str, max_chars: int = MAX_CHUNK_CHARS, overlap: int = OVERLAP_CHARS) -> List[str]:
    """Last-resort sliding window over raw text."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + max_chars
        chunks.append(text[start:end].strip())
        start += max_chars - overlap
    return [c for c in chunks if c]


def _merge_small_chunks(chunks: List[str], min_chars: int = 80) -> List[str]:
    """Merge chunks that are too small into their predecessor."""
    merged: List[str] = []
    for chunk in chunks:
        if merged and len(chunk) < min_chars:
            merged[-1] = merged[-1] + " " + chunk
        else:
            merged.append(chunk)
    return merged


def chunk_page(page: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Chunk a single page dict into a list of chunk dicts.

    Input page dict keys: page_num, text, char_count
    Output chunk dict keys: page_num, chunk_index, text, source_type, char_count
    """
    text: str = page["text"]
    page_num: int = page.get("page_num", 0)

    # Try clause split → paragraph split → sliding window
    raw_chunks = _split_on_clauses(text)
    method = "clause"

    if not raw_chunks:
        raw_chunks = _split_on_paragraphs(text)
        method = "paragraph"

    if not raw_chunks:
        raw_chunks = _sliding_window(text)
        method = "sliding_window"

    # Merge tiny fragments
    raw_chunks = _merge_small_chunks(raw_chunks)

    # Further split any chunk that still exceeds MAX_CHUNK_CHARS
    final: List[str] = []
    for c in raw_chunks:
        if len(c) > MAX_CHUNK_CHARS:
            final.extend(_sliding_window(c))
        else:
            final.append(c)

    result = [
        {
            "page_num": page_num,
            "chunk_index": i,
            "text": chunk,
            "source_type": "pdf",
            "char_count": len(chunk),
            "split_method": method,
        }
        for i, chunk in enumerate(final)
        if chunk.strip() and len(chunk.strip()) >= 50
    ]

    logger.debug(
        f"Page {page_num}: {len(result)} chunks (method={method})"
    )
    return result


def chunk_pages(pages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Chunk all pages. Returns flat list of chunk dicts. Max 30 chunks."""
    all_chunks = []
    for page in pages:
        all_chunks.extend(chunk_page(page))
    
    # Cap at 30 chunks per document
    all_chunks = all_chunks[:30]
    logger.info(f"Total chunks produced: {len(all_chunks)} (capped at 30)")
    return all_chunks


def chunk_image_text(ocr_result: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Chunk OCR text from an image.
    Images are typically single clauses; use paragraph split.
    """
    text = ocr_result["text"]
    file_name = ocr_result["file_name"]

    raw_chunks = _split_on_paragraphs(text) or _sliding_window(text)
    raw_chunks = _merge_small_chunks(raw_chunks)

    return [
        {
            "file_name": file_name,
            "chunk_index": i,
            "text": chunk,
            "source_type": "image",
            "char_count": len(chunk),
        }
        for i, chunk in enumerate(raw_chunks)
        if chunk.strip()
    ]