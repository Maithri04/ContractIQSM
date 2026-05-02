"""
Text cleaning utilities shared by both pipelines.
"""
import re
import unicodedata


def clean_text(raw: str) -> str:
    """
    Normalise raw extracted text:
    - Fix unicode / encoding artefacts
    - Collapse excess whitespace
    - Remove garbage characters while preserving legal punctuation
    """
    if not raw:
        return ""

    # Normalise unicode (NFC form)
    text = unicodedata.normalize("NFC", raw)

    # Replace non-breaking spaces, zero-width chars, etc.
    text = text.replace("\u00a0", " ").replace("\u200b", "")

    # Remove control characters except newlines and tabs
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)

    # Collapse repeated whitespace within a line
    lines = [re.sub(r"[ \t]+", " ", line).strip() for line in text.splitlines()]

    # Collapse more than 2 consecutive blank lines
    cleaned_lines: list[str] = []
    blank_count = 0
    for line in lines:
        if line == "":
            blank_count += 1
            if blank_count <= 2:
                cleaned_lines.append(line)
        else:
            blank_count = 0
            cleaned_lines.append(line)

    return "\n".join(cleaned_lines).strip()


def remove_headers_footers(text: str) -> str:
    """
    Best-effort removal of repeating page headers/footers.
    Heuristic: lines shorter than 80 chars that repeat 3+ times across pages.
    """
    lines = text.splitlines()
    from collections import Counter
    freq = Counter(ln.strip() for ln in lines if 0 < len(ln.strip()) < 80)
    repeated = {line for line, count in freq.items() if count >= 3}
    filtered = [ln for ln in lines if ln.strip() not in repeated]
    return "\n".join(filtered)