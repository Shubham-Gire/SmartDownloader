export default function Terms() {
  return (
    <section id="terms" className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
      <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/5 to-white/10 p-1 shadow-[0_30px_120px_rgba(0,0,0,0.12)]">
        <div className="rounded-[30px] bg-ink-soft/95 px-8 py-10 sm:px-10 sm:py-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-glow-cyan">Terms of Service</p>
              <h1 className="mt-4 text-3xl font-bold leading-tight text-mist sm:text-4xl">
                Use SmartDownloader responsibly with clear rights and responsibilities.
              </h1>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-mist-muted">
                Please review these terms before using SmartDownloader. By continuing, you acknowledge that you are responsible for complying with applicable laws, respecting content ownership, and using the service only for lawful purposes.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-mist-muted shadow-sm sm:w-80">
              <p className="font-semibold text-mist">Quick summary</p>
              <ul className="mt-3 space-y-2 text-sm leading-6">
                <li>Only download what you own or have permission to use.</li>
                <li>Use is at your own risk.</li>
                <li>We are not liable for misuse.</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-mist">Permitted use only</h2>
              <p className="mt-4 text-sm leading-relaxed text-mist-muted">
                SmartDownloader is meant for content you own, have licensed, or have explicit permission to download. You must not use the service to infringe copyrights, violate a platform's terms, or access content unlawfully.
              </p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-mist">No warranties</h2>
              <p className="mt-4 text-sm leading-relaxed text-mist-muted">
                This service is provided "as is" without warranties. We do not guarantee the availability, accuracy, completeness, or legality of any content processed through this site.
              </p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-mist">Limitation of liability</h2>
              <p className="mt-4 text-sm leading-relaxed text-mist-muted">
                To the fullest extent allowed by law, SmartDownloader and its operators are not liable for any damages or legal claims arising from your use of the service.
              </p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-mist">Your responsibility</h2>
              <p className="mt-4 text-sm leading-relaxed text-mist-muted">
                You are responsible for complying with these terms and applicable laws. You agree to indemnify SmartDownloader for claims related to your use of the service.
              </p>
            </section>
          </div>
        </div>
      </div>
    </section>
  )
}
