"""
RAG Pipeline Orchestrator.

Coordinates the full flow:
  Upload  →  Ingestion  →  Embed  →  Store  →  Retrieve  →  Fuse  →  LLM  →  Response

Two public entry points:
  - ingest_pdf(path)        : text pipeline
  - ingest_image(path)      : image pipeline
  - query(question)         : dual retrieval + fusion + LLM
"""
from pathlib import Path
from typing import Any, Dict

from loguru import logger

from ingestion.pdf_parser import extract_pdf_pages
from ingestion.document_parser import extract_document_pages
from ingestion.image_ocr import ocr_image
from ingestion.chunker import chunk_pages, chunk_image_text
from embeddings.text_embedder import text_embedder
from embeddings.image_embedder import image_embedder
from db.text_vector_store import get_text_store
from db.image_vector_store import get_image_store
from retrieval.fusion import fusion_retriever
from llm.generator import llm_generator
from services.risk_analyzer import heuristic_risk_score, parse_risk_response
from utils.helpers import timer


from fastapi.concurrency import run_in_threadpool

# ── Text (PDF) Pipeline ───────────────────────────────────────────────────────

async def ingest_pdf(pdf_path: Path):
    logger.info(f"[TEXT PIPELINE] Starting ingestion for: {pdf_path.name}")
    
    yield {"step": 1}
    pages = await run_in_threadpool(extract_pdf_pages, pdf_path)

    if not pages:
        logger.warning(f"No text extracted from {pdf_path.name}")
        yield {"result": {"chunks_stored": 0, "heuristic_risk": "UNKNOWN"}}
        return

    yield {"step": 2}
    chunks = await run_in_threadpool(chunk_pages, pages)

    if not chunks:
        logger.warning("No chunks produced from PDF pages.")
        yield {"result": {"chunks_stored": 0, "heuristic_risk": "UNKNOWN"}}
        return

    texts = [c["text"] for c in chunks]

    yield {"step": 3}
    embeddings = await run_in_threadpool(text_embedder.embed, texts)

    for chunk in chunks:
        chunk["source_file"] = pdf_path.name

    yield {"step": 4}
    store = get_text_store()
    await run_in_threadpool(store.add, embeddings, chunks)
    await run_in_threadpool(store.save)

    full_text = " ".join(texts)
    risk = await run_in_threadpool(heuristic_risk_score, full_text)

    logger.info(f"[TEXT PIPELINE] Done: {len(chunks)} chunks stored | heuristic_risk={risk}")
    yield {"result": {"chunks_stored": len(chunks), "heuristic_risk": risk}}


async def ingest_document(file_path: Path):
    logger.info(f"[TEXT PIPELINE] Starting generic ingestion for: {file_path.name}")

    yield {"step": 1}
    pages = await run_in_threadpool(extract_document_pages, file_path)

    if not pages:
        logger.warning(f"No extractable text found in {file_path.name}")
        yield {"result": {"chunks_stored": 0, "heuristic_risk": "UNKNOWN"}}
        return

    yield {"step": 2}
    chunks = await run_in_threadpool(chunk_pages, pages)

    if not chunks:
        yield {"result": {"chunks_stored": 0, "heuristic_risk": "UNKNOWN"}}
        return

    texts = [c["text"] for c in chunks]

    yield {"step": 3}
    embeddings = await run_in_threadpool(text_embedder.embed, texts)

    for chunk in chunks:
        chunk["source_file"] = file_path.name

    yield {"step": 4}
    store = get_text_store()
    await run_in_threadpool(store.add, embeddings, chunks)
    await run_in_threadpool(store.save)

    risk = await run_in_threadpool(heuristic_risk_score, " ".join(texts))
    logger.info(f"[TEXT PIPELINE] Done: {len(chunks)} chunks stored | heuristic_risk={risk}")
    yield {"result": {"chunks_stored": len(chunks), "heuristic_risk": risk}}


# ── Image Pipeline ────────────────────────────────────────────────────────────

async def ingest_image(image_path: Path):
    logger.info(f"[IMAGE PIPELINE] Starting ingestion for: {image_path.name}")

    yield {"step": 1}
    ocr_result = await run_in_threadpool(ocr_image, image_path)

    if not ocr_result["text"].strip():
        logger.warning(f"No text extracted via OCR from {image_path.name}")
        yield {"result": {"chunks_stored": 0, "heuristic_risk": "UNKNOWN"}}
        return

    yield {"step": 2}
    chunks = await run_in_threadpool(chunk_image_text, ocr_result)

    if not chunks:
        logger.warning("No chunks produced from image OCR text.")
        yield {"result": {"chunks_stored": 0, "heuristic_risk": "UNKNOWN"}}
        return

    texts = [c["text"] for c in chunks]

    yield {"step": 3}
    embeddings = await run_in_threadpool(image_embedder.embed, texts)

    for chunk in chunks:
        chunk["source_file"] = image_path.name

    yield {"step": 4}
    store = get_image_store()
    await run_in_threadpool(store.add, embeddings, chunks)
    await run_in_threadpool(store.save)

    risk = await run_in_threadpool(heuristic_risk_score, " ".join(texts))

    logger.info(f"[IMAGE PIPELINE] Done: {len(chunks)} chunks stored | heuristic_risk={risk}")
    yield {"result": {"chunks_stored": len(chunks), "heuristic_risk": risk}}


# ── Query Pipeline ────────────────────────────────────────────────────────────

def query_pipeline(question: str) -> Dict[str, Any]:
    """
    Full RAG query flow:
      Question → Dual Retrieval → Late Fusion → LLM → Structured Response

    Returns
    -------
    dict matching AskResponse schema fields
    """
    logger.info(f"[QUERY PIPELINE] question='{question[:80]}'")

    # ── Step 1: Late Fusion Retrieval ─────────────────────────────────────
    with timer("Late fusion retrieval"):
        fusion_result = fusion_retriever.retrieve(question)

    context: str = fusion_result["context"]
    sources: list = fusion_result["sources"]
    text_hits: int = fusion_result["text_hits"]
    image_hits: int = fusion_result["image_hits"]

    if not context.strip():
        logger.warning("Empty context after fusion — no documents indexed yet.")
        return {
            "answer": (
                "⚠️ No documents have been uploaded yet.\n\n"
                "Please upload a PDF contract and/or a clause screenshot first, "
                "then ask your question."
            ),
            "risk_level": "UNKNOWN",
            "summary": "No documents indexed.",
            "recommendation": "Upload a contract document to get started.",
            "sources": [],
            "text_hits": 0,
            "image_hits": 0,
        }

    # ── Step 2: LLM Generation ────────────────────────────────────────────
    with timer("LLM generation"):
        llm_response = llm_generator.generate(context=context, question=question)

    # ── Step 3: Parse & structure response ───────────────────────────────
    parsed = parse_risk_response(llm_response, sources)
    parsed["text_hits"] = text_hits
    parsed["image_hits"] = image_hits

    logger.info(
        f"[QUERY PIPELINE] Done: risk_level={parsed['risk_level']} | "
        f"text_hits={text_hits} | image_hits={image_hits}"
    )
    return parsed


# ── Index Reset ───────────────────────────────────────────────────────────────

def reset_all_indexes() -> None:
    """Clear both FAISS indexes and their metadata."""
    get_text_store().reset()
    get_image_store().reset()
    logger.info("All indexes reset.")