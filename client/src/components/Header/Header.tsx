import React from 'react'
import './Header.css'

const Header: React.FC = () => {
  return (
    <header>
      <h1>Smart Travel Planner</h1>
      <p className="subtitle">Tell me your destination, dates, and budget — I'll plan the perfect trip for you</p>
    </header>
  )
}

export default Header
