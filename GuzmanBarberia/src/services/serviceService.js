import api from './api'; 

const serviceService = {
  
  getAllServices: async () => {
    try {
      const response = await api.get('/servicios'); 
      return response.data;
    } catch (error) {
      console.error('Error al obtener servicios:', error);
      throw error;
    }
  },

  getServiceById: async (id) => {
    try {
      const response = await api.get(`/servicios/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener servicio con ID ${id}:`, error);
      throw error;
    }
  },
};

export default serviceService;