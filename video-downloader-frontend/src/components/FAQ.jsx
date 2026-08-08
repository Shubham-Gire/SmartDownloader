const faqs = [
  {
    q: 'Which link formats can I paste?',
    a: 'Any public video, reel, post or playlist URL from a supported platform — including Instagram posts and reels. Copy it straight from the share menu or your browser address bar.',
  },
  {
    q: 'Do downloads keep the original quality?',
    a: 'Yes. Pick a quality from the dropdown and we fetch that exact version instead of re-encoding it.',
  },
  {
    q: 'Can I download a whole playlist at once?',
    a: 'Paste the playlist or album link and every item inside it is queued for you automatically.',
  },
  {
    q: 'Is my link history saved anywhere?',
    a: 'No. Nothing is logged or stored — once you close the tab, that session is gone.',
  },
  {
    q: 'Is it okay to download any video I find?',
    a: 'Only download content you own or have permission to use, and always respect the original creator\u2019s rights and each platform\u2019s terms.',
  },
]

export default function FAQ() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-24 lg:px-10">
      <div className="mb-12 text-center">
        <h2 className="font-display text-3xl font-bold text-mist sm:text-4xl">
          Good to <span className="font-cursive font-normal text-glow-gold text-4xl sm:text-5xl">know</span>
        </h2>
      </div>

      <div className="divide-y divide-white/5 rounded-3xl border border-white/10 bg-white/5">
        {faqs.map((f) => (
          <details key={f.q} className="group px-6 py-5 open:bg-white/10">
            <summary className="flex cursor-pointer list-none items-center justify-between font-display text-sm font-medium text-mist sm:text-base">
              {f.q}
              <span className="ml-4 shrink-0 font-mono text-glow-cyan transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 font-body text-sm leading-relaxed text-mist-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
