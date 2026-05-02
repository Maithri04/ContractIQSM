"""
Text-pipeline FAISS vector store.
"""
from functools import lru_cache

from config.settings import get_settings
from .base_store import BaseFAISSStore


class TextVectorStore(BaseFAISSStore):
    """FAISS store for PDF text chunks."""

    def __init__(self):
        settings = get_settings()
        super().__init__(
            index_path=settings.text_index_path,
            meta_path=settings.text_meta_path,
            dim=settings.embedding_dim,
        )


@lru_cache(maxsize=1)
def get_text_store() -> TextVectorStore:
    return TextVectorStore()