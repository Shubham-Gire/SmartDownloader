import os
import shutil
from pathlib import Path

# Binary names
_FFMPEG_EXE = "ffmpeg.exe" if os.name == "nt" else "ffmpeg"
_FFPROBE_EXE = "ffprobe.exe" if os.name == "nt" else "ffprobe"


def _ffmpeg_bin_dir() -> Path:
    """
    Resolve the directory containing ffmpeg and ffprobe.

    Priority:
    1. Explicit FFMPEG_LOCATION environment variable
    2. Bundled ./ffmpeg/bin directory
    3. System PATH
    """

    # 1. Explicit environment variable
    if settings.FFMPEG_LOCATION:
        configured = Path(settings.FFMPEG_LOCATION).expanduser()

        if configured.exists():
            return configured

    # 2. Bundled FFmpeg directory
    bundled = Path(__file__).resolve().parent.parent / "ffmpeg" / "bin"

    if (
        (bundled / _FFMPEG_EXE).exists()
        and (bundled / _FFPROBE_EXE).exists()
    ):
        return bundled

    # 3. System FFmpeg
    ffmpeg_path = shutil.which("ffmpeg")
    ffprobe_path = shutil.which("ffprobe")

    if ffmpeg_path and ffprobe_path:
        return Path(ffmpeg_path).resolve().parent

    # Return system location if either executable exists.
    # ffmpeg_status() will report the missing executable.
    if ffmpeg_path:
        return Path(ffmpeg_path).resolve().parent

    if ffprobe_path:
        return Path(ffprobe_path).resolve().parent

    # Nothing found
    return Path(".").resolve()


def ffmpeg_location() -> str:
    """Return the directory containing ffmpeg and ffprobe."""
    return str(_ffmpeg_bin_dir())


def ffmpeg_status() -> tuple[bool, list[str]]:
    """Check whether ffmpeg and ffprobe are available."""

    bin_dir = _ffmpeg_bin_dir()

    missing = []

    for name in (_FFMPEG_EXE, _FFPROBE_EXE):
        executable = bin_dir / name

        if not executable.exists():
            # Also check system PATH
            if shutil.which(name) is None:
                missing.append(name)

    return len(missing) == 0, missing


def ffmpeg_available() -> bool:
    """Return True when both ffmpeg and ffprobe are available."""
    return ffmpeg_status()[0]