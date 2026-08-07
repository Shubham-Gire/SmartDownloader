import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import logo from '../img/smart.png'

const links = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Platforms', href: '#platforms' },
  { label: 'Features', href: '#features' },
  { label: 'FAQ', href: '#faq' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
<a href="#top" className="group flex items-center gap-2">
          <img
            src={logo}
            alt="Smart Downloader logo"
            className="h-9 w-9 rounded-xl object-contain transition group-hover:scale-105"
          />
<span className="font-brand text-lg font-bold leading-none text-mist tracking-wide">Smart Downloader</span>
        </a>

        <div className="hidden items-center gap-9 md:flex">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="relative font-display text-sm font-medium text-mist-muted transition after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-grabit-gradient after:transition-all hover:text-mist hover:after:w-full"
            >
              {l.label}
            </a>
          ))}
        </div>

        <a
          href="#download"
          className="hidden rounded-full bg-grabit-gradient bg-200% px-5 py-2.5 font-display text-sm font-semibold text-white shadow-lg shadow-glow-pink/20 transition hover:animate-gradient-x hover:shadow-glow-pink/30 md:inline-block"
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
        <div className="border-t border-white/10 bg-ink/95 px-6 pb-6 md:hidden">
          <div className="flex flex-col gap-4 pt-4">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="font-display text-sm font-medium text-mist-muted transition hover:text-mist"
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
