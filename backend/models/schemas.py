"""
Pydantic schemas for all API request/response contracts.
"""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# ── Upload ────────────────────────────────────────────────────────────────────

class UploadResponse(BaseModel):
    success: bool
    message: str
    pdf_chunks: Optional[int] = None
    image_chunks: Optional[int] = None
    pdf_filename: Optional[str] = None
    image_filename: Optional[str] = None
    heuristic_risk: Optional[str] = None  # fast pre-screen before LLM
    warnings: List[str] = Field(default_factory=list)


# ── Ask / Query ───────────────────────────────────────────────────────────────

class AskRequest(BaseModel):
    question: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="User's question about the uploaded contract",
    )


class SourceItem(BaseModel):
    type: str                          # "pdf" | "image"
    page_num: Optional[int] = None    # for pdf sources
    file_name: Optional[str] = None   # for image sources
    text_snippet: str
    score: float


class AskResponse(BaseModel):
    answer: str                        # full LLM response (markdown)
    risk_level: str                    # LOW | MEDIUM | HIGH | UNKNOWN
    summary: str
    recommendation: str
    sources: List[SourceItem]
    text_hits: int
    image_hits: int


# ── Health ────────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    text_index_vectors: int
    image_index_vectors: int
    model: str


# ── Reset ─────────────────────────────────────────────────────────────────────

class ResetResponse(BaseModel):
    success: bool
    message: str