import os
import shutil
from pathlib import Path

from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv(Path(__file__).resolve().parent.parent / ".env")


class Settings(BaseModel):
    # Comma-separated list of origins allowed to call this API
    ALLOWED_ORIGINS: str = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://localhost:3000",
    )

    # Where downloaded files are staged before being sent to the client
    DOWNLOAD_DIR: str = os.getenv(
        "DOWNLOAD_DIR",
        "./tmp_downloads",
    )

    # Safety cap: refuse to resolve/download media longer than this
    MAX_DURATION_SECONDS: int = int(
        os.getenv("MAX_DURATION_SECONDS", "10800")
    )

    # How old a leftover job folder must be before cleanup
    MAX_FILE_AGE_MINUTES: int = int(
        os.getenv("MAX_FILE_AGE_MINUTES", "30")
    )

    # Optional FFmpeg location
    FFMPEG_LOCATION: str = os.getenv(
        "FFMPEG_LOCATION",
        "",
    )

    # Optional yt-dlp cookies file
    YTDLP_COOKIES_FILE: str = os.getenv(
        "YTDLP_COOKIES_FILE",
        "",
    )

    # Optional browser cookies source
    YTDLP_COOKIES_FROM_BROWSER: str = os.getenv(
        "YTDLP_COOKIES_FROM_BROWSER",
        "",
    )

    # Server port for uvicorn when run via `python run.py`
    PORT: int = int(os.getenv("PORT", "8000"))

    # Optional frontend distribution directory
    FRONTEND_DIST: Path | None = None


# IMPORTANT
settings = Settings()


# FFmpeg executable names
_FFMPEG_EXE = "ffmpeg.exe" if os.name == "nt" else "ffmpeg"
_FFPROBE_EXE = "ffprobe.exe" if os.name == "nt" else "ffprobe"


def _ffmpeg_bin_dir() -> Path:
    """
    Find the directory containing ffmpeg and ffprobe.

    Priority:
    1. Explicit FFMPEG_LOCATION
    2. Bundled ./ffmpeg/bin
    3. System PATH
    """

    # 1. Explicit environment variable
    if settings.FFMPEG_LOCATION:
        configured = Path(
            settings.FFMPEG_LOCATION
        ).expanduser()

        if configured.exists():
            return configured

    # 2. Bundled FFmpeg
    bundled = (
        Path(__file__).resolve().parent.parent
        / "ffmpeg"
        / "bin"
    )

    if (
        (bundled / _FFMPEG_EXE).exists()
        and
        (bundled / _FFPROBE_EXE).exists()
    ):
        return bundled

    # 3. System FFmpeg
    ffmpeg_path = shutil.which("ffmpeg")
    ffprobe_path = shutil.which("ffprobe")

    if ffmpeg_path and ffprobe_path:
        return Path(ffmpeg_path).resolve().parent

    if ffmpeg_path:
        return Path(ffmpeg_path).resolve().parent

    if ffprobe_path:
        return Path(ffprobe_path).resolve().parent

    # Nothing found
    return Path(".").resolve()


def ffmpeg_location() -> str:
    """Return the directory containing FFmpeg."""
    return str(_ffmpeg_bin_dir())


def ffmpeg_status() -> tuple[bool, list[str]]:
    """
    Check whether both ffmpeg and ffprobe are available.
    """

    missing = []

    # Check system PATH first
    ffmpeg_path = shutil.which("ffmpeg")
    ffprobe_path = shutil.which("ffprobe")

    # Check ffmpeg
    if not ffmpeg_path:
        bin_dir = _ffmpeg_bin_dir()
        local_ffmpeg = bin_dir / _FFMPEG_EXE

        if not local_ffmpeg.exists():
            missing.append("ffmpeg")

    # Check ffprobe
    if not ffprobe_path:
        bin_dir = _ffmpeg_bin_dir()
        local_ffprobe = bin_dir / _FFPROBE_EXE

        if not local_ffprobe.exists():
            missing.append("ffprobe")

    return len(missing) == 0, missing


def ffmpeg_available() -> bool:
    """Return True when both FFmpeg and ffprobe are available."""
    return ffmpeg_status()[0]