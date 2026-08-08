import { useEffect, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import HowItWorks from './components/HowItWorks.jsx'
import Platforms from './components/Platforms.jsx'
import Stats from './components/Stats.jsx'
import Features from './components/Features.jsx'
import FAQ from './components/FAQ.jsx'
import Footer from './components/Footer.jsx'
import Privacy from './components/Privacy.jsx'
import Terms from './components/Terms.jsx'

function getRoute() {
  const hash = window.location.hash.toLowerCase()
  if (hash === '#privacy') return 'privacy'
  if (hash === '#terms') return 'terms'
  return 'home'
}

export default function App() {
  const [route, setRoute] = useState(getRoute())

  useEffect(() => {
    const onHashChange = () => setRoute(getRoute())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [route])

  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <main>
        {route === 'privacy' ? (
          <Privacy />
        ) : route === 'terms' ? (
          <Terms />
        ) : (
          <>
            <Hero />
            <HowItWorks />
            <Platforms />
            <Stats />
            <Features />
            <FAQ />
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
