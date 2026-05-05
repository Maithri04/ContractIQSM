"""
api/history.py
GET  /api/history
GET  /api/history/{file_hash}
GET  /api/history/{file_hash}/file
DELETE /api/history/{file_hash}
"""
import json
import hashlib
from pathlib import Path
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from pydantic import BaseModel
from services.risk_scoring import score_contract
from fastapi.concurrency import run_in_threadpool

router = APIRouter(prefix="/api", tags=["history"])

STORAGE_DIR = Path("storage/uploads")
META_DIR    = Path("storage/meta")
STORAGE_DIR.mkdir(parents=True, exist_ok=True)
META_DIR.mkdir(parents=True, exist_ok=True)

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff"}

class HistoryUpdate(BaseModel):
    risk_level: Optional[str] = None
    analysis: Optional[dict] = None


def _meta_path(file_hash: str) -> Path:
    return META_DIR / f"{file_hash}.json"

def _fix_risk_level(data: dict, meta_file: Path) -> dict:
    if "analysis" in data and isinstance(data["analysis"], dict):
        ans_data = data["analysis"].get("data", {})
        if isinstance(ans_data, dict) and "level" in ans_data:
            true_level = ans_data["level"]
            if data.get("risk_level") != true_level:
                data["risk_level"] = true_level
                meta_file.write_text(json.dumps(data, indent=2), encoding="utf-8")
    return data

def _read_meta(file_hash: str) -> dict:
    p = _meta_path(file_hash)
    if not p.exists():
        raise HTTPException(status_code=404, detail="File not found in history.")
    data = json.loads(p.read_text(encoding="utf-8"))
    return _fix_risk_level(data, p)


def save_to_history(file_path: Path, file_name: str, risk_level: str = "UNKNOWN",
                    analysis: Optional[dict] = None) -> str:
    """Called from upload pipeline after processing."""
    file_hash = hashlib.sha256(file_path.read_bytes()).hexdigest()
    ext       = file_path.suffix.lower()
    dest      = STORAGE_DIR / f"{file_hash}{ext}"

    if not dest.exists():
        import shutil
        shutil.copy2(str(file_path), str(dest))

    meta = {
        "file_hash":   file_hash,
        "file_name":   file_name,
        "file_type":   "image" if ext in IMAGE_EXTS else "pdf",
        "ext":         ext,
        "uploaded_at": datetime.utcnow().isoformat(),
        "risk_level":  risk_level,
        "analysis":    analysis or {},
    }
    _meta_path(file_hash).write_text(json.dumps(meta, indent=2), encoding="utf-8")
    return file_hash


@router.get("/history")
def list_history():
    items = []
    for meta_file in sorted(META_DIR.glob("*.json"), key=lambda f: f.stat().st_mtime, reverse=True):
        try:
            data = json.loads(meta_file.read_text(encoding="utf-8"))
            data = _fix_risk_level(data, meta_file)
            items.append({
                "file_hash":   data["file_hash"],
                "file_name":   data["file_name"],
                "file_type":   data["file_type"],
                "uploaded_at": data["uploaded_at"],
                "risk_level":  data.get("risk_level", "UNKNOWN"),
            })
        except Exception:
            continue
    return items


@router.get("/history/{file_hash}")
def get_history_item(file_hash: str):
    return _read_meta(file_hash)


@router.get("/history/{file_hash}/file")
def get_history_file(file_hash: str):
    meta = _read_meta(file_hash)
    ext  = meta["ext"]
    dest = STORAGE_DIR / f"{file_hash}{ext}"
    if not dest.exists():
        raise HTTPException(status_code=404, detail="File not found on disk.")
    media_type = "application/pdf" if ext == ".pdf" else f"image/{ext.lstrip('.')}"
    return FileResponse(str(dest), media_type=media_type,
                        filename=meta["file_name"])


@router.delete("/history/{file_hash}")
def delete_history_item(file_hash: str):
    meta = _read_meta(file_hash)
    ext  = meta["ext"]

    file_path = STORAGE_DIR / f"{file_hash}{ext}"
    if file_path.exists():
        file_path.unlink()

    meta_file = _meta_path(file_hash)
    if meta_file.exists():
        meta_file.unlink()

    return {"message": "Deleted successfully"}

@router.put("/history/{file_hash}")
def update_history_item(file_hash: str, update_data: HistoryUpdate):
    meta = _read_meta(file_hash)
    if update_data.risk_level is not None:
        meta["risk_level"] = update_data.risk_level
    if update_data.analysis is not None:
        meta["analysis"] = update_data.analysis
    _meta_path(file_hash).write_text(json.dumps(meta, indent=2), encoding="utf-8")
    return meta

@router.post("/history/{file_hash}/summary")
async def generate_history_summary(file_hash: str):
    meta = _read_meta(file_hash)
    ext = meta["ext"]
    dest = STORAGE_DIR / f"{file_hash}{ext}"
    if not dest.exists():
        raise HTTPException(404, "File not found")
    try:
        result = await run_in_threadpool(score_contract, dest)
    except Exception as e:
        raise HTTPException(500, str(e))
    
    meta["analysis"] = result
    meta["risk_level"] = result.get("data", {}).get("level", "UNKNOWN")
    _meta_path(file_hash).write_text(json.dumps(meta, indent=2), encoding="utf-8")
    return meta