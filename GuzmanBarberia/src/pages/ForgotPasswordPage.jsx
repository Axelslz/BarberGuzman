import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
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

const ForgotPasswordPage = () => {
    const [correo, setCorreo] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            await authService.forgotPassword(correo); 
            setMessage('Si el correo electrónico está registrado, se te enviará un código para restablecer tu contraseña. Redirigiendo...');
            setCorreo(''); 

            setTimeout(() => {
                navigate('/reset-password', { state: { emailSent: true, email: correo } });
            }, 2000); 
            
        } catch (err) {
            console.error('Error al solicitar restablecimiento:', err);
            setError(err.message || 'Hubo un error al procesar tu solicitud. Intenta de nuevo.');
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
                    Recuperar Contraseña
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="correo"
                        label="Correo Electrónico"
                        name="correo"
                        autoComplete="email"
                        autoFocus
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Ingresa el correo asociado a tu cuenta.
                    </Typography>

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
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Enviar Código de Restablecimiento'}
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

export default ForgotPasswordPage;