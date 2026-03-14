import { useEffect } from 'react'
import Cursor from './components/Cursor'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import StatsBar from './components/StatsBar'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import EventsShowcase from './components/EventsShowcase'
import Testimonials from './components/Testimonials'
import Pricing from './components/Pricing'
import CTABanner from './components/CTABanner'
import Footer from './components/Footer'
import { useReveal } from './hooks/useReveal'

export default function App() {
  useReveal()

  return (
    <>
      <Cursor />
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <Features />
        <HowItWorks />
        <EventsShowcase />
        <Testimonials />
        <Pricing />
        <CTABanner />
      </main>
      <Footer />
    </>
  )
}
