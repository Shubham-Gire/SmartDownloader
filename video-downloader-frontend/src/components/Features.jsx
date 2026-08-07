import { Gauge, Layers, ShieldCheck, Smartphone, SparklesIcon, Infinity as InfinityIcon } from 'lucide-react'

const features = [
  { icon: Gauge, title: 'Original quality', body: 'Grab files up to 4K — we never re-compress your download.', color: 'text-glow-pink' },
  { icon: Layers, title: 'Playlists & batches', body: 'Drop a playlist or album link and get every item in one go.', color: 'text-glow-cyan' },
  { icon: SparklesIcon, title: 'No watermark', body: 'Clean exports, exactly as the creator posted them.', color: 'text-glow-gold' },
  { icon: Smartphone, title: 'Works anywhere', body: 'Same smooth experience on phone, tablet or desktop.', color: 'text-glow-violet' },
  { icon: ShieldCheck, title: 'Private by default', body: 'Links aren\u2019t stored and history clears when you close the tab.', color: 'text-glow-cyan' },
  { icon: InfinityIcon, title: 'No daily limits', body: 'Grab one clip or fifty — there\u2019s no cap and no queue.', color: 'text-glow-pink' },
]

export default function Features() {
  return (
    <section id="features" className="relative mx-auto max-w-6xl px-6 py-24 lg:px-10">
      <div className="mb-14 text-center">
        <h2 className="font-display text-3xl font-bold text-mist sm:text-4xl">
          Built to feel <span className="font-cursive font-normal text-glow-cyan text-4xl sm:text-5xl">effortless</span>
        </h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, body, color }) => (
          <div
            key={title}
            className="glass group p-7 transition duration-300 hover:-translate-y-1 hover:border-white/20"
          >
            <div className={`grid h-11 w-11 place-items-center rounded-2xl bg-white/5 transition group-hover:scale-110 ${color}`}>
              <Icon className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <h3 className="mt-5 font-display text-base font-semibold text-mist">{title}</h3>
            <p className="mt-2 font-body text-sm leading-relaxed text-mist-muted">{body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
