"""
Safety net that runs alongside the API: sweeps the download scratch folder
and removes any job directories older than MAX_FILE_AGE_MINUTES. Normally
each request cleans up after itself, but this catches leftovers from
crashed requests, cancelled downloads, etc.
"""
import asyncio
import shutil
import time

from app.config import settings


async def periodic_cleanup(interval_seconds: int = 300) -> None:
    while True:
        _sweep_once()
        await asyncio.sleep(interval_seconds)


def _sweep_once() -> None:
    cutoff = time.time() - settings.MAX_FILE_AGE_MINUTES * 60
    if not settings.DOWNLOAD_DIR.exists():
        return
    for job_dir in settings.DOWNLOAD_DIR.iterdir():
        try:
            if job_dir.is_dir() and job_dir.stat().st_mtime < cutoff:
                shutil.rmtree(job_dir, ignore_errors=True)
        except OSError:
            continue
