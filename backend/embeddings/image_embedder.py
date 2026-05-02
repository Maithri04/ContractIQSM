"""
Image pipeline embedder.

Since our image pipeline extracts text via OCR, we embed that text
using the same sentence-transformer model. This keeps the embedding
space consistent for fusion.

If you later add visual embeddings (CLIP etc.), swap this module.
"""
from typing import List

import numpy as np

from .text_embedder import text_embedder


class ImageEmbedder:
    """Embed OCR-extracted text from images."""

    def embed(self, texts: List[str]) -> np.ndarray:
        return text_embedder.embed(texts)

    def embed_single(self, text: str) -> np.ndarray:
        return text_embedder.embed_single(text)


image_embedder = ImageEmbedder()