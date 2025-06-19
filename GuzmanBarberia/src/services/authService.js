// src/services/authService.js
import api from './api';

export const login = async (correo, password) => {
    try {
        const response = await api.post('/auth/login', { correo, password });

        const { token, user } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        console.log("Datos de usuario recibidos y procesados en login:", user);
        return user;
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Error al iniciar sesión. Inténtalo de nuevo.';
        throw new Error(errorMessage);
    }
};

export const loginWithGoogle = async (googleToken) => {
    try {
        const response = await api.post('/auth/google', { googleToken });
        const { token, user, redirectRequired, setupToken } = response.data; // Captura setupToken y redirectRequired

        if (redirectRequired) {
            // Guarda el setupToken en localStorage para la nueva vista
            localStorage.setItem('setupToken', setupToken);
            // Guarda la información básica del usuario (id, correo, etc.) si la necesitas en la vista de configurar contraseña
            localStorage.setItem('userForSetup', JSON.stringify(user));
            return { redirectRequired: true }; // Indica al frontend que debe redirigir
        } else {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            console.log("Datos de usuario recibidos y procesados en loginWithGoogle:", user);
            return { user, redirectRequired: false }; // Devuelve el usuario y false para la redirección
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Error al iniciar sesión con Google.';
        throw new Error(errorMessage);
    }
};

// NUEVA FUNCIÓN para establecer la contraseña
export const setPassword = async (setupToken, newPassword) => {
    try {
        const response = await api.post('/auth/set-password', { setupToken, newPassword });
        const { token, user } = response.data; // Debería devolver un token de sesión normal

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.removeItem('setupToken'); // Limpia el token de setup
        localStorage.removeItem('userForSetup'); // Limpia la info temporal

        return { user };
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Error al establecer la contraseña.';
        throw new Error(errorMessage);
    }
};

export const registrar = async (userData) => {
    try {
        const response = await api.post('/auth/registrar', userData);
        const { message, user } = response.data;
        return { message, user };
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Error al registrar usuario. Inténtalo de nuevo.';
        throw new Error(errorMessage);
    }
};

export const getProfile = async () => {
    try {
        const response = await api.get('/auth/me');
        return response.data.user;
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Error al obtener el perfil del usuario.';
        throw new Error(errorMessage);
    }
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('setupToken'); // Asegúrate de limpiar también este token
    localStorage.removeItem('userForSetup'); // Y este
    if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.disableAutoSelect();
    }
};

export const getToken = () => {
    return localStorage.getItem('token');
};

export const getUserRole = () => {
    const userString = localStorage.getItem('user');
    if (userString) {
        try {
            const user = JSON.parse(userString);
            return user.role;
        } catch (e) {
            console.error("Error al parsear el usuario de localStorage:", e);
            return null;
        }
    }
    return null;
};

export const forgotPassword = async (correo) => {
    try {
        const response = await api.post('/auth/forgot-password', { correo });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || error.message || 'Error desconocido al solicitar restablecimiento.';
    }
};

export const resetPassword = async (token, newPassword) => {
    try {
        const response = await api.post('/auth/reset-password', { token, newPassword });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || error.message || 'Error desconocido al restablecer contraseña.';
    }
};

export const getAllUsers = async () => {
    try {
        const response = await api.get('/auth/users');
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Error al obtener todos los usuarios.';
        throw new Error(errorMessage);
    }
};

export const updateUserRole = async (userId, newRole, especialidad = null) => {
    try {
        const response = await api.put(`/auth/users/${userId}/role`, { newRole, especialidad });
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Error al actualizar el rol del usuario.';
        throw new Error(errorMessage);
    }
};