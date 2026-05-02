"""
Image-pipeline retriever.
"""
from typing import List, Tuple, Dict, Any

from embeddings.image_embedder import image_embedder
from db.image_vector_store import get_image_store
from config.settings import get_settings


class ImageRetriever:
    def retrieve(
        self, query: str, top_k: int | None = None
    ) -> List[Tuple[Dict[str, Any], float]]:
        """
        Embed query and retrieve top-k image OCR chunks.
        """
        settings = get_settings()
        k = top_k or settings.top_k_image

        query_emb = image_embedder.embed_single(query)
        store = get_image_store()
        return store.search(query_emb, top_k=k)


image_retriever = ImageRetriever()