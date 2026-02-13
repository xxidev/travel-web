import React from 'react'
import CityCard, { CityData } from '../CityCard/CityCard'
import './Home.css'

interface HomeProps {
  onNavigateToPlanner: (destination?: string) => void
}

const cities: CityData[] = [
  {
    name: 'Paris',
    country: 'France',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
    description: 'The City of Light captivates with the iconic Eiffel Tower, world-class art at the Louvre, and charming caf\u00e9-lined boulevards along the Seine.',
    tag: 'Most Popular'
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
    description: 'A mesmerizing blend of ancient temples and neon-lit skyscrapers, where traditional tea ceremonies exist alongside cutting-edge technology.',
    tag: 'Trending'
  },
  {
    name: 'New York',
    country: 'United States',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
    description: 'The city that never sleeps offers the Statue of Liberty, Broadway shows, Central Park, and an unrivaled skyline of architectural wonders.',
    tag: 'Classic'
  },
  {
    name: 'London',
    country: 'United Kingdom',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
    description: 'Steeped in history with Big Ben, Buckingham Palace, and the Tower Bridge, London blends royal heritage with vibrant modern culture.',
    tag: 'Heritage'
  },
  {
    name: 'Sydney',
    country: 'Australia',
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80',
    description: 'Home to the stunning Opera House and Harbour Bridge, Sydney offers golden beaches, lush botanical gardens, and a laid-back coastal vibe.',
    tag: 'Adventure'
  },
  {
    name: 'Rome',
    country: 'Italy',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80',
    description: 'The Eternal City enchants with the Colosseum, Vatican City, and centuries of art, all paired with unforgettable pasta and gelato.',
    tag: 'Cultural'
  }
]

const Home: React.FC<HomeProps> = ({ onNavigateToPlanner }) => {
  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="container">
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
              <a href="#cities" className="hero-btn hero-btn--ghost">
                Browse Cities
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Cities Grid */}
      <section className="cities-section" id="cities">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Destinations</span>
            <h2 className="section-title">Popular cities to explore</h2>
            <p className="section-desc">
              Hand-picked destinations loved by travelers worldwide.
              Click any city to start planning your trip.
            </p>
          </div>

          <div className="cities-grid">
            {cities.map((city, index) => (
              <CityCard
                key={city.name}
                city={city}
                index={index}
                onExplore={(name) => onNavigateToPlanner(name)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2 className="cta-title">Ready for your next adventure?</h2>
            <p className="cta-desc">
              Tell us where you want to go and we'll handle the rest.
              Smart itineraries powered by AI, built around you.
            </p>
            <button
              className="hero-btn hero-btn--primary hero-btn--on-dark"
              onClick={() => onNavigateToPlanner()}
            >
              Plan My Trip
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
