import React, { useState, useEffect } from 'react'
import './Navbar.css'

export type Page = 'home' | 'cities' | 'planner'

interface NavbarProps {
  currentPage: Page
  onNavigate: (page: Page) => void
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNav = (page: Page) => {
    onNavigate(page)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar-inner container">
        <button className="navbar-brand" onClick={() => handleNav('home')}>
          <span className="navbar-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </span>
          Voyager
        </button>

        <button
          className={`navbar-toggle ${menuOpen ? 'navbar-toggle--open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>

        <ul className={`navbar-links ${menuOpen ? 'navbar-links--open' : ''}`}>
          <li>
            <button
              className={`navbar-link ${currentPage === 'home' ? 'navbar-link--active' : ''}`}
              onClick={() => handleNav('home')}
            >
              Home
            </button>
          </li>
          <li>
            <button
              className={`navbar-link ${currentPage === 'cities' ? 'navbar-link--active' : ''}`}
              onClick={() => handleNav('cities')}
            >
              Cities
            </button>
          </li>
          <li>
            <button
              className={`navbar-link navbar-link--cta ${currentPage === 'planner' ? 'navbar-link--active' : ''}`}
              onClick={() => handleNav('planner')}
            >
              Plan a Trip
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
