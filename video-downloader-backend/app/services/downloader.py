"""
Downloads a single item or a playlist to a scratch folder on disk using
yt-dlp, then hands the resulting file (or a zip, for playlists) back to the
router to stream to the client.

Requires ffmpeg/ffprobe for:
- merging separate video + audio streams
- extracting MP3 audio
"""

import shutil
import uuid
from pathlib import Path
from typing import Optional

import yt_dlp

from app.config import ffmpeg_location, ffmpeg_status, settings


DEFAULT_HTTP_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/126.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": (
        "text/html,application/xhtml+xml,application/xml;"
        "q=0.9,image/avif,image/webp,*/*;q=0.8"
    ),
}


class DownloadFailed(Exception):
    pass


def _require_ffmpeg() -> None:
    """Ensure ffmpeg and ffprobe are available."""

    available, missing = ffmpeg_status()

    if available:
        return

    names = ", ".join(missing) or "ffmpeg/ffprobe"

    raise DownloadFailed(
        f"Could not find {names} on this server. "
        "FFmpeg is required to merge video+audio and to extract MP3 audio."
    )


def _new_job_dir() -> Path:
    """Create a unique directory for this download."""

    # Support DOWNLOAD_DIR as either str or Path.
    base_dir = Path(settings.DOWNLOAD_DIR)

    base_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    job_id = uuid.uuid4().hex[:12]

    job_dir = base_dir / job_id

    job_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    return job_dir


def _first_file(directory: Path) -> Path:
    """Find the completed downloaded file."""

    files = [
        f
        for f in directory.glob("*")
        if f.is_file()
    ]

    if not files:
        raise DownloadFailed(
            "Download finished but produced no file."
        )

    finished = [
        f
        for f in files
        if f.suffix.lower() not in (".part", ".ytdl")
    ]

    if not finished:
        raise DownloadFailed(
            "Download did not produce a completed media file."
        )

    return finished[0]


def _apply_authentication(ydl_opts: dict) -> None:
    """
    Apply optional yt-dlp authentication settings.

    YTDLP_COOKIES_FILE is recommended for Render.

    YTDLP_COOKIES_FROM_BROWSER is mainly useful when running locally
    with an installed browser profile.
    """

    cookie_file = getattr(
        settings,
        "YTDLP_COOKIES_FILE",
        "",
    )

    cookies_from_browser = getattr(
        settings,
        "YTDLP_COOKIES_FROM_BROWSER",
        "",
    )

    # Cookies file
    if cookie_file:
        cookie_path = Path(cookie_file).expanduser()

        if not cookie_path.exists():
            raise DownloadFailed(
                "YTDLP_COOKIES_FILE is configured, but the cookies "
                f"file was not found: {cookie_path}"
            )

        ydl_opts["cookiefile"] = str(cookie_path)

        return

    # Browser cookies
    if cookies_from_browser:
        browser_value = str(
            cookies_from_browser
        ).strip()

        if browser_value:
            # yt-dlp expects a tuple/list for cookiesfrombrowser.
            #
            # Example:
            # chrome
            #
            # or:
            # chrome:Default
            #
            # or:
            # chrome:Default::
            parts = browser_value.split(":")

            browser = parts[0].strip()

            if not browser:
                return

            profile = (
                parts[1].strip()
                if len(parts) > 1
                else None
            )

            if profile:
                ydl_opts["cookiesfrombrowser"] = (
                    browser,
                    profile,
                )
            else:
                ydl_opts["cookiesfrombrowser"] = (
                    browser,
                )


def _base_options(job_dir: Path) -> dict:
    """Create common yt-dlp options."""

    options = {
        "quiet": True,
        "no_warnings": True,
        "noprogress": True,

        "outtmpl": str(
            job_dir / "%(title).80s.%(ext)s"
        ),

        "noplaylist": True,

        "restrictfilenames": False,

        "http_headers": DEFAULT_HTTP_HEADERS,

        "retries": 3,
        "fragment_retries": 3,

        "socket_timeout": 30,
    }

    _apply_authentication(options)

    # Tell yt-dlp where ffmpeg/ffprobe are.
    ffloc = ffmpeg_location()

    if ffloc:
        options["ffmpeg_location"] = ffloc

    return options


def _friendly_error(error: Exception) -> str:
    """
    Convert yt-dlp errors into cleaner messages for the frontend.
    """

    message = str(error).strip()

    lower = message.lower()

    if (
        "sign in to confirm" in lower
        or "not a bot" in lower
        or "use --cookies-from-browser" in lower
        or "use --cookies" in lower
    ):
        return (
            "YouTube requires authentication for this request. "
            "Configure YTDLP_COOKIES_FILE on the backend using a "
            "valid cookies file for content you are authorized to access."
        )

    if (
        "ffmpeg" in lower
        or "ffprobe" in lower
    ):
        return (
            "FFmpeg/FFprobe is unavailable on the backend."
        )

    return message or "Download failed."


def download_single(
    url: str,
    format_id: Optional[str],
    audio_only: bool,
) -> Path:
    """
    Download one media item.
    """

    _require_ffmpeg()

    if not url or not str(url).strip():
        raise DownloadFailed(
            "A valid URL is required."
        )

    job_dir = _new_job_dir()

    ydl_opts = _base_options(job_dir)

    if audio_only:

        ydl_opts["format"] = (
            "bestaudio/best"
        )

        ydl_opts["postprocessors"] = [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "192",
            }
        ]

    else:

        if format_id:
            ydl_opts["format"] = (
                f"{format_id}+bestaudio/"
                f"{format_id}/best"
            )
        else:
            ydl_opts["format"] = (
                "bestvideo+bestaudio/"
                "best"
            )

        ydl_opts["merge_output_format"] = "mp4"

    try:

        with yt_dlp.YoutubeDL(
            ydl_opts
        ) as ydl:

            ydl.download(
                [str(url)]
            )

    except yt_dlp.utils.DownloadError as e:

        shutil.rmtree(
            job_dir,
            ignore_errors=True,
        )

        raise DownloadFailed(
            _friendly_error(e)
        ) from e

    except Exception as e:

        shutil.rmtree(
            job_dir,
            ignore_errors=True,
        )

        raise DownloadFailed(
            _friendly_error(e)
        ) from e

    try:

        return _first_file(
            job_dir
        )

    except DownloadFailed:

        shutil.rmtree(
            job_dir,
            ignore_errors=True,
        )

        raise


def download_playlist(
    url: str,
    format_id: Optional[str],
) -> Path:
    """Download a playlist and return a ZIP archive."""

    _require_ffmpeg()

    if not url or not str(url).strip():
        raise DownloadFailed(
            "A valid playlist URL is required."
        )

    job_dir = _new_job_dir()

    outtmpl = str(
        job_dir
        / "%(playlist_index)02d - %(title).70s.%(ext)s"
    )

    ydl_opts = _base_options(job_dir)

    ydl_opts["outtmpl"] = outtmpl
    ydl_opts["noplaylist"] = False
    ydl_opts["ignoreerrors"] = True

    if format_id:
        ydl_opts["format"] = (
            f"{format_id}+bestaudio/"
            f"{format_id}/best"
        )
    else:
        ydl_opts["format"] = (
            "bestvideo+bestaudio/"
            "best"
        )

    ydl_opts["merge_output_format"] = "mp4"

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([str(url)])

    except yt_dlp.utils.DownloadError as e:
        shutil.rmtree(
            job_dir,
            ignore_errors=True,
        )

        raise DownloadFailed(
            _friendly_error(e)
        ) from e

    except Exception as e:
        shutil.rmtree(
            job_dir,
            ignore_errors=True,
        )

        raise DownloadFailed(
            _friendly_error(e)
        ) from e

    media_files = [
        f
        for f in job_dir.iterdir()
        if f.is_file()
        and f.suffix.lower()
        not in {
            ".part",
            ".ytdl",
            ".zip",
        }
    ]

    if not media_files:
        shutil.rmtree(
            job_dir,
            ignore_errors=True,
        )

        raise DownloadFailed(
            "No items in that playlist could be downloaded."
        )

    zip_base = (
        job_dir.parent
        / f"{job_dir.name}-playlist"
    )

    zip_path = Path(
        shutil.make_archive(
            str(zip_base),
            "zip",
            root_dir=job_dir,
        )
    )

    # Remove the original downloaded media.
    shutil.rmtree(
        job_dir,
        ignore_errors=True,
    )

    return zip_path