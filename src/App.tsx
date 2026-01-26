import React, { useState } from 'react'
import './App.css'

interface TravelFormData {
  destination: string
  startDate: string
  endDate: string
  budget: string
  currency: string
  preferences: string
}

const App: React.FC = () => {
  const [formData, setFormData] = useState<TravelFormData>({
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    currency: 'CNY',
    preferences: ''
  })

  const [itinerary, setItinerary] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setShowResult(false)

    try {
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || '生成行程失败')
      }

      const data = await response.json()
      setItinerary(data.itinerary)
      setShowResult(true)

      // 平滑滚动到结果
      setTimeout(() => {
        document.getElementById('result')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }, 100)

    } catch (error) {
      alert('抱歉，生成行程时出现错误：' + (error as Error).message)
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatItinerary = (text: string): string => {
    let html = text
      .replace(/### (.*?)$/gm, '<h3>$1</h3>')
      .replace(/## (.*?)$/gm, '<h3>$1</h3>')
      .replace(/# (.*?)$/gm, '<h2>$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^- (.*?)$/gm, '<li>$1</li>')

    html = html.replace(/(<li>.*?<\/li>\s*)+/gs, (match) => {
      return '<ul>' + match + '</ul>'
    })

    if (!html.startsWith('<h') && !html.startsWith('<ul>')) {
      html = '<p>' + html + '</p>'
    }

    return html
  }

  // 设置日期最小值
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="container">
      <header>
        <h1>🌍 智能旅行规划助手</h1>
        <p className="subtitle">告诉我你的目的地、时间和预算，我为你规划完美行程</p>
      </header>

      <main>
        <form onSubmit={handleSubmit} className="travel-form">
          <div className="form-group">
            <label htmlFor="destination">目的地</label>
            <input
              type="text"
              id="destination"
              name="destination"
              placeholder="例如：东京、巴黎、成都"
              value={formData.destination}
              onChange={handleInputChange}
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
                onChange={handleInputChange}
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
                onChange={handleInputChange}
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
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group" style={{ flex: '1' }}>
              <label htmlFor="currency">货币</label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
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
              onChange={handleInputChange}
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

        {showResult && (
          <div id="result" className="result-section">
            <h2>为您推荐的行程</h2>
            <div
              className="itinerary-content"
              dangerouslySetInnerHTML={{ __html: formatItinerary(itinerary) }}
            />
          </div>
        )}
      </main>

      <footer>
        <p>Powered by Claude AI & Google Places</p>
      </footer>
    </div>
  )
}

export default App
