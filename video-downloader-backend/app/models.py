from typing import List, Optional
from pydantic import BaseModel, HttpUrl, Field


class ResolveRequest(BaseModel):
    url: HttpUrl


class FormatOption(BaseModel):
    format_id: str
    ext: str
    resolution: Optional[str] = None
    note: Optional[str] = None
    filesize_approx: Optional[int] = None
    acodec: Optional[str] = None
    vcodec: Optional[str] = None
    has_audio: bool = False
    has_video: bool = False


class MediaInfo(BaseModel):
    id: str
    title: str
    thumbnail: Optional[str] = None
    duration: Optional[float] = None
    uploader: Optional[str] = None
    platform: str
    source_url: str
    is_playlist: bool = False
    entry_count: int = 1
    formats: List[FormatOption] = Field(default_factory=list)


class DownloadRequest(BaseModel):
    url: HttpUrl
    format_id: Optional[str] = None
    audio_only: bool = False
    job_id: Optional[str] = None


class ErrorResponse(BaseModel):
    detail: str
