import axios from 'axios';

// o 'http://localhost:3000' si tus rutas (ej. /auth/login) ya están en la raíz
const API_BASE_URL = 'http://localhost:4000/api'; // <--- ¡AJUSTA ESTO!

const api = axios.create({
  baseURL: API_BASE_URL,
  
});

// Interceptor para enviar el token JWT en cada petición (excepto login/registro)
api.interceptors.request.use(
  (config) => {
    // No enviamos el token para las rutas de autenticación iniciales (login, registro)
    // porque aún no tenemos uno o estamos en el proceso de obtenerlo.
    if (!config.url.includes('/auth/login') && !config.url.includes('/auth/registrar')) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    // Ejemplo:
    // if (!(config.data instanceof FormData)) {
    //    config.headers['Content-Type'] = 'application/json';
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas de error (ej. token expirado 401/403)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el error es 401 (Unauthorized) o 403 (Forbidden) y no es la página de login
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Si el error es por token inválido/expirado, limpia el token y redirige al login
      console.error('Error de autenticación o autorización:', error.response.data.message);
      localStorage.removeItem('token'); // Limpia cualquier token inválido
      // No podemos usar `Maps` directamente aquí porque no es un componente React.
      // Podemos forzar una recarga o una redirección.
      // Si esto ocurre, es mejor manejarlo en el componente que hizo la petición.
      // Para una solución global, puedes usar un sistema de eventos o un contexto.
      // Por ahora, solo logueamos y limpiamos el token.
      // Si necesitas una redirección automática, considera usar un estado global
      // o un componente superior para escuchar este tipo de errores.
    }
    return Promise.reject(error);
  }
);

export default api;