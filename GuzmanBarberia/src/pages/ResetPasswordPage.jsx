import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; 
import * as authService from '../services/authService';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Alert,
    CircularProgress
} from '@mui/material';

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const location = useLocation(); 
    const [token, setToken] = useState(''); 
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (location.state?.emailSent) {
            setMessage('Hemos enviado un código a tu correo. Ingresa el código y tu nueva contraseña.');
        }
    }, [location.state]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            setLoading(false);
            return;
        }

        if (token.length !== 5 || isNaN(token)) { 
            setError('El código debe ser numérico y de 5 dígitos.');
            setLoading(false);
            return;
        }

        try {
            const response = await authService.resetPassword(token, newPassword);
            setMessage(response.message || 'Tu contraseña ha sido restablecida exitosamente.');
            setNewPassword('');
            setConfirmPassword('');
            setToken('');

            setTimeout(() => {
                navigate('/login', { state: { passwordReset: true } }); 
            }, 3000); 

        } catch (err) {
            console.error('Error al restablecer contraseña:', err);
            setError(err.message || 'Hubo un error al restablecer tu contraseña. Verifica el código e intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container
            component="main"
            maxWidth="xs"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: '#D1B498', 
            }}
        >
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backgroundColor: 'white',
                    padding: 4,
                    borderRadius: 2,
                    boxShadow: 3,
                    width: '100%',
                }}
            >
                <Typography component="h1" variant="h5" sx={{ mb: 3, color: '#333' }}>
                    Restablecer Contraseña
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="token"
                        label="Código de Restablecimiento"
                        name="token"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        inputProps={{ maxLength: 5 }} 
                        placeholder="Ej: 12345"
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="newPassword"
                        label="Nueva Contraseña"
                        type="password"
                        id="newPassword"
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="confirmPassword"
                        label="Confirmar Nueva Contraseña"
                        type="password"
                        id="confirmPassword"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        variant="outlined"
                        sx={{ mb: 3 }}
                    />

                    {/* Mensajes de feedback */}
                    {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{
                            mt: 3,
                            mb: 2,
                            backgroundColor: '#333',
                            '&:hover': {
                                backgroundColor: '#555',
                            },
                        }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Restablecer Contraseña'}
                    </Button>
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Link to="/login" style={{ textDecoration: 'none', color: '#6A0DAD' }}>
                            Volver al inicio de sesión
                        </Link>
                    </Box>
                </Box>
            </Box>
        </Container>
    );
};

export default ResetPasswordPage;