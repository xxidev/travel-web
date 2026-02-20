import React, { useEffect, useRef, useState } from 'react'
import './Home.css'

interface HomeProps {
  onNavigateToPlanner: (destination?: string) => void
}

const SECTIONS = ['hero', 'cities', 'routes', 'steps', 'cta'] as const

const cities = [
  { name: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80', tag: 'Most Popular' },
  { name: 'Tokyo', country: 'Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80', tag: 'Trending' },
  { name: 'New York', country: 'United States', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80', tag: 'Classic' },
  { name: 'London', country: 'United Kingdom', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80', tag: 'Heritage' },
  { name: 'Sydney', country: 'Australia', image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80', tag: 'Adventure' },
]

const routes = [
  {
    title: '7 Days in Japan',
    duration: '7 days',
    stops: ['Tokyo', 'Kyoto', 'Osaka', 'Nara'],
    gradient: 'linear-gradient(135deg, #f72585, #7209b7)',
  },
  {
    title: 'European Classics',
    duration: '14 days',
    stops: ['Paris', 'Rome', 'Barcelona', 'Amsterdam'],
    gradient: 'linear-gradient(135deg, #4361ee, #4cc9f0)',
  },
  {
    title: 'Southeast Asia Explorer',
    duration: '10 days',
    stops: ['Bangkok', 'Hanoi', 'Bali', 'Singapore'],
    gradient: 'linear-gradient(135deg, #06d6a0, #118ab2)',
  },
]

const steps = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    title: 'Choose Destination',
    description: 'Browse popular cities or search for your dream destination from around the world.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    title: 'Set Preferences',
    description: 'Tell us your dates, budget, and travel style. We tailor everything to you.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    title: 'Get Itinerary',
    description: 'Receive a detailed day-by-day plan crafted by AI, ready for your adventure.',
  },
]

const Home: React.FC<HomeProps> = ({ onNavigateToPlanner }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeSection, setActiveSection] = useState(0)

  // Body scroll lock
  useEffect(() => {
    document.body.classList.add('fp-active')
    return () => {
      document.body.classList.remove('fp-active')
    }
  }, [])

  // IntersectionObserver for active section tracking
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const sectionEls = container.querySelectorAll<HTMLElement>('.fp-section')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement
          if (entry.isIntersecting) {
            el.classList.add('fp-section--active')
            const idx = Number(el.dataset.index)
            if (!isNaN(idx)) setActiveSection(idx)
          }
        })
      },
      { root: container, threshold: 0.5 }
    )

    sectionEls.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const scrollToSection = (index: number) => {
    const container = containerRef.current
    if (!container) return
    const section = container.querySelectorAll('.fp-section')[index]
    section?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="fp-container" ref={containerRef}>
      {/* Dot navigation */}
      <div className="fp-dots">
        {SECTIONS.map((id, i) => (
          <button
            key={id}
            className={`fp-dot ${activeSection === i ? 'fp-dot--active' : ''}`}
            onClick={() => scrollToSection(i)}
            aria-label={`Go to ${id} section`}
          />
        ))}
      </div>

      {/* ===== 1. Hero ===== */}
      <section className="fp-section fp-section--hero fp-section--active" data-index="0">
        <div className="fp-section__inner">
          <div className="hero-content">
            <span className="hero-badge">
              <span className="hero-badge-dot" />
              AI-Powered Travel Planning
            </span>
            <h1 className="hero-title">
              Discover the world,
              <br />
              <span className="hero-accent">one trip at a time.</span>
            </h1>
            <p className="hero-subtitle">
              Explore iconic destinations and let our AI craft a personalized
              itinerary tailored to your style, budget, and schedule.
            </p>
            <div className="hero-actions">
              <button
                className="hero-btn hero-btn--primary"
                onClick={() => onNavigateToPlanner()}
              >
                Start Planning
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
              <button
                className="hero-btn hero-btn--ghost"
                onClick={() => scrollToSection(1)}
              >
                Browse Cities
              </button>
            </div>
          </div>
          <button className="scroll-chevron" onClick={() => scrollToSection(1)} aria-label="Scroll down">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </section>

      {/* ===== 2. Cities ===== */}
      <section className="fp-section fp-section--cities" data-index="1" id="cities">
        <div className="fp-section__inner">
          <div className="section-header">
            <span className="section-label">Destinations</span>
            <h2 className="section-title">Popular cities to explore</h2>
            <p className="section-desc">
              Hand-picked destinations loved by travelers worldwide.
            </p>
          </div>
          <div className="cities-row">
            {cities.map((city) => (
              <button
                key={city.name}
                className="compact-city-card"
                onClick={() => onNavigateToPlanner(city.name)}
              >
                <div className="compact-city-card__img-wrap">
                  <img src={city.image} alt={city.name} loading="lazy" />
                  <span className="compact-city-card__tag">{city.tag}</span>
                </div>
                <div className="compact-city-card__info">
                  <span className="compact-city-card__name">{city.name}</span>
                  <span className="compact-city-card__country">{city.country}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 3. Routes ===== */}
      <section className="fp-section fp-section--routes" data-index="2" id="routes">
        <div className="fp-section__inner">
          <div className="section-header">
            <span className="section-label">Curated Trips</span>
            <h2 className="section-title">Recommended routes</h2>
            <p className="section-desc">
              Ready-made itineraries for the most popular travel routes.
            </p>
          </div>
          <div className="routes-row">
            {routes.map((route) => (
              <div key={route.title} className="route-card" style={{ background: route.gradient }}>
                <span className="route-card__duration">{route.duration}</span>
                <h3 className="route-card__title">{route.title}</h3>
                <div className="route-card__stops">
                  {route.stops.map((stop, i) => (
                    <span key={stop}>
                      {stop}{i < route.stops.length - 1 && ' → '}
                    </span>
                  ))}
                </div>
                <button
                  className="route-card__btn"
                  onClick={() => onNavigateToPlanner(route.stops[0])}
                >
                  Plan This Trip
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 4. Steps ===== */}
      <section className="fp-section fp-section--steps" data-index="3" id="steps">
        <div className="fp-section__inner">
          <div className="section-header">
            <span className="section-label">How It Works</span>
            <h2 className="section-title">Plan your trip in 3 steps</h2>
            <p className="section-desc">
              From inspiration to itinerary in minutes.
            </p>
          </div>
          <div className="steps-row">
            {steps.map((step, i) => (
              <div key={step.title} className="step-card">
                <div className="step-card__icon">{step.icon}</div>
                <span className="step-card__number">Step {i + 1}</span>
                <h3 className="step-card__title">{step.title}</h3>
                <p className="step-card__desc">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="steps-cta">
            <button
              className="hero-btn hero-btn--primary"
              onClick={() => onNavigateToPlanner()}
            >
              Get Started
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* ===== 5. CTA + Footer ===== */}
      <section className="fp-section fp-section--cta" data-index="4" id="cta">
        <div className="fp-section__inner">
          <div className="cta-content">
            <h2 className="cta-title">Ready for your next adventure?</h2>
            <p className="cta-desc">
              Tell us where you want to go and we'll handle the rest.
              Smart itineraries powered by AI, built around you.
            </p>
            <button
              className="hero-btn hero-btn--on-dark"
              onClick={() => onNavigateToPlanner()}
            >
              Plan My Trip
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <footer className="fp-footer">
            <p>Powered by Claude AI & Google Places</p>
            <p>&copy; {new Date().getFullYear()} Voyager. All rights reserved.</p>
          </footer>
        </div>
      </section>
    </div>
  )
}

export default Home
