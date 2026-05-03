"""
Image OCR via EasyOCR.

FIX: EasyOCR is a synchronous/blocking library. Calling it directly inside
an async FastAPI handler blocks the entire event loop, causing the server to
go silent with no logs or responses until it finishes (or hangs).

Solution: All blocking calls are wrapped with asyncio.get_event_loop().run_in_executor()
so they run in a thread pool without freezing the async server.
"""
import asyncio
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict

import numpy as np
from loguru import logger

from .cleaner import clean_text


@lru_cache(maxsize=1)
def _load_easyocr_reader():
    import easyocr

    logger.info("Loading EasyOCR model (first run may download model files)...")
    reader = easyocr.Reader(lang_list=["en"], gpu=False, verbose=False)
    logger.info("EasyOCR model loaded")
    return reader


def _preprocess_image(image_path: Path):
    from PIL import Image, ImageEnhance

    img = Image.open(image_path).convert("RGB")
    min_dim = 1000
    w, h = img.size
    if min(w, h) < min_dim:
        scale = min_dim / min(w, h)
        img = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
        logger.debug(f"Upscaled image from {w}x{h} to {img.size[0]}x{img.size[1]}")

    img = ImageEnhance.Contrast(img).enhance(1.5)
    img = ImageEnhance.Sharpness(img).enhance(1.5)
    return img


def _ocr_with_easyocr(img) -> Dict[str, Any]:
    """
    Synchronous OCR call — must always be run via run_in_executor,
    never called directly from async code.
    """
    reader = _load_easyocr_reader()
    results = reader.readtext(
        np.array(img),
        detail=1,
        paragraph=True,
        batch_size=4,
    )
    text_blocks = []
    confidences = []
    for result in results:
        if len(result) == 3:
            _bbox, text, confidence = result
        else:
            _bbox, text = result[0], result[1]
            confidence = 1.0
        if confidence >= 0.3 and text.strip():
            text_blocks.append(text.strip())
            confidences.append(float(confidence))

    raw_text = "\n".join(text_blocks)
    cleaned = clean_text(raw_text)
    avg_confidence = float(np.mean(confidences)) if confidences else 0.0
    return {
        "text": cleaned,
        "confidence": round(avg_confidence, 4),
        "raw_blocks": len(results),
        "engine": "easyocr",
    }


def _run_ocr_sync(image_path: Path) -> Dict[str, Any]:
    """
    Full synchronous pipeline: preprocess + OCR.
    Designed to be called from run_in_executor only.
    """
    img = _preprocess_image(image_path)
    logger.info(f"Running OCR (EasyOCR) on '{image_path.name}'")
    result = _ocr_with_easyocr(img)
    logger.info(
        f"OCR complete for '{image_path.name}' using easyocr: "
        f"{len(result['text'])} chars"
    )
    return result


async def ocr_image(image_path: str | Path) -> Dict[str, Any]:
    """
    Async-safe OCR entry point.

    Runs the blocking EasyOCR pipeline in a thread pool executor so it does
    not block FastAPI's event loop. This is what you should call from any
    async context (routers, services, ingestion pipeline).
    """
    image_path = Path(image_path)
    if not image_path.exists():
        raise FileNotFoundError(f"Image not found: {image_path}")

    loop = asyncio.get_event_loop()
    # run_in_executor offloads the blocking work to a thread — event loop stays free
    result = await loop.run_in_executor(None, _run_ocr_sync, image_path)

    return {
        "file_name": image_path.name,
        "text": result["text"],
        "char_count": len(result["text"]),
        "source": "image",
        "confidence": result["confidence"],
        "raw_blocks": result["raw_blocks"],
        "ocr_engine": result["engine"],
    }


# ---------------------------------------------------------------------------
# Backwards-compat shim — if anything in your codebase calls ocr_image()
# synchronously (e.g. from a non-async function), use this wrapper instead.
# But prefer the async version everywhere possible.
# ---------------------------------------------------------------------------
def ocr_image_sync(image_path: str | Path) -> Dict[str, Any]:
    """
    Synchronous wrapper for contexts that cannot use await.
    Avoid using this inside async FastAPI handlers.
    """
    image_path = Path(image_path)
    if not image_path.exists():
        raise FileNotFoundError(f"Image not found: {image_path}")

    result = _run_ocr_sync(image_path)
    return {
        "file_name": image_path.name,
        "text": result["text"],
        "char_count": len(result["text"]),
        "source": "image",
        "confidence": result["confidence"],
        "raw_blocks": result["raw_blocks"],
        "ocr_engine": result["engine"],
    }