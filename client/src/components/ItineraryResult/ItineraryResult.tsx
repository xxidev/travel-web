import React from 'react'
import { formatItinerary } from '../../utils/formatItinerary'
import './ItineraryResult.css'

interface ItineraryResultProps {
  itinerary: string
}

const ItineraryResult: React.FC<ItineraryResultProps> = ({ itinerary }) => {
  return (
    <div id="result" className="result-section">
      <h2>为您推荐的行程</h2>
      <div
        className="itinerary-content"
        dangerouslySetInnerHTML={{ __html: formatItinerary(itinerary) }}
      />
    </div>
  )
}

export default ItineraryResult
