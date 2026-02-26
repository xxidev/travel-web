import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import LanguageIcon from '@mui/icons-material/Language';
import { useAuth } from '../../context/AuthContext';
import { apiLogin, apiRegister } from '../../api/auth';

interface AuthModalProps {
    open: boolean;
    onClose: () => void;
}

type TabValue = 'login' | 'register';

const AuthModal: React.FC<AuthModalProps> = ({ open, onClose }) => {
    const { login } = useAuth();
    const [tab, setTab] = useState<TabValue>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const resetForm = () => {
        setName('');
        setEmail('');
        setPassword('');
        setError('');
    };

    const switchTab = (t: TabValue) => {
        setTab(t);
        resetForm();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const result = tab === 'login'
                ? await apiLogin(email, password)
                : await apiRegister(email, password, name);

            login(result.token, result.user);
            resetForm();
            onClose();
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    p: 0,
                    overflow: 'visible',
                },
            }}
        >
            <DialogContent sx={{ p: 4 }}>
                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{ position: 'absolute', top: 16, right: 16, color: 'text.secondary' }}
                    aria-label="Close"
                >
                    <CloseIcon fontSize="small" />
                </IconButton>

                {/* Brand */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
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
                        }}
                    >
                        <LanguageIcon sx={{ fontSize: 18 }} />
                    </Box>
                    <Typography fontWeight={700} fontSize="1rem">Voyager</Typography>
                </Box>

                {/* Tabs */}
                <Tabs
                    value={tab}
                    onChange={(_, v) => switchTab(v)}
                    variant="fullWidth"
                    sx={{
                        mb: 3,
                        borderBottom: 1,
                        borderColor: 'divider',
                        '& .MuiTab-root': { fontWeight: 600, fontSize: '0.9rem' },
                    }}
                >
                    <Tab label="Sign In" value="login" />
                    <Tab label="Sign Up" value="register" />
                </Tabs>

                {/* Form */}
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {tab === 'register' && (
                        <TextField
                            label="Name"
                            type="text"
                            placeholder="Your name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            autoComplete="name"
                            fullWidth
                        />
                    )}

                    <TextField
                        label="Email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        fullWidth
                    />

                    <TextField
                        label="Password"
                        type="password"
                        placeholder={tab === 'register' ? 'At least 6 characters' : '••••••••'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                        fullWidth
                    />

                    {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={submitting}
                        sx={{
                            py: 1.4,
                            background: 'linear-gradient(135deg, #4361ee 0%, #7209b7 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #3a56d4 0%, #6008a0 100%)',
                            },
                        }}
                    >
                        {submitting ? 'Please wait…' : (tab === 'login' ? 'Sign In' : 'Create Account')}
                    </Button>
                </Box>

                {/* Switch */}
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                    {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
                    <Box
                        component="span"
                        onClick={() => switchTab(tab === 'login' ? 'register' : 'login')}
                        sx={{
                            color: 'primary.main',
                            fontWeight: 600,
                            cursor: 'pointer',
                            '&:hover': { textDecoration: 'underline' },
                        }}
                    >
                        {tab === 'login' ? 'Sign up' : 'Sign in'}
                    </Box>
                </Typography>
            </DialogContent>
        </Dialog>
    );
};

export default AuthModal;
