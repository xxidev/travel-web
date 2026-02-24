import React from 'react'
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

export interface CityData {
  name: string
  country: string
  image: string
  description: string
  tag: string
}

interface CityCardProps {
  city: CityData
  index: number
  onExplore: (cityName: string) => void
}

const CityCard: React.FC<CityCardProps> = ({ city, index, onExplore }) => {
  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid rgba(0,0,0,0.06)',
        borderRadius: 4,
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        animationDelay: `${index * 0.1}s`,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 20px rgba(0,0,0,0.08), 0 20px 60px rgba(0,0,0,0.12)',
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height={200}
          image={city.image}
          alt={`${city.name} landmark`}
          loading="lazy"
          sx={{
            transition: 'transform 0.35s',
            '.MuiCard-root:hover &': { transform: 'scale(1.05)' },
          }}
        />
        <Chip
          label={city.tag}
          size="small"
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(8px)',
            color: 'white',
            fontSize: '0.7rem',
            fontWeight: 600,
            borderRadius: 100,
          }}
        />
      </Box>
      <CardContent sx={{ pb: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="subtitle1" fontWeight={700}>{city.name}</Typography>
          <Typography variant="caption" color="text.secondary">{city.country}</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {city.description}
        </Typography>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button
          variant="text"
          endIcon={<ArrowForwardIcon fontSize="small" />}
          onClick={() => onExplore(city.name)}
          sx={{
            fontWeight: 600,
            fontSize: '0.85rem',
            color: 'text.primary',
            borderRadius: 100,
            px: 1.5,
            '&:hover': { background: 'rgba(0,0,0,0.04)' },
            '&:hover .MuiButton-endIcon': { transform: 'translateX(3px)', transition: 'transform 0.2s' },
          }}
        >
          Plan a Trip
        </Button>
      </CardActions>
    </Card>
  )
}

export default CityCard
