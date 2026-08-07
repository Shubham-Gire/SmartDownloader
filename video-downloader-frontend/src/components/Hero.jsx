import DownloadBar from './DownloadBar.jsx'
import { Youtube, Instagram, Facebook, Twitter, Music2 } from 'lucide-react'

const chips = [
  { icon: Youtube, label: 'YouTube' },
  { icon: Instagram, label: 'Instagram' },
  { icon: Facebook, label: 'Facebook' },
  { icon: Twitter, label: 'X / Twitter' },
  { icon: Music2, label: 'TikTok' },
]

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />

      <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-glow-pink/20 blur-[100px] animate-blob" />
      <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-glow-cyan/20 blur-[110px] animate-blob [animation-delay:3s]" />
      <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-glow-violet/25 blur-[100px] animate-blob [animation-delay:6s]" />

<div className="relative mx-auto max-w-5xl px-6 pb-16 pt-12 text-center sm:pt-16 lg:px-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-glow-cyan backdrop-blur-sm">
          one link in, every format out
        </span>

        <h1 className="mt-7 font-display text-4xl font-bold leading-[1.1] text-mist sm:text-6xl">
          Download <span className="font-cursive font-normal text-gradient text-5xl sm:text-7xl">anything</span>
          <br />
          from anywhere you scroll
        </h1>

        <p className="mx-auto mt-6 max-w-xl font-body text-base text-mist-muted sm:text-lg">
          Paste a link from YouTube, Instagram, Facebook, TikTok or X — grab the video,
          reel, story or full playlist in seconds. No watermark, no signup, no fuss.
        </p>

        <div className="mx-auto mt-8 max-w-3xl">
          <DownloadBar />
        </div>

        <div className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-3">
          {chips.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-display text-xs text-mist-muted backdrop-blur-sm transition hover:border-white/20 hover:text-mist"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
