import { Zap, Download, Menu, X } from 'lucide-react'
import { useState } from 'react'

const links = [
  { label: 'Home', href: '#top' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Platforms', href: '#platforms' },
  { label: 'Features', href: '#features' },
  { label: 'FAQ', href: '#faq' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink-soft/90 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <a href="#top" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-grabit-gradient">
            <Download className="h-5 w-5 text-white" />
          </span>
          <span className="font-display text-2xl font-semibold tracking-tight text-mist">SmartDownloader</span>
        </a>

        <div className="hidden items-center gap-9 md:flex">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="font-display text-sm font-medium text-mist-muted transition hover:text-mist"
            >
              {l.label}
            </a>
          ))}
        </div>

        <a
          href="#download"
          className="hidden rounded-full bg-grabit-gradient bg-200% px-5 py-2.5 font-display text-sm font-semibold text-white transition hover:animate-gradient-x md:inline-block"
        >
          Paste a link
        </a>

        <button
          aria-label="Toggle menu"
          className="text-mist md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/10 bg-ink-soft px-6 pb-6 md:hidden">
          <div className="flex flex-col gap-4 pt-4">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="font-display text-sm font-medium text-mist-muted"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#download"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-grabit-gradient px-5 py-2.5 text-center font-display text-sm font-semibold text-white"
            >
              Paste a link
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
