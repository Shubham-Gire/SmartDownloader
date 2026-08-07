from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask

from app.models import DownloadRequest
from app.services import downloader, progress

router = APIRouter()


def _cleanup(file_path: Path, job_id: str | None = None) -> None:
    """Remove the delivered file and its now-empty job folder after the response is sent."""
    job_dir = file_path.parent
    try:
        if file_path.exists():
            file_path.unlink()
        if job_dir.exists() and not any(job_dir.iterdir()):
            job_dir.rmdir()
    except OSError:
        pass
    if job_id:
        progress.remove(job_id)


@router.post("/download")
def download(payload: DownloadRequest):
    """Downloads a single video/audio item and streams the file back."""
    try:
        file_path = downloader.download_single(
            str(payload.url), payload.format_id, payload.audio_only, payload.job_id
        )
    except downloader.DownloadFailed as e:
        if payload.job_id:
            progress.remove(payload.job_id)
        raise HTTPException(status_code=400, detail=str(e))

    return FileResponse(
        path=file_path,
        filename=file_path.name,
        media_type="application/octet-stream",
        background=BackgroundTask(_cleanup, file_path, payload.job_id),
    )


@router.get("/download/progress/{job_id}")
def download_progress(job_id: str):
    """Return the current download progress snapshot for a job_id."""
    entry = progress.get(job_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="Unknown or expired download job.")
    return entry


@router.post("/download-playlist")
def download_playlist(payload: DownloadRequest):
    """Downloads every item in a playlist/album link and returns them zipped."""
    try:
        zip_path = downloader.download_playlist(str(payload.url), payload.format_id)
    except downloader.DownloadFailed as e:
        raise HTTPException(status_code=400, detail=str(e))

    return FileResponse(
        path=zip_path,
        filename=zip_path.name,
        media_type="application/zip",
        background=BackgroundTask(_cleanup, zip_path),
    )
