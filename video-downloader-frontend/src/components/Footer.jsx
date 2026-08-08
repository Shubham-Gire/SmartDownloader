import { Zap, Twitter, Mail, Download } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink-soft/90">
      <div className="mx-auto max-w-6xl px-6 py-14 lg:px-10">
        <div className="flex flex-col items-start justify-between gap-10 sm:flex-row">
          <div className="max-w-sm">
            <a href="#top" className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-grabit-gradient">
                <Download className="h-5 w-5 text-white" />
              </span>
              <span className="font-display text-2xl font-semibold tracking-tight text-mist">SmartDownloader</span>
            </a>
            <p className="mt-4 font-body text-sm leading-relaxed text-mist-muted">
              Paste any link, download the video. Built for people who move fast and
              save the stuff worth keeping.
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
                <a
                  href="#privacy"
                  onClick={() => {
                    if (window.location.hash !== '#privacy') {
                      window.location.hash = '#privacy'
                    }
                  }}
                  className="font-body text-sm text-mist-muted hover:text-mist"
                >
                  Privacy
                </a>
                <a
                  href="#terms"
                  onClick={() => {
                    if (window.location.hash !== '#terms') {
                      window.location.hash = '#terms'
                    }
                  }}
                  className="font-body text-sm text-mist-muted hover:text-mist"
                >
                  Terms
                </a>
              </div>
            </div>
            <div>
              <p className="font-display text-xs font-semibold uppercase tracking-wide text-mist-dim">Connect</p>
              <div className="mt-4 flex flex-col gap-3">
                <div className="flex gap-3">
                  <a href="#" aria-label="Twitter" className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-mist-muted hover:text-mist">
                    <Twitter className="h-4 w-4" />
                  </a>
                  <a href="mailto:discover.yourself.in.hub@gmail.com" aria-label="Email" className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-mist-muted hover:text-mist">
                    <Mail className="h-4 w-4" />
                  </a>
                </div>
                <a href="mailto:discover.yourself.in.hub@gmail.com" className="text-sm text-mist-muted hover:text-mist">
                  discover.yourself.in.hub@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center">
          <p className="font-body text-xs leading-relaxed text-mist-dim">
            SmartDownloader is only for downloading content you own or have permission to use.
            Please respect creators' rights and each platform's terms of service when accessing media.
          </p>
          <p className="mt-3 font-body text-xs leading-relaxed text-mist-dim">
            By using SmartDownloader, you agree to our{' '}
            <a href="#privacy" className="text-glow-cyan hover:text-mist">Privacy Policy</a>{' '}
            and{' '}
            <a href="#terms" className="text-glow-cyan hover:text-mist">Terms of Service</a>.
          </p>
          <p className="mt-3 font-mono text-xs text-mist-dim">© {new Date().getFullYear()} SmartDownloader. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
