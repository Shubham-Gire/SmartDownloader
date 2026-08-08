export default function Privacy() {
  return (
    <section id="privacy" className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
      <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/5 to-white/10 p-1 shadow-[0_30px_120px_rgba(0,0,0,0.12)]">
        <div className="rounded-[30px] bg-ink-soft/95 px-8 py-10 sm:px-10 sm:py-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-glow-cyan">Privacy Policy</p>
              <h1 className="mt-4 text-3xl font-bold leading-tight text-mist sm:text-4xl">
                Minimal data, transparent handling, no hidden tracking.
              </h1>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-mist-muted">
                SmartDownloader only uses the information needed to process your download request.
                We do not store personal data beyond what is necessary, and we do not sell your information.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-mist-muted shadow-sm sm:w-80">
              <p className="font-semibold text-mist">Privacy highlights</p>
              <ul className="mt-3 space-y-2 text-sm leading-6">
                <li>Only the URL you submit is processed.</li>
                <li>No tracking of personal data or browsing activity.</li>
                <li>No data sales or third-party transfers.</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-mist">What we collect</h2>
              <p className="mt-4 text-sm leading-relaxed text-mist-muted">
                We only collect the URL you submit and metadata required to resolve the download.
                We do not collect browsing history, account credentials, or location data.
              </p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-mist">How we use it</h2>
              <p className="mt-4 text-sm leading-relaxed text-mist-muted">
                The URL is used solely to resolve media information and retrieve the requested content.
                Temporary processing files are deleted when the request completes.
              </p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-mist">Data sharing</h2>
              <p className="mt-4 text-sm leading-relaxed text-mist-muted">
                We do not sell, rent, or otherwise disclose your data to third parties except as
                required by law or to enforce our terms.
              </p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-mist">Your rights</h2>
              <p className="mt-4 text-sm leading-relaxed text-mist-muted">
                You may stop using the service at any time. If you have privacy concerns, please contact us using the links in the footer.
              </p>
            </section>
          </div>
        </div>
      </div>
    </section>
  )
}
