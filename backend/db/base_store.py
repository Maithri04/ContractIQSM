"""
Base FAISS vector store.

Handles index creation, adding vectors, similarity search,
persistence (save/load), and reset.

Subclasses (TextVectorStore, ImageVectorStore) simply call super().__init__()
with their own index_path and meta_path.
"""
import json
from pathlib import Path
from typing import Any, Dict, List, Optional

import numpy as np
from loguru import logger


class BaseFAISSStore:
    """
    Generic FAISS flat-L2 vector store backed by a .index file and a
    .json metadata file.

    Parameters
    ----------
    index_path : Path
        Where the FAISS index is persisted on disk.
    meta_path : Path
        Where the chunk metadata list is persisted (JSON).
    dim : int
        Embedding dimension. Must match the model used (default: 384 for
        all-MiniLM-L6-v2 / paraphrase-MiniLM-L6-v2).
    """

    def __init__(self, index_path: Path, meta_path: Path, dim: int = 384) -> None:
        self.index_path = Path(index_path)
        self.meta_path = Path(meta_path)
        self.dim = dim
        self.metadata: List[Dict[str, Any]] = []

        # Lazy-import FAISS so the module can be imported even if faiss-cpu
        # is not installed yet (the error surfaces only on first use).
        try:
            import faiss  # noqa: F401
        except ImportError as exc:
            raise RuntimeError(
                "faiss-cpu is not installed. Run: pip install faiss-cpu"
            ) from exc

        self._index = self._load_or_create_index()

    # ── Internal helpers ──────────────────────────────────────────────────

    def _load_or_create_index(self):
        """Load existing index from disk, or create a fresh flat-L2 index."""
        import faiss

        if self.index_path.exists() and self.meta_path.exists():
            try:
                index = faiss.read_index(str(self.index_path))
                with open(self.meta_path, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
                logger.info(
                    f"Loaded FAISS index from '{self.index_path.name}' "
                    f"({index.ntotal} vectors)"
                )
                return index
            except Exception as exc:
                logger.warning(
                    f"Could not load existing index ({exc}). "
                    "Creating a fresh index."
                )

        logger.info(f"Creating new FAISS flat-L2 index (dim={self.dim})")
        return faiss.IndexFlatL2(self.dim)

    def _to_float32(self, embeddings) -> np.ndarray:
        """Ensure embeddings are a contiguous float32 numpy array."""
        arr = np.array(embeddings, dtype=np.float32)
        if arr.ndim == 1:
            arr = arr.reshape(1, -1)
        return np.ascontiguousarray(arr)

    # ── Public API ────────────────────────────────────────────────────────

    @property
    def total(self) -> int:
        """Number of vectors currently stored in the index."""
        return self._index.ntotal

    def add(self, embeddings, chunks: List[Dict[str, Any]]) -> None:
        """
        Add embeddings and their associated metadata chunks to the index.

        Parameters
        ----------
        embeddings : array-like, shape (n, dim)
        chunks     : list of dicts, len == n
        """
        if len(embeddings) == 0:
            logger.warning("add() called with 0 embeddings — skipping.")
            return

        vectors = self._to_float32(embeddings)
        if vectors.shape[1] != self.dim:
            raise ValueError(
                f"Embedding dimension mismatch: expected {self.dim}, "
                f"got {vectors.shape[1]}"
            )

        self._index.add(vectors)
        self.metadata.extend(chunks)
        logger.debug(
            f"Added {len(chunks)} chunk(s) → index now has {self.total} vectors"
        )

    def save(self) -> None:
        """
        Persist the FAISS index and metadata to disk.

        FIX 2: This method must be called after every add() to ensure
        embeddings survive server restarts. Without this, the in-memory
        index is lost when the process exits.
        """
        import faiss

        # Ensure parent directories exist
        self.index_path.parent.mkdir(parents=True, exist_ok=True)
        self.meta_path.parent.mkdir(parents=True, exist_ok=True)

        faiss.write_index(self._index, str(self.index_path))
        with open(self.meta_path, "w", encoding="utf-8") as f:
            json.dump(self.metadata, f, ensure_ascii=False, indent=2)

        logger.info(
            f"Saved FAISS index → {self.index_path.name} "
            f"({self.total} vectors | {len(self.metadata)} metadata entries)"
        )

    def search(
        self, query_embedding, top_k: int = 5
    ) -> List[tuple]:
        """
        Retrieve the top_k nearest chunks to query_embedding.

        Returns
        -------
        List of (meta_dict, score) tuples where score is the L2 distance
        (lower = more similar). Matches the format fusion.py expects:
            for meta, score in results: ...
        """
        if self.total == 0:
            logger.debug("search() called on empty index — returning []")
            return []

        query = self._to_float32(query_embedding)
        k = min(top_k, self.total)
        distances, indices = self._index.search(query, k)

        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx == -1:
                continue  # FAISS padding for under-full indexes
            chunk = dict(self.metadata[idx])
            score = round(float(dist), 4)
            results.append((chunk, score))  # (meta, score) tuple for fusion.py

        return results

    def reset(self) -> None:
        """
        Clear the index and metadata, and delete the files on disk.
        """
        import faiss

        self._index = faiss.IndexFlatL2(self.dim)
        self.metadata = []

        if self.index_path.exists():
            self.index_path.unlink()
        if self.meta_path.exists():
            self.meta_path.unlink()

        logger.info(
            f"Reset FAISS index: {self.index_path.name} cleared."
        )

    def __repr__(self) -> str:
        return (
            f"<{self.__class__.__name__} "
            f"dim={self.dim} vectors={self.total} "
            f"index='{self.index_path.name}'>"
        )