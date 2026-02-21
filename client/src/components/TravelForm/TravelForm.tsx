import React from 'react'
import { TravelFormData } from '../../types'
import './TravelForm.css'

interface TravelFormProps {
  formData: TravelFormData
  loading: boolean
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onSubmit: (e: React.FormEvent) => void
}

const CHIPS = [
  { label: '🇯🇵 Japan',   value: 'Japan' },
  { label: '🇫🇷 Paris',   value: 'Paris' },
  { label: '🇮🇸 Iceland', value: 'Iceland' },
  { label: '🇮🇹 Rome',    value: 'Rome' },
  { label: '🇹🇭 Thailand', value: 'Thailand' },
]

const TravelForm: React.FC<TravelFormProps> = ({ formData, loading, onInputChange, onSubmit }) => {
  const today = new Date().toISOString().split('T')[0]

  const handleChipClick = (value: string) => {
    onInputChange({ target: { name: 'destination', value } } as React.ChangeEvent<HTMLInputElement>)
  }

  return (
    <form onSubmit={onSubmit} className="travel-form">

      {/* ── Command Bar ── */}
      <div className="command-bar">

        {/* Destination */}
        <div className="command-slot command-slot--destination">
          <svg className="command-icon" width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <div className="command-field">
            <span className="command-label">Where to?</span>
            <input
              type="text"
              name="destination"
              className="command-input"
              placeholder="Tokyo, Paris, Bali…"
              value={formData.destination}
              onChange={onInputChange}
              required
              autoComplete="off"
            />
          </div>
        </div>

        <div className="command-divider" />

        {/* Dates */}
        <div className="command-slot command-slot--dates">
          <svg className="command-icon" width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <div className="command-field">
            <span className="command-label">From</span>
            <input
              type="date"
              name="startDate"
              className="command-input"
              min={today}
              value={formData.startDate}
              onChange={onInputChange}
              required
            />
          </div>
          <svg className="command-arrow-icon" width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
          <div className="command-field">
            <span className="command-label">To</span>
            <input
              type="date"
              name="endDate"
              className="command-input"
              min={formData.startDate || today}
              value={formData.endDate}
              onChange={onInputChange}
              required
            />
          </div>
        </div>

        <div className="command-divider" />

        {/* Budget */}
        <div className="command-slot command-slot--budget">
          <svg className="command-icon" width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          <div className="command-field">
            <span className="command-label">Budget</span>
            <div className="command-budget">
              <input
                type="number"
                name="budget"
                className="command-input command-input--num"
                placeholder="5000"
                min="0"
                step="100"
                value={formData.budget}
                onChange={onInputChange}
                required
              />
              <select
                name="currency"
                className="command-input command-select"
                value={formData.currency}
                onChange={onInputChange}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CNY">CNY</option>
                <option value="JPY">JPY</option>
                <option value="KRW">KRW</option>
                <option value="SGD">SGD</option>
                <option value="AUD">AUD</option>
                <option value="CAD">CAD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button type="submit" className="command-submit" disabled={loading} aria-label="Generate itinerary">
          {loading
            ? <span className="command-spinner" />
            : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            )
          }
        </button>
      </div>

      {/* ── Destination Chips ── */}
      <div className="chips-row">
        <span className="chips-label">Popular:</span>
        {CHIPS.map(chip => (
          <button
            key={chip.value}
            type="button"
            className={`chip ${formData.destination === chip.value ? 'chip--active' : ''}`}
            onClick={() => handleChipClick(chip.value)}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* ── Preferences ── */}
      <div className="preferences-wrap">
        <textarea
          name="preferences"
          className="preferences-input"
          rows={2}
          placeholder="✦  Travel style, interests, must-sees… (optional)"
          value={formData.preferences}
          onChange={onInputChange}
        />
      </div>

    </form>
  )
}

export default TravelForm
