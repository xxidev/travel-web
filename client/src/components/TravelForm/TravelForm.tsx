import React from 'react'
import { TravelFormData } from '../../types'
import './TravelForm.css'

interface TravelFormProps {
  formData: TravelFormData
  loading: boolean
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onSubmit: (e: React.FormEvent) => void
}

const TravelForm: React.FC<TravelFormProps> = ({ formData, loading, onInputChange, onSubmit }) => {
  const today = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={onSubmit} className="travel-form">
      <div className="form-section">
        <div className="form-field">
          <label htmlFor="destination" className="form-label">Destination</label>
          <input
            type="text"
            id="destination"
            name="destination"
            className="form-input"
            placeholder="e.g. Tokyo, Paris, New York"
            value={formData.destination}
            onChange={onInputChange}
            required
          />
        </div>
      </div>

      <div className="form-section">
        <div className="form-grid form-grid--2">
          <div className="form-field">
            <label htmlFor="startDate" className="form-label">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              className="form-input"
              min={today}
              value={formData.startDate}
              onChange={onInputChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="endDate" className="form-label">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              className="form-input"
              min={formData.startDate || today}
              value={formData.endDate}
              onChange={onInputChange}
              required
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-grid form-grid--budget">
          <div className="form-field">
            <label htmlFor="budget" className="form-label">Budget</label>
            <input
              type="number"
              id="budget"
              name="budget"
              className="form-input"
              placeholder="e.g. 5000"
              min="0"
              step="100"
              value={formData.budget}
              onChange={onInputChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="currency" className="form-label">Currency</label>
            <select
              id="currency"
              name="currency"
              className="form-input form-select"
              value={formData.currency}
              onChange={onInputChange}
              required
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (&euro;)</option>
              <option value="GBP">GBP (&pound;)</option>
              <option value="CNY">CNY (&yen;)</option>
              <option value="JPY">JPY (&yen;)</option>
              <option value="KRW">KRW (&won;)</option>
              <option value="SGD">SGD (S$)</option>
              <option value="AUD">AUD (A$)</option>
              <option value="CAD">CAD (C$)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-field">
          <label htmlFor="preferences" className="form-label">
            Preferences
            <span className="form-label-hint">Optional</span>
          </label>
          <textarea
            id="preferences"
            name="preferences"
            className="form-input form-textarea"
            rows={3}
            placeholder="e.g. love food, interested in history & culture, want to visit popular spots"
            value={formData.preferences}
            onChange={onInputChange}
          />
        </div>
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? (
          <span className="btn-loading">
            <span className="btn-spinner" />
            Generating...
          </span>
        ) : (
          'Generate Itinerary'
        )}
      </button>
    </form>
  )
}

export default TravelForm
