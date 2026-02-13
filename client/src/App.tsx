import React, { useState } from 'react'
import { TravelFormData } from './types'
import { generateItinerary } from './api/itinerary'
import Navbar, { Page } from './components/Navbar/Navbar'
import Home from './components/Home/Home'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import TravelForm from './components/TravelForm/TravelForm'
import ItineraryResult from './components/ItineraryResult/ItineraryResult'

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home')

  const [formData, setFormData] = useState<TravelFormData>({
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    currency: 'USD',
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
      alert('Sorry, an error occurred while generating the itinerary: ' + (error as Error).message)
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const navigateToPlanner = (destination?: string) => {
    if (destination) {
      setFormData(prev => ({ ...prev, destination }))
    }
    setCurrentPage('planner')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNavigate = (page: Page) => {
    if (page === 'cities') {
      setCurrentPage('home')
      setTimeout(() => {
        document.getElementById('cities')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      setCurrentPage(page)
    }
  }

  return (
    <>
      <div className="ambient-bg">
        <div className="ambient-orb ambient-orb--1" />
        <div className="ambient-orb ambient-orb--2" />
        <div className="ambient-orb ambient-orb--3" />
      </div>

      <div className="page-wrapper">
        <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

        {currentPage === 'home' ? (
          <>
            <Home onNavigateToPlanner={navigateToPlanner} />
            <Footer />
          </>
        ) : (
          <div className="container container--narrow" style={{ paddingTop: 100 }}>
            <Header />

            <main className="main-card">
              <TravelForm
                formData={formData}
                loading={loading}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
              />
            </main>

            {showResult && (
              <section className="result-card">
                <ItineraryResult itinerary={itinerary} />
              </section>
            )}

            <Footer />
          </div>
        )}
      </div>
    </>
  )
}

export default App
