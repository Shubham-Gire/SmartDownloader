# Grabit API — Python backend

FastAPI backend for the Grabit frontend. Uses [yt-dlp](https://github.com/yt-dlp/yt-dlp)
to read metadata from a pasted URL and to download the media, so it works
with any site yt-dlp supports — YouTube, Instagram (posts, reels, stories),
LinkedIn, Facebook, TikTok, X/Twitter, Pinterest, Vimeo, and more.

> **Use responsibly.** Only download content you own or have permission to
> save, and follow each platform's terms of service and applicable copyright
> law. This backend does not bypass logins, paywalls, or DRM — it can only
> fetch what's publicly viewable, same as opening the link in a browser.

## Requirements

- Python 3.10+
- **ffmpeg** on your PATH — required to merge video+audio streams and for
  audio-only (MP3) downloads.
  - macOS: `brew install ffmpeg`
  - Ubuntu/Debian: `sudo apt install ffmpeg`
  - Windows: [ffmpeg.org/download.html](https://ffmpeg.org/download.html)

## Setup

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env             # adjust ALLOWED_ORIGINS etc. if needed
python run.py                    # http://localhost:8000
```

Interactive API docs: `http://localhost:8000/docs`

## Endpoints

| Method | Path                   | Description                                              |
|--------|------------------------|------------------------------------------------------------|
| GET    | `/api/health`          | Liveness check                                            |
| GET    | `/api/platforms`       | Static list of supported platforms (for the frontend UI)  |
| POST   | `/api/resolve`         | `{ "url": "..." }` → title, thumbnail, duration, formats  |
| POST   | `/api/download`        | `{ "url", "format_id"?, "audio_only"? }` → streams a file |
| POST   | `/api/download-playlist` | `{ "url", "format_id"? }` → streams a `.zip` of the playlist |

`format_id` comes from the `formats[].format_id` values returned by
`/api/resolve`. Omit it to get yt-dlp's best available quality.

### Example

```bash
curl -X POST http://localhost:8000/api/resolve \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'

curl -X POST http://localhost:8000/api/download \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}' \
  --output video.mp4
```

## How it fits with the React frontend

Point `DownloadBar.jsx` at this API instead of the simulated `setTimeout`:

```js
const res = await fetch('http://localhost:8000/api/resolve', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url }),
})
const info = await res.json()
// then POST /api/download with the chosen format_id and stream the
// response blob into a download link
```

Set `ALLOWED_ORIGINS` in `.env` to match wherever the frontend is served
from (defaults already cover the Vite dev server on `localhost:5173`).

If Instagram content requires login or cookies, configure one of these:

- `YTDLP_COOKIES_FILE=path/to/cookies.txt`
- `YTDLP_COOKIES_FROM_BROWSER=chrome`

This lets yt-dlp use browser cookies for authenticated downloads when public
access is blocked.

## Notes on scaling this up

- **Downloads are synchronous** in this version — the request blocks until
  the file is ready. Fine for a demo; for production, move downloads to a
  background job queue (Celery/RQ/arq) and poll or use a websocket for
  progress.
- **No auth/rate limiting** is included. Add both before exposing this
  publicly — unrestricted downloading is expensive in bandwidth and easy to
  abuse.
- **Cleanup**: each request deletes its own files after sending; a periodic
  sweep (`app/services/cleanup.py`) also removes anything older than
  `MAX_FILE_AGE_MINUTES` as a safety net.
- **Legal**: build in whatever consent/ownership checks make sense for your
  audience, and keep an eye on the terms of service of any platform you
  support — they can and do change.
