"""
Generic non-PDF document text extraction.
Supports plain text-like files and DOCX.
"""
from pathlib import Path
from typing import List, Dict, Any

from .cleaner import clean_text

TEXT_EXTENSIONS = {
    ".txt", ".md", ".csv", ".json", ".log", ".xml", ".yaml", ".yml", ".rtf"
}


def extract_document_pages(file_path: str | Path) -> List[Dict[str, Any]]:
    file_path = Path(file_path)
    ext = file_path.suffix.lower()

    text = ""
    if ext in TEXT_EXTENSIONS:
        raw = file_path.read_text(encoding="utf-8", errors="ignore")
        text = clean_text(raw)
    elif ext == ".docx":
        try:
            from docx import Document
        except ImportError as exc:
            raise RuntimeError("DOCX support requires python-docx. Run: pip install python-docx") from exc
        doc = Document(str(file_path))
        raw = "\n".join(p.text for p in doc.paragraphs if p.text and p.text.strip())
        text = clean_text(raw)
    else:
        return []

    if not text.strip():
        return []

    return [
        {
            "page_num": 1,
            "text": text,
            "char_count": len(text),
        }
    ]
