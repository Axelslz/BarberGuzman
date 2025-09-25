import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://backbarberguzman.onrender.com/api',
    withCredentials: true, 
});


const saveTokens = (accessToken, refreshToken, user, rememberMe) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('accessToken', accessToken);
    storage.setItem('refreshToken', refreshToken);
    // Guardar el objeto de usuario también es útil para no tener que decodificar el token
    storage.setItem('user', JSON.stringify(user));
    console.log(`Tokens y usuario guardados en ${rememberMe ? 'localStorage' : 'sessionStorage'}.`);
};

export const getAccessToken = () => {
    return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
};

export const getRefreshToken = () => {
    return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
};

const clearTokens = () => {
    localStorage.clear();
    sessionStorage.clear();
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
    }
    return accessToken;
};

export const getProfile = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

export const registrar = async (userData) => {
    const response = await api.post('/auth/registrar', userData);
    const { accessToken, refreshToken, user } = response.data;
    if (accessToken && refreshToken && user) {
        saveTokens(accessToken, refreshToken, user, false); // "Recordarme" es falso por defecto al registrars
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
    const formData = new FormData();
    if (updates.name) formData.append('name', updates.name);
    if (updates.lastName) formData.append('lastname', updates.lastName);
    if (updates.profileImage) {
        formData.append('profilePhoto', updates.profileImage);
    }

    const response = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    const userString = localStorage.getItem('user') || sessionStorage.getItem('user');
    const rememberMe = !!localStorage.getItem('user');
    if (userString) {
        const oldUser = JSON.parse(userString);
        const newUser = { ...oldUser, ...response.data.user };
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('user', JSON.stringify(newUser));
    }

    return response.data.user;
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