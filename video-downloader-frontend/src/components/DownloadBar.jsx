import { useState, useRef, useEffect } from 'react'
import { ClipboardPaste, ArrowRight, Loader2, Download, RefreshCw } from 'lucide-react'
import API_URL from '../config'

const statusText = {
  idle: '',
  resolving: 'Reading your link…',
  downloading: 'Fetching your file…',
  ready: 'Your file is ready — select a quality and hit Download.',
  error: 'Something went wrong. Please check the link and try again.',
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** index).toFixed(1)} ${units[index]}`
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0s'
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
}

// Build video quality options from the resolved formats.
// labeled by resolution and always download as a merged video+audio MP4.
function buildVideoOptions(info) {
  const options = []
  const seen = new Set()
  info.formats.forEach((f) => {
    if (!f.has_video) return
    // Prefer a clean resolution label; skip formats without one (e.g. audio).
    const res = f.resolution || f.note
    if (!res) return
    const key = res.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    options.push({
      id: f.format_id,
      label: res,
      sub: `${f.ext.toUpperCase()}${f.filesize_approx ? ` · ${(f.filesize_approx / 1048576).toFixed(0)} MB` : ''}`,
      audio: false,
    })
  })
  return options
}

export default function DownloadBar() {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState('idle') // idle | resolving | downloading | ready | error
  const [info, setInfo] = useState(null) // resolved media metadata
  const [selected, setSelected] = useState('') // chosen format_id
  const [errorMsg, setErrorMsg] = useState('')
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [downloadSpeed, setDownloadSpeed] = useState('')
  const [downloadEta, setDownloadEta] = useState('')
  const [downloadedBytes, setDownloadedBytes] = useState(0)
  const [totalBytes, setTotalBytes] = useState(null)
  const [fakeProgress, setFakeProgress] = useState(0)
  const abortRef = useRef(null)

  useEffect(() => {
    if (status === 'resolving' || (status === 'downloading' && !totalBytes)) {
      const interval = setInterval(() => {
        setFakeProgress((prev) => Math.min(prev + Math.random() * 10, 95))
      }, 500)
      return () => clearInterval(interval)
    }
    setFakeProgress(0)
    return undefined
  }, [status, totalBytes])

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setUrl(text)
    } catch {
      /* clipboard access denied — user can paste manually */
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!url.trim()) return

    setStatus('resolving')
    setInfo(null)
    setErrorMsg('')
    setDownloadProgress(0)
    setDownloadSpeed('')
    setDownloadEta('')
    setDownloadedBytes(0)
    setTotalBytes(null)
    setFakeProgress(0)

    try {
      const res = await fetch(`${API_URL}/api/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })

      if (!res.ok) {
        let detail = `Request failed (${res.status})`
        try {
          const err = await res.json()
          if (err && err.detail) detail = err.detail
        } catch {
          /* ignore */
        }
        throw new Error(detail)
      }

      const data = await res.json()

      // Default to the "Best quality (video + audio)" merged option (empty
      // format_id), which makes the backend merge bestvideo+bestaudio so the
      // file always includes an audio track.
      setSelected('')
      setInfo(data)
      setStatus('ready')
    } catch (err) {
      setErrorMsg(err.message || 'Could not read that link.')
      setStatus('error')
    }
  }

  const handleDownload = async () => {
    if (!info) return
    setStatus('downloading')
    setErrorMsg('')
    setDownloadProgress(0)
    setDownloadSpeed('')
    setDownloadEta('')
    setDownloadedBytes(0)
    setTotalBytes(null)

    abortRef.current = new AbortController()
    const body = { url: info.source_url }
    let endpoint = '/api/download'

    if (!info.is_playlist) {
      const audioOnly = selected === 'audio_only'
      body.audio_only = audioOnly
      if (selected && !audioOnly) body.format_id = selected
    } else {
      endpoint = '/api/download-playlist'
      if (selected) body.format_id = selected
    }

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        let detail = `Download failed (${res.status})`
        try {
          const err = await res.json()
          if (err && err.detail) detail = err.detail
        } catch {
          /* ignore */
        }
        throw new Error(detail)
      }

      const contentLength = res.headers.get('content-length')
      let blob
      if (res.body) {
        const reader = res.body.getReader()
        const total = contentLength ? parseInt(contentLength, 10) : null
        if (total) setTotalBytes(total)
        const chunks = []
        let received = 0
        const start = performance.now()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          if (value) {
            chunks.push(value)
            received += value.byteLength
            setDownloadedBytes(received)
            const elapsed = Math.max((performance.now() - start) / 1000, 0.1)
            const speed = received / elapsed
            setDownloadSpeed(`${formatBytes(speed)}/s`)

            if (total) {
              const progress = Math.min(100, Math.round((received / total) * 100))
              setDownloadProgress(progress)
              const eta = (total - received) / speed
              setDownloadEta(formatTime(eta))
            } else {
              setDownloadProgress(0)
              setDownloadEta('Calculating…')
            }
          }
        }

        blob = new Blob(chunks)
      } else {
        blob = await res.blob()
        setDownloadProgress(100)
      }

      // Prefer the RFC 5987 fallback filename* (handles non-ASCII titles),
      // then the plain filename=, otherwise fall back to a title-based name.
      const disposition = res.headers.get('content-disposition') || ''
      const starMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i)
      const plainMatch = disposition.match(/filename="?([^";]+)"?/i)
      const serverFilename = starMatch
        ? decodeURIComponent(starMatch[1])
        : plainMatch
        ? plainMatch[1]
        : null

      const sanitizedTitle = info.title.replace(/[^\w\s-]/g, '').slice(0, 60) || (info.is_playlist ? 'playlist' : 'video')
      const filename = serverFilename
        ? serverFilename
        : info.is_playlist
        ? `${sanitizedTitle}.zip`
        : selected === 'audio_only'
        ? 'audio.mp3'
        : `${sanitizedTitle}.mp4`

      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(objectUrl), 4000)

      setStatus('ready')
    } catch (err) {
      if (err.name === 'AbortError') {
        setErrorMsg('Download canceled.')
        setStatus('ready')
      } else {
        setErrorMsg(err.message || 'Download failed. Try again.')
        setStatus('error')
      }
    } finally {
      abortRef.current = null
    }
  }

  const reset = () => {
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = null
    setUrl('')
    setInfo(null)
    setSelected('')
    setStatus('idle')
    setErrorMsg('')
    setDownloadProgress(0)
    setDownloadSpeed('')
    setDownloadEta('')
    setDownloadedBytes(0)
    setTotalBytes(null)
    setFakeProgress(0)
  }

  // Build the video and audio quality options from the resolved formats.
  const videoOptions = info ? buildVideoOptions(info) : []
  const audioOptions = info && !info.is_playlist
    ? [{ id: 'audio_only', label: 'MP3', sub: 'audio only', audio: true }]
    : []
  const allOptions = [...videoOptions, ...audioOptions]
  const showProgress = status === 'resolving' || status === 'downloading'
  const downloadedLabel = downloadedBytes > 0 ? formatBytes(downloadedBytes) : ''
  const progressLabel = status === 'downloading'
    ? totalBytes
      ? `${downloadProgress}% · ${formatBytes(downloadedBytes)} / ${formatBytes(totalBytes)}`
      : downloadedBytes > 0
      ? `${fakeProgress}% · ${formatBytes(downloadedBytes)} downloaded`
      : `${fakeProgress}%`
    : `${fakeProgress}% · Resolving…`
  const progressWidth = status === 'downloading'
    ? totalBytes
      ? `${downloadProgress}%`
      : `${fakeProgress}%`
    : `${fakeProgress}%`
  const progressHeading = status === 'downloading' ? 'Download progress' : 'Resolving link'
  const progressAnimation = status === 'resolving' || (status === 'downloading' && !totalBytes) ? 'animate-pulse' : ''

  return (
    <div id="download" className="w-full">
      <form onSubmit={handleSubmit} className="group relative rounded-[28px] border border-white/10 p-[1.5px]">
        <div className="flex flex-col gap-3 rounded-[26px] bg-ink-soft/90 p-3 sm:flex-row sm:items-center sm:p-3 shadow">
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handlePaste}
              className="w-full sm:w-auto flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white/5 px-4 py-3.5 text-sm text-mist transition hover:bg-white/10"
            >
              <ClipboardPaste className="h-4 w-4" />
              Paste
            </button>

            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a video or post URL here…"
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-3 font-mono text-sm text-mist placeholder:text-mist-dim focus:outline-none"
            />

            <button
              type="submit"
              disabled={status === 'resolving' || status === 'downloading'}
              className="w-full sm:w-auto flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-grabit-gradient px-6 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-70"
            >
              {status === 'resolving' || status === 'downloading' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Fetching
                </>
              ) : (
                <>
                  Grab it
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {(status === 'ready' || status === 'downloading') && info && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {info.thumbnail && (
                <a
                  href={info.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block shrink-0"
                  title="Open source link"
                >
                  <img
                    src={info.thumbnail}
                    alt={info.title}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                    className="h-20 w-32 rounded-lg object-cover ring-1 ring-white/10 sm:h-24 sm:w-40"
                  />
                </a>
              )}
              <div className="min-w-0">
                <p className="line-clamp-2 font-display text-sm font-semibold text-mist">
                  {info.title}
                </p>
                <p className="mt-0.5 text-xs text-mist-muted">
                  {info.platform}
                  {info.duration ? ` · ${Math.round(info.duration)}s` : ''}
                  {info.is_playlist ? ` · playlist (${info.entry_count})` : ''}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={reset}
              className="shrink-0 rounded-full bg-white/5 p-2 text-mist-muted transition hover:bg-white/10"
              aria-label="Reset"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

{!info.is_playlist && allOptions.length > 0 && (
            <div className="mt-4">
              {/* Video quality section — always downloads a merged video+audio MP4 */}
              <p className="mb-2 font-display text-xs font-semibold uppercase tracking-wide text-mist-muted">
                Video
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {videoOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelected(opt.id)}
                    className={`rounded-xl border px-3 py-2 text-left transition ${
                      selected === opt.id
                        ? 'border-mist bg-white/10 ring-1 ring-mist'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <span className="block font-display text-sm font-semibold text-mist">
                      {opt.label}
                    </span>
                    <span className="block text-[11px] text-mist-dim">{opt.sub}</span>
                  </button>
                ))}
              </div>

              {/* Audio section */}
              <p className="mb-2 mt-4 font-display text-xs font-semibold uppercase tracking-wide text-mist-muted">
                Audio
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {audioOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelected(opt.id)}
                    className={`rounded-xl border px-3 py-2 text-left transition ${
                      selected === opt.id
                        ? 'border-mist bg-white/10 ring-1 ring-mist'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <span className="block font-display text-sm font-semibold text-mist">
                      {opt.label}
                    </span>
                    <span className="block text-[11px] text-mist-dim">{opt.sub}</span>
                  </button>
                ))}
              </div>

              <p className="mt-3 text-[11px] text-mist-dim">
                Video options download as an MP4 with the best audio track merged in.
              </p>
            </div>
          )}
          <div className="mt-4 space-y-3">
            {showProgress && (
              <div className="rounded-2xl bg-white/10 p-3">
                <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-[11px] text-mist-dim">
                  <span>{progressHeading}</span>
                  <span>{progressLabel}</span>
                </div>
                <div className="mb-3 grid grid-cols-1 gap-2 text-[11px] text-mist-dim sm:grid-cols-3">
                  <span>{downloadSpeed || 'Estimating speed…'}</span>
                  <span>{downloadEta ? `ETA ${downloadEta}` : 'ETA calculating…'}</span>
                  <span>{totalBytes ? `Downloaded ${formatBytes(downloadedBytes)} of ${formatBytes(totalBytes)}` : `Downloaded ${formatBytes(downloadedBytes)}`}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-grabit-gradient transition-all duration-300"
                    style={{ width: progressWidth }}
                  />
                </div>
              </div>
            )}
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={handleDownload}
                disabled={status === 'downloading' || !info}
                className="w-full sm:w-auto min-w-[180px] rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {status === 'downloading' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Downloading…</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>{info?.is_playlist ? 'Download playlist' : 'Download'}</span>
                  </>
                )}
              </button>
              {status === 'downloading' && (
                <button
                  type="button"
                  onClick={() => {
                    if (abortRef.current) abortRef.current.abort()
                    reset()
                  }}
                  className="w-full sm:w-auto min-w-[140px] rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-mist transition hover:bg-white/10"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-4">
          <p className="font-display text-sm text-red-200">{errorMsg}</p>
          <button
            type="button"
            onClick={reset}
            className="mt-2 text-xs text-red-200 underline"
          >
            Try another link
          </button>
        </div>
      )}

      {status !== 'idle' && status !== 'error' && (
        <p className="mt-3 text-center font-body text-xs text-mist-dim sm:text-left">
          {statusText[status]}
        </p>
      )}
    </div>
  )
}
