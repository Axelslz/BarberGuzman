import api from './api'; 

const barberService = {

  getAllBarbers: async () => {
    try {
      const response = await api.get('/barberos'); 
      return response.data;
    } catch (error) {
      console.error('Error al obtener barberos:', error);
      throw error;
    }
  },

  getBarberById: async (id) => {
    try {
      const response = await api.get(`/barberos/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener barbero con ID ${id}:`, error);
      throw error;
    }
  },

  updateBarbero: async (id, barberoData, token) => {
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        // 'Content-Type': 'multipart/form-data' 
      }
    };
    try {
      const response = await api.put(`/barberos/${id}`, barberoData, config);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar barbero con ID ${id}:`, error);
      throw error; 
    }
  },
};

export default barberService;