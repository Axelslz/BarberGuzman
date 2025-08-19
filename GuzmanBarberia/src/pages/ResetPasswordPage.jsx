import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; 
import * as authService from '../services/authService';
import { Alert, CircularProgress } from '@mui/material';

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
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Elementos decorativos de fondo */}
            <div className="absolute top-10 right-10 w-24 h-24 bg-purple-200 rounded-full opacity-40 animate-pulse"></div>
            <div className="absolute bottom-10 left-10 w-32 h-32 bg-pink-200 rounded-full opacity-30 animate-bounce"></div>
            <div className="absolute top-1/3 right-0 w-20 h-20 bg-indigo-200 rounded-full opacity-50"></div>
            <div className="absolute bottom-1/3 left-0 w-16 h-16 bg-purple-300 rounded-full opacity-40"></div>
            
            <div className="w-full max-w-md relative">
                {/* Contenedor principal con efecto glassmorphism */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 relative">
                    {/* Icono decorativo */}
                    <div className="flex justify-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                    </div>
                    
                    {/* Título principal */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-slate-700 bg-clip-text text-transparent mb-2">
                            Restablecer Contraseña
                        </h1>
                        <p className="text-gray-600 text-sm">
                            Ingresa el código y tu nueva contraseña
                        </p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Campo de código */}
                        <div className="space-y-2">
                            <label htmlFor="token" className="block text-sm font-semibold text-gray-700">
                                Código de Restablecimiento
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                    </svg>
                                </div>
                                <input
                                    id="token"
                                    type="text"
                                    name="token"
                                    required
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    maxLength={5}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm placeholder-gray-400 text-center text-lg font-mono tracking-widest"
                                    placeholder="12345"
                                />
                            </div>
                            <p className="text-xs text-gray-500 flex items-center mt-1">
                                <svg className="w-3 h-3 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                Código numérico de 5 dígitos enviado a tu correo
                            </p>
                        </div>

                        {/* Campo de nueva contraseña */}
                        <div className="space-y-2">
                            <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700">
                                Nueva Contraseña
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    id="newPassword"
                                    type="password"
                                    name="newPassword"
                                    autoComplete="new-password"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm placeholder-gray-400"
                                    placeholder="Tu nueva contraseña"
                                />
                            </div>
                        </div>

                        {/* Campo de confirmar contraseña */}
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                                Confirmar Nueva Contraseña
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    name="confirmPassword"
                                    autoComplete="new-password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm placeholder-gray-400"
                                    placeholder="Confirma tu nueva contraseña"
                                />
                            </div>
                        </div>

                        {/* Alertas mejoradas */}
                        {message && (
                            <div className="rounded-xl bg-green-50 p-4 border border-green-200">
                                <div className="flex items-start">
                                    <svg className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-sm text-green-700">{message}</p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="rounded-xl bg-red-50 p-4 border border-red-200">
                                <div className="flex items-start">
                                    <svg className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Botón principal mejorado */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full relative overflow-hidden rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 px-4 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                            <div className="relative flex items-center justify-center">
                                {loading ? (
                                    <>
                                        <CircularProgress size={20} color="inherit" className="mr-2" />
                                        Restableciendo...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        Restablecer Contraseña
                                    </>
                                )}
                            </div>
                        </button>

                        {/* Link de retorno mejorado */}
                        <div className="text-center pt-4">
                            <Link
                                to="/login"
                                className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-green-600 transition-colors duration-200 group"
                            >
                                <svg className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Volver al inicio de sesión
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;