import axios from 'axios';
import { getAccessToken, getRefreshToken, logout } from './authService';

const API_BASE_URL = 'https://backbarberguzman.onrender.com/api'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  
});

api.interceptors.request.use(
  (config) => {
    if (!config.url.includes('/auth/login') && !config.url.includes('/auth/registrar')) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && error.response?.data?.isExpired && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = getRefreshToken();
                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
                    const { accessToken } = response.data;

                    localStorage.setItem('accessToken', accessToken);
                    
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    
                    return api(originalRequest);
                }
            } catch (refreshError) {
                console.error('Error al refrescar el token:', refreshError);
            }
            logout();
            window.location.href = '/login'; 
            return Promise.reject(error);
        }
       
        if (error.response?.status === 401 || error.response?.status === 403) {
    
            if (!originalRequest._retry) {
                console.error('Error de autenticación o autorización:', error.response?.data?.message);
                logout();
                window.location.href = '/login'; 
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;