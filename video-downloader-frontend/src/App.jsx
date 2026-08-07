import { useEffect, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import HowItWorks from './components/HowItWorks.jsx'
import Platforms from './components/Platforms.jsx'
import Stats from './components/Stats.jsx'
import Features from './components/Features.jsx'
import FAQ from './components/FAQ.jsx'
import Footer from './components/Footer.jsx'
import Privacy from './pages/Privacy.jsx'
import Terms from './pages/Terms.jsx'

function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash || '#/')
  useEffect(() => {
    const onChange = () => setHash(window.location.hash || '#/')
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

export default function App() {
  const hash = useHashRoute()

  // Strip the leading "#" and any query, keep the path segment only.
  const route = hash.replace(/^#/, '').split('?')[0].replace(/^\/+/, '')

  if (route === 'privacy') {
    return <Privacy />
  }
  if (route === 'terms') {
    return <Terms />
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-glow-pink/10 blur-[140px]" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-glow-violet/10 blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-glow-cyan/10 blur-[140px]" />
      </div>

      <Navbar />
      <main className="relative z-10">
        <Hero />
        <HowItWorks />
        <Platforms />
        <Stats />
        <Features />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
