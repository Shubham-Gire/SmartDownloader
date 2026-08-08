const steps = [
  {
    n: '01',
    title: 'Copy the link',
    body: 'Open the video, reel, post or playlist in your app or browser and copy its URL.',
  },
  {
    n: '02',
    title: 'Paste into SmartDownloader',
    body: 'Drop the link into the bar above and pick the quality or format you want.',
  },
  {
    n: '03',
    title: 'Download instantly',
    body: 'We fetch the file and hand it straight to your device — original quality, no watermark.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative mx-auto max-w-6xl px-6 py-24 lg:px-10">
      <div className="mb-14 text-center">
        <h2 className="font-display text-3xl font-bold text-mist sm:text-4xl">
          Three steps. <span className="font-cursive font-normal text-glow-gold text-4xl sm:text-5xl">That's it.</span>
        </h2>
      </div>

      <div className="relative grid gap-8 md:grid-cols-3">
        <div className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-white/10 to-transparent md:block" />
        {steps.map((s) => (
          <div key={s.n} className="relative rounded-3xl border border-white/5 bg-white/[0.02] p-8">
            <span className="font-mono text-sm text-glow-pink">{s.n}</span>
            <h3 className="mt-4 font-display text-xl font-semibold text-mist">{s.title}</h3>
            <p className="mt-3 font-body text-sm leading-relaxed text-mist-muted">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
