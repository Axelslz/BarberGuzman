import api from './api';
import axios from 'axios';

const API_BASE_URL = 'https://backbarberguzman.onrender.com/api'; 

export const login = async (correo, password, rememberMe) => {
    try {
        const response = await api.post('/auth/login', { correo, password });

        const { accessToken, refreshToken, user } = response.data;

        localStorage.setItem('accessToken', accessToken);
        if (rememberMe) {
            localStorage.setItem('refreshToken', refreshToken); 
        } else {
            localStorage.removeItem('refreshToken');
        }
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

export const registrar = async (userData) => {
    try {
        const response = await api.post('/auth/registrar', userData);
        const { message, user, accessToken, refreshToken } = response.data;

        if (accessToken && refreshToken) {
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));
        }

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

export const logout = async () => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
            await api.post('/auth/logout', { refreshToken });
        }
    } catch (error) {
        console.error('Error al cerrar sesión en el servidor:', error);
    } finally {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('setupToken'); 
        localStorage.removeItem('userForSetup'); 
        if (window.google && window.google.accounts && window.google.accounts.id) {
            window.google.accounts.id.disableAutoSelect();
        }
    }
};

export const getAccessToken = () => {
    return localStorage.getItem('accessToken');
};

export const getRefreshToken = () => {
    return localStorage.getItem('refreshToken');
};

// NUEVA FUNCIÓN para refrescar el token
export const refreshAccessToken = async () => {
    try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
            throw new Error('No refresh token available.');
        }
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        return accessToken;
    } catch (error) {
        console.error('Error al refrescar el token:', error);
        throw error;
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
