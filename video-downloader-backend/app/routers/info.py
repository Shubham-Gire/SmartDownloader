from fastapi import APIRouter, HTTPException

from app.models import MediaInfo, ResolveRequest
from app.services import extractor

router = APIRouter()


@router.post("/resolve", response_model=MediaInfo)
def resolve(payload: ResolveRequest):
    """
    Reads a pasted URL and returns its title, thumbnail, duration and the
    formats/qualities available to download — without downloading anything.
    """
    try:
        return extractor.resolve(str(payload.url))
    except extractor.ResolveError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:  # unexpected extractor/site error
        raise HTTPException(status_code=400, detail=f"Couldn't read that link: {e}")
