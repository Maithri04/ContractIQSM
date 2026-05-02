"""
General-purpose helper utilities used across the application.
"""
import re
import time
from contextlib import contextmanager
from typing import Generator

from loguru import logger


@contextmanager
def timer(label: str) -> Generator:
    """
    Context manager that logs how long a block takes.

    Usage:
        with timer("PDF extraction"):
            pages = extract_pdf_pages(path)
    """
    start = time.perf_counter()
    try:
        yield
    finally:
        elapsed = time.perf_counter() - start
        logger.info(f"[TIMER] {label}: {elapsed:.3f}s")


def truncate(text: str, max_chars: int = 300, suffix: str = "…") -> str:
    """Truncate text to max_chars, appending suffix if truncated."""
    if len(text) <= max_chars:
        return text
    return text[:max_chars].rstrip() + suffix


def sanitize_filename(name: str) -> str:
    """
    Strip path separators and dangerous characters from a filename.
    Keeps alphanumeric, hyphens, underscores, and dots.
    """
    name = re.sub(r"[^\w.\-]", "_", name)
    name = re.sub(r"_+", "_", name)
    return name.strip("_.")


def extract_page_refs(text: str) -> list[int]:
    """
    Heuristically extract page numbers mentioned in a text string.
    e.g. "Page 3", "p. 5", "pages 2-4" → [3, 5, 2, 3, 4]
    """
    patterns = [
        r"[Pp]age[s]?\s+(\d+)(?:\s*[-–]\s*(\d+))?",
        r"\bp\.?\s*(\d+)\b",
    ]
    pages = []
    for pattern in patterns:
        for match in re.finditer(pattern, text):
            start_pg = int(match.group(1))
            pages.append(start_pg)
            if match.lastindex and match.lastindex >= 2 and match.group(2):
                end_pg = int(match.group(2))
                pages.extend(range(start_pg + 1, end_pg + 1))
    return sorted(set(pages))


def risk_level_to_emoji(level: str) -> str:
    """Map a risk level string to its display emoji."""
    mapping = {
        "HIGH": "🔴",
        "MEDIUM": "🟠",
        "LOW": "🟢",
        "UNKNOWN": "⚪",
    }
    return mapping.get(level.upper(), "⚪")


def build_error_response(message: str, detail: str = "") -> dict:
    """Standardised error payload for API error handlers."""
    return {
        "success": False,
        "message": message,
        "detail": detail,
    }