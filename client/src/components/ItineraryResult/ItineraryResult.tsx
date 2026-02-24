import React from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import DownloadIcon from '@mui/icons-material/Download'
import { parseItinerary, ParsedItinerary, DayData, SlotData, HotelData, ActivityType } from '../../utils/formatItinerary'
import { downloadItinerary } from '../../utils/downloadItinerary'

interface ItineraryResultProps {
  itinerary: string
}

// ── Constants ──────────────────────────────────────────────────────────────

const ACTIVITY_META: Record<ActivityType, { label: string; icon: string; color: string }> = {
  accommodation: { label: 'Stay',    icon: '🏨', color: '#4361ee' },
  dining:        { label: 'Dining',  icon: '🍽️', color: '#ef476f' },
  transport:     { label: 'Transit', icon: '✈️', color: '#7209b7' },
  sightseeing:   { label: 'Explore', icon: '🗺️', color: '#06d6a0' },
  leisure:       { label: 'Leisure', icon: '🌙', color: '#ffd166' },
}

// ── Item renderer ──────────────────────────────────────────────────────────

const ActivityItem: React.FC<{ text: string }> = ({ text }) => {
  if (text.startsWith('Address:')) {
    return (
      <Box component="li" sx={{ listStyle: 'none', display: 'flex', alignItems: 'flex-start', gap: 0.5, py: 0.3 }}>
        <span>📍</span>
        <Typography variant="body2" color="text.secondary">{text.replace('Address:', '').trim()}</Typography>
      </Box>
    )
  }
  if (text.startsWith('Rating:')) {
    return (
      <Box component="li" sx={{ listStyle: 'none', display: 'flex', alignItems: 'flex-start', gap: 0.5, py: 0.3 }}>
        <span>⭐</span>
        <Typography variant="body2">{text.replace('Rating:', '').trim()}</Typography>
      </Box>
    )
  }
  if (text.startsWith('Check in at:')) {
    return (
      <Box component="li" sx={{ listStyle: 'none', display: 'flex', alignItems: 'flex-start', gap: 0.5, py: 0.3 }}>
        <span>🏨</span>
        <Typography variant="body2" fontWeight={500}>{text.replace('Check in at:', '').trim()}</Typography>
      </Box>
    )
  }
  if (text.startsWith('Recommended:')) {
    return (
      <Box component="li" sx={{ listStyle: 'none', display: 'flex', alignItems: 'flex-start', gap: 0.5, py: 0.3 }}>
        <span>🍽️</span>
        <Typography variant="body2" fontWeight={500}>{text.replace('Recommended:', '').trim()}</Typography>
      </Box>
    )
  }
  return (
    <Box component="li" sx={{ listStyle: 'none', py: 0.3 }}>
      <Typography variant="body2" color="text.secondary">{text}</Typography>
    </Box>
  )
}

// ── Activity card ──────────────────────────────────────────────────────────

const ActivityCard: React.FC<{ slot: SlotData }> = ({ slot }) => {
  const meta = ACTIVITY_META[slot.activityType]
  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid rgba(0,0,0,0.06)',
        borderLeft: `3px solid ${meta.color}`,
        borderRadius: 2,
        p: 2,
        mb: 1.5,
        background: 'rgba(255,255,255,0.8)',
      }}
    >
      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: slot.title || slot.items.length ? 1 : 0 }}>
        <Chip
          label={slot.time}
          size="small"
          sx={{
            fontSize: '0.72rem',
            fontWeight: 700,
            height: 22,
            background: `${meta.color}15`,
            color: meta.color,
            border: `1px solid ${meta.color}30`,
          }}
        />
        <Chip
          label={`${meta.icon} ${meta.label}`}
          size="small"
          sx={{
            fontSize: '0.72rem',
            fontWeight: 600,
            height: 22,
            background: `${meta.color}10`,
            color: meta.color,
          }}
        />
      </Box>
      {slot.title && (
        <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>{slot.title}</Typography>
      )}
      {slot.items.length > 0 && (
        <Box component="ul" sx={{ m: 0, p: 0 }}>
          {slot.items.map((item, i) => <ActivityItem key={i} text={item} />)}
        </Box>
      )}
    </Paper>
  )
}

// ── Timeline ───────────────────────────────────────────────────────────────

const TimelineDay: React.FC<{ day: DayData; isLast: boolean }> = ({ day, isLast }) => (
  <Box sx={{ display: 'flex', gap: 2, mb: isLast ? 0 : 1 }}>
    {/* Left: dot + line */}
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4361ee 0%, #7209b7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '0.78rem',
          fontWeight: 700,
          flexShrink: 0,
          zIndex: 1,
        }}
      >
        {day.number}
      </Box>
      {!isLast && (
        <Box
          sx={{
            width: 2,
            flex: 1,
            minHeight: 24,
            background: 'linear-gradient(to bottom, #4361ee, #7209b7)',
            opacity: 0.25,
            mt: 0.5,
          }}
        />
      )}
    </Box>

    {/* Right: content */}
    <Box sx={{ flex: 1, pb: isLast ? 0 : 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Typography variant="subtitle2" fontWeight={700}>Day {day.number}</Typography>
        {day.area && (
          <Chip
            label={`📍 ${day.area}`}
            size="small"
            sx={{ fontSize: '0.72rem', height: 20, background: 'rgba(67,97,238,0.08)', color: 'primary.main' }}
          />
        )}
      </Box>
      {day.slots.map((slot, i) => <ActivityCard key={i} slot={slot} />)}
    </Box>
  </Box>
)

// ── Hotel card ─────────────────────────────────────────────────────────────

const HotelCard: React.FC<{ hotel: HotelData }> = ({ hotel }) => {
  const rating = parseFloat(hotel.rating)
  const hasRating = !isNaN(rating)

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid rgba(0,0,0,0.07)',
        borderRadius: 3,
        p: 2,
        minWidth: 200,
        maxWidth: 240,
        flexShrink: 0,
        background: 'rgba(255,255,255,0.9)',
      }}
    >
      <Typography variant="caption" color="text.disabled" fontWeight={700}>#{hotel.rank}</Typography>
      <Typography variant="body2" fontWeight={700} sx={{ mt: 0.5, mb: 0.5 }}>{hotel.name}</Typography>
      {hasRating && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
          <span style={{ fontSize: '0.85em' }}>⭐</span>
          <Typography variant="caption" fontWeight={600}>{hotel.rating}</Typography>
        </Box>
      )}
      {hotel.priceLevel && (
        <Chip
          label={hotel.priceLevel}
          size="small"
          sx={{ fontSize: '0.72rem', height: 20, mb: hotel.address ? 0.5 : 0 }}
        />
      )}
      {hotel.address && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          📍 {hotel.address}
        </Typography>
      )}
    </Paper>
  )
}

// ── Tip text (parses **Bold**: rest) ──────────────────────────────────────

const TipText: React.FC<{ text: string }> = ({ text }) => {
  const m = text.match(/^\*\*(.+?)\*\*:\s*(.+)/)
  if (m) return <><strong>{m[1]}</strong>: {m[2]}</>
  return <>{text.replace(/\*\*/g, '')}</>
}

// ── Section card wrapper ────────────────────────────────────────────────────

const SectionCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Paper
    elevation={0}
    sx={{
      border: '1px solid rgba(0,0,0,0.06)',
      borderRadius: 4,
      p: { xs: 2.5, md: 3.5 },
      mb: 2.5,
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(20px)',
    }}
  >
    {children}
  </Paper>
)

// ── Main component ─────────────────────────────────────────────────────────

const ItineraryResult: React.FC<ItineraryResultProps> = ({ itinerary }) => {
  const data: ParsedItinerary = parseItinerary(itinerary)
  const [downloading, setDownloading] = React.useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      await downloadItinerary(data)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Box id="result">

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Chip
            label="✈️ Your Itinerary"
            size="small"
            sx={{ fontWeight: 600, background: 'rgba(67,97,238,0.08)', color: 'primary.main', borderRadius: 100 }}
          />
          <Button
            variant="outlined"
            size="small"
            onClick={handleDownload}
            disabled={downloading}
            startIcon={downloading ? <CircularProgress size={14} /> : <DownloadIcon fontSize="small" />}
            sx={{
              borderRadius: 100,
              fontSize: '0.82rem',
              borderColor: 'rgba(0,0,0,0.12)',
              color: 'text.secondary',
              '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
            }}
          >
            {downloading ? 'Generating…' : 'Download PDF'}
          </Button>
        </Box>
        <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: '-0.02em' }}>
          {data.title || "Here's your personalized travel plan"}
        </Typography>
      </Box>

      {/* Budget */}
      {(data.budget.total || data.budget.allocations.length > 0) && (
        <SectionCard>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>💰</span> Budget Overview
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, mb: data.budget.allocations.length ? 2 : 0, flexWrap: 'wrap' }}>
            {data.budget.total && (
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>Total Budget</Typography>
                <Typography variant="h6" fontWeight={700}>{data.budget.total}</Typography>
              </Box>
            )}
            {data.budget.daily && (
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>Daily Budget</Typography>
                <Typography variant="h6" fontWeight={700}>{data.budget.daily}</Typography>
              </Box>
            )}
          </Box>
          {data.budget.allocations.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {data.budget.allocations.map((a, i) => (
                <Chip
                  key={i}
                  label={<><strong>{a.label}</strong>: {a.value}</>}
                  size="small"
                  sx={{ fontSize: '0.8rem', height: 26, background: 'rgba(67,97,238,0.07)', color: 'text.primary' }}
                />
              ))}
            </Box>
          )}
        </SectionCard>
      )}

      {/* Accommodation */}
      {(data.accommodation.hotels.length > 0 || data.accommodation.bookingTips.length > 0) && (
        <SectionCard>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>🏨</span> Accommodation
          </Typography>
          {data.accommodation.summary && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{data.accommodation.summary}</Typography>
          )}

          {data.accommodation.hotels.length > 0 && (
            <Box sx={{ overflowX: 'auto', pb: 1, mb: data.accommodation.bookingTips.length ? 2 : 0 }}>
              <Box sx={{ display: 'flex', gap: 1.5, width: 'max-content' }}>
                {data.accommodation.hotels.map(h => <HotelCard key={h.rank} hotel={h} />)}
              </Box>
            </Box>
          )}

          {data.accommodation.bookingTips.length > 0 && (
            <Box
              sx={{
                background: 'rgba(255,209,102,0.12)',
                border: '1px solid rgba(255,209,102,0.3)',
                borderRadius: 2,
                p: 2,
                display: 'flex',
                gap: 1.5,
                alignItems: 'flex-start',
              }}
            >
              <span style={{ fontSize: '1.1em', flexShrink: 0 }}>💡</span>
              <Box component="ul" sx={{ m: 0, p: 0 }}>
                {data.accommodation.bookingTips.map((tip, i) => (
                  <Box component="li" key={i} sx={{ listStyle: 'none', py: 0.3 }}>
                    <Typography variant="body2">{tip}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </SectionCard>
      )}

      {/* Timeline */}
      {data.days.length > 0 && (
        <SectionCard>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>🗓️</span> Day-by-Day Itinerary
          </Typography>
          {data.routeNote && (
            <Box
              sx={{
                background: 'rgba(67,97,238,0.06)',
                border: '1px solid rgba(67,97,238,0.15)',
                borderRadius: 2,
                px: 2,
                py: 1,
                mb: 2,
              }}
            >
              <Typography variant="body2">📍 {data.routeNote}</Typography>
            </Box>
          )}
          <Box>
            {data.days.map(day => (
              <TimelineDay
                key={day.number}
                day={day}
                isLast={day.number === data.days[data.days.length - 1].number}
              />
            ))}
          </Box>
        </SectionCard>
      )}

      {/* Tips */}
      {data.tips.length > 0 && (
        <SectionCard>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>✨</span> Travel Tips
          </Typography>
          <Box component="ul" sx={{ m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {data.tips.map((tip, i) => (
              <Box
                component="li"
                key={i}
                sx={{
                  listStyle: 'none',
                  background: 'rgba(0,0,0,0.02)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                }}
              >
                <Typography variant="body2">
                  <TipText text={tip} />
                </Typography>
              </Box>
            ))}
          </Box>
          {data.closing && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
              {data.closing}
            </Typography>
          )}
        </SectionCard>
      )}

    </Box>
  )
}

export default ItineraryResult
