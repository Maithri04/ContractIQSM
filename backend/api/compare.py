"""
api/compare.py

POST /api/compare
Accepts 2-5 files (PDF, DOCX, TXT, or images).
Compares penalty, termination, and liability clauses across all files.
Returns structured data + human-readable UI text.
"""
from pathlib import Path
from typing  import List

from fastapi                import APIRouter, File, HTTPException, UploadFile
from fastapi.concurrency    import run_in_threadpool
from loguru                 import logger

from services.comparision_service import compare_contracts
from utils.file_handler          import save_upload, delete_file

router = APIRouter(prefix="/api", tags=["compare"])

IMAGE_EXTS    = {".png", ".jpg", ".jpeg", ".tiff", ".tif", ".webp", ".bmp"}
ALLOWED_EXTS  = {".pdf", ".docx", ".txt", ".md", ".csv"} | IMAGE_EXTS
MAX_FILES     = 5


@router.post("/compare", summary="Compare multiple contracts or images")
async def compare_endpoint(
    files: List[UploadFile] = File(
        ..., description="2–5 files: PDF / DOCX / TXT / image"
    ),
):
    """
    Upload 2–5 contracts or clause images to get a side-by-side comparison.

    Supports:
    - PDF, DOCX, TXT documents  → text extraction
    - PNG, JPG, JPEG images     → OCR then extraction

    Returns
    -------
    JSON with:
    - success: bool
    - data: list of per-file clause findings + risk scores
    - ui_text: plain-English summary for direct frontend display
    - comparison_summary: one-line verdict
    - safest_contract / riskiest_contract: names for UI highlighting
    """
    # ── Validation ────────────────────────────────────────────────────────────
    if len(files) < 2:
        raise HTTPException(
            status_code=422,
            detail="Please upload at least 2 files to compare.",
        )
    if len(files) > MAX_FILES:
        raise HTTPException(
            status_code=422,
            detail=f"Maximum {MAX_FILES} files allowed per comparison.",
        )

    for f in files:
        ext = Path(f.filename or "").suffix.lower()
        if ext not in ALLOWED_EXTS:
            raise HTTPException(
                status_code=422,
                detail=(
                    f"Unsupported file type: {f.filename}. "
                    f"Allowed: PDF, DOCX, TXT, PNG, JPG, JPEG, WEBP, BMP."
                ),
            )

    # ── Save all uploads ──────────────────────────────────────────────────────
    saved_paths: List[Path] = []

    for f in files:
        ext       = Path(f.filename or "").suffix.lower()
        subfolder = "images" if ext in IMAGE_EXTS else "pdfs"
        path      = await save_upload(f, subfolder=subfolder)
        saved_paths.append(path)
        logger.info(f"[COMPARE] Saved: {path.name} → {subfolder}/")

    # ── Run comparison pipeline ───────────────────────────────────────────────
    try:
        result = await run_in_threadpool(compare_contracts, saved_paths)
    except Exception as exc:
        logger.exception(f"[COMPARE] Pipeline error: {exc}")
        for p in saved_paths:
            delete_file(p)
        raise HTTPException(
            status_code=500,
            detail=f"Comparison failed: {exc}",
        )

    if not result["success"]:
        for p in saved_paths:
            delete_file(p)
        raise HTTPException(
            status_code=422,
            detail=result["ui_text"],
        )

    return result