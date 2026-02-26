import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Fab from '@mui/material/Fab'
import Badge from '@mui/material/Badge'
import HistoryIcon from '@mui/icons-material/History'
import { TravelFormData } from './types'
import { generateItinerary } from './api/itinerary'
import { AuthProvider } from './context/AuthContext'
import Navbar, { Page } from './components/Navbar/Navbar'
import Home from './components/Home/Home'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import TravelForm from './components/TravelForm/TravelForm'
import ItineraryResult from './components/ItineraryResult/ItineraryResult'
import HistoryDrawer from './components/HistoryDrawer/HistoryDrawer'
import AuthModal from './components/AuthModal/AuthModal'
import { useHistory, HistoryEntry } from './hooks/useHistory'

const AppInner: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [authModalOpen, setAuthModalOpen] = useState(false)

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
      await addEntry(formData, result)

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
      {/* Ambient orbs */}
      <div className="ambient-bg">
        <div className="ambient-orb ambient-orb--1" />
        <div className="ambient-orb ambient-orb--2" />
        <div className="ambient-orb ambient-orb--3" />
      </div>

      <Box className="page-wrapper">
        <Navbar currentPage={currentPage} onNavigate={handleNavigate} onOpenAuth={() => setAuthModalOpen(true)} />

        {currentPage === 'home' ? (
          <Home onNavigateToPlanner={navigateToPlanner} />
        ) : (
          <Box className="container container--planner" sx={{ pt: 10 }}>
            <Header />

            <Box component="main" sx={{ mb: 3 }}>
              <TravelForm
                formData={formData}
                loading={loading}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
              />
            </Box>

            {showResult && (
              <Box component="section" sx={{ mb: 4 }}>
                <ItineraryResult itinerary={itinerary} />
              </Box>
            )}

            <Footer />
          </Box>
        )}
      </Box>

      {/* History FAB */}
      {currentPage === 'planner' && entries.length > 0 && (
        <Badge
          badgeContent={entries.length}
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 1200,
          }}
        >
          <Fab
            variant="extended"
            onClick={() => setHistoryOpen(true)}
            sx={{
              background: '#1a1a2e',
              color: 'white',
              fontSize: '0.85rem',
              fontWeight: 600,
              gap: 1,
              px: 2.5,
              borderRadius: 100,
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              '&:hover': { background: '#000' },
            }}
          >
            <HistoryIcon sx={{ fontSize: 18 }} />
            History
          </Fab>
        </Badge>
      )}

      <HistoryDrawer
        open={historyOpen}
        entries={entries}
        onClose={() => setHistoryOpen(false)}
        onRestore={handleRestoreEntry}
        onRemove={removeEntry}
        onClear={clearAll}
      />

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  )
}

const App: React.FC = () => (
  <AuthProvider>
    <AppInner />
  </AuthProvider>
)

export default App
