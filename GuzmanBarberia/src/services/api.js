import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api'; 

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
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error('Error de autenticación o autorización:', error.response.data.message);
      localStorage.removeItem('token'); 
    }
    return Promise.reject(error);
  }
);

export default api;