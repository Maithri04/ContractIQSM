"""
/api/upload  — Dual ingestion endpoint.

Accepts:
  - pdf_file   (optional): contract PDF
  - image_file (optional): clause screenshot

At least one must be provided.
Runs text and/or image pipelines and stores embeddings in FAISS.
"""
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool  # FIX 1: import threadpool runner
from loguru import logger

from models.schemas import UploadResponse
from services.rag_pipeline import ingest_pdf, ingest_image, ingest_document
from utils.file_handler import save_upload, delete_file
from api.history import save_to_history

router = APIRouter(prefix="/api", tags=["upload"])


IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".tiff", ".tif", ".webp", ".bmp"}


import json
from fastapi.responses import StreamingResponse

@router.post("/upload", summary="Upload files for ingestion")
async def upload_documents(
    pdf_file: Optional[UploadFile] = File(None, description="Contract file (PDF/TXT/DOCX/etc.)"),
    image_file: Optional[UploadFile] = File(None, description="Clause screenshot (optional)"),
    pdf: Optional[UploadFile] = File(None, description="Alias for pdf_file"),
    image: Optional[UploadFile] = File(None, description="Alias for image_file"),
):
    pdf_file = pdf_file or pdf
    image_file = image_file or image

    if pdf_file is None and image_file is None:
        raise HTTPException(
            status_code=422,
            detail="At least one file (pdf_file/image_file or pdf/image) must be provided.",
        )

    main_path: Optional[Path] = None
    image_path: Optional[Path] = None
    
    if pdf_file is not None:
        ext = Path(pdf_file.filename or "").suffix.lower()
        subfolder = "images" if ext in IMAGE_EXTENSIONS else "docs"
        main_path = await save_upload(pdf_file, subfolder=subfolder)
        logger.info(f"Main file saved: {main_path.name} | ext={ext}")

    if image_file is not None:
        image_path = await save_upload(image_file, subfolder="images")
        logger.info(f"Image saved: {image_path.name}")

    async def progress_stream():
        text_chunks_stored = 0
        image_chunks_stored = 0
        risk_levels: list[str] = ["UNKNOWN"]
        warnings: list[str] = []

        # ── Main file pipeline ───────────────────────────
        if main_path is not None:
            ext = main_path.suffix.lower()
            try:
                if ext in IMAGE_EXTENSIONS:
                    gen = ingest_image(main_path)
                elif ext == ".pdf":
                    gen = ingest_pdf(main_path)
                else:
                    gen = ingest_document(main_path)
                
                async for update in gen:
                    if "step" in update:
                        yield json.dumps({"step": update["step"]}) + "\n"
                    if "result" in update:
                        res = update["result"]
                        text_chunks_stored += res.get("chunks_stored", 0) if ext not in IMAGE_EXTENSIONS else 0
                        image_chunks_stored += res.get("chunks_stored", 0) if ext in IMAGE_EXTENSIONS else 0
                        risk_levels.append(res.get("heuristic_risk", "UNKNOWN"))
            except Exception as exc:
                logger.exception(f"Main file ingestion failed: {exc}")
                warnings.append(f"Main file processing failed: {exc}")

        # ── Image pipeline ────────────────────────────────────────────────────
        if image_path is not None:
            try:
                async for update in ingest_image(image_path):
                    if "step" in update:
                        yield json.dumps({"step": update["step"]}) + "\n"
                    if "result" in update:
                        res = update["result"]
                        image_chunks_stored += res.get("chunks_stored", 0)
                        risk_levels.append(res.get("heuristic_risk", "UNKNOWN"))
            except Exception as exc:
                logger.exception(f"Image ingestion failed: {exc}")
                warnings.append(f"Image processing failed: {exc}")

        if warnings:
            logger.warning(f"Upload completed with warnings: {' | '.join(warnings)}")

        total_chunks = text_chunks_stored + image_chunks_stored
        risk_priority = {"HIGH": 3, "MEDIUM": 2, "LOW": 1, "UNKNOWN": 0}
        combined_risk = max(risk_levels, key=lambda r: risk_priority.get(r, 0))

        if total_chunks == 0:
            if main_path: delete_file(main_path)
            if image_path: delete_file(image_path)
            # Yield error and end stream so frontend handles it
            yield json.dumps({"error": "No text could be extracted from the uploaded file(s). " + (f" Errors: {' | '.join(warnings)}" if warnings else "")}) + "\n"
            return

        final_result = {
            "success": True,
            "message": f"Successfully processed {total_chunks} chunk(s)." + (" Some files could not be fully processed." if warnings else ""),
            "pdf_chunks": text_chunks_stored if text_chunks_stored > 0 else None,
            "image_chunks": image_chunks_stored if image_chunks_stored > 0 else None,
            "pdf_filename": main_path.name if main_path else None,
            "image_filename": image_path.name if image_path else None,
            "heuristic_risk": combined_risk,
            "warnings": warnings,
        }
        try:
            with open("history_debug.log", "a") as f:
                f.write(f"Attempting to save to history. main_path={main_path}, image_path={image_path}\n")
            if main_path:
                name_to_use = getattr(pdf_file, "filename", main_path.name) if pdf_file else main_path.name
                file_hash = save_to_history(main_path, name_to_use, risk_level=combined_risk)
                final_result["file_hash"] = file_hash
                with open("history_debug.log", "a") as f: f.write(f"Saved main_path to history: {name_to_use}\n")
            elif image_path:
                name_to_use = getattr(image_file, "filename", image_path.name) if image_file else image_path.name
                file_hash = save_to_history(image_path, name_to_use, risk_level=combined_risk)
                final_result["file_hash"] = file_hash
                with open("history_debug.log", "a") as f: f.write(f"Saved image_path to history: {name_to_use}\n")
        except Exception as e:
            with open("history_debug.log", "a") as f: f.write(f"Exception in save_to_history: {e}\n")
            logger.error(f"Failed to save to history: {e}")
        
        yield json.dumps({"result": final_result}) + "\n"

    return StreamingResponse(progress_stream(), media_type="application/x-ndjson")