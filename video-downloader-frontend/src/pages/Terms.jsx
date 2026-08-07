import { ArrowLeft, FileText } from 'lucide-react'
import logo from '../img/smart.png'

const sections = [
  {
    title: '1. Acceptance of terms',
    body: 'By using Smart Downloader you agree to these terms. If you do not agree, please do not use the service. We may update these terms from time to time, and continued use after changes are posted counts as acceptance of the updated terms.',
  },
  {
    title: '2. Purpose of the service',
    body: 'Smart Downloader is a tool that lets you fetch publicly viewable media from links you provide. It is intended for personal, private use and for saving content you own or have explicit permission to keep.',
  },
  {
    title: '3. Lawful & responsible use',
    body: 'You are solely responsible for the links you paste and how you use the files you download. Do not use Smart Downloader to copy content you do not own or lack permission to save, to bypass paywalls or DRM, or to infringe any copyright, privacy right, or applicable law.',
  },
  {
    title: '4. No ownership transfer',
    body: 'Downloading a file does not transfer ownership of the underlying content. All rights remain with the original creators and rights holders. Please honour creators\u2019 rights and always credit the original source when you share or reuse anything.',
  },
  {
    title: '5. Acceptable use',
    body: 'You agree not to misuse the service \u2014 for example by sending excessive automated requests, attempting to disrupt the servers, scraping at scale, or otherwise abusing the bandwidth. We reserve the right to rate-limit or block access that we reasonably believe is abusive.',
  },
  {
    title: '6. Service availability',
    body: 'Smart Downloader is provided \u201cas is\u201d and \u201cas available.\u201d We do not guarantee that every link will resolve, that every platform will always work, or that the service will be uninterrupted. Supported platforms and formats can change without notice.',
  },
  {
    title: '7. Disclaimer of warranties',
    body: 'To the fullest extent permitted by law, Smart Downloader is provided without warranties of any kind, express or implied, including fitness for a particular purpose. You use the service at your own risk.',
  },
  {
    title: '8. Limitation of liability',
    body: 'Smart Downloader will not be liable for any indirect, incidental, or consequential damages arising from your use of the service, including loss of data or inability to download content. Our total liability is limited to the extent permitted by law.',
  },
  {
    title: '9. Contact',
    body: 'Questions about these terms? Reach out at discover.yourself.in.hub@gmail.com and we will be happy to help.',
  },
]

export default function Terms() {
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
            <FileText className="h-6 w-6 text-white" />
          </span>
          <div>
            <h1 className="font-display text-3xl font-bold text-mist sm:text-4xl">Terms of Service</h1>
            <p className="mt-1 font-body text-sm text-mist-muted">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 sm:p-10">
          <p className="font-body text-sm leading-relaxed text-mist-muted">
            These terms govern your use of the Smart Downloader service. Please read them carefully \u2014
            by using the service you agree to follow them and to use the tool responsibly.
          </p>

          <div className="mt-10 flex flex-col gap-8">
            {sections.map((s) => (
              <div key={s.title} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition hover:border-white/10">
                <h2 className="font-display text-base font-semibold text-glow-gold">{s.title}</h2>
                <p className="mt-3 font-body text-sm leading-relaxed text-mist-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
