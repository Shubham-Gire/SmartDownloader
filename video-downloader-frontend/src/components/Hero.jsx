import DownloadBar from './DownloadBar.jsx'
import { Youtube, Instagram, Facebook, Twitter, Music2, Link2, Linkedin } from 'lucide-react'

const chips = [
  { icon: Youtube, label: 'YouTube' },
  { icon: Instagram, label: 'Instagram' },
  { icon: Linkedin, label: 'LinkedIn' },
  { icon: Facebook, label: 'Facebook' },
  { icon: Twitter, label: 'X / Twitter' },
  { icon: Music2, label: 'TikTok' },
  { icon: Link2, label: 'Pinterest' },
]

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-grabit-radial">
      <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />

      <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-glow-pink/20 blur-[100px] animate-blob" />
      <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-glow-cyan/20 blur-[110px] animate-blob [animation-delay:3s]" />
      <div className="absolute left-1/3 bottom-0 h-64 w-64 rounded-full bg-glow-violet/25 blur-[100px] animate-blob [animation-delay:6s]" />

      <div className="relative mx-auto max-w-5xl px-6 pb-20 pt-20 text-center sm:pt-28 lg:px-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-glow-cyan">
          one link in, every format out
        </span>

        <h1 className="mt-7 font-display text-4xl font-bold leading-[1.1] text-mist sm:text-6xl">
          Download <span className="font-cursive font-normal text-gradient text-5xl sm:text-7xl">anything</span>
          <br />
          from anywhere you scroll
        </h1>

        <div className="mx-auto mt-5 max-w-3xl">
          <DownloadBar />
        </div>

        <p className="mx-auto mt-6 max-w-xl font-body text-base text-mist-muted sm:text-lg">
          Paste a link from YouTube, Instagram, LinkedIn, Facebook, TikTok, X or Pinterest — grab the video,
          reel, story or post in seconds. Instagram posts and reels work too.
        </p>

        <div className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-3">
          {chips.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-display text-xs text-mist"
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
