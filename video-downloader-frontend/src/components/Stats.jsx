const stats = [
  { value: '2M+', label: 'links grabbed' },
  { value: '8', label: 'platforms supported' },
  { value: '180+', label: 'countries reached' },
  { value: '4.9', label: 'average rating' },
]

export default function Stats() {
  return (
    <section className="border-y border-white/5 bg-ink-soft/50">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-14 sm:grid-cols-4 lg:px-10">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-display text-3xl font-bold text-gradient sm:text-4xl">{s.value}</p>
            <p className="mt-1.5 font-body text-xs uppercase tracking-wide text-mist-dim">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
