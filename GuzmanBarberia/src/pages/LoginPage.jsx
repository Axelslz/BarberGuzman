import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Link as MuiLink,
    Alert,
    CircularProgress,
    useMediaQuery,
    // Popover, // <-- Ya no necesitas Popover
    Snackbar // <-- Importa Snackbar
} from '@mui/material';
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

    // Estados para el Snackbar
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // 'success', 'error', 'info', 'warning'

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const googleButtonContainerRef = useRef(null); // Ref para el contenedor del botón de Google
    // const loginButtonRef = useRef(null); // Ya no es estrictamente necesario para el Snackbar si no lo usas para anclar

    const handleCredentialResponse = async (response) => {
        console.log("Encoded JWT ID token: " + response.credential);
        setLoading(true);
        setErrorLogin(null);
        try {
            const authResult = await loginWithGoogle(response.credential);

            if (authResult.redirectRequired) {
                setSnackbarMessage('¡Bienvenido! Por favor, establece una contraseña para tu cuenta.');
                setSnackbarSeverity('info');
                setSnackbarOpen(true);
                setTimeout(() => {
                    navigate('/set-password');
                }, 1500);
            } else {
                const profileData = await getProfile();
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

                setSnackbarMessage('¡Bienvenido a Guzman BarWeb!');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
                setTimeout(() => {
                    navigate('/seleccionar-barbero');
                }, 1500);
            }

        } catch (error) {
            setErrorLogin(error.message || 'Error al iniciar sesión con Google.');
            setSnackbarMessage(error.message || 'Error al iniciar sesión con Google.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            console.error('Error al iniciar sesión con Google:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log("Valor de VITE_GOOGLE_CLIENT_ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);

        if (window.google && googleButtonContainerRef.current) {
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
                googleButtonContainerRef.current,
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
        onSubmit: async (values, { setSubmitting }) => {
            setErrorLogin(null);
            setLoading(true);
            setSubmitting(true);

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

                setSnackbarMessage('¡Bienvenido a Guzman BarWeb!');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
                setTimeout(() => {
                    navigate('/seleccionar-barbero');
                }, 1500);

            } catch (error) {
                setErrorLogin(error.message);
                setSnackbarMessage(error.message);
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
                console.error('Error al iniciar sesión:', error);
            } finally {
                setLoading(false);
                setSubmitting(false);
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
                        display: { xs: 'none', md: 'flex' }, 
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
                                // ref={loginButtonRef} // Ya no necesitas esta ref para el Snackbar
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
                            ref={googleButtonContainerRef}
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

            {/* Snackbar para notificaciones */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000} // Cierra automáticamente después de 3 segundos
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // Posición en la pantalla
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default LoginPage;