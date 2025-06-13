// src/services/appointmentService.js
import api from './api';

const appointmentService = {
    getBarberAvailability: async (barberId, date) => {
        try {
            const response = await api.get(`/citas/disponibilidad`, {
                params: { idBarbero: barberId, fecha: date }
            });
            return response.data.disponibilidad;
        } catch (error) {
            console.error('Error al obtener disponibilidad del barbero:', error);
            throw error;
        }
    },

    createAppointment: async (appointmentData) => {
        try {
            const response = await api.post('/citas', appointmentData);
            return response.data;
        } catch (error) {
            console.error('Error al crear cita:', error);
            const errorMessage = error.response?.data?.message || 'Error al agendar la cita. Inténtalo de nuevo.';
            throw new Error(errorMessage);
        }
    },

    // Este método es el punto de entrada unificado para el historial.
    // El backend se encarga de determinar qué citas devolver según el rol del usuario.
    getAppointmentsHistory: async (options = {}) => {
        try {
            let url = '/citas';
            const queryParams = new URLSearchParams();

            // Parámetros para el super_admin o para filtros específicos
            if (options.allBarbers) { // Si el super_admin quiere ver TODAS las citas
                queryParams.append('allBarbers', 'true');
            } else if (options.barberId) { // Si se filtra por un barbero específico (útil para super_admin)
                queryParams.append('barberoId', options.barberId);
            } else if (options.userId) { // Para clientes o si un admin/super_admin quiere ver un usuario específico
                queryParams.append('clienteId', options.userId); // Usamos clienteId para ser más explícitos en el backend
            }

            // Filtrado por fechas, aplicado a todos los roles si se envían
            if (options.startDate) {
                queryParams.append('startDate', options.startDate);
            }
            if (options.endDate) {
                queryParams.append('endDate', options.endDate);
            }

            if (queryParams.toString()) {
                url += `?${queryParams.toString()}`;
            }

            console.log(`[appointmentService] Calling: ${url}`);
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching appointments history:', error);
            throw error;
        }
    },

    // Función para obtener todos los barberos.
    getAllBarbers: async () => {
        try {
            const response = await api.get('/usuarios/barberos');
            return response.data;
        } catch (error) {
            console.error('Error fetching all barbers:', error);
            throw error;
        }
    },

    updateAppointment: async (id, nuevoEstado) => {
        try {
            const response = await api.put(`/citas/${id}`, { nuevoEstado });
            return response.data;
        } catch (error) {
            console.error('Error updating appointment:', error);
            throw error;
        }
    }
};

export default appointmentService;