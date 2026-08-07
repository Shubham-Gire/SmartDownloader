import asyncio
import logging
import platform
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.config import ffmpeg_available, ffmpeg_status, ffmpeg_location, settings
from app.routers import download, info
from app.services.cleanup import periodic_cleanup
from app.middleware.ratelimit import SimpleRateLimiter

logger = logging.getLogger("grabit")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")

# Startup sanity check: yt-dlp needs ffmpeg to merge video+audio and to
# extract MP3. Surface a loud, actionable warning here (instead of only a
# cryptic "ffmpeg.exe not found" mid-download) when it's missing.
if not ffmpeg_available():
    ok, missing = ffmpeg_status()
    logger.warning(
        "ffmpeg/ffprobe were not found. Video+audio merging and MP3 extraction "
        "will fail. Install ffmpeg or set FFMPEG_LOCATION or place the binaries in ./ffmpeg/bin and "
        f"restart the server. Missing: {', '.join(missing)}"
    )

PLATFORMS = [
    {"name": "YouTube", "supports": ["video", "shorts", "playlist"]},
    {"name": "Instagram", "supports": ["reel", "post", "story", "carousel"]},
    {"name": "Facebook", "supports": ["video", "reel", "post"]},
    {"name": "TikTok", "supports": ["video"]},
    {"name": "X / Twitter", "supports": ["video", "gif"]},
    {"name": "Vimeo", "supports": ["video"]},
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    cleanup_task = asyncio.create_task(periodic_cleanup())
    yield
    cleanup_task.cancel()


app = FastAPI(title="Grabit API", version="1.0.0", lifespan=lifespan)

# In dev the frontend uses the Vite proxy so the same-origin request just
# works. For production/different origins allow the configured origins.
allow_origins = settings.ALLOWED_ORIGINS
if "*" in allow_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Add a lightweight rate limiter for safety during development
app.add_middleware(SimpleRateLimiter, max_requests=120, window_seconds=60)

app.include_router(info.router, prefix="/api", tags=["info"])
app.include_router(download.router, prefix="/api", tags=["download"])


@app.get("/api/health")
def health():
    ok, missing = ffmpeg_status()
    return {
        "status": "ok",
        "ffmpeg_available": ok,
        "ffmpeg_location": ffmpeg_location(),
        "ffmpeg_missing": missing,
        "python": platform.python_version(),
        "download_dir": str(settings.DOWNLOAD_DIR),
    }


@app.get("/api/platforms")
def platforms():
    return {"platforms": PLATFORMS}


# --- Serve the built frontend (production) --------------------------------
# If FRONTEND_DIST is set (path to the vite build output /dist), serve static
# assets and fall back to index.html so client-side routing works and the API
# + frontend live on the same origin (no CORS needed when uploaded online).
_has_frontend = False
if settings.FRONTEND_DIST and settings.FRONTEND_DIST.is_dir():
    assets = settings.FRONTEND_DIST / "assets"
    if assets.is_dir():
        app.mount("/assets", StaticFiles(directory=assets), name="assets")
    _has_frontend = True

    @app.get("/{full_path:path}", include_in_schema=False)
    def spa_fallback(full_path: str):
        candidate = settings.FRONTEND_DIST / full_path
        # Serve real files (favicon, etc.) if they exist, otherwise index.html
        if full_path and candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(settings.FRONTEND_DIST / "index.html")

