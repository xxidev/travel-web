import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        borderTop: '1px solid',
        borderColor: 'divider',
        mt: 6,
        py: 3,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        Powered by Claude AI &amp; Google Places
      </Typography>
      <Typography variant="body2" color="text.disabled" fontSize="0.8rem">
        &copy; {new Date().getFullYear()} Voyager. All rights reserved.
      </Typography>
    </Box>
  )
}

export default Footer
