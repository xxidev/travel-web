import React from 'react'
import './Header.css'

const Header: React.FC = () => {
  return (
    <header className="planner-hero">
      <span className="planner-badge">AI-Powered</span>
      <h1 className="planner-title">
        Plan your next
        <br />
        <span className="planner-title-accent">adventure.</span>
      </h1>
      <p className="planner-subtitle">
        Share your destination, dates, and budget. We'll craft a
        personalized itinerary just for you.
      </p>
    </header>
  )
}

export default Header
