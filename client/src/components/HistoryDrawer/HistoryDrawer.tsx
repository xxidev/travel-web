import React from 'react'
import { HistoryEntry } from '../../hooks/useHistory'
import './HistoryDrawer.css'

interface HistoryDrawerProps {
  open: boolean
  entries: HistoryEntry[]
  onClose: () => void
  onRestore: (entry: HistoryEntry) => void
  onRemove: (id: string) => void
  onClear: () => void
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

function formatDateRange(start: string, end: string): string {
  if (!start || !end) return ''
  try {
    const s = new Date(start + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const e = new Date(end   + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    return `${s} – ${e}`
  } catch {
    return `${start} – ${end}`
  }
}

const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  open, entries, onClose, onRestore, onRemove, onClear
}) => {
  const handleRestore = (entry: HistoryEntry) => {
    onRestore(entry)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`hd-backdrop ${open ? 'hd-backdrop--open' : ''}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className={`hd-drawer ${open ? 'hd-drawer--open' : ''}`} aria-label="Search history">

        {/* Header */}
        <div className="hd-header">
          <div className="hd-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>Search History</span>
            {entries.length > 0 && (
              <span className="hd-count">{entries.length}</span>
            )}
          </div>
          <div className="hd-header-actions">
            {entries.length > 0 && (
              <button className="hd-clear-btn" onClick={onClear}>Clear all</button>
            )}
            <button className="hd-close-btn" onClick={onClose} aria-label="Close history">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="hd-body">
          {entries.length === 0 ? (
            <div className="hd-empty">
              <span className="hd-empty-icon">🗺️</span>
              <p className="hd-empty-title">No history yet</p>
              <p className="hd-empty-sub">Generate an itinerary to see it here.</p>
            </div>
          ) : (
            <ul className="hd-list">
              {entries.map(entry => (
                <li key={entry.id} className="hd-entry">
                  <button
                    className="hd-entry-main"
                    onClick={() => handleRestore(entry)}
                  >
                    <span className="hd-entry-dest">{entry.destination}</span>
                    <span className="hd-entry-meta">
                      {entry.startDate && entry.endDate && (
                        <span className="hd-meta-chip">
                          📅 {formatDateRange(entry.startDate, entry.endDate)}
                        </span>
                      )}
                      <span className="hd-meta-chip">
                        💰 {entry.budget} {entry.currency}
                      </span>
                    </span>
                    <span className="hd-entry-time">{timeAgo(entry.createdAt)}</span>
                  </button>
                  <button
                    className="hd-entry-delete"
                    onClick={() => onRemove(entry.id)}
                    aria-label={`Delete ${entry.destination}`}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  )
}

export default HistoryDrawer
