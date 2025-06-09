// src/services/appointmentService.js
import api from './api'; // Asegúrate de que tu instancia de axios esté configurada aquí

const appointmentService = {
  // Obtener disponibilidad de un barbero para una fecha específica
  getBarberAvailability: async (barberId, date) => {
    try {
      // date debe ser en formato YYYY-MM-DD
      const response = await api.get(`/citas/disponibilidad`, {
        params: { idBarbero: barberId, fecha: date }
      });
      return response.data.disponibilidad; // Tu backend devuelve { barbero, fecha, disponibilidad }
    } catch (error) {
      console.error('Error al obtener disponibilidad del barbero:', error);
      throw error;
    }
  },

  // Crear una nueva cita
  createAppointment: async (appointmentData) => {
    try {
      // appointmentData debe contener: id_barbero, fecha_cita, hora_inicio, id_servicio
      const response = await api.post('/citas', appointmentData);
      return response.data;
    } catch (error) {
      console.error('Error al crear cita:', error);
      // Puedes intentar extraer un mensaje de error más específico de la respuesta
      const errorMessage = error.response?.data?.message || 'Error al agendar la cita. Inténtalo de nuevo.';
      throw new Error(errorMessage);
    }
  },

  // Obtener historial de citas del cliente (si tienes un componente para esto)
  getAppointmentHistory: async () => {
    try {
      const response = await api.get('/citas/historial');
      return response.data;
    } catch (error) {
      console.error('Error al obtener historial de citas:', error);
      throw error;
    }
  },

  // **NUEVO MÉTODO: Obtener todas las citas para el administrador**
  getAllAppointmentsForAdmin: async () => {
    try {
      const response = await api.get('/citas'); // Llama a la ruta router.get('/', authenticateToken, authorizeRole(['admin']), obtenerCitas);
      return response.data; // Esto debería ser un array de objetos de cita
    } catch (error) {
      console.error('Error al obtener todas las citas para el administrador:', error);
      throw error;
    }
  }
};

export default appointmentService;