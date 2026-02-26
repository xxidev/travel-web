import React from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import InputBase from '@mui/material/InputBase'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import { TravelFormData } from '../../types'

interface TravelFormProps {
  formData: TravelFormData
  loading: boolean
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onSubmit: (e: React.FormEvent) => void
}

const CHIPS = [
  { label: '🇯🇵 Japan',    value: 'Japan' },
  { label: '🇫🇷 Paris',    value: 'Paris' },
  { label: '🇮🇸 Iceland',  value: 'Iceland' },
  { label: '🇮🇹 Rome',     value: 'Rome' },
  { label: '🇹🇭 Thailand', value: 'Thailand' },
]

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CNY', 'JPY', 'KRW', 'SGD', 'AUD', 'CAD']

const TravelForm: React.FC<TravelFormProps> = ({ formData, loading, onInputChange, onSubmit }) => {
  const today = new Date().toISOString().split('T')[0]

  const handleChipClick = (value: string) => {
    onInputChange({ target: { name: 'destination', value } } as React.ChangeEvent<HTMLInputElement>)
  }

  return (
    <Box component="form" onSubmit={onSubmit}>

      {/* Command Bar */}
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          borderRadius: 4,
          border: '1px solid rgba(0,0,0,0.08)',
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.06)',
          flexWrap: { xs: 'wrap', md: 'nowrap' },
        }}
      >
        {/* Destination */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2.5, py: 1.5, flex: '1 1 180px', minWidth: 0 }}>
          <PlaceOutlinedIcon sx={{ color: 'text.disabled', fontSize: 18, flexShrink: 0 }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', fontWeight: 500, lineHeight: 1.2 }}>
              Where to?
            </Typography>
            <InputBase
              name="destination"
              placeholder="Tokyo, Paris, Bali…"
              value={formData.destination}
              onChange={onInputChange}
              required
              autoComplete="off"
              inputProps={{ style: { padding: 0, fontSize: '0.88rem', fontWeight: 500 } }}
              sx={{ width: '100%' }}
            />
          </Box>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

        {/* Date range */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2.5, py: 1.5, flex: '1 1 240px', minWidth: 0 }}>
          <CalendarTodayOutlinedIcon sx={{ color: 'text.disabled', fontSize: 18, flexShrink: 0 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.disabled" sx={{ display: 'block', fontWeight: 500, lineHeight: 1.2 }}>
                From
              </Typography>
              <InputBase
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={onInputChange}
                required
                inputProps={{ min: today, style: { padding: 0, fontSize: '0.88rem', fontWeight: 500 } }}
              />
            </Box>
            <ArrowForwardIcon sx={{ fontSize: 14, color: 'text.disabled', flexShrink: 0 }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.disabled" sx={{ display: 'block', fontWeight: 500, lineHeight: 1.2 }}>
                To
              </Typography>
              <InputBase
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={onInputChange}
                required
                inputProps={{ min: formData.startDate || today, style: { padding: 0, fontSize: '0.88rem', fontWeight: 500 } }}
              />
            </Box>
          </Box>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

        {/* Budget */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2.5, py: 1.5, flex: '0 1 160px', minWidth: 0 }}>
          <AttachMoneyIcon sx={{ color: 'text.disabled', fontSize: 18, flexShrink: 0 }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', fontWeight: 500, lineHeight: 1.2 }}>
              Budget
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <InputBase
                name="budget"
                type="number"
                placeholder="5000"
                value={formData.budget}
                onChange={onInputChange}
                required
                inputProps={{ min: 0, step: 100, style: { padding: 0, fontSize: '0.88rem', fontWeight: 500, width: 60 } }}
              />
              <Select
                name="currency"
                value={formData.currency}
                onChange={(e) => onInputChange(e as unknown as React.ChangeEvent<HTMLSelectElement>)}
                variant="standard"
                disableUnderline
                sx={{ fontSize: '0.82rem', fontWeight: 600, color: 'text.secondary', '.MuiSelect-select': { p: 0 } }}
              >
                {CURRENCIES.map(c => (
                  <MenuItem key={c} value={c} sx={{ fontSize: '0.85rem' }}>{c}</MenuItem>
                ))}
              </Select>
            </Box>
          </Box>
        </Box>

        {/* Submit */}
        <Box sx={{ px: 1.5, py: 1.5, flexShrink: 0 }}>
          <IconButton
            type="submit"
            disabled={loading}
            aria-label="Generate itinerary"
            sx={{
              width: 44,
              height: 44,
              background: loading ? 'rgba(0,0,0,0.08)' : '#1a1a2e',
              color: 'white',
              borderRadius: 3,
              '&:hover': { background: '#000', transform: 'scale(1.05)' },
              '&.Mui-disabled': { background: 'rgba(0,0,0,0.08)', color: 'rgba(0,0,0,0.3)' },
              transition: 'all 0.2s',
            }}
          >
            {loading
              ? <CircularProgress size={18} color="inherit" />
              : <ArrowForwardIcon sx={{ fontSize: 20 }} />
            }
          </IconButton>
        </Box>
      </Paper>

      {/* Destination Chips */}
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mt: 2 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mr: 0.5 }}>
          Popular:
        </Typography>
        {CHIPS.map(chip => (
          <Chip
            key={chip.value}
            label={chip.label}
            onClick={() => handleChipClick(chip.value)}
            variant={formData.destination === chip.value ? 'filled' : 'outlined'}
            color={formData.destination === chip.value ? 'primary' : 'default'}
            size="small"
            clickable
            sx={{
              fontSize: '0.82rem',
              fontWeight: 500,
              borderRadius: 100,
              ...(formData.destination !== chip.value && {
                borderColor: 'rgba(0,0,0,0.12)',
                color: 'text.secondary',
                '&:hover': { borderColor: 'primary.main', color: 'primary.main', background: 'rgba(67,97,238,0.05)' },
              }),
            }}
          />
        ))}
      </Box>

      {/* Preferences */}
      <Box
        component="textarea"
        name="preferences"
        rows={2}
        placeholder="✦  Travel style, interests, must-sees… (optional)"
        value={formData.preferences}
        onChange={onInputChange}
        sx={{
          display: 'block',
          width: '100%',
          mt: 2,
          p: 2,
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 3,
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(20px)',
          fontFamily: 'inherit',
          fontSize: '0.88rem',
          color: 'text.primary',
          resize: 'none',
          outline: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          '&:focus': { borderColor: 'primary.main', boxShadow: '0 0 0 3px rgba(67,97,238,0.1)' },
          lineHeight: 1.6,
        }}
      />

    </Box>
  )
}

export default TravelForm
