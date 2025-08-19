import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Alert, CircularProgress, Snackbar } from '@mui/material';
// import { useTheme } from '@mui/material/styles';
import { useFormik } from 'formik';
import * as yup from 'yup';
import barberPoleRegister from '../assets/Registro.jpg'; 
import { useNavigate } from 'react-router-dom';
import { registrar } from '../services/authService';

const validationSchema = yup.object({
    nombre: yup
        .string('Ingresa tu nombre')
        .required('El nombre es requerido'),
    apellido: yup
        .string('Ingresa tu apellido')
        .required('El apellido es requerido'),
    correo: yup
        .string('Ingresa tu correo electrónico')
        .email('Ingresa un correo electrónico válido')
        .required('El correo electrónico es requerido'),
    contrasena: yup
        .string('Ingresa tu contraseña')
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .required('La contraseña es requerida'),
    confirmarContrasena: yup
        .string('Confirma tu contraseña')
        .oneOf([yup.ref('contrasena'), null], 'Las contraseñas no coinciden')
        .required('Confirmar contraseña es requerido'),
});

function RegisterPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success'); 

    const formik = useFormik({
        initialValues: {
            nombre: '',
            apellido: '',
            correo: '',
            contrasena: '',
            confirmarContrasena: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            setLoading(true);

            try {
                const { mensaje } = await registrar({
                    name: values.nombre,
                    lastname: values.apellido,
                    correo: values.correo,
                    password: values.contrasena,
                    confirmPassword: values.confirmarContrasena,
                });

                // Usar Snackbar para el mensaje de éxito
                setSnackbarMessage(mensaje || 'Registro exitoso. ¡Ahora inicia sesión!');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
                
                formik.resetForm();
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } catch (error) {
                setSnackbarMessage(error.message || 'Error al registrar.');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
                console.error('Error al registrar:', error);
            } finally {
                setLoading(false);
            }
        },
    });

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-10 right-10 w-24 h-24 bg-blue-200 rounded-full opacity-40 animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-32 h-32 bg-indigo-200 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute top-1/3 left-0 w-20 h-20 bg-purple-200 rounded-full opacity-50"></div>
        <div className="absolute bottom-1/3 right-0 w-16 h-16 bg-blue-300 rounded-full opacity-40"></div>
        
        <div className="w-full max-w-5xl relative">
            {/* Contenedor principal con diseño de dos columnas */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden flex flex-col md:flex-row min-h-[700px]">
                
                {/* Sección izquierda: Imagen - Solo visible en desktop */}
                <div className="hidden md:flex md:flex-1 bg-gradient-to-br from-blue-100 to-indigo-100 items-center justify-center  relative">
                    {/* Elementos decorativos en la sección de imagen */}
                    <div className="absolute top-4 left-4 w-8 h-8 bg-blue-300 rounded-full opacity-60"></div>
                    <div className="absolute bottom-4 right-4 w-6 h-6 bg-indigo-300 rounded-full opacity-50"></div>
                    <div className="absolute top-1/2 right-0 w-4 h-16 bg-gradient-to-b from-blue-400 to-transparent opacity-40"></div>
                    
                    {/* Contenedor de imagen con efectos */}
                    <div className="relative bg-white rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-transform duration-300">
                        <img
                            src={barberPoleRegister}
                            alt="Barber Pole"
                            className="w-full h-full max-w-sm max-h-full object-contain"
                        />
                        {/* Reflejo sutil */}
                        <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent rounded-2xl pointer-events-none"></div>
                    </div>
                </div>

                {/* Sección derecha: Formulario */}
                <div className="flex-1 p-8 md:p-12 flex flex-col justify-center max-h-screen md:max-h-none overflow-y-auto">
                    {/* Título principal */}
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg mx-auto mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold bg-slate-700 bg-clip-text text-transparent mb-2">
                            Crear Cuenta
                        </h1>
                        <p className="text-gray-600 text-sm">
                            Completa los datos para registrarte
                        </p>
                    </div>

                    <form onSubmit={formik.handleSubmit} className="space-y-2">
                        {/* Campo de nombre */}
                        <div className="space-y-2">
                            <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700">
                                Nombre
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <input
                                    id="nombre"
                                    name="nombre"
                                    type="text"
                                    autoComplete="given-name"
                                    value={formik.values.nombre}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm placeholder-gray-400 ${
                                        formik.touched.nombre && formik.errors.nombre 
                                            ? 'border-red-300 focus:ring-red-500' 
                                            : 'border-gray-200'
                                    }`}
                                    placeholder="Tu nombre"
                                />
                            </div>
                            {formik.touched.nombre && formik.errors.nombre && (
                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {formik.errors.nombre}
                                </p>
                            )}
                        </div>

                        {/* Campo de apellido */}
                        <div className="space-y-2">
                            <label htmlFor="apellido" className="block text-sm font-semibold text-gray-700">
                                Apellido
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <input
                                    id="apellido"
                                    name="apellido"
                                    type="text"
                                    autoComplete="family-name"
                                    value={formik.values.apellido}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm placeholder-gray-400 ${
                                        formik.touched.apellido && formik.errors.apellido 
                                            ? 'border-red-300 focus:ring-red-500' 
                                            : 'border-gray-200'
                                    }`}
                                    placeholder="Tu apellido"
                                />
                            </div>
                            {formik.touched.apellido && formik.errors.apellido && (
                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {formik.errors.apellido}
                                </p>
                            )}
                        </div>

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
                                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm placeholder-gray-400 ${
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
                                    autoComplete="new-password"
                                    value={formik.values.contrasena}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm placeholder-gray-400 ${
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

                        {/* Campo de confirmar contraseña */}
                        <div className="space-y-2">
                            <label htmlFor="confirmarContrasena" className="block text-sm font-semibold text-gray-700">
                                Confirmar Contraseña
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <input
                                    id="confirmarContrasena"
                                    name="confirmarContrasena"
                                    type="password"
                                    autoComplete="new-password"
                                    value={formik.values.confirmarContrasena}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm placeholder-gray-400 ${
                                        formik.touched.confirmarContrasena && formik.errors.confirmarContrasena 
                                            ? 'border-red-300 focus:ring-red-500' 
                                            : 'border-gray-200'
                                    }`}
                                    placeholder="Confirma tu contraseña"
                                />
                            </div>
                            {formik.touched.confirmarContrasena && formik.errors.confirmarContrasena && (
                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {formik.errors.confirmarContrasena}
                                </p>
                            )}
                        </div>

                        {/* Botón de registro / Loading */}
                        <div className="pt-4">
                            {loading ? (
                                <div className="flex justify-center py-4">
                                    <div className="flex items-center space-x-3 text-blue-600">
                                        <CircularProgress size={24} sx={{ color: '#2563EB' }} />
                                        <span className="text-sm font-medium">Creando tu cuenta...</span>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="submit"
                                    className="w-full relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3.5 px-4 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 group"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                    <div className="relative flex items-center justify-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                        </svg>
                                        Registrarse
                                    </div>
                                </button>
                            )}
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
                            onClick={handleCloseSnackbar}
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

export default RegisterPage;