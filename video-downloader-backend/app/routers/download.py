from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask

from app.models import DownloadRequest
from app.services import downloader

router = APIRouter()


def _cleanup(file_path: Path) -> None:
    """Remove the delivered file and its now-empty job folder after the response is sent."""
    job_dir = file_path.parent
    try:
        if file_path.exists():
            file_path.unlink()
        if job_dir.exists() and not any(job_dir.iterdir()):
            job_dir.rmdir()
    except OSError:
        pass


@router.post("/download")
def download(payload: DownloadRequest):
    """Downloads a single video/audio item and streams the file back."""
    try:
        file_path = downloader.download_single(
            str(payload.url), payload.format_id, payload.audio_only
        )
    except downloader.DownloadFailed as e:
        raise HTTPException(status_code=400, detail=str(e))

    return FileResponse(
        path=file_path,
        filename=file_path.name,
        media_type="application/octet-stream",
        background=BackgroundTask(_cleanup, file_path),
    )


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
