import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, Button, Paper, Link as MuiLink, Alert, CircularProgress, Snackbar } from '@mui/material';
// import { useTheme } from '@mui/material/styles';
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

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success'); 

    // const theme = useTheme();
    // const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const googleButtonContainerRef = useRef(null); 

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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-10 left-10 w-24 h-24 bg-amber-200 rounded-full opacity-40 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-orange-200 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute top-1/3 right-0 w-20 h-20 bg-yellow-200 rounded-full opacity-50"></div>
        <div className="absolute bottom-1/3 left-0 w-16 h-16 bg-amber-300 rounded-full opacity-40"></div>
        
        <div className="w-full max-w-5xl relative">
            {/* Contenedor principal con diseño de dos columnas */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                
                {/* Sección izquierda: Imagen - Solo visible en desktop */}
                <div className="hidden md:flex md:flex-1 bg-gradient-to-br from-amber-100 to-orange-100 items-center justify-center  relative">
                    {/* Elementos decorativos en la sección de imagen */}
                    <div className="absolute top-4 left-4 w-8 h-8 bg-amber-300 rounded-full opacity-60"></div>
                    <div className="absolute bottom-4 right-4 w-6 h-6 bg-orange-300 rounded-full opacity-50"></div>
                    <div className="absolute top-1/2 left-0 w-4 h-16 bg-gradient-to-b from-amber-400 to-transparent opacity-40"></div>
                    
                    {/* Contenedor de imagen con efectos */}
                    <div className="relative bg-white rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-transform duration-300">
                        <img
                            src={barberPoleLogin}
                            alt="Barber Pole"
                            className="w-full h-full max-w-sm max-h-full object-contain"
                        />
                        {/* Reflejo sutil */}
                        <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent rounded-2xl pointer-events-none"></div>
                    </div>
                </div>

                {/* Sección derecha: Formulario */}
                <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
                    {/* Título principal */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg mx-auto mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold bg-slate-700 bg-clip-text text-transparent mb-2">
                            Iniciar Sesión
                        </h1>
                        <p className="text-gray-600 text-sm">
                            Ingresa tus credenciales para continuar
                        </p>
                    </div>

                    <form onSubmit={formik.handleSubmit} className="space-y-4">
                        {/* Campo de correo electrónico */}
                        <div className="space-y-2">
                            <label htmlFor="correo" className="block text-sm font-semibold text-gray-700">
                                Correo Electrónico
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </div>
                                <input
                                    id="correo"
                                    name="correo"
                                    type="email"
                                    autoComplete="email"
                                    value={formik.values.correo}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm placeholder-gray-400 ${
                                        formik.touched.correo && formik.errors.correo 
                                            ? 'border-red-300 focus:ring-red-500' 
                                            : 'border-gray-200'
                                    }`}
                                    placeholder="tu@email.com"
                                />
                            </div>
                            {formik.touched.correo && formik.errors.correo && (
                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {formik.errors.correo}
                                </p>
                            )}
                        </div>

                        {/* Campo de contraseña */}
                        <div className="space-y-2">
                            <label htmlFor="contrasena" className="block text-sm font-semibold text-gray-700">
                                Contraseña
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    id="contrasena"
                                    name="contrasena"
                                    type="password"
                                    autoComplete="current-password"
                                    value={formik.values.contrasena}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm placeholder-gray-400 ${
                                        formik.touched.contrasena && formik.errors.contrasena 
                                            ? 'border-red-300 focus:ring-red-500' 
                                            : 'border-gray-200'
                                    }`}
                                    placeholder="Tu contraseña"
                                />
                            </div>
                            {formik.touched.contrasena && formik.errors.contrasena && (
                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {formik.errors.contrasena}
                                </p>
                            )}
                        </div>

                        {/* Botón de login / Loading */}
                        {loading ? (
                            <div className="flex justify-center py-4">
                                <div className="flex items-center space-x-3 text-amber-600">
                                    <CircularProgress size={24} sx={{ color: '#D97706' }} />
                                    <span className="text-sm font-medium">Iniciando sesión...</span>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="submit"
                                className="w-full relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3.5 px-4 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 group"
                            >
                                <div className="absolute inset-0 bg-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                <div className="relative flex items-center justify-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                    Iniciar Sesión
                                </div>
                            </button>
                        )}

                        {/* Error de login */}
                        {errorLogin && (
                            <div className="rounded-xl bg-red-50 p-4 border border-red-200">
                                <div className="flex items-start">
                                    <svg className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-sm text-red-700">{errorLogin}</p>
                                </div>
                            </div>
                        )}

                        {/* Link para recuperar contraseña */}
                        <div className="text-center">
                            <Link
                                to="/forgot-password"
                                className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-amber-600 transition-colors duration-200 group"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>

                        {/* Separador */}
                        <div className="relative flex items-center">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <div className="flex-shrink-0 px-4">
                                <span className="text-sm font-medium text-gray-500 bg-white">O</span>
                            </div>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        {/* Contenedor para botón de Google */}
                        <div 
                            ref={googleButtonContainerRef}
                            className="flex justify-center"
                        >
                            {/* El botón de Google se renderiza aquí por el script */}
                        </div>

                        {/* Link para registrarse */}
                        <div className="text-center pt-4">
                            <p className="text-sm text-gray-600">
                                ¿Aún no tienes una cuenta?{' '}
                                <Link
                                    to="/register"
                                    className="font-semibold text-amber-600 hover:text-amber-700 transition-colors duration-200"
                                >
                                    Regístrate
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        {/* Snackbar para notificaciones - convertido a Tailwind */}
        {snackbarOpen && (
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom duration-300">
                <div className={`rounded-xl p-4 shadow-lg border max-w-sm w-full mx-4 ${
                    snackbarSeverity === 'success' 
                        ? 'bg-green-50 border-green-200 text-green-700' 
                        : snackbarSeverity === 'error'
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-blue-50 border-blue-200 text-blue-700'
                }`}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-start">
                            <svg className={`h-5 w-5 mt-0.5 mr-3 flex-shrink-0 ${
                                snackbarSeverity === 'success' ? 'text-green-500' : 
                                snackbarSeverity === 'error' ? 'text-red-500' : 'text-blue-500'
                            }`} fill="currentColor" viewBox="0 0 20 20">
                                {snackbarSeverity === 'success' ? (
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                ) : snackbarSeverity === 'error' ? (
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                ) : (
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                )}
                            </svg>
                            <p className="text-sm font-medium">{snackbarMessage}</p>
                        </div>
                        <button 
                            onClick={() => setSnackbarOpen(false)}
                            className={`ml-3 flex-shrink-0 ${
                                snackbarSeverity === 'success' ? 'text-green-500 hover:text-green-600' : 
                                snackbarSeverity === 'error' ? 'text-red-500 hover:text-red-600' : 'text-blue-500 hover:text-blue-600'
                            } transition-colors duration-200`}
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
);
}

export default LoginPage;