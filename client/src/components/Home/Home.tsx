import React, { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import './Home.css'

interface HomeProps {
  onNavigateToPlanner: (destination?: string) => void
}

const SECTIONS = ['hero', 'cities', 'steps', 'cta'] as const

const cities = [
  { name: 'Paris',    country: 'France',         image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80', tag: 'Most Popular' },
  { name: 'Tokyo',    country: 'Japan',           image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80', tag: 'Trending' },
  { name: 'New York', country: 'United States',   image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80', tag: 'Classic' },
  { name: 'London',   country: 'United Kingdom',  image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80', tag: 'Heritage' },
  { name: 'Sydney',   country: 'Australia',       image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80', tag: 'Adventure' },
]

const steps = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
      </svg>
    ),
    title: 'Choose Destination',
    description: 'Browse popular cities or search for your dream destination from around the world.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
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

  useEffect(() => {
    document.body.classList.add('fp-active')
    return () => { document.body.classList.remove('fp-active') }
  }, [])

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
    container.querySelectorAll('.fp-section')[index]?.scrollIntoView({ behavior: 'smooth' })
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
          <Box sx={{ maxWidth: 680, mx: 'auto', textAlign: 'center' }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 0.875,
                background: 'white',
                border: '1px solid rgba(0,0,0,0.06)',
                borderRadius: 100,
                fontSize: '0.82rem',
                fontWeight: 500,
                color: 'text.secondary',
                mb: 4,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <span className="hero-badge-dot" />
              AI-Powered Travel Planning
            </Box>

            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.8rem', md: '4.2rem' },
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: '-0.045em',
                color: 'text.primary',
                mb: 3,
              }}
            >
              Discover the world,
              <br />
              <Box
                component="span"
                className="hero-accent"
              >
                one trip at a time.
              </Box>
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: '1.15rem', lineHeight: 1.7, maxWidth: 520, mx: 'auto', mb: 5 }}
            >
              Explore iconic destinations and let our AI craft a personalized
              itinerary tailored to your style, budget, and schedule.
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                onClick={() => onNavigateToPlanner()}
                sx={{
                  borderRadius: 100,
                  px: 3.5,
                  py: 1.5,
                  fontSize: '0.95rem',
                  background: '#1a1a2e',
                  boxShadow: '0 4px 16px rgba(26,26,46,0.2)',
                  '&:hover': { background: '#000', transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(26,26,46,0.25)' },
                  '&:hover .MuiButton-endIcon': { transform: 'translateX(3px)', transition: 'transform 0.2s' },
                  transition: 'all 0.2s',
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                Start Planning
              </Button>
              <Button
                variant="outlined"
                onClick={() => scrollToSection(1)}
                sx={{
                  borderRadius: 100,
                  px: 3.5,
                  py: 1.5,
                  fontSize: '0.95rem',
                  borderColor: 'rgba(0,0,0,0.12)',
                  color: 'text.secondary',
                  '&:hover': { background: 'white', color: 'text.primary', borderColor: 'rgba(0,0,0,0.18)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', transform: 'translateY(-2px)' },
                  transition: 'all 0.2s',
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                Browse Cities
              </Button>
            </Box>
          </Box>

          <button className="scroll-chevron" onClick={() => scrollToSection(1)} aria-label="Scroll down">
            <KeyboardArrowDownIcon />
          </button>
        </div>
      </section>

      {/* ===== 2. Cities ===== */}
      <section className="fp-section fp-section--cities" data-index="1" id="cities">
        <div className="fp-section__inner">
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography variant="overline" color="primary" fontWeight={600} letterSpacing="0.1em" display="block" mb={1}>
              Destinations
            </Typography>
            <Typography variant="h3" fontWeight={700} letterSpacing="-0.03em" mb={1}>
              Popular cities to explore
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 480, mx: 'auto' }}>
              Hand-picked destinations loved by travelers worldwide.
            </Typography>
          </Box>

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

      {/* ===== 3. Steps ===== */}
      <section className="fp-section fp-section--steps" data-index="2" id="steps">
        <div className="fp-section__inner">
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography variant="overline" color="primary" fontWeight={600} letterSpacing="0.1em" display="block" mb={1}>
              How It Works
            </Typography>
            <Typography variant="h3" fontWeight={700} letterSpacing="-0.03em" mb={1}>
              Plan your trip in 3 steps
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 480, mx: 'auto' }}>
              From inspiration to itinerary in minutes.
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 5 }}>
            {steps.map((step, i) => (
              <Box key={step.title}>
                <Card
                  elevation={0}
                  sx={{
                    border: '1px solid rgba(0,0,0,0.06)',
                    borderRadius: 4,
                    p: 4,
                    textAlign: 'center',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 20px rgba(0,0,0,0.08), 0 20px 60px rgba(0,0,0,0.12)' },
                  }}
                >
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 56,
                      height: 56,
                      background: 'rgba(67,97,238,0.08)',
                      color: 'primary.main',
                      borderRadius: 3,
                      mb: 2,
                    }}
                  >
                    {step.icon}
                  </Box>
                  <Typography
                    variant="overline"
                    color="primary"
                    fontWeight={600}
                    letterSpacing="0.08em"
                    display="block"
                    mb={1}
                  >
                    Step {i + 1}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={600} mb={1}>{step.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {step.description}
                  </Typography>
                </Card>
              </Box>
            ))}
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={() => onNavigateToPlanner()}
              sx={{
                borderRadius: 100,
                px: 3.5,
                py: 1.5,
                fontSize: '0.95rem',
                background: '#1a1a2e',
                boxShadow: '0 4px 16px rgba(26,26,46,0.2)',
                '&:hover': { background: '#000', transform: 'translateY(-2px)' },
                '&:hover .MuiButton-endIcon': { transform: 'translateX(3px)', transition: 'transform 0.2s' },
                transition: 'all 0.2s',
              }}
            >
              Get Started
            </Button>
          </Box>
        </div>
      </section>

      {/* ===== 4. CTA + Footer ===== */}
      <section className="fp-section fp-section--cta" data-index="3" id="cta">
        <div className="fp-section__inner">
          <Box sx={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Typography
              variant="h2"
              sx={{ fontSize: { xs: '1.8rem', md: '2.4rem' }, fontWeight: 700, letterSpacing: '-0.03em', color: 'white', mb: 2 }}
            >
              Ready for your next adventure?
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: 'rgba(255,255,255,0.6)', maxWidth: 440, mx: 'auto', mb: 4.5, lineHeight: 1.65 }}
            >
              Tell us where you want to go and we'll handle the rest.
              Smart itineraries powered by AI, built around you.
            </Typography>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={() => onNavigateToPlanner()}
              sx={{
                borderRadius: 100,
                px: 3.5,
                py: 1.5,
                fontSize: '0.95rem',
                background: 'white',
                color: '#1a1a2e',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                '&:hover': { background: '#f0f0f0', color: '#000', transform: 'translateY(-2px)' },
                '&:hover .MuiButton-endIcon': { transform: 'translateX(3px)', transition: 'transform 0.2s' },
                transition: 'all 0.2s',
              }}
            >
              Plan My Trip
            </Button>
          </Box>

          <footer className="fp-footer">
            <p>Powered by Claude AI &amp; Google Places</p>
            <p>&copy; {new Date().getFullYear()} Voyager. All rights reserved.</p>
          </footer>
        </div>
      </section>
    </div>
  )
}

export default Home
