import time
from typing import Dict

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse


class SimpleRateLimiter(BaseHTTPMiddleware):
    """Very small in-memory per-IP rate limiter suitable for dev/testing.

    Not suitable for multi-process or multi-host production. Use a central
    store (Redis) for real deployments.
    """

    def __init__(self, app, max_requests: int = 60, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window = window_seconds
        self._store: Dict[str, Dict[str, int]] = {}

    async def dispatch(self, request: Request, call_next):
        ip = request.client.host if request.client else "unknown"
        now = int(time.time())
        bucket = self._store.get(ip)
        if not bucket:
            bucket = {"ts": now, "count": 0}
            self._store[ip] = bucket

        # reset window
        if now - bucket["ts"] >= self.window:
            bucket["ts"] = now
            bucket["count"] = 0

        bucket["count"] += 1
        if bucket["count"] > self.max_requests:
            return JSONResponse(
                {"detail": "Rate limit exceeded. Try again later."}, status_code=429
            )

        return await call_next(request)
