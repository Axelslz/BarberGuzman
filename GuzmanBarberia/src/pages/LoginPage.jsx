// src/pages/LoginPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, Button, Paper, Link as MuiLink, Alert, CircularProgress, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import barberPoleLogin from '../assets/Registro.jpg';
import { useUser } from '../contexts/UserContext.jsx';
import { login, getProfile, loginWithGoogle } from '../services/authService';

const validationSchema = yup.object({
    correo: yup
        .string('Ingresa tu correo electrónico')
        .email('Ingresa un correo electrónico válido')
        .required('El correo electrónico es requerido'),
    contrasena: yup
        .string('Ingresa tu contraseña')
        .required('La contraseña es requerido'),
});

function LoginPage() {
    const navigate = useNavigate();
    const { updateUserProfile } = useUser();
    const [errorLogin, setErrorLogin] = useState(null);
    const [loading, setLoading] = useState(false);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const googleButtonRef = useRef(null);

    const handleCredentialResponse = async (response) => {
        console.log("Encoded JWT ID token: " + response.credential);
        setLoading(true);
        setErrorLogin(null);
        try {
            const authResult = await loginWithGoogle(response.credential); // Ahora devuelve un objeto con user/redirectRequired

            if (authResult.redirectRequired) {
                // Redirige a la página para establecer la contraseña
                navigate('/set-password');
                alert('¡Bienvenido! Por favor, establece una contraseña para tu cuenta.');
            } else {
                // Si no se requiere redirección, actualiza el perfil y procede con el login normal
                const profileData = await getProfile(); // getProfile asegura obtener los datos completos si ya hay un token
                console.log("ProfileData después de getProfile en LoginPage (Google - No redirect):", profileData);

                updateUserProfile({
                    id: profileData.id,
                    name: profileData.name,
                    lastName: profileData.lastname,
                    email: profileData.correo,
                    role: profileData.role,
                    id_barbero: profileData.id_barbero,
                    citas_completadas: profileData.citas_completadas || 0,
                });

                alert('Inicio de sesión con Google exitoso. ¡Bienvenido!');
                navigate('/seleccionar-barbero');
            }

        } catch (error) {
            setErrorLogin(error.message || 'Error al iniciar sesión con Google.');
            console.error('Error al iniciar sesión con Google:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log("Valor de VITE_GOOGLE_CLIENT_ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);

        if (window.google && googleButtonRef.current) {
            if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
                console.error("Error: VITE_GOOGLE_CLIENT_ID no está definido. Revisa tu archivo .env");
                return;
            }

            window.google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                callback: handleCredentialResponse,
                auto_select: false,
            });

            window.google.accounts.id.renderButton(
                googleButtonRef.current,
                { theme: "outline", size: "large", text: "continue_with", width: "100%", locale: "es" }
            );
        }
    }, []);

    const formik = useFormik({
        initialValues: {
            correo: '',
            contrasena: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            setErrorLogin(null);
            setLoading(true);

            try {
                const user = await login(values.correo, values.contrasena);
                updateUserProfile({
                    id: user.id,
                    name: user.name,
                    lastName: user.lastname,
                    email: user.correo,
                    role: user.role,
                    id_barbero: user.id_barbero,
                    citas_completadas: user.citas_completadas || 0,
                });

                alert('Inicio de sesión exitoso. ¡Bienvenido!');
                navigate('/seleccionar-barbero');

            } catch (error) {
                setErrorLogin(error.message);
                console.error('Error al iniciar sesión:', error);
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
                overflow: 'hidden',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: 'stretch',
                    maxWidth: '900px',
                    width: '100%',
                    boxShadow: 6,
                    borderRadius: '20px',
                    overflow: 'hidden',
                    maxHeight: { xs: '98vh', md: '95vh' },
                    margin: 'auto',
                }}
            >
                {/* Left Section: Image */}
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        p: { xs: 2, md: 4 },
                        backgroundColor: 'white',
                        borderRadius: isMobile ? '20px 20px 0 0' : '20px 0 0 20px',
                        height: { xs: '30vh', sm: '35vh', md: 'auto' },
                        maxHeight: { xs: '300px', md: 'none' },
                        overflow: 'hidden',
                        width: '100%',
                    }}
                >
                    <img
                        src={barberPoleLogin}
                        alt="Barber Pole"
                        style={{
                            maxWidth: '100%',
                            height: '100%',
                            display: 'block',
                            objectFit: 'contain',
                        }}
                    />
                </Box>

                {/* Right Section: Form */}
                <Paper
                    elevation={0}
                    sx={{
                        flex: 1,
                        backgroundColor: 'white',
                        p: { xs: 3, md: 5 },
                        borderRadius: isMobile ? '0 0 20px 20px' : '0 20px 20px 0',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        boxSizing: 'border-box',
                        overflowY: 'auto',
                        maxHeight: isMobile ? '70vh' : 'auto',
                    }}
                >
                    <Typography
                        variant="h4"
                        component="h2"
                        sx={{ mb: { xs: 3, md: 4 }, textAlign: 'center', color: '#333333', fontWeight: 'bold' }}
                    >
                        Iniciar Sesión
                    </Typography>
                    <form onSubmit={formik.handleSubmit}>
                        <TextField
                            fullWidth
                            id="correo"
                            name="correo"
                            label="Correo Electrónico"
                            variant="filled"
                            value={formik.values.correo}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.correo && Boolean(formik.errors.correo)}
                            helperText={formik.touched.correo && formik.errors.correo}
                            sx={{
                                mb: 2,
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                '& .MuiInputBase-input': {
                                    paddingTop: '25px',
                                    paddingBottom: '10px',
                                    paddingLeft: '14px',
                                    paddingRight: '14px',
                                    color: '#333333',
                                },
                                '& .MuiInputLabel-root': {
                                    transform: 'translate(14px, 12px) scale(1)',
                                    color: '#555',
                                },
                                '& .MuiInputLabel-root.Mui-focused, & .MuiInputLabel-root.Mui-active': {
                                    transform: 'translate(14px, 5px) scale(0.75)',
                                    color: '#D4AF37',
                                },
                                '& .MuiInputLabel-shrink': {
                                    transform: 'translate(14px, 5px) scale(0.75)',
                                },
                                '& .MuiFilledInput-root': {
                                    backgroundColor: 'white',
                                    '&:hover': { backgroundColor: 'white' },
                                    '&.Mui-focused': { backgroundColor: 'white' },
                                    border: '1px solid #eee',
                                },
                            }}
                            InputProps={{ disableUnderline: true }}
                        />
                        <TextField
                            fullWidth
                            id="contrasena"
                            name="contrasena"
                            label="Contraseña"
                            type="password"
                            variant="filled"
                            value={formik.values.contrasena}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.contrasena && Boolean(formik.errors.contrasena)}
                            helperText={formik.touched.contrasena && formik.errors.contrasena}
                            sx={{
                                mb: 4,
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                '& .MuiInputBase-input': {
                                    paddingTop: '25px',
                                    paddingBottom: '10px',
                                    paddingLeft: '14px',
                                    paddingRight: '14px',
                                    color: '#333333',
                                },
                                '& .MuiInputLabel-root': {
                                    transform: 'translate(14px, 12px) scale(1)',
                                    color: '#555',
                                },
                                '& .MuiInputLabel-root.Mui-focused, & .MuiInputLabel-root.Mui-active': {
                                    transform: 'translate(14px, 5px) scale(0.75)',
                                    color: '#D4AF37',
                                },
                                '& .MuiInputLabel-shrink': {
                                    transform: 'translate(14px, 5px) scale(0.75)',
                                },
                                '& .MuiFilledInput-root': {
                                    backgroundColor: 'white',
                                    '&:hover': { backgroundColor: 'white' },
                                    '&.Mui-focused': { backgroundColor: 'white' },
                                    border: '1px solid #eee',
                                },
                            }}
                            InputProps={{ disableUnderline: true }}
                        />
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                                <CircularProgress size={24} sx={{ color: '#D4AF37' }} />
                            </Box>
                        ) : (
                            <Button
                                color="primary"
                                variant="contained"
                                fullWidth
                                type="submit"
                                sx={{
                                    backgroundColor: '#D4AF37',
                                    '&:hover': {
                                        backgroundColor: '#C39F37',
                                    },
                                    color: '#1a202c',
                                    fontSize: '1.1rem',
                                    padding: '12px 0',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    boxShadow: '0px 4px 10px rgba(0,0,0,0.2)',
                                }}
                            >
                                Iniciar Sesión
                            </Button>
                        )}

                        {errorLogin && (
                            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                                {errorLogin}
                            </Alert>
                        )}

                        <MuiLink
                            component={Link}
                            to="/forgot-password"
                            variant="body2"
                            sx={{ mt: 2, display: 'block', textAlign: 'center', color: '#333333', textDecoration: 'underline' }}
                        >
                            ¿Olvidaste tu contraseña?
                        </MuiLink>
                        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: '#333333', fontWeight: 'bold' }}>
                            O
                        </Typography>
                        {/* Contenedor para el botón de Google */}
                        <Box
                            ref={googleButtonRef}
                            sx={{
                                mt: 2,
                                display: 'flex',
                                justifyContent: 'center',
                                '.g_id_signin': {
                                    width: '100%',
                                    justifyContent: 'center',
                                }
                            }}
                        >
                        </Box>
                        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: '#333333' }}>
                            ¿Aún no tienes una cuenta?{' '}
                            <MuiLink component={Link} to="/register" sx={{ color: '#D4AF37', textDecoration: 'underline', fontWeight: 'bold' }}>
                                Regístrate
                            </MuiLink>
                        </Typography>
                    </form>
                </Paper>
            </Box>
        </Box>
    );
}

export default LoginPage;