import { ArrowLeft, ShieldCheck } from 'lucide-react'
import logo from '../img/smart.png'

const sections = [
  {
    title: '1. What we collect',
    body: 'Smart Downloader is built around privacy. We do not require an account, and we do not ask for your name, email, or any personal identifier to use the downloader. The only data that touches our servers is the URL you paste — and that is used solely to resolve and fetch the media you requested, then discarded.',
  },
  {
    title: '2. Link handling & retention',
    body: 'Each link you paste is processed in memory to read the video metadata and stream the download back to you. Once the response is delivered, the temporary file is deleted from the server and the link is not saved in any database, log, or history. Close the tab and that session is gone.',
  },
  {
    title: '3. No tracking, no cookies',
    body: 'We do not use advertising trackers, analytics beacons, or third-party cookies on this site. Nothing about your browsing behaviour is profiled or sold. Your device simply talks to our API to fetch the media you requested — nothing more.',
  },
  {
    title: '4. What we never store',
    body: 'We never store your downloaded files, your pasted URLs, your IP address in a permanent log, or any content that would identify you. Temporary server-side files live only long enough to stream your download and are wiped automatically afterwards.',
  },
  {
    title: '5. Third-party platforms',
    body: 'When you paste a link, we fetch public data from the originating platform (e.g. YouTube, Instagram, TikTok) through yt-dlp. Those platforms have their own privacy policies, and any interaction with them is governed by their terms — not ours. We only ever request what is publicly viewable.',
  },
  {
    title: '6. Your rights',
    body: 'Because we hold no personal data, there is nothing to access, correct, or delete. If you have questions about how a particular request was handled, or want a copy of what the server saw in a specific session, contact us at discover.yourself.in.hub@gmail.com and we will help.',
  },
  {
    title: '7. Contact',
    body: 'Questions about this policy? Reach out at discover.yourself.in.hub@gmail.com and we will get back to you as soon as we can.',
  },
]

export default function Privacy() {
  return (
    <div className="relative min-h-screen bg-ink">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-glow-pink/10 blur-[140px]" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-glow-violet/10 blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-glow-cyan/10 blur-[140px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <a href="#/" className="flex items-center gap-2">
            <img
              src={logo}
              alt="Smart Downloader logo"
              className="h-9 w-9 rounded-xl object-contain"
            />
            <span className="font-brand text-lg font-bold leading-none tracking-wide text-mist">Smart Downloader</span>
          </a>
          <a
            href="#/"
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-display text-sm font-medium text-mist-muted transition hover:border-white/20 hover:text-mist"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </a>
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16 lg:px-10">
        <div className="mb-12 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-grabit-gradient shadow-lg shadow-glow-pink/20">
            <ShieldCheck className="h-6 w-6 text-white" />
          </span>
          <div>
            <h1 className="font-display text-3xl font-bold text-mist sm:text-4xl">Privacy Policy</h1>
            <p className="mt-1 font-body text-sm text-mist-muted">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 sm:p-10">
          <p className="font-body text-sm leading-relaxed text-mist-muted">
            Your privacy is the whole point. Smart Downloader is designed so that grabbing a video
            leaves no trace — no account, no profile, no history. This page explains exactly what
            happens to the links you paste and the files you save.
          </p>

          <div className="mt-10 flex flex-col gap-8">
            {sections.map((s) => (
              <div key={s.title} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition hover:border-white/10">
                <h2 className="font-display text-base font-semibold text-glow-cyan">{s.title}</h2>
                <p className="mt-3 font-body text-sm leading-relaxed text-mist-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

