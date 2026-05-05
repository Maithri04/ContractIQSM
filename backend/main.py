"""
LexGuard AI — Legal Document Risk Analyzer
FastAPI backend entry point
"""
import sys
import asyncio
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.concurrency import run_in_threadpool
from loguru import logger

from config.settings import get_settings
from api.upload import router as upload_router
from api.compare import router as compare_router
from api.risk import router as risk_router
from api.scenarios import router as scenarios_router
from api.ask import router as ask_router
from api.history import router as history_router
from models.schemas import HealthResponse, ResetResponse
from db.text_vector_store import get_text_store
from db.image_vector_store import get_image_store
from services.rag_pipeline import reset_all_indexes

settings = get_settings()

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

logger.remove()
logger.add(
    sys.stdout,
    level="DEBUG" if settings.debug else "INFO",
    format="{time:HH:mm:ss} | {level: <8} | {message}",
    colorize=False,
    enqueue=True,
)

app = FastAPI(title="LexGuard AI", version="1.0.0", docs_url="/docs", redoc_url="/redoc")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(ask_router)
app.include_router(compare_router)
app.include_router(risk_router)
app.include_router(scenarios_router)
app.include_router(history_router)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled exception: {exc}")
    return JSONResponse(status_code=500, content={"detail": "Unexpected server error."})


@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="ok",
        text_index_vectors=get_text_store().total,
        image_index_vectors=get_image_store().total,
        model=settings.llm_model,
    )


@app.post("/api/reset", response_model=ResetResponse)
async def reset_indexes():
    try:
        reset_all_indexes()
        return ResetResponse(success=True, message="All indexes reset.")
    except Exception as exc:
        return ResetResponse(success=False, message=str(exc))


@app.on_event("startup")
async def on_startup():
    settings.ensure_dirs()

    async def warm():
        try:
            from ingestion.image_ocr import _load_easyocr_reader
            await run_in_threadpool(_load_easyocr_reader)
            logger.info("EasyOCR model pre-loaded and ready")
        except Exception as e:
            logger.warning(f"EasyOCR pre-warm failed: {e}")

    asyncio.create_task(warm())

    logger.info("=" * 55)
    logger.info("LexGuard AI started")
    logger.info(f"   UI   -> http://localhost:{settings.port}/")
    logger.info(f"   Docs -> http://localhost:{settings.port}/docs")
    logger.info("=" * 55)


@app.on_event("shutdown")
async def on_shutdown():
    logger.info("LexGuard AI shutting down.")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.host, port=settings.port, reload=False)