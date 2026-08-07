import { Github, Twitter, Mail } from 'lucide-react'
import logo from '../img/smart.png'

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-black/20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-glow-violet/40 to-transparent" />
      <div className="mx-auto max-w-6xl px-6 py-14 lg:px-10">
        <div className="flex flex-col items-start justify-between gap-10 sm:flex-row">
          <div className="max-w-sm">
<a href="#top" className="flex items-center gap-2">
              <img
                src={logo}
                alt="Smart Downloader logo"
                className="h-9 w-9 rounded-xl object-contain"
              />
<span className="font-brand text-xl font-bold leading-none text-mist tracking-wide">Smart Downloader</span>
            </a>
<p className="mt-4 font-body text-sm leading-relaxed text-mist-muted">
              Effortlessly download videos from your favourite platforms.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <p className="font-display text-xs font-semibold uppercase tracking-wide text-mist-dim">Product</p>
              <div className="mt-4 flex flex-col gap-3">
                <a href="#how-it-works" className="font-body text-sm text-mist-muted hover:text-mist">How it works</a>
                <a href="#platforms" className="font-body text-sm text-mist-muted hover:text-mist">Platforms</a>
                <a href="#features" className="font-body text-sm text-mist-muted hover:text-mist">Features</a>
              </div>
            </div>
            <div>
              <p className="font-display text-xs font-semibold uppercase tracking-wide text-mist-dim">Company</p>
              <div className="mt-4 flex flex-col gap-3">
<a href="#faq" className="font-body text-sm text-mist-muted hover:text-mist">FAQ</a>
                <a href="#/privacy" className="font-body text-sm text-mist-muted hover:text-mist">Privacy</a>
                <a href="#/terms" className="font-body text-sm text-mist-muted hover:text-mist">Terms</a>
              </div>
            </div>
<div>
              <p className="font-display text-xs font-semibold uppercase tracking-wide text-mist-dim">Connect</p>
              <div className="mt-4 flex gap-3">
                <a href="#" aria-label="Twitter" className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-mist-muted hover:text-mist">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="#" aria-label="Github" className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-mist-muted hover:text-mist">
                  <Github className="h-4 w-4" />
                </a>
                <a href="mailto:discover.yourself.in.hub@gmail.com" aria-label="Email" className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-mist-muted hover:text-mist">
                  <Mail className="h-4 w-4" />
                </a>
              </div>
              <a
                href="mailto:discover.yourself.in.hub@gmail.com"
                className="mt-3 inline-block font-body text-xs text-mist-dim underline decoration-glow-violet/60 underline-offset-2 transition hover:text-mist"
              >
                discover.yourself.in.hub@gmail.com
              </a>
            </div>
          </div>
        </div>

<div className="mt-12 border-t border-white/5 pt-6">
<p className="text-center font-body text-xs leading-relaxed text-mist-dim">
              Smart Downloader is intended for saving content you own or have explicit permission
              to retain. Users are reminded to respect the intellectual property rights of content
              creators, to comply with each platform's terms of service, and to use the service
              responsibly and lawfully.
          </p>
<p className="mt-3 text-center font-mono text-xs text-mist-dim">© {new Date().getFullYear()} Smart Downloader. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
