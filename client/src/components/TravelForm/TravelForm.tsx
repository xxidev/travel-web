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
        <label htmlFor="destination">目的地</label>
        <input
          type="text"
          id="destination"
          name="destination"
          placeholder="例如：东京、巴黎、成都"
          value={formData.destination}
          onChange={onInputChange}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="startDate">开始日期</label>
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
          <label htmlFor="endDate">结束日期</label>
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
          <label htmlFor="budget">预算金额</label>
          <input
            type="number"
            id="budget"
            name="budget"
            placeholder="例如：5000"
            min="0"
            step="100"
            value={formData.budget}
            onChange={onInputChange}
            required
          />
        </div>

        <div className="form-group" style={{ flex: '1' }}>
          <label htmlFor="currency">货币</label>
          <select
            id="currency"
            name="currency"
            value={formData.currency}
            onChange={onInputChange}
            required
          >
            <option value="CNY">人民币 (¥)</option>
            <option value="USD">美元 ($)</option>
            <option value="EUR">欧元 (€)</option>
            <option value="GBP">英镑 (£)</option>
            <option value="JPY">日元 (¥)</option>
            <option value="KRW">韩元 (₩)</option>
            <option value="SGD">新元 (S$)</option>
            <option value="AUD">澳元 (A$)</option>
            <option value="CAD">加元 (C$)</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="preferences">旅行偏好（可选）</label>
        <textarea
          id="preferences"
          name="preferences"
          rows={3}
          placeholder="例如：喜欢美食、对历史文化感兴趣、想去网红打卡点"
          value={formData.preferences}
          onChange={onInputChange}
        />
      </div>

      <button type="submit" className="submit-btn" disabled={loading}>
        <span className="btn-text" style={{ display: loading ? 'none' : 'inline-block' }}>
          生成行程计划
        </span>
        <span className="btn-loader" style={{ display: loading ? 'inline-block' : 'none' }}>
          生成中...
        </span>
      </button>
    </form>
  )
}

export default TravelForm
