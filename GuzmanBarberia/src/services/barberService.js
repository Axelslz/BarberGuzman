// src/services/barberService.js
import api from './api'; // Asegúrate de que tu instancia de axios esté configurada aquí

const barberService = {
  // Obtener todos los barberos
  getAllBarbers: async () => {
    try {
      const response = await api.get('/barberos'); // Corresponde a GET /api/barberos/
      return response.data;
    } catch (error) {
      console.error('Error al obtener barberos:', error);
      throw error;
    }
  },

  // Obtener un barbero por ID (útil si lo necesitas en algún otro lugar)
  getBarberById: async (id) => {
    try {
      // Asumiendo que tendrás una ruta GET /api/barberos/:id en el futuro
      const response = await api.get(`/barberos/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener barbero con ID ${id}:`, error);
      throw error;
    }
  },
};

export default barberService;