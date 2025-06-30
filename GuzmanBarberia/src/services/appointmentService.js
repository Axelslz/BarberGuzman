// appointmentService.js
import api from './api'; // Asumiendo que 'api' es tu instancia de Axios configurada

const appointmentService = {
    
    getBarberAvailability: async (barberId, date) => {
        try {
            const response = await api.get(`/citas/disponibilidad`, {
                params: { idBarbero: barberId, fecha: date }
            });
            // El backend DEBE devolver un objeto con { disponibilidad: [], horariosNoDisponibles: [] }
            // O un array plano que se pueda filtrar con 'es_bloqueo_manual'
            return response.data;
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

    getAppointmentsHistory: async (options = {}) => {
        try {
            let url = '/citas';
            const queryParams = new URLSearchParams();

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

    // 4. Ruta: PUT /citas/:id
    updateAppointment: async (id, updateData) => {
        try {
            // updateData puede ser { estado: 'cancelada' } o cualquier otro campo a actualizar
            const response = await api.put(`/citas/${id}`, updateData);
            return response.data;
        } catch (error) {
            console.error('Error updating appointment:', error);
            const errorMessage = error.response?.data?.message || 'Error al actualizar la cita. Inténtalo de nuevo.';
            throw new Error(errorMessage);
        }
    },

    // 5. Ruta: PUT /citas/:idCita/cancelar (se puede consolidar con updateAppointment)
    // Se recomienda usar `updateAppointment(idCita, { estado: 'cancelada' })`
    // Si tu backend tiene una ruta específica para cancelar, la dejaríamos.
    cancelAppointment: async (idCita) => {
        try {
            // Si tu backend espera un PUT sin body para cancelar, o un body vacío
            const response = await api.put(`/citas/${idCita}/cancelar`, {}); // O solo `/citas/${idCita}/cancelar` si no necesita body
            return response.data;
        } catch (error) {
            console.error('Error al cancelar la cita:', error);
            const errorMessage = error.response?.data?.message || 'Error al cancelar la cita. Inténtalo de nuevo.';
            throw new Error(errorMessage);
        }
    },

    // 6. Ruta: POST /citas/block-time
    blockBarberTime: async (blockData) => { // Recibe un objeto con los datos
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No hay token de autenticación disponible.');
        }
        try {
            const response = await api.post('/citas/block-time', blockData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            return response.data; // Devolver data en lugar de response completa
        } catch (error) {
            console.error('Error al bloquear el horario del barbero:', error);
            const errorMessage = error.response?.data?.message || 'Error al bloquear el horario. Inténtalo de nuevo.';
            throw new Error(errorMessage);
        }
    },

    // 7. Ruta: DELETE /citas/unblock-time/:id (para desbloquear un bloqueo manual)
    unblockBarberTime: async (blockId) => {
        try {
            const response = await api.delete(`/citas/unblock-time/${blockId}`);
            return response.data;
        } catch (error) {
            console.error('Error al desbloquear el horario del barbero:', error);
            const errorMessage = error.response?.data?.message || 'Error al liberar el bloqueo. Inténtalo de nuevo.';
            throw new Error(errorMessage);
        }
    },

    // 8. Ruta: GET /citas/all
    getAllCitas: async () => {
        try {
            const response = await api.get('/citas/all');
            return response.data;
        } catch (error) {
            console.error('Error al obtener todas las citas:', error);
            throw error;
        }
    },

    // 9. Ruta: GET /citas/user/:userId
    getCitasByUserId: async (userId) => {
        try {
            const response = await api.get(`/citas/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener citas por usuario:', error);
            throw error;
        }
    },

    // 10. Ruta: GET /citas/barber/:barberId
    getCitasByBarberId: async (barberId) => {
        try {
            const response = await api.get(`/citas/barber/${barberId}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener citas por barbero:', error);
            throw error;
        }
    },

    // Funciones para la gestión de servicios (sin cambios)
    getServices: async () => {
        try {
            const response = await api.get('/servicios');
            return response.data;
        } catch (error) {
            console.error('Error al obtener los servicios:', error);
            throw error;
        }
    },

    createService: async (serviceData) => {
        try {
            const response = await api.post('/servicios', serviceData);
            return response.data;
        } catch (error) {
            console.error('Error al crear el servicio:', error);
            const errorMessage = error.response?.data?.message || 'Error al crear el servicio. Inténtalo de nuevo.';
            throw new Error(errorMessage);
        }
    },

    updateService: async (id, serviceData) => {
        try {
            const response = await api.put(`/servicios/${id}`, serviceData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar el servicio:', error);
            const errorMessage = error.response?.data?.message || 'Error al actualizar el servicio. Inténtalo de nuevo.';
            throw new Error(errorMessage);
        }
    },

    deleteService: async (id) => {
        try {
            const response = await api.delete(`/servicios/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar el servicio:', error);
            const errorMessage = error.response?.data?.message || 'Error al eliminar el servicio. Inténtalo de nuevo.';
            throw new Error(errorMessage);
        }
    },

    // Aclaración: updateBarberAvailability y addBarberScheduleSlot y deleteBarberScheduleSlot
    // Las advertencias en tu código actual (`console.warn`) indican que estas rutas no existen en tu `citasRoutes.js`.
    // La estrategia recomendada es usar `blockBarberTime` y `unblockBarberTime` para gestionar la disponibilidad.
    // Si realmente necesitas agregar/eliminar slots base de un horario recurrente, necesitarías nuevas rutas en el backend.
    // Para la funcionalidad actual del diálogo, parece que `blockBarberTime` y `unblockBarberTime` son suficientes para "gestionar" la disponibilidad.

    // Si `addBarberScheduleSlot` está destinado a añadir un *nuevo* slot de disponibilidad recurrente,
    // o un slot de "base" para un día específico que no es un bloqueo manual,
    // entonces sí necesitarías una ruta de backend específica para eso, por ejemplo, POST /citas/slots
    addBarberScheduleSlot: async (barberId, date, time, duration) => {
        console.warn("ADVERTENCIA: `addBarberScheduleSlot` está diseñado para agregar un slot de disponibilidad base. Asegúrate de que la ruta POST /citas/disponibilidad o similar exista y maneje esto.");
        try {
            const response = await api.post(`/citas/disponibilidad`, { // Esta ruta debería existir en el backend para añadir slots base
                id_barbero: barberId, // Asegúrate que el backend espera este nombre
                fecha: date,
                hora_inicio: time,
                duracion_minutos: parseInt(duration),
                disponible: true // Siempre true si se está añadiendo un slot DISPONIBLE
            });
            return response.data;
        } catch (error) {
            console.error('Error al añadir nuevo slot de horario:', error);
            const errorMessage = error.response?.data?.message || 'Error al añadir el slot de horario.';
            throw new Error(errorMessage);
        }
    },

    // Similar a addBarberScheduleSlot, si es para eliminar un slot de disponibilidad base.
    deleteBarberScheduleSlot: async (slotId) => {
        console.warn("ADVERTENCIA: `deleteBarberScheduleSlot` está diseñado para eliminar un slot de disponibilidad base. Asegúrate de que la ruta DELETE /citas/disponibilidad/:slotId o similar exista y maneje esto.");
        try {
            const response = await api.delete(`/citas/disponibilidad/${slotId}`); // Esta ruta debería existir en el backend
            return response.data;
        } catch (error) {
            console.error('Error al eliminar slot de horario:', error);
            const errorMessage = error.response?.data?.message || 'Error al eliminar el slot de horario.';
            throw new Error(errorMessage);
        }
    },

    getAllBarbers: async () => {
        try {
            const response = await api.get('/usuarios/barberos');
            return response.data;
        } catch (error) {
            console.error('Error fetching all barbers:', error);
            throw error;
        }
    },

    // 11. DELETE /citas/:id (para eliminar una cita por completo, no solo cancelar)
    // Advertencia similar a las anteriores: si tu backend no tiene esta ruta, la necesitarás.
    deleteAppointment: async (id) => {
        console.warn("ADVERTENCIA: `deleteAppointment` usa una ruta DELETE /citas/:id que no está definida en `routes/citasRoutes.js` para eliminación *completa* de citas. Considera usar `cancelAppointment` si solo se trata de cambiar el estado.");
        try {
            const response = await api.delete(`/citas/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar la cita:', error);
            const errorMessage = error.response?.data?.message || 'Error al eliminar la cita. Inténtalo de nuevo.';
            throw new Error(errorMessage);
        }
    },
};

export default appointmentService;