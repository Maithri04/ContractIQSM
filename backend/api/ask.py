"""
/api/ask  — RAG query endpoint.

Accepts a user question, runs Late Fusion retrieval across both FAISS
indexes, sends combined context to the LLM, returns structured risk analysis.
"""
from fastapi import APIRouter, HTTPException
from loguru import logger

from models.schemas import AskRequest, AskResponse, SourceItem
from services.rag_pipeline import query_pipeline

router = APIRouter(prefix="/api", tags=["query"])


@router.post("/ask", response_model=AskResponse, summary="Ask a question about uploaded contracts")
async def ask_question(request: AskRequest) -> AskResponse:
    """
    Submit a natural-language question about uploaded contract document(s).

    **Flow:**
    1. Embed the question
    2. Retrieve top-k results from text FAISS index  (PDF pipeline)
    3. Retrieve top-k results from image FAISS index (image pipeline)
    4. Late Fusion: weight + merge + deduplicate
    5. Send fused context to Claude LLM
    6. Parse & return structured risk analysis

    **Returns:**
    - Full LLM answer with risk level, summary, key risks, sources, recommendation
    """
    question = request.question.strip()
    logger.info(f"[ASK] question='{question[:80]}'")

    try:
        result = query_pipeline(question)
    except RuntimeError as exc:
        # e.g. missing API key
        logger.error(f"Pipeline runtime error: {exc}")
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception(f"Unexpected error in query pipeline: {exc}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing your question. Please try again.",
        ) from exc

    # Coerce sources list to SourceItem models (pipeline returns plain dicts)
    sources = [
        SourceItem(**s) if isinstance(s, dict) else s
        for s in result.get("sources", [])
    ]

    return AskResponse(
        answer=result["answer"],
        risk_level=result["risk_level"],
        summary=result["summary"],
        recommendation=result["recommendation"],
        sources=sources,
        text_hits=result["text_hits"],
        image_hits=result["image_hits"],
    )