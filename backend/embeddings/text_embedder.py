"""
Text embedding using sentence-transformers.
Singleton pattern to avoid reloading the model on every request.
"""
from functools import lru_cache
from typing import List

import numpy as np
from loguru import logger

from config.settings import get_settings


@lru_cache(maxsize=1)
def _load_model():
    """Load and cache the SentenceTransformer model."""
    from sentence_transformers import SentenceTransformer
    settings = get_settings()
    logger.info(f"Loading embedding model: {settings.embedding_model}")
    model = SentenceTransformer(settings.embedding_model)
    logger.info("Embedding model loaded ✓")
    return model


class TextEmbedder:
    """Wrapper around SentenceTransformer for batch text embedding."""

    def __init__(self):
        self._model = None

    @property
    def model(self):
        if self._model is None:
            self._model = _load_model()
        return self._model

    def embed(self, texts: List[str]) -> np.ndarray:
        """
        Embed a list of texts.

        Returns
        -------
        np.ndarray of shape (len(texts), embedding_dim), dtype float32
        """
        if not texts:
            return np.empty((0, get_settings().embedding_dim), dtype=np.float32)

        embeddings = self.model.encode(
            texts,
            show_progress_bar=False,
            convert_to_numpy=True,
            normalize_embeddings=True,   # cosine similarity via dot product
        )
        return embeddings.astype(np.float32)

    def embed_single(self, text: str) -> np.ndarray:
        """Embed a single string. Returns 1-D float32 array."""
        return self.embed([text])[0]


# Module-level singleton
text_embedder = TextEmbedder()