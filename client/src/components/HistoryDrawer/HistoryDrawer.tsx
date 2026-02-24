import React from 'react'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import CloseIcon from '@mui/icons-material/Close'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import HistoryIcon from '@mui/icons-material/History'
import { HistoryEntry } from '../../hooks/useHistory'

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
    const e = new Date(end + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100vw', sm: 380 },
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography fontWeight={600} fontSize="0.95rem">Search History</Typography>
          {entries.length > 0 && (
            <Chip
              label={entries.length}
              size="small"
              sx={{ height: 20, fontSize: '0.72rem', fontWeight: 700, background: 'rgba(67,97,238,0.1)', color: 'primary.main' }}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {entries.length > 0 && (
            <Button
              size="small"
              onClick={onClear}
              sx={{ color: 'text.secondary', fontSize: '0.78rem', fontWeight: 500, minWidth: 0 }}
            >
              Clear all
            </Button>
          )}
          <IconButton size="small" onClick={onClose} aria-label="Close history">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {entries.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: 300,
              gap: 1,
              color: 'text.secondary',
            }}
          >
            <Typography fontSize="2rem">🗺️</Typography>
            <Typography fontWeight={600} fontSize="0.95rem" color="text.primary">No history yet</Typography>
            <Typography fontSize="0.85rem">Generate an itinerary to see it here.</Typography>
          </Box>
        ) : (
          <List disablePadding>
            {entries.map((entry, idx) => (
              <React.Fragment key={entry.id}>
                <ListItem
                  disablePadding
                  secondaryAction={
                    <IconButton
                      size="small"
                      edge="end"
                      onClick={() => onRemove(entry.id)}
                      aria-label={`Delete ${entry.destination}`}
                      sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <Box
                    component="button"
                    onClick={() => handleRestore(entry)}
                    sx={{
                      flex: 1,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      px: 2.5,
                      py: 1.5,
                      pr: 6,
                      '&:hover': { background: 'rgba(0,0,0,0.03)' },
                    }}
                  >
                    <Typography fontWeight={600} fontSize="0.9rem" color="text.primary" noWrap>
                      {entry.destination}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {entry.startDate && entry.endDate && (
                        <Chip
                          label={`📅 ${formatDateRange(entry.startDate, entry.endDate)}`}
                          size="small"
                          sx={{ fontSize: '0.72rem', height: 22, background: 'rgba(0,0,0,0.05)' }}
                        />
                      )}
                      <Chip
                        label={`💰 ${entry.budget} ${entry.currency}`}
                        size="small"
                        sx={{ fontSize: '0.72rem', height: 22, background: 'rgba(0,0,0,0.05)' }}
                      />
                    </Box>
                    <Typography color="text.disabled" fontSize="0.75rem" sx={{ mt: 0.5 }}>
                      {timeAgo(entry.createdAt)}
                    </Typography>
                  </Box>
                </ListItem>
                {idx < entries.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Drawer>
  )
}

export default HistoryDrawer
