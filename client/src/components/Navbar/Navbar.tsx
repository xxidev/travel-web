import React, { useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import MenuIcon from '@mui/icons-material/Menu'
import LanguageIcon from '@mui/icons-material/Language'
import { useAuth } from '../../context/AuthContext'

export type Page = 'home' | 'cities' | 'planner'

interface NavbarProps {
    currentPage: Page
    onNavigate: (page: Page) => void
    onOpenAuth: () => void
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, onOpenAuth }) => {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const { user, logout } = useAuth()

    const handleNav = (page: Page) => {
        onNavigate(page)
        setMobileOpen(false)
    }

    const handleLogout = () => {
        logout()
        setAnchorEl(null)
    }

    const initials = user?.name
        ? user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
        : ''

    const navLinks: { label: string; page: Page }[] = [
        { label: 'Home', page: 'home' },
        { label: 'Cities', page: 'cities' },
        { label: 'Plan a Trip', page: 'planner' },
    ]

    return (
        <>
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    background: 'rgba(248,249,250,0.85)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                    color: 'text.primary',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
            >
                <Toolbar sx={{ maxWidth: 1200, width: '100%', mx: 'auto', px: { xs: 2.5, md: 4 } }}>
                    {/* Brand */}
                    <Box
                        component="button"
                        onClick={() => handleNav('home')}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            p: 0,
                            mr: 4,
                        }}
                    >
                        <Box
                            sx={{
                                width: 32,
                                height: 32,
                                borderRadius: 2,
                                background: 'linear-gradient(135deg, #4361ee 0%, #7209b7 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                flexShrink: 0,
                            }}
                        >
                            <LanguageIcon sx={{ fontSize: 18 }} />
                        </Box>
                        <Typography fontWeight={700} fontSize="1.1rem" color="text.primary">
                            Voyager
                        </Typography>
                    </Box>

                    {/* Desktop nav links */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5, flex: 1 }}>
                        {navLinks.map(({ label, page }) => (
                            <Button
                                key={page}
                                onClick={() => handleNav(page)}
                                sx={{
                                    color: currentPage === page ? 'primary.main' : 'text.secondary',
                                    fontWeight: currentPage === page ? 600 : 500,
                                    fontSize: '0.9rem',
                                    px: 2,
                                    '&:hover': { color: 'text.primary', background: 'rgba(0,0,0,0.04)' },
                                }}
                            >
                                {label}
                            </Button>
                        ))}
                    </Box>

                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                        {/* Auth area */}
                        {user ? (
                            <>
                                <Avatar
                                    onClick={(e) => setAnchorEl(e.currentTarget)}
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        fontSize: '0.8rem',
                                        fontWeight: 700,
                                        background: 'linear-gradient(135deg, #4361ee 0%, #7209b7 100%)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {initials}
                                </Avatar>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={() => setAnchorEl(null)}
                                    PaperProps={{ sx: { mt: 1, minWidth: 180, borderRadius: 3 } }}
                                >
                                    <Box sx={{ px: 2, py: 1.5 }}>
                                        <Typography fontWeight={600} fontSize="0.9rem">{user.name}</Typography>
                                        <Typography color="text.secondary" fontSize="0.8rem">{user.email}</Typography>
                                    </Box>
                                    <Divider />
                                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main', fontWeight: 500 }}>
                                        Sign Out
                                    </MenuItem>
                                </Menu>
                            </>
                        ) : (
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => { onOpenAuth(); setMobileOpen(false); }}
                                sx={{
                                    display: { xs: 'none', md: 'flex' },
                                    borderRadius: 100,
                                    fontWeight: 600,
                                    borderColor: 'rgba(0,0,0,0.15)',
                                    color: 'text.primary',
                                    '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
                                }}
                            >
                                Sign In
                            </Button>
                        )}

                        {/* Mobile hamburger */}
                        <IconButton
                            onClick={() => setMobileOpen(true)}
                            sx={{ display: { md: 'none' } }}
                            aria-label="Toggle menu"
                        >
                            <MenuIcon />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Mobile Drawer */}
            <Drawer
                anchor="left"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                PaperProps={{ sx: { width: 280, pt: 8 } }}
            >
                <List>
                    {navLinks.map(({ label, page }) => (
                        <ListItem key={page} disablePadding>
                            <ListItemButton
                                onClick={() => handleNav(page)}
                                selected={currentPage === page}
                                sx={{ borderRadius: 2, mx: 1 }}
                            >
                                <ListItemText
                                    primary={label}
                                    primaryTypographyProps={{ fontWeight: currentPage === page ? 600 : 400 }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                    {!user && (
                        <ListItem disablePadding>
                            <ListItemButton
                                onClick={() => { onOpenAuth(); setMobileOpen(false); }}
                                sx={{ borderRadius: 2, mx: 1 }}
                            >
                                <ListItemText primary="Sign In" primaryTypographyProps={{ color: 'primary.main', fontWeight: 600 }} />
                            </ListItemButton>
                        </ListItem>
                    )}
                </List>
            </Drawer>
        </>
    )
}

export default Navbar
