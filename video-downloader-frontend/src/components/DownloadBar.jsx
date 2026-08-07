import { useState, useRef, useEffect, useCallback } from 'react'
import { ClipboardPaste, ArrowRight, Loader2, Download, RefreshCw, HardDrive, Gauge } from 'lucide-react'
import API_URL from '../config'

const statusText = {
  idle: '',
  resolving: 'Reading your link…',
  downloading: 'Fetching your file…',
  ready: 'Your file is ready — select a quality and hit Download.',
  error: 'Something went wrong. Please check the link and try again.',
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

// Format a byte count into a human-readable string.
function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

// Format a seconds ETA into "mm:ss".
function formatEta(eta) {
  if (!eta || eta < 0) return '…'
  const m = Math.floor(eta / 60)
  const s = Math.floor(eta % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function DownloadBar() {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState('idle') // idle | resolving | downloading | ready | error
  const [info, setInfo] = useState(null) // resolved media metadata
  const [selected, setSelected] = useState('') // chosen format_id
  const [errorMsg, setErrorMsg] = useState('')
  const [params, setParams] = useState({}) // download body + job_id
  const [progress, setProgress] = useState(null) // real-time progress snapshot
  const [showAdModal, setShowAdModal] = useState(false)
  const [adCountdown, setAdCountdown] = useState(20)
  const pollRef = useRef(null)
  const abortRef = useRef(null)

  const shouldShowAd = useCallback(() => {
    if (typeof window === 'undefined') return false
    const lastShown = window.localStorage.getItem('smartDownloaderAdLastShown')
    if (!lastShown) return true
    const last = Number(lastShown)
    if (!Number.isFinite(last)) return true
    return Date.now() - last >= 24 * 60 * 60 * 1000
  }, [])

  const markAdShown = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('smartDownloaderAdLastShown', String(Date.now()))
    }
  }, [])

  // Poll the backend for real-time download progress while a job is active.
  useEffect(() => {
    if (status !== 'downloading' || !params.job_id) return
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/download/progress/${params.job_id}`)
        if (res.ok) {
          const data = await res.json()
          setProgress(data)
          // Stop polling once the download finishes on the server side.
          if (data.status === 'finished') {
            clearInterval(pollRef.current)
            pollRef.current = null
          }
        }
      } catch {
        /* transient poll error — ignore */
      }
    }, 500)
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
  }, [status, params.job_id])

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

      // Default to the first available video quality. Video formats are
      // merged with the best audio track server-side so the resulting MP4
      // always includes sound.
      const firstVideo =
        data.formats && data.formats.find((f) => f.has_video && f.format_id)
      setSelected(firstVideo ? firstVideo.format_id : '')
      setInfo(data)
      setStatus('ready')
    } catch (err) {
      setErrorMsg(err.message || 'Could not read that link.')
      setStatus('error')
    }
  }

  const executeDownload = useCallback(async () => {
    if (!info) return
    setStatus('downloading')
    setErrorMsg('')
    setProgress(null)

    const audioOnly = selected === 'audio_only'
    const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const body = { url: info.source_url, audio_only: audioOnly, job_id: jobId }
    if (selected && !audioOnly) body.format_id = selected
    setParams({ ...body, job_id: jobId })

    try {
      const res = await fetch(`${API_URL}/api/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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

      const blob = await res.blob()

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

      const filename = serverFilename
        ? serverFilename
        : audioOnly
        ? 'audio.mp3'
        : `${info.title.replace(/[^\w\s-]/g, '').slice(0, 60) || 'video'}.mp4`

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
      setErrorMsg(err.message || 'Download failed. Try again.')
      setStatus('error')
    }
  }, [info, selected])

  const handleDownload = async () => {
    if (!info) return
    if (shouldShowAd()) {
      setShowAdModal(true)
      setAdCountdown(20)
      return
    }

    await executeDownload()
  }

  useEffect(() => {
    if (!showAdModal) return

    const timer = window.setInterval(() => {
      setAdCountdown((prev) => prev - 1)
    }, 1000)

    return () => window.clearInterval(timer)
  }, [showAdModal])

  useEffect(() => {
    if (!showAdModal || adCountdown > 0) return

    const id = window.setTimeout(() => {
      markAdShown()
      setShowAdModal(false)
      executeDownload()
    }, 0)

    return () => window.clearTimeout(id)
  }, [showAdModal, adCountdown, executeDownload, markAdShown])

  useEffect(() => {
    if (!showAdModal || typeof window === 'undefined') return
    if (window.adsbygoogle) {
      window.adsbygoogle.push({})
    }
  }, [showAdModal])

  const reset = () => {
    if (abortRef.current) abortRef.current.abort()
    clearInterval(pollRef.current)
    pollRef.current = null
    setUrl('')
    setInfo(null)
    setSelected('')
    setParams({})
    setProgress(null)
    setStatus('idle')
    setErrorMsg('')
    setShowAdModal(false)
  }

  // Build the video and audio quality options from the resolved formats.
  const videoOptions = info ? buildVideoOptions(info) : []
  const audioOptions = info
    ? [{ id: 'audio_only', label: 'MP3', sub: 'audio only', audio: true }]
    : []
  const allOptions = [...videoOptions, ...audioOptions]

  const percent = progress ? Math.min(100, Math.max(0, progress.percent || 0)) : 0

  return (
    <div id="download" className="w-full">
      <form onSubmit={handleSubmit} className="group relative rounded-[28px] border border-white/10 bg-gradient-to-r from-white/10 via-white/5 to-white/10 p-[1.5px]">
        <div className="flex flex-col gap-3 rounded-[26px] bg-ink-soft/90 p-3 shadow-2xl shadow-black/40 sm:flex-row sm:items-center sm:p-3">
          <div className="flex w-full items-center gap-3">
            <button
              type="button"
              onClick={handlePaste}
              className="flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white/5 px-4 py-3.5 text-sm text-mist-muted transition hover:bg-white/10 hover:text-mist"
            >
              <ClipboardPaste className="h-4 w-4" />
              Paste
            </button>

            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a video or post URL here…"
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-ink px-3 py-3 font-mono text-sm text-mist placeholder:text-mist-dim focus:outline-none focus:border-white/20"
            />

            <button
              type="submit"
              disabled={status === 'resolving' || status === 'downloading'}
              className="flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-grabit-gradient bg-200% px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-glow-pink/20 transition hover:animate-gradient-x disabled:opacity-70"
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

      {showAdModal && (
        <div className="glass mt-4 px-5 py-5">
          <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-sm font-semibold text-mist">Watch this ad for 20 seconds</p>
              <p className="mt-1 text-sm text-mist-muted">
                You will see one ad every 24 hours. After the countdown, your download will continue automatically.
              </p>
            </div>
            <div className="rounded-full border border-glow-cyan/30 bg-glow-cyan/10 px-4 py-2 font-display text-sm font-semibold text-glow-cyan">
              {adCountdown}s
            </div>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <ins
              className="adsbygoogle"
              style={{ display: 'block', width: '100%', minHeight: '120px' }}
              data-ad-client="ca-pub-2277419777414616"
              data-ad-slot="1234567890"
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => {
                markAdShown()
                setShowAdModal(false)
                executeDownload()
              }}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-mist-muted transition hover:border-white/20 hover:text-mist"
            >
              Continue now
            </button>
          </div>
        </div>
      )}

      {status === 'ready' && info && !showAdModal && (
        <div className="glass mt-4 px-5 py-5">
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
              className="shrink-0 rounded-full bg-white/5 p-2 text-mist-muted transition hover:bg-white/10 hover:text-mist"
              aria-label="Reset"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {!info.is_playlist && allOptions.length > 0 && (
            <div className="mt-5">
              {/* Video quality section — always downloads a merged video+audio MP4 */}
              <p className="mb-2 font-display text-xs font-semibold uppercase tracking-wider text-mist-dim">
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
                        ? 'border-glow-cyan/60 bg-white/10 ring-1 ring-glow-cyan/30'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]'
                    }`}
                  >
                    <span className="block font-display text-sm font-semibold text-mist">
                      {opt.label}
                    </span>
                    <span className="block text-[11px] text-mist-muted">{opt.sub}</span>
                  </button>
                ))}
              </div>

              {/* Audio section */}
              <p className="mb-2 mt-4 font-display text-xs font-semibold uppercase tracking-wider text-mist-dim">
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
                        ? 'border-glow-cyan/60 bg-white/10 ring-1 ring-glow-cyan/30'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]'
                    }`}
                  >
                    <span className="block font-display text-sm font-semibold text-mist">
                      {opt.label}
                    </span>
                    <span className="block text-[11px] text-mist-muted">{opt.sub}</span>
                  </button>
                ))}
              </div>

              <p className="mt-3 text-[11px] text-mist-dim">
                Video options download as an MP4 with the best audio track merged in.
              </p>
            </div>
          )}
          <div className="mt-4 flex flex-col items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={status === 'downloading'}
              aria-label="Download"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-grabit-gradient text-white shadow-lg shadow-glow-pink/25 transition hover:scale-105 hover:shadow-glow-pink/40 disabled:opacity-70 disabled:hover:scale-100"
            >
              {status === 'downloading' ? (
                <Loader2 className="h-7 w-7 animate-spin" />
              ) : (
                <Download className="h-7 w-7" />
              )}
            </button>
            <span className="font-display text-sm font-semibold text-mist-muted">
              {status === 'downloading'
                ? 'Downloading…'
                : info.is_playlist
                ? 'Download playlist (ZIP)'
                : 'Download'}
            </span>
          </div>
        </div>
      )}

      {status === 'downloading' && (
        <div className="glass mt-4 px-5 py-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2 font-display text-sm font-semibold text-mist">
              <Loader2 className="h-4 w-4 animate-spin text-glow-cyan" />
              Downloading…
            </span>
            <span className="font-mono text-lg font-bold text-glow-cyan">
              {percent.toFixed(0)}%
            </span>
          </div>

          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10">
            <div
              className="h-full rounded-full bg-grabit-gradient bg-200% transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>

          {progress && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                <HardDrive className="h-4 w-4 shrink-0 text-glow-pink" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-mist-dim">Size</p>
                  <p className="truncate font-mono text-xs text-mist">
                    {formatBytes(progress.downloaded_bytes)}
                    {progress.total_bytes
                      ? ` / ${formatBytes(progress.total_bytes)}`
                      : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                <Gauge className="h-4 w-4 shrink-0 text-glow-violet" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-mist-dim">Speed</p>
                  <p className="truncate font-mono text-xs text-mist">
                    {progress.speed ? `${formatBytes(progress.speed)}/s` : '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                <Loader2 className="h-4 w-4 shrink-0 text-glow-cyan" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-mist-dim">ETA</p>
                  <p className="truncate font-mono text-xs text-mist">
                    {progress.eta !== null && progress.eta !== undefined
                      ? formatEta(progress.eta)
                      : '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                <Download className="h-4 w-4 shrink-0 text-glow-pink" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-mist-dim">Status</p>
                  <p className="truncate font-mono text-xs text-mist">{progress.status}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {status === 'error' && (
        <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 backdrop-blur-sm">
          <p className="font-display text-sm text-red-300">{errorMsg}</p>
          <button
            type="button"
            onClick={reset}
            className="mt-2 text-xs text-red-400 underline"
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
