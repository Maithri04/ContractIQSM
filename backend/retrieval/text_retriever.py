"""
Text-pipeline retriever.
"""
from typing import List, Tuple, Dict, Any

from embeddings.text_embedder import text_embedder
from db.text_vector_store import get_text_store
from config.settings import get_settings


class TextRetriever:
    def retrieve(
        self, query: str, top_k: int | None = None
    ) -> List[Tuple[Dict[str, Any], float]]:
        """
        Embed query and retrieve top-k text chunks.

        Returns list of (metadata, score) tuples.
        """
        settings = get_settings()
        k = top_k or settings.top_k_text

        query_emb = text_embedder.embed_single(query)
        store = get_text_store()
        return store.search(query_emb, top_k=k)


text_retriever = TextRetriever()