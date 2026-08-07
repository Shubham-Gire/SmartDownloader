import os
from pathlib import Path

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # python-dotenv is optional; env vars can be set another way
    pass


class Settings:
    ALLOWED_ORIGINS = [
        o.strip()
        for o in os.getenv("ALLOWED_ORIGINS", "*").split(",")
        if o.strip()
    ]
    DOWNLOAD_DIR = Path(os.getenv("DOWNLOAD_DIR", "./tmp_downloads")).resolve()
    MAX_DURATION_SECONDS = int(os.getenv("MAX_DURATION_SECONDS", "10800"))
    MAX_FILE_AGE_MINUTES = int(os.getenv("MAX_FILE_AGE_MINUTES", "30"))
    PORT = int(os.getenv("PORT", "8000"))
    # Path to the ffmpeg/ffprobe binaries. yt-dlp uses these to merge
    # video+audio into an MP4 and to extract MP3 audio. Falls back to the
    # bundled project copy under ./ffmpeg, then to system PATH, whichever
    # exists first.
    FFMPEG_LOCATION = os.getenv("FFMPEG_LOCATION", "")
    # Path to the built frontend (vite build output). Only used when non-empty
    # so the backend can serve the React app in production on the same origin.
    FRONTEND_DIST = Path(
        os.getenv("FRONTEND_DIST", "")
    ).resolve() if os.getenv("FRONTEND_DIST") else None


settings = Settings()
settings.DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)


# Binary names to require in the ffmpeg directory, with the Windows ".exe"
# extension handled automatically where applicable.
_FFMPEG_EXE = "ffmpeg.exe" if os.name == "nt" else "ffmpeg"
_FFPROBE_EXE = "ffprobe.exe" if os.name == "nt" else "ffprobe"


def _ffmpeg_bin_dir() -> Path:
    """Resolve the ffmpeg/ffprobe directory, mirroring ffmpeg_location()'s
    priority: explicit FFMPEG_LOCATION env var -> bundled ./ffmpeg/bin.
    Returns an empty Path if neither is configured/exists."""
    if settings.FFMPEG_LOCATION and Path(settings.FFMPEG_LOCATION).exists():
        return Path(settings.FFMPEG_LOCATION)
    bundled = Path(__file__).resolve().parent.parent / "ffmpeg" / "bin"
    if (bundled / _FFMPEG_EXE).exists():
        return bundled
    return Path()


def ffmpeg_location() -> str:
    """Return the directory containing ffmpeg/ffprobe for yt-dlp.

    Priority: explicit FFMPEG_LOCATION env var -> bundled ./ffmpeg/bin ->
    empty string (let yt-dlp fall back to system PATH).
    """
    return str(_ffmpeg_bin_dir())


def ffmpeg_status() -> tuple[bool, list[str]]:
    """Check whether the required ffmpeg/ffprobe binaries are present.

    Returns (available, missing_binaries) where missing_binaries lists the
    names of binaries we expected but could not find. A non-empty list means
    merging video+audio or MP3 extraction will fail at download time.
    """
    missing = []
    bin_dir = _ffmpeg_bin_dir()
    for name in (_FFMPEG_EXE, _FFPROBE_EXE):
        if not (bin_dir / name).exists():
            missing.append(name)
    return (not missing, missing)


def ffmpeg_available() -> bool:
    """Convenience wrapper: True when ffmpeg and ffprobe are both present."""
    return ffmpeg_status()[0]

