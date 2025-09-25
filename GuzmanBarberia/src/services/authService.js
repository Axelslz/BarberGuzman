import api from './api';
import axios from 'axios';

// La instancia de Axios que usarán todas tus funciones.
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://backbarberguzman.onrender.com/api',
    withCredentials: true, 
});


/**
 * Guarda los tokens en el lugar correcto según la opción "Recordarme".
 * @param {string} accessToken - El token de acceso.
 * @param {string} refreshToken - El token de refresco.
 * @param {boolean} rememberMe - Si el usuario marcó "Recordarme".
 */
const saveTokens = (accessToken, refreshToken, rememberMe) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('accessToken', accessToken);
    storage.setItem('refreshToken', refreshToken);
    console.log(`Tokens guardados en ${rememberMe ? 'localStorage' : 'sessionStorage'}.`);
};

/**
 * Obtiene el token de acceso. Busca primero en localStorage y luego en sessionStorage.
 * @returns {string|null} El token de acceso o null si no se encuentra.
 */
export const getAccessToken = () => {
    return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
};

/**
 * Obtiene el token de refresco. Busca en ambos almacenamientos.
 * @returns {string|null} El token de refresco o null si no se encuentra.
 */
export const getRefreshToken = () => {
    return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
};

/**
 * Limpia los tokens de AMBOS almacenamientos para un cierre de sesión completo.
 */
const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    console.log("Tokens eliminados de ambos almacenamientos.");
};


api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const login = async (correo, contrasena, rememberMe) => {
    const response = await api.post('/auth/login', { correo, contrasena });
    if (response.data.accessToken && response.data.refreshToken) {
        
        saveTokens(response.data.accessToken, response.data.refreshToken, rememberMe);
    }
    return response.data; 
};

export const logout = () => {
    
    clearTokens();
    if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
    }
};

export const refreshAccessToken = async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
       
        throw new Error('No refresh token available.');
    }

    const response = await api.post('/auth/refresh-token', { refreshToken });
    const { accessToken } = response.data;

    if (accessToken) {
        const wasRemembered = !!localStorage.getItem('refreshToken');
        const storage = wasRemembered ? localStorage : sessionStorage;
        storage.setItem('accessToken', accessToken);
        console.log("Token de acceso refrescado exitosamente.");
    }
    return accessToken;
};

export const getProfile = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

export const registrar = async (userData) => {
    const response = await api.post('/auth/registrar', userData);
    if (response.data.accessToken && response.data.refreshToken) {
        saveTokens(response.data.accessToken, response.data.refreshToken, false);
    }
    return response.data;
};



export const loginWithGoogle = async (googleToken) => {
    try {
        const response = await api.post('/auth/google', { googleToken });
        const { accessToken, refreshToken, user, redirectRequired, setupToken } = response.data;

        if (redirectRequired) {
            localStorage.setItem('setupToken', setupToken);
            localStorage.setItem('userForSetup', JSON.stringify(user));
            return { redirectRequired: true };
        } else {
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken); 
            localStorage.setItem('user', JSON.stringify(user));
            console.log("Datos de usuario recibidos y procesados en loginWithGoogle:", user);
            return { user, redirectRequired: false };
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Error al iniciar sesión con Google.';
        throw new Error(errorMessage);
    }
};

export const setPassword = async (setupToken, newPassword) => {
    try {
        const response = await api.post('/auth/set-password', { setupToken, newPassword });
        const { accessToken, refreshToken, user } = response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken); 
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.removeItem('setupToken');
        localStorage.removeItem('userForSetup');

        return { user };
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Error al establecer la contraseña.';
        throw new Error(errorMessage);
    }
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

export const updateUserProfile = async (updates) => {
    try {
        const formData = new FormData();
      
        if (updates.name) formData.append('name', updates.name);
        if (updates.lastName) formData.append('lastname', updates.lastName);
        if (updates.email) formData.append('correo', updates.email);
    
        if (updates.profileImage) {
            formData.append('profilePhoto', updates.profileImage);
        }

        const response = await api.put('/auth/profile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        return response.data.user;
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Error al actualizar el perfil.';
        throw new Error(errorMessage);
    }
};

export const updateProfilePhoto = async (imageFile) => {
    try {
    
        const formData = new FormData();
        formData.append('profilePhoto', imageFile); 

        const response = await api.post('/auth/profile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data.photoUrl; 
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Error al actualizar la foto de perfil.';
        throw new Error(errorMessage);
    }
};