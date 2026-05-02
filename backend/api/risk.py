"""
api/risk.py

POST /api/risk-score
Accepts a PDF or image, returns a weighted risk score (0–10)
with clause-by-clause breakdown and UI-ready text.
"""
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from loguru import logger

from services.risk_scoring import score_contract
from utils.file_handler import save_upload, delete_file

router = APIRouter(prefix="/api", tags=["risk"])

ALLOWED_EXTENSIONS = {"pdf", "png", "jpg", "jpeg", "tiff", "tif", "webp", "bmp"}


@router.post("/risk-score", summary="Score contract risk (0-10)")
async def risk_score_endpoint(
    file: UploadFile = File(..., description="PDF or image contract to score"),
):
    ext = (file.filename or "").rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported file type: {file.filename}. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    subfolder = "images" if ext != "pdf" else "pdfs"
    path = await save_upload(file, subfolder=subfolder)
    logger.info(f"[RISK SCORE] Saved: {path.name}")

    try:
        result = await run_in_threadpool(score_contract, path)
    except Exception as exc:
        logger.exception(f"[RISK SCORE] Pipeline error: {exc}")
        delete_file(path)
        raise HTTPException(status_code=500, detail=f"Risk scoring failed: {exc}")

    if not result["success"]:
        delete_file(path)
        raise HTTPException(status_code=422, detail=result["ui_text"])

    return result