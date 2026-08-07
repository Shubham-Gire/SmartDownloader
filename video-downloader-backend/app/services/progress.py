"""
Simple in-memory download progress store.

yt-dlp reports progress via a callback while downloading. We store the latest
snapshot per job_id so a separate endpoint can return near-real-time progress
to the frontend. Entries are small and expire quickly; runs entirely in RAM.
"""
import time
import uuid
from typing import Dict, Optional


class _ProgressEntry:
    __slots__ = (
        "job_id",
        "filename",
        "percent",
        "downloaded_bytes",
        "total_bytes",
        "speed",
        "eta",
        "status",
        "updated_at",
    )

    def __init__(self, job_id: str):
        self.job_id = job_id
        self.filename = ""
        self.percent = 0.0
        self.downloaded_bytes = 0
        self.total_bytes = 0
        self.speed = 0.0
        self.eta = None
        self.status = "downloading"
        self.updated_at = time.time()


_progress: Dict[str, "_ProgressEntry"] = {}


def new_job_id() -> str:
    return uuid.uuid4().hex[:12]


def create_entry(job_id: str) -> None:
    _progress[job_id] = _ProgressEntry(job_id)


def update(job_id: str, d: dict) -> None:
    entry = _progress.get(job_id)
    if not entry:
        return
    if d.get("filename"):
        entry.filename = d["filename"]
    if d.get("downloaded_bytes") is not None:
        entry.downloaded_bytes = int(d["downloaded_bytes"])
    if d.get("total_bytes") is not None:
        entry.total_bytes = int(d["total_bytes"])
    elif d.get("total_bytes_estimate") is not None:
        entry.total_bytes = int(d["total_bytes_estimate"])
    if d.get("speed") is not None:
        entry.speed = float(d["speed"])
    if d.get("eta") is not None:
        entry.eta = int(d["eta"])
    if d.get("percent") is not None:
        entry.percent = float(d["percent"])
    if d.get("status"):
        entry.status = d["status"]
    entry.updated_at = time.time()


def get(job_id: str) -> Optional[dict]:
    entry = _progress.get(job_id)
    if not entry:
        return None
    # Clear entries that are stale (nothing updated for a while).
    if time.time() - entry.updated_at > 120:
        _progress.pop(job_id, None)
        return None
    return {
        "job_id": entry.job_id,
        "filename": entry.filename,
        "percent": entry.percent,
        "downloaded_bytes": entry.downloaded_bytes,
        "total_bytes": entry.total_bytes,
        "speed": entry.speed,
        "eta": entry.eta,
        "status": entry.status,
    }


def remove(job_id: str) -> None:
    _progress.pop(job_id, None)
