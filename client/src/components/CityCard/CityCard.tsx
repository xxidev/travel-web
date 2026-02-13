import React from 'react'
import './CityCard.css'

export interface CityData {
  name: string
  country: string
  image: string
  description: string
  tag: string
}

interface CityCardProps {
  city: CityData
  index: number
  onExplore: (cityName: string) => void
}

const CityCard: React.FC<CityCardProps> = ({ city, index, onExplore }) => {
  return (
    <article
      className="city-card"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="city-card-image-wrap">
        <img
          src={city.image}
          alt={`${city.name} landmark`}
          className="city-card-image"
          loading="lazy"
        />
        <span className="city-card-tag">{city.tag}</span>
      </div>

      <div className="city-card-body">
        <div className="city-card-header">
          <h3 className="city-card-name">{city.name}</h3>
          <span className="city-card-country">{city.country}</span>
        </div>
        <p className="city-card-desc">{city.description}</p>
        <button
          className="city-card-btn"
          onClick={() => onExplore(city.name)}
        >
          Plan a Trip
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </article>
  )
}

export default CityCard
