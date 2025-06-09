// src/services/authService.js

import api from './api';

// Función para iniciar sesión
export const login = async (correo, password) => { // Agrega 'export' aquí
    try {
        const response = await api.post('/auth/login', { correo, password });
        
        const { token, usuario } = response.data;
        localStorage.setItem('token', token);
        
        // Puedes guardar también el usuario en localStorage para acceder a su rol
        localStorage.setItem('user', JSON.stringify(usuario)); // Guarda el objeto usuario
        
        return usuario; 
    } catch (error) {
        const errorMessage = error.response?.data?.mensaje || 'Error al iniciar sesión. Inténtalo de nuevo.';
        throw new Error(errorMessage);
    }
};

// Función para registrar un nuevo usuario
export const registrar = async (userData) => { // Agrega 'export' aquí
    try {
        const response = await api.post('/auth/registrar', userData);
        const { mensaje, token, usuario } = response.data;
        // Opcional: si quieres que el usuario inicie sesión automáticamente después de registrarse
        // localStorage.setItem('token', token); 
        // localStorage.setItem('user', JSON.stringify(usuario)); 
        return { mensaje, usuario };
    } catch (error) {
        const errorMessage = error.response?.data?.mensaje || 'Error al registrar usuario. Inténtalo de nuevo.';
        throw new Error(errorMessage);
    }
};

// Función para obtener el perfil del usuario (usando el token)
export const getProfile = async () => { // Agrega 'export' aquí
    try {
        const response = await api.get('/auth/me');
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Error al obtener el perfil del usuario.';
        throw new Error(errorMessage);
    }
};

// Función para cerrar sesión (simplemente elimina el token y el usuario del localStorage)
export const logout = () => { // Agrega 'export' aquí
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // ¡Importante! Elimina también la información del usuario
};

// NUEVAS FUNCIONES PARA OBTENER TOKEN Y ROL
export const getToken = () => {
    return localStorage.getItem('token');
};

export const getUserRole = () => {
    const userString = localStorage.getItem('user');
    if (userString) {
        try {
            const user = JSON.parse(userString);
            return user.rol; // Asumiendo que el campo para el rol es 'rol'
        } catch (e) {
            console.error("Error al parsear el usuario de localStorage:", e);
            return null;
        }
    }
    return null;
};