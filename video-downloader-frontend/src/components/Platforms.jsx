import { Youtube, Instagram, Facebook, Twitter, Music2, Link2, Linkedin } from 'lucide-react'

const platforms = [
  { icon: Youtube, name: 'YouTube', desc: 'Videos, Shorts & full playlists', color: 'from-glow-pink/20' },
  { icon: Instagram, name: 'Instagram', desc: 'Reels, posts, stories & carousels', color: 'from-glow-violet/20' },
  { icon: Linkedin, name: 'LinkedIn', desc: 'Professional video posts & shared stories', color: 'from-glow-teal/20' },
  { icon: Facebook, name: 'Facebook', desc: 'Public videos, reels & posts', color: 'from-glow-cyan/20' },
  { icon: Twitter, name: 'X / Twitter', desc: 'Video & GIF posts', color: 'from-glow-gold/20' },
  { icon: Music2, name: 'TikTok', desc: 'Clips without the watermark', color: 'from-glow-pink/20' },
  { icon: Link2, name: 'Pinterest', desc: 'Pins, boards & video posts', color: 'from-glow-violet/20' },
]

export default function Platforms() {
  return (
    <section id="platforms" className="mx-auto max-w-6xl px-6 py-24 lg:px-10">
      <div className="mb-14 text-center">
        <span className="font-mono text-xs uppercase tracking-wider text-glow-cyan">supported everywhere</span>
        <h2 className="mt-4 font-display text-3xl font-bold text-mist sm:text-4xl">
          One bar, every <span className="font-cursive font-normal text-gradient text-4xl sm:text-5xl">platform</span>
        </h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {platforms.map(({ icon: Icon, name, desc, color }) => (
          <div
            key={name}
            className={`group rounded-3xl border border-white/5 bg-gradient-to-br ${color} to-transparent p-6 transition hover:border-white/10`}
          >
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-ink-softer">
              <Icon className="h-5 w-5 text-mist" />
            </div>
            <h3 className="mt-5 font-display text-lg font-semibold text-mist">{name}</h3>
            <p className="mt-1.5 font-body text-sm text-mist-muted">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
