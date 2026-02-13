import React from 'react'
import { formatItinerary } from '../../utils/formatItinerary'
import './ItineraryResult.css'

interface ItineraryResultProps {
  itinerary: string
}

const ItineraryResult: React.FC<ItineraryResultProps> = ({ itinerary }) => {
  return (
    <div id="result" className="result-section">
      <div className="result-header">
        <span className="result-badge">Your Itinerary</span>
        <h2 className="result-title">Here's your personalized travel plan</h2>
      </div>
      <div
        className="itinerary-content"
        dangerouslySetInnerHTML={{ __html: formatItinerary(itinerary) }}
      />
    </div>
  )
}

export default ItineraryResult
