"""
Resolves a pasted URL into metadata (title, thumbnail, duration, available
formats) without downloading anything. Powered by yt-dlp, which supports
YouTube, Instagram, Facebook, TikTok, X/Twitter, Vimeo, and many more sites.

Only works on links that are publicly viewable. Private/login-gated content,
DRM-protected content, and platform-side blocks are intentionally not
bypassed here.
"""
from typing import Optional

import yt_dlp

from app.config import settings
from app.models import FormatOption, MediaInfo


class ResolveError(Exception):
    pass


def _ydl_opts() -> dict:
    return {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
        "noplaylist": False,
        "extract_flat": False,
    }


def _to_format_option(f: dict) -> Optional[FormatOption]:
    if not f.get("format_id"):
        return None
    vcodec = f.get("vcodec")
    acodec = f.get("acodec")
    return FormatOption(
        format_id=f["format_id"],
        ext=f.get("ext", ""),
        resolution=f.get("format_note") or f.get("resolution"),
        note=f.get("format"),
        filesize_approx=f.get("filesize") or f.get("filesize_approx"),
        acodec=acodec,
        vcodec=vcodec,
        has_audio=bool(acodec and acodec != "none"),
        has_video=bool(vcodec and vcodec != "none"),
    )


def resolve(url: str) -> MediaInfo:
    try:
        with yt_dlp.YoutubeDL(_ydl_opts()) as ydl:
            info = ydl.extract_info(url, download=False)
    except yt_dlp.utils.DownloadError as e:
        raise ResolveError(str(e)) from e

    if info is None:
        raise ResolveError("No media found at that link.")

    is_playlist = info.get("_type") == "playlist" or "entries" in info

    if is_playlist:
        entries = [e for e in (info.get("entries") or []) if e]
        thumbnail = None
        if entries:
            thumbnail = entries[0].get("thumbnail")
        return MediaInfo(
            id=info.get("id", "playlist"),
            title=info.get("title") or "Untitled playlist",
            thumbnail=thumbnail,
            duration=None,
            uploader=info.get("uploader"),
            platform=info.get("extractor_key", "unknown"),
            source_url=url,
            is_playlist=True,
            entry_count=len(entries),
            formats=[],
        )

    duration = info.get("duration")
    if duration and duration > settings.MAX_DURATION_SECONDS:
        raise ResolveError(
            f"This video is longer than the {settings.MAX_DURATION_SECONDS // 60}-minute limit configured on this server."
        )

    raw_formats = info.get("formats") or []
    formats = [fo for fo in (_to_format_option(f) for f in raw_formats) if fo]

    # De-dupe and keep only formats that carry video (progressive or video-only,
    # since we merge with best audio at download time) plus a couple of audio-only ones.
    seen = set()
    deduped = []
    for fo in formats:
        key = (fo.ext, fo.resolution, fo.has_audio, fo.has_video)
        if key in seen:
            continue
        seen.add(key)
        deduped.append(fo)

    return MediaInfo(
        id=info.get("id", "media"),
        title=info.get("title") or "Untitled",
        thumbnail=info.get("thumbnail"),
        duration=duration,
        uploader=info.get("uploader"),
        platform=info.get("extractor_key", "unknown"),
        source_url=url,
        is_playlist=False,
        entry_count=1,
        formats=deduped,
    )
