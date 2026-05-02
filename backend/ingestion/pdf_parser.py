"""
PDF text extraction using PyMuPDF (fitz).
Returns a list of page dicts: {page_num, text, char_count}.
"""
from pathlib import Path
from typing import List, Dict, Any

from loguru import logger

from .cleaner import clean_text, remove_headers_footers

MAX_PAGES = 30  # Cap pages to avoid timeout on huge files
MIN_CHARS_PER_PAGE = 50  # Pages with fewer chars are considered scanned


def extract_pdf_pages(pdf_path: str | Path) -> List[Dict[str, Any]]:
    try:
        import fitz
    except ImportError as exc:
        raise RuntimeError("PyMuPDF not installed. Run: pip install PyMuPDF") from exc

    pdf_path = Path(pdf_path)
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    pages: List[Dict[str, Any]] = []

    with fitz.open(str(pdf_path)) as doc:
        total = min(doc.page_count, MAX_PAGES)
        logger.info(f"Opened PDF '{pdf_path.name}' — {doc.page_count} pages (processing {total})")

        # Pass 1: collect raw text from all pages (capped)
        raw_pages = []
        for page_index in range(total):
            raw_pages.append(doc.load_page(page_index).get_text("text"))

        # Header/footer removal across full doc
        full_raw = "\n\f".join(raw_pages)
        full_cleaned = remove_headers_footers(full_raw)
        cleaned_pages = full_cleaned.split("\f")

        if len(cleaned_pages) != total:
            cleaned_pages = [remove_headers_footers(r) for r in raw_pages]

        has_text_overall = len(full_cleaned.strip()) >= MIN_CHARS_PER_PAGE

        # Pass 2: build page list — NO OCR fallback for text PDFs
        for page_index in range(total):
            header_stripped = cleaned_pages[page_index] if page_index < len(cleaned_pages) else raw_pages[page_index]
            cleaned = clean_text(header_stripped)

            if len(cleaned.strip()) >= MIN_CHARS_PER_PAGE:
                pages.append({
                    "page_num": page_index + 1,
                    "text": cleaned,
                    "char_count": len(cleaned),
                })
            elif not has_text_overall:
                # Scanned page — only OCR if PDF has NO extractable text overall
                logger.debug(f"Page {page_index + 1} has little text ({len(cleaned.strip())} chars) — attempting OCR")
                try:
                    from .image_ocr import ocr_image
                    page = doc.load_page(page_index)
                    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                    temp_img = pdf_path.parent / f".ocr_page_{page_index+1}_{pdf_path.stem}.png"
                    pix.save(str(temp_img))
                    try:
                        ocr_result = ocr_image(temp_img)
                        ocr_text = clean_text(ocr_result.get("text", ""))
                        if ocr_text.strip():
                            pages.append({
                                "page_num": page_index + 1,
                                "text": ocr_text,
                                "char_count": len(ocr_text),
                            })
                    finally:
                        temp_img.unlink(missing_ok=True)
                except Exception as e:
                    logger.warning(f"OCR fallback failed for page {page_index + 1}: {e}")

    logger.info(f"Extracted {len(pages)} non-empty pages from '{pdf_path.name}'")
    return pages