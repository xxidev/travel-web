import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'

const Header: React.FC = () => {
  return (
    <Box component="header" sx={{ textAlign: 'center', pt: 6, pb: 4 }}>
      <Chip
        label="AI-Powered"
        size="small"
        sx={{
          mb: 3,
          fontWeight: 600,
          fontSize: '0.78rem',
          background: 'rgba(67,97,238,0.08)',
          color: 'primary.main',
          borderRadius: 100,
          letterSpacing: '0.05em',
        }}
      />
      <Typography
        variant="h2"
        sx={{
          fontSize: { xs: '2.4rem', md: '3.2rem' },
          fontWeight: 800,
          letterSpacing: '-0.04em',
          lineHeight: 1.1,
          mb: 2,
          color: 'text.primary',
        }}
      >
        Plan your next
        <br />
        <Box
          component="span"
          sx={{
            background: 'linear-gradient(135deg, #4361ee 0%, #7209b7 35%, #f72585 65%, #4361ee 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'gradientShift 6s ease-in-out infinite',
          }}
        >
          adventure.
        </Box>
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ maxWidth: 480, mx: 'auto', lineHeight: 1.7, fontSize: '1.05rem' }}
      >
        Share your destination, dates, and budget. We'll craft a
        personalized itinerary just for you.
      </Typography>
    </Box>
  )
}

export default Header
