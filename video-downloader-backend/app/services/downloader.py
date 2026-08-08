"""
Downloads a single item or a playlist to a scratch folder on disk using
yt-dlp, then hands the resulting file (or a zip, for playlists) back to the
router to stream to the client. Every job gets its own folder so concurrent
downloads never collide, and the router deletes that folder once the file
has been sent.

Requires ffmpeg on PATH for audio extraction and for merging separate
video+audio streams into a single file.
"""
import shutil
import uuid
from pathlib import Path
from typing import Optional

import yt_dlp

from app.config import ffmpeg_location, ffmpeg_status, settings


DEFAULT_HTTP_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.instagram.com/",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
}


class DownloadFailed(Exception):
    pass


def _require_ffmpeg() -> None:
    """Raise a clear DownloadFailed if ffmpeg/ffprobe cannot be located.

    yt-dlp needs ffmpeg to merge separate video+audio streams into an MP4 and
    to extract MP3 audio. Without it, users get a cryptic "ffmpeg.exe not
    found" error, so we surface an actionable message up front."""
    available, missing = ffmpeg_status()
    if available:
        return
    names = ", ".join(missing) or "ffmpeg/ffprobe"
    raise DownloadFailed(
        f"Could not find {names} on this server. "
        "ffmpeg is required to merge video+audio and to extract MP3 audio. "
        "Please install ffmpeg (see ffmpeg.org/download.html) or place the "
        "binaries in the bundled ./ffmpeg/bin folder, then restart the server."
    )


def _new_job_dir() -> Path:
    job_id = uuid.uuid4().hex[:12]
    job_dir = settings.DOWNLOAD_DIR / job_id
    job_dir.mkdir(parents=True, exist_ok=True)
    return job_dir


def _first_file(directory: Path) -> Path:
    files = [f for f in directory.glob("*") if f.is_file()]
    if not files:
        raise DownloadFailed("Download finished but produced no file.")
    # if yt-dlp left behind a .part or .ytdl sidecar, prefer the finished media file
    finished = [f for f in files if f.suffix not in (".part", ".ytdl")]
    return (finished or files)[0]


def download_single(url: str, format_id: Optional[str], audio_only: bool) -> Path:
    # Merging video+audio (or extracting MP3) requires ffmpeg; fail fast with a
    # clear message instead of yt-dlp's cryptic "ffmpeg.exe not found".
    _require_ffmpeg()

    job_dir = _new_job_dir()
    outtmpl = str(job_dir / "%(title).80s.%(ext)s")

    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "outtmpl": outtmpl,
        "noplaylist": True,
        "restrictfilenames": False,
        "http_headers": DEFAULT_HTTP_HEADERS,
    }
    if settings.YTDLP_COOKIES_FILE:
        ydl_opts["cookiefile"] = settings.YTDLP_COOKIES_FILE
    elif settings.YTDLP_COOKIES_FROM_BROWSER:
        ydl_opts["cookiesfrombrowser"] = settings.YTDLP_COOKIES_FROM_BROWSER

    ffloc = ffmpeg_location()
    if ffloc:
        ydl_opts["ffmpeg_location"] = ffloc

    if audio_only:
        ydl_opts["format"] = "bestaudio/best"
        ydl_opts["postprocessors"] = [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "192",
            }
        ]
    else:
        # When a specific video quality is chosen, merge it with the best
        # available audio track so the resulting MP4 always contains sound.
        # If no format_id is given, fall back to best video + best audio.
        ydl_opts["format"] = (
            f"{format_id}+bestaudio/best" if format_id else "bestvideo+bestaudio/best"
        )
        ydl_opts["merge_output_format"] = "mp4"

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
    except yt_dlp.utils.DownloadError as e:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise DownloadFailed(str(e)) from e

    try:
        return _first_file(job_dir)
    except DownloadFailed:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise


def download_playlist(url: str, format_id: Optional[str]) -> Path:
    # Merging video+audio streams for each playlist item requires ffmpeg.
    _require_ffmpeg()

    job_dir = _new_job_dir()
    outtmpl = str(job_dir / "%(playlist_index)02d - %(title).70s.%(ext)s")

    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "outtmpl": outtmpl,
        "format": format_id or "bestvideo+bestaudio/best",
        "merge_output_format": "mp4",
        "ignoreerrors": True,  # skip items that fail (private/removed) instead of aborting the whole playlist
        "http_headers": DEFAULT_HTTP_HEADERS,
    }
    if settings.YTDLP_COOKIES_FILE:
        ydl_opts["cookiefile"] = settings.YTDLP_COOKIES_FILE
    elif settings.YTDLP_COOKIES_FROM_BROWSER:
        ydl_opts["cookiesfrombrowser"] = settings.YTDLP_COOKIES_FROM_BROWSER

    ffloc = ffmpeg_location()
    if ffloc:
        ydl_opts["ffmpeg_location"] = ffloc

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
    except yt_dlp.utils.DownloadError as e:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise DownloadFailed(str(e)) from e

    if not any(job_dir.iterdir()):
        shutil.rmtree(job_dir, ignore_errors=True)
        raise DownloadFailed("No items in that playlist could be downloaded.")

    archive_base = str(job_dir)  # shutil appends .zip
    zip_path = shutil.make_archive(archive_base, "zip", root_dir=job_dir)

    # remove the raw media files now that they're zipped, keep only the archive
    for item in job_dir.iterdir():
        item.unlink()

    final_zip = job_dir / f"{job_dir.name}.zip"
    Path(zip_path).rename(final_zip)
    return final_zip
