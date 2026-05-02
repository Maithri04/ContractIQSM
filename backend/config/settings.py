"""
Application configuration — loads from .env with sensible defaults.
"""
from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── LLM — Groq ────────────────────────────────────────────────────────
    groq_api_key: str = ""
    llm_model: str = "llama-3.3-70b-versatile"

    # ── Embeddings ────────────────────────────────────────────────────────
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    embedding_dim: int = 384

    # ── FAISS Paths ───────────────────────────────────────────────────────
    text_index_path: str = "data/index/text_faiss.index"
    image_index_path: str = "data/index/image_faiss.index"
    text_meta_path: str = "data/index/text_meta.json"
    image_meta_path: str = "data/index/image_meta.json"

    # ── Upload ────────────────────────────────────────────────────────────
    upload_dir: str = "data/uploads"
    max_upload_size_mb: int = 50
    ocr_engine: str = "easyocr"

    # ── Retrieval ─────────────────────────────────────────────────────────
    top_k_text: int = 5
    top_k_image: int = 3
    fusion_weight_text: float = 0.6
    fusion_weight_image: float = 0.4

    # ── Server ────────────────────────────────────────────────────────────
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

    def ensure_dirs(self) -> None:
        for path_str in [
            self.upload_dir,
            str(Path(self.text_index_path).parent),
        ]:
            Path(path_str).mkdir(parents=True, exist_ok=True)


@lru_cache()
def get_settings() -> Settings:
    s = Settings()
    s.ensure_dirs()
    return s