import React, { useState } from 'react'
import { TravelFormData } from './types'
import { generateItinerary } from './api/itinerary'
import Navbar, { Page } from './components/Navbar/Navbar'
import Home from './components/Home/Home'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import TravelForm from './components/TravelForm/TravelForm'
import ItineraryResult from './components/ItineraryResult/ItineraryResult'
import HistoryDrawer from './components/HistoryDrawer/HistoryDrawer'
import { useHistory, HistoryEntry } from './hooks/useHistory'

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
  const [historyOpen, setHistoryOpen] = useState(false)

  const { entries, addEntry, removeEntry, clearAll } = useHistory()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setShowResult(false)

    try {
      const result = await generateItinerary(formData)
      setItinerary(result)
      setShowResult(true)
      addEntry(formData, result)

      setTimeout(() => {
        document.getElementById('result')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch (error) {
      alert('Sorry, an error occurred while generating the itinerary: ' + (error as Error).message)
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRestoreEntry = (entry: HistoryEntry) => {
    setFormData({
      destination: entry.destination,
      startDate: entry.startDate,
      endDate: entry.endDate,
      budget: entry.budget,
      currency: entry.currency,
      preferences: entry.preferences,
    })
    setItinerary(entry.itinerary)
    setShowResult(true)
    setCurrentPage('planner')
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0)
  }

  const navigateToPlanner = (destination?: string) => {
    if (destination) setFormData(prev => ({ ...prev, destination }))
    setCurrentPage('planner')
    setTimeout(() => window.scrollTo(0, 0), 0)
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
          <Home onNavigateToPlanner={navigateToPlanner} />
        ) : (
          <div className="container container--planner" style={{ paddingTop: 80 }}>
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

      {/* History FAB — shown on planner page once history exists */}
      {currentPage === 'planner' && entries.length > 0 && (
        <button className="history-fab" onClick={() => setHistoryOpen(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          History
          <span className="history-fab-count">{entries.length}</span>
        </button>
      )}

      {/* History Drawer — always in DOM for smooth slide animation */}
      <HistoryDrawer
        open={historyOpen}
        entries={entries}
        onClose={() => setHistoryOpen(false)}
        onRestore={handleRestoreEntry}
        onRemove={removeEntry}
        onClear={clearAll}
      />
    </>
  )
}

export default App
