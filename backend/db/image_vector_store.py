"""
Image-pipeline FAISS vector store.
"""
from functools import lru_cache

from config.settings import get_settings
from .base_store import BaseFAISSStore


class ImageVectorStore(BaseFAISSStore):
    """FAISS store for OCR-extracted image text chunks."""

    def __init__(self):
        settings = get_settings()
        super().__init__(
            index_path=settings.image_index_path,
            meta_path=settings.image_meta_path,
            dim=settings.embedding_dim,
        )


@lru_cache(maxsize=1)
def get_image_store() -> ImageVectorStore:
    return ImageVectorStore()