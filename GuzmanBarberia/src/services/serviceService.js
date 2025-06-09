// src/services/serviceService.js
import api from './api'; // Asegúrate de que tu instancia de axios esté configurada aquí

const serviceService = {
  // Obtener todos los servicios
  getAllServices: async () => {
    try {
      const response = await api.get('/servicios'); // Corresponde a GET /api/servicios/
      return response.data;
    } catch (error) {
      console.error('Error al obtener servicios:', error);
      throw error;
    }
  },

  // Obtener un servicio por ID (útil si lo necesitas)
  getServiceById: async (id) => {
    try {
      // Asumiendo que tendrás una ruta GET /api/servicios/:id en el futuro
      const response = await api.get(`/servicios/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener servicio con ID ${id}:`, error);
      throw error;
    }
  },
};

export default serviceService;