import { useState, useCallback } from 'react'
import { TravelFormData } from '../types'

export interface HistoryEntry {
  id: string
  destination: string
  startDate: string
  endDate: string
  budget: string
  currency: string
  preferences: string
  itinerary: string
  createdAt: number
}

const STORAGE_KEY = 'travel-history'
const MAX_ENTRIES = 20

function load(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save(entries: HistoryEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>(load)

  const addEntry = useCallback((formData: TravelFormData, itinerary: string) => {
    const entry: HistoryEntry = {
      id: Date.now().toString(),
      ...formData,
      itinerary,
      createdAt: Date.now(),
    }
    setEntries(prev => {
      const updated = [entry, ...prev].slice(0, MAX_ENTRIES)
      save(updated)
      return updated
    })
  }, [])

  const removeEntry = useCallback((id: string) => {
    setEntries(prev => {
      const updated = prev.filter(e => e.id !== id)
      save(updated)
      return updated
    })
  }, [])

  const clearAll = useCallback(() => {
    setEntries([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { entries, addEntry, removeEntry, clearAll }
}
