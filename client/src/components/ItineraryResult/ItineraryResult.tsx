import React from 'react'
import { parseItinerary, ParsedItinerary, DayData, SlotData, HotelData, ActivityType } from '../../utils/formatItinerary'
import { downloadItinerary } from '../../utils/downloadItinerary'
import './ItineraryResult.css'

interface ItineraryResultProps {
  itinerary: string
}

// ── Constants ──────────────────────────────────────────────────────────────

const ACTIVITY_META: Record<ActivityType, { label: string; icon: string }> = {
  accommodation: { label: 'Stay',        icon: '🏨' },
  dining:        { label: 'Dining',      icon: '🍽️' },
  transport:     { label: 'Transit',     icon: '✈️' },
  sightseeing:   { label: 'Explore',     icon: '🗺️' },
  leisure:       { label: 'Leisure',     icon: '🌙' },
}

// ── Item renderer ──────────────────────────────────────────────────────────

const ActivityItem: React.FC<{ text: string }> = ({ text }) => {
  if (text.startsWith('Address:')) {
    return <li className="ai ai--address"><span className="ai-icon">📍</span>{text.replace('Address:', '').trim()}</li>
  }
  if (text.startsWith('Rating:')) {
    const val = text.replace('Rating:', '').trim()
    return <li className="ai ai--rating"><span className="ai-icon">⭐</span>{val}</li>
  }
  if (text.startsWith('Check in at:')) {
    return <li className="ai ai--highlight"><span className="ai-icon">🏨</span>{text.replace('Check in at:', '').trim()}</li>
  }
  if (text.startsWith('Recommended:')) {
    return <li className="ai ai--highlight"><span className="ai-icon">🍽️</span>{text.replace('Recommended:', '').trim()}</li>
  }
  return <li className="ai">{text}</li>
}

// ── Activity card ──────────────────────────────────────────────────────────

const ActivityCard: React.FC<{ slot: SlotData }> = ({ slot }) => {
  const meta = ACTIVITY_META[slot.activityType]
  return (
    <div className={`activity-card activity-card--${slot.activityType}`}>
      <div className="activity-tags">
        <span className={`act-tag act-tag--time act-tag--${slot.activityType}`}>{slot.time}</span>
        <span className={`act-tag act-tag--type act-tag--${slot.activityType}`}>
          {meta.icon} {meta.label}
        </span>
      </div>
      {slot.title && <p className="activity-title">{slot.title}</p>}
      {slot.items.length > 0 && (
        <ul className="activity-items">
          {slot.items.map((item, i) => <ActivityItem key={i} text={item} />)}
        </ul>
      )}
    </div>
  )
}

// ── Timeline ───────────────────────────────────────────────────────────────

const TimelineDay: React.FC<{ day: DayData; isLast: boolean }> = ({ day, isLast }) => (
  <div className="tl-day">
    <div className="tl-left">
      <div className="tl-dot"><span>{day.number}</span></div>
      {!isLast && <div className="tl-line" />}
    </div>
    <div className="tl-right">
      <div className="tl-day-header">
        <h4 className="tl-day-title">Day {day.number}</h4>
        {day.area && <span className="tl-area-badge">📍 {day.area}</span>}
      </div>
      <div className="tl-activities">
        {day.slots.map((slot, i) => <ActivityCard key={i} slot={slot} />)}
      </div>
    </div>
  </div>
)

// ── Hotel card ─────────────────────────────────────────────────────────────

const HotelCard: React.FC<{ hotel: HotelData }> = ({ hotel }) => {
  const rating = parseFloat(hotel.rating)
  const hasRating = !isNaN(rating)

  return (
    <div className="hotel-card">
      <div className="hotel-card-rank">#{hotel.rank}</div>
      <h4 className="hotel-card-name">{hotel.name}</h4>
      {hasRating && (
        <div className="hotel-card-rating">
          <span className="hotel-star">⭐</span>
          <span className="hotel-rating-val">{hotel.rating}</span>
        </div>
      )}
      {hotel.priceLevel && (
        <div className="hotel-price-badge">{hotel.priceLevel}</div>
      )}
      {hotel.address && (
        <p className="hotel-card-address">📍 {hotel.address}</p>
      )}
    </div>
  )
}

// ── Tip text (parses **Bold**: rest) ──────────────────────────────────────

const TipText: React.FC<{ text: string }> = ({ text }) => {
  const m = text.match(/^\*\*(.+?)\*\*:\s*(.+)/)
  if (m) return <><strong>{m[1]}</strong>: {m[2]}</>
  return <>{text.replace(/\*\*/g, '')}</>
}

// ── Main component ─────────────────────────────────────────────────────────

const ItineraryResult: React.FC<ItineraryResultProps> = ({ itinerary }) => {
  const data: ParsedItinerary = parseItinerary(itinerary)

  return (
    <div id="result" className="result-section">

      {/* Header */}
      <div className="result-header">
        <div className="result-header-top">
          <span className="result-badge">✈️ Your Itinerary</span>
          <button className="download-btn" onClick={() => downloadItinerary(data)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download
          </button>
        </div>
        <h2 className="result-title">{data.title || "Here's your personalized travel plan"}</h2>
      </div>

      {/* Budget */}
      {(data.budget.total || data.budget.allocations.length > 0) && (
        <div className="section-card">
          <h3 className="section-title"><span>💰</span> Budget Overview</h3>
          <div className="budget-row">
            {data.budget.total && (
              <div className="budget-stat">
                <span className="budget-stat-label">Total Budget</span>
                <span className="budget-stat-value">{data.budget.total}</span>
              </div>
            )}
            {data.budget.daily && (
              <div className="budget-stat">
                <span className="budget-stat-label">Daily Budget</span>
                <span className="budget-stat-value">{data.budget.daily}</span>
              </div>
            )}
          </div>
          {data.budget.allocations.length > 0 && (
            <div className="budget-chips">
              {data.budget.allocations.map((a, i) => (
                <span key={i} className="budget-chip">
                  <span className="budget-chip-label">{a.label}</span>
                  <span className="budget-chip-value">{a.value}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Accommodation */}
      {(data.accommodation.hotels.length > 0 || data.accommodation.bookingTips.length > 0) && (
        <div className="section-card">
          <h3 className="section-title"><span>🏨</span> Accommodation</h3>
          {data.accommodation.summary && (
            <p className="accom-summary">{data.accommodation.summary}</p>
          )}

          {data.accommodation.hotels.length > 0 && (
            <div className="hotel-scroll-wrap">
              <div className="hotel-scroll">
                {data.accommodation.hotels.map(h => <HotelCard key={h.rank} hotel={h} />)}
              </div>
            </div>
          )}

          {data.accommodation.bookingTips.length > 0 && (
            <div className="booking-bubble">
              <span className="booking-bubble-icon">💡</span>
              <ul className="booking-bubble-list">
                {data.accommodation.bookingTips.map((tip, i) => <li key={i}>{tip}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Timeline */}
      {data.days.length > 0 && (
        <div className="section-card">
          <h3 className="section-title"><span>🗓️</span> Day-by-Day Itinerary</h3>
          {data.routeNote && (
            <div className="route-note">📍 {data.routeNote}</div>
          )}
          <div className="timeline">
            {data.days.map(day => (
              <TimelineDay
                key={day.number}
                day={day}
                isLast={day.number === data.days[data.days.length - 1].number}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      {data.tips.length > 0 && (
        <div className="section-card">
          <h3 className="section-title"><span>✨</span> Travel Tips</h3>
          <ul className="tips-list">
            {data.tips.map((tip, i) => (
              <li key={i} className="tip-item">
                <TipText text={tip} />
              </li>
            ))}
          </ul>
          {data.closing && <p className="tips-closing">{data.closing}</p>}
        </div>
      )}

    </div>
  )
}

export default ItineraryResult
