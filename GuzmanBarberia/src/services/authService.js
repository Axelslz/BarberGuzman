// src/services/authService.js
import api from './api';

export const login = async (correo, password) => { 
    try {
        const response = await api.post('/auth/login', { correo, password });
        
        // Asumiendo que el backend retorna: { token: '...', user: { id: ..., role: '...' } }
        // Si tu backend realmente retorna { token: '...', usuario: { ... } }, esta línea ya es correcta.
        // Pero si tu backend retorna { token: '...', user: { ... } }, DEBES cambiarlo a 'user'.
        // Basado en "Datos de perfil recibidos en getProfile: {user: {…}}", es probable que sea 'user'.
        const { token, user } = response.data; // <-- CAMBIO AQUÍ: de 'usuario' a 'user'
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user)); // Guarda el objeto 'user'
        
        console.log("Datos de usuario recibidos y procesados en login:", user); // Para verificar
        return user; 
    } catch (error) {
        const errorMessage = error.response?.data?.mensaje || 'Error al iniciar sesión. Inténtalo de nuevo.';
        throw new Error(errorMessage);
    }
};

// Función para registrar un nuevo usuario
export const registrar = async (userData) => {
    try {
        const response = await api.post('/auth/registrar', userData);
        const { mensaje, user } = response.data; // <--- POSIBLE CAMBIO AQUÍ si tu backend también retorna 'user' para registrar
        // Opcional: si quieres que el usuario inicie sesión automáticamente después de registrarse
        // localStorage.setItem('token', token); 
        // localStorage.setItem('user', JSON.stringify(usuario)); 
        return { mensaje, user }; // <--- POSIBLE CAMBIO AQUÍ
    } catch (error) {
        const errorMessage = error.response?.data?.mensaje || 'Error al registrar usuario. Inténtalo de nuevo.';
        throw new Error(errorMessage);
    }
};

// Función para obtener el perfil del usuario (usando el token)
export const getProfile = async () => {
    try {
        const response = await api.get('/auth/me');
        // Tu console.log mostró: "Datos de perfil recibidos en getProfile: {user: {…}}"
        // Por lo tanto, los datos del perfil están dentro de 'response.data.user'.
        console.log("Datos de perfil recibidos en getProfile RAW:", response.data); // Para verificar la estructura completa
        console.log("Datos de perfil obtenidos en getProfile (dentro de user):", response.data.user); // Para verificar la data del user
        return response.data.user; // <-- CAMBIO CRÍTICO AQUÍ
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Error al obtener el perfil del usuario.';
        throw new Error(errorMessage);
    }
};

// Función para cerrar sesión (simplemente elimina el token y el usuario del localStorage)
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

export const getToken = () => {
    return localStorage.getItem('token');
};

export const getUserRole = () => {
    const userString = localStorage.getItem('user');
    if (userString) {
        try {
            const user = JSON.parse(userString);
            return user.role; // Asegúrate de que el campo sea 'role', no 'rol'
        } catch (e) {
            console.error("Error al parsear el usuario de localStorage:", e);
            return null;
        }
    }
    return null;
};