import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, CircularProgress, Alert } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { setPassword } from '../services/authService';
import { useUser } from '../contexts/UserContext'; 

const validationSchema = yup.object({
    newPassword: yup
        .string('Ingresa tu nueva contraseña')
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
        .required('La nueva contraseña es requerida'),
    confirmPassword: yup
        .string('Confirma tu nueva contraseña')
        .oneOf([yup.ref('newPassword'), null], 'Las contraseñas no coinciden')
        .required('La confirmación de contraseña es requerida'),
});

function SetPasswordPage() {
    const navigate = useNavigate();
    const { updateUserProfile } = useUser();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [setupToken, setSetupToken] = useState(null);
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        const storedSetupToken = localStorage.getItem('setupToken');
        const storedUserForSetup = localStorage.getItem('userForSetup');

        if (!storedSetupToken) {
            setError('Token de configuración no encontrado. Por favor, inicia sesión con Google de nuevo.');
            navigate('/login'); 
            return;
        }
        setSetupToken(storedSetupToken);

        if (storedUserForSetup) {
            try {
                const user = JSON.parse(storedUserForSetup);
                setUserEmail(user.correo || '');
            } catch (e) {
                console.error("Error al parsear userForSetup:", e);
                setUserEmail('');
            }
        }
    }, [navigate]);

    const formik = useFormik({
        initialValues: {
            newPassword: '',
            confirmPassword: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            setError(null);
            setSuccess(null);
            setLoading(true);

            try {
                if (!setupToken) {
                    throw new Error('Token de configuración no disponible.');
                }
                const response = await setPassword(setupToken, values.newPassword);

                updateUserProfile({
                    id: response.user.id,
                    name: response.user.name,
                    lastName: response.user.lastname,
                    email: response.user.correo,
                    role: response.user.role,
                    id_barbero: response.user.id_barbero, 
                    citas_completadas: response.user.citas_completadas || 0,
                });

                setSuccess('Contraseña establecida exitosamente. Redirigiendo...');
                setTimeout(() => {
                    navigate('/seleccionar-barbero'); 
                    
                }, 1500);

            } catch (err) {
                setError(err.message || 'Error al establecer la contraseña.');
                console.error("Error al establecer la contraseña:", err);
            } finally {
                setLoading(false);
            }
        },
    });

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: '#EDE0D4',
            }}
        >
            <Paper
                elevation={6}
                sx={{
                    p: { xs: 3, md: 5 },
                    borderRadius: '15px',
                    width: '100%',
                    maxWidth: '450px',
                    textAlign: 'center',
                    boxSizing: 'border-box',
                }}
            >
                <Typography variant="h5" component="h2" sx={{ mb: 3, color: '#333333', fontWeight: 'bold' }}>
                    Establecer Contraseña
                </Typography>
                {userEmail && (
                    <Typography variant="body1" sx={{ mb: 2, color: '#555' }}>
                        Establece una contraseña para tu cuenta de Google: <br /> <strong>{userEmail}</strong>
                    </Typography>
                )}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                {loading && <CircularProgress size={24} sx={{ mb: 2, color: '#D4AF37' }} />}

                <form onSubmit={formik.handleSubmit}>
                    <TextField
                        fullWidth
                        id="newPassword"
                        name="newPassword"
                        label="Nueva Contraseña"
                        type="password"
                        variant="outlined"
                        value={formik.values.newPassword}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
                        helperText={formik.touched.newPassword && formik.errors.newPassword}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        id="confirmPassword"
                        name="confirmPassword"
                        label="Confirmar Contraseña"
                        type="password"
                        variant="outlined"
                        value={formik.values.confirmPassword}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                        helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                        sx={{ mb: 3 }}
                    />
                    <Button
                        color="primary"
                        variant="contained"
                        fullWidth
                        type="submit"
                        disabled={loading}
                        sx={{
                            backgroundColor: '#D4AF37',
                            '&:hover': { backgroundColor: '#C39F37' },
                            color: '#1a202c',
                            fontSize: '1rem',
                            padding: '10px 0',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                        }}
                    >
                        Establecer Contraseña
                    </Button>
                </form>
            </Paper>
        </Box>
    );
}

export default SetPasswordPage;