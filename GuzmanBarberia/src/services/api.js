import axios from 'axios';
import { getAccessToken, getRefreshToken, logout } from './authService';

const API_BASE_URL = 'https://backbarberguzman.onrender.com/api'; 

const api = axios.create({
    baseURL: API_BASE_URL,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
    (config) => {
        if (!config.url.includes('/auth/login') && !config.url.includes('/auth/registrar')) {
            const accessToken = getAccessToken();
            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
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
        
        if (originalRequest._retry || error.response?.status !== 401 || !error.response?.data?.isExpired) {
            return Promise.reject(error);
        }
        
        if (error.response?.data?.isExpired) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;
            
            const refreshToken = getRefreshToken();
            
            if (!refreshToken) {
                logout();
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
                const { accessToken } = response.data;
                localStorage.setItem('accessToken', accessToken);
                
                api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                processQueue(null, accessToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                logout();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;