"""
File handling utilities: save uploads, validate types, clean up temp files.
"""
import shutil
import uuid
from pathlib import Path

from fastapi import UploadFile, HTTPException
from loguru import logger

from config.settings import get_settings

ALLOWED_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".tiff", ".tif", ".webp", ".bmp"}


def _unique_filename(original: str) -> str:
    """Prepend a UUID to avoid filename collisions."""
    suffix = Path(original).suffix.lower()
    return f"{uuid.uuid4().hex}{suffix}"


async def save_upload(file: UploadFile, subfolder: str = "") -> Path:
    """
    Validate and stream-save an uploaded file to the uploads directory.

    Returns
    -------
    Path to the saved file on disk.
    """
    settings = get_settings()
    upload_root = Path(settings.upload_dir)
    dest_dir = upload_root / subfolder if subfolder else upload_root
    dest_dir.mkdir(parents=True, exist_ok=True)

    filename = _unique_filename(file.filename or "upload")
    dest_path = dest_dir / filename

    # Stream to disk in 1 MB chunks
    with open(dest_path, "wb") as f:
        while True:
            chunk = await file.read(1024 * 1024)
            if not chunk:
                break
            f.write(chunk)

    size_mb = dest_path.stat().st_size / (1024 * 1024)
    if size_mb > settings.max_upload_size_mb:
        dest_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=413,
            detail=(
                f"File too large ({size_mb:.1f} MB). "
                f"Max allowed: {settings.max_upload_size_mb} MB."
            ),
        )

    logger.info(f"Saved upload → {dest_path}  ({size_mb:.2f} MB)")
    return dest_path


def validate_pdf(file: UploadFile) -> None:
    """Raise 422 if the uploaded file is not a PDF."""
    ext = Path(file.filename or "").suffix.lower()
    if ext != ".pdf":
        raise HTTPException(
            status_code=422,
            detail=f"Expected a PDF file, got '{ext or 'no extension'}'.",
        )


def validate_image(file: UploadFile) -> None:
    """Raise 422 if the uploaded file is not a supported image type."""
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Unsupported image extension '{ext}'. "
                f"Allowed: {', '.join(sorted(ALLOWED_IMAGE_EXTENSIONS))}."
            ),
        )


def delete_file(path: Path) -> None:
    """Silently delete a file if it exists (used for cleanup on error)."""
    try:
        path.unlink(missing_ok=True)
        logger.debug(f"Deleted temp file: {path}")
    except Exception as exc:
        logger.warning(f"Could not delete {path}: {exc}")


def purge_uploads_dir() -> int:
    """
    Remove all files in the uploads directory.
    Returns the number of files deleted.
    """
    settings = get_settings()
    upload_root = Path(settings.upload_dir)
    count = 0
    for f in upload_root.rglob("*"):
        if f.is_file():
            f.unlink(missing_ok=True)
            count += 1
    logger.info(f"Purged {count} file(s) from uploads directory.")
    return count