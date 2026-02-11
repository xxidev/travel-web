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
      <div className="form-group">
        <label htmlFor="destination">Destination</label>
        <input
          type="text"
          id="destination"
          name="destination"
          placeholder="e.g. Tokyo, Paris, New York"
          value={formData.destination}
          onChange={onInputChange}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="startDate">Start Date</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            min={today}
            value={formData.startDate}
            onChange={onInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="endDate">End Date</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            min={formData.startDate || today}
            value={formData.endDate}
            onChange={onInputChange}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group" style={{ flex: '2' }}>
          <label htmlFor="budget">Budget</label>
          <input
            type="number"
            id="budget"
            name="budget"
            placeholder="e.g. 5000"
            min="0"
            step="100"
            value={formData.budget}
            onChange={onInputChange}
            required
          />
        </div>

        <div className="form-group" style={{ flex: '1' }}>
          <label htmlFor="currency">Currency</label>
          <select
            id="currency"
            name="currency"
            value={formData.currency}
            onChange={onInputChange}
            required
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="CNY">CNY (¥)</option>
            <option value="JPY">JPY (¥)</option>
            <option value="KRW">KRW (₩)</option>
            <option value="SGD">SGD (S$)</option>
            <option value="AUD">AUD (A$)</option>
            <option value="CAD">CAD (C$)</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="preferences">Travel Preferences (optional)</label>
        <textarea
          id="preferences"
          name="preferences"
          rows={3}
          placeholder="e.g. love food, interested in history & culture, want to visit popular spots"
          value={formData.preferences}
          onChange={onInputChange}
        />
      </div>

      <button type="submit" className="submit-btn" disabled={loading}>
        <span className="btn-text" style={{ display: loading ? 'none' : 'inline-block' }}>
          Generate Itinerary
        </span>
        <span className="btn-loader" style={{ display: loading ? 'inline-block' : 'none' }}>
          Generating...
        </span>
      </button>
    </form>
  )
}

export default TravelForm
