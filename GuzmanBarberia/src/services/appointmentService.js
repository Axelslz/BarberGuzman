import api from './api'; 

const appointmentService = {
    
    getBarberAvailability: async (barberId, date) => {
        try {
            const response = await api.get(`/citas/disponibilidad`, {
                params: { idBarbero: barberId, fecha: date }
            });
            
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
            
            const response = await api.put(`/citas/${id}`, updateData);
            return response.data;
        } catch (error) {
            console.error('Error updating appointment:', error);
            const errorMessage = error.response?.data?.message || 'Error al actualizar la cita. Inténtalo de nuevo.';
            throw new Error(errorMessage);
        }
    },

    cancelAppointment: async (idCita) => {
        try {
            const response = await api.put(`/citas/${idCita}/cancelar`, {}); 
            return response.data;
        } catch (error) {
            console.error('Error al cancelar la cita:', error);
            const errorMessage = error.response?.data?.message || 'Error al cancelar la cita. Inténtalo de nuevo.';
            throw new Error(errorMessage);
        }
    },

    blockBarberTime: async (blockData) => { 
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
            return response.data; 
        } catch (error) {
            console.error('Error al bloquear el horario del barbero:', error);
            const errorMessage = error.response?.data?.message || 'Error al bloquear el horario. Inténtalo de nuevo.';
            throw new Error(errorMessage);
        }
    },

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

    getAllCitas: async () => {
        try {
            const response = await api.get('/citas/all');
            return response.data;
        } catch (error) {
            console.error('Error al obtener todas las citas:', error);
            throw error;
        }
    },

    getCitasByUserId: async (userId) => {
        try {
            const response = await api.get(`/citas/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener citas por usuario:', error);
            throw error;
        }
    },

    getCitasByBarberId: async (barberId) => {
        try {
            const response = await api.get(`/citas/barber/${barberId}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener citas por barbero:', error);
            throw error;
        }
    },

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

    addBarberScheduleSlot: async (barberId, date, time, duration) => {
        console.warn("ADVERTENCIA: `addBarberScheduleSlot` está diseñado para agregar un slot de disponibilidad base. Asegúrate de que la ruta POST /citas/disponibilidad o similar exista y maneje esto.");
        try {
            const response = await api.post(`/citas/disponibilidad`, { 
                id_barbero: barberId, 
                fecha: date,
                hora_inicio: time,
                duracion_minutos: parseInt(duration),
                disponible: true 
            });
            return response.data;
        } catch (error) {
            console.error('Error al añadir nuevo slot de horario:', error);
            const errorMessage = error.response?.data?.message || 'Error al añadir el slot de horario.';
            throw new Error(errorMessage);
        }
    },

    deleteBarberScheduleSlot: async (slotId) => {
        console.warn("ADVERTENCIA: `deleteBarberScheduleSlot` está diseñado para eliminar un slot de disponibilidad base. Asegúrate de que la ruta DELETE /citas/disponibilidad/:slotId o similar exista y maneje esto.");
        try {
            const response = await api.delete(`/citas/disponibilidad/${slotId}`); 
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