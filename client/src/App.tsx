import React, { useState } from 'react'
import { TravelFormData } from './types'
import { generateItinerary } from './api/itinerary'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import TravelForm from './components/TravelForm/TravelForm'
import ItineraryResult from './components/ItineraryResult/ItineraryResult'

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      const result = await generateItinerary(formData)
      setItinerary(result)
      setShowResult(true)

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

  return (
    <div className="container">
      <Header />

      <main>
        <TravelForm
          formData={formData}
          loading={loading}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
        />

        {showResult && <ItineraryResult itinerary={itinerary} />}
      </main>

      <Footer />
    </div>
  )
}

export default App
