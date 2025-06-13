// services/aboutService.js
import api from './api';

export const getAboutInfo = async () => {
    try {
        const response = await api.get('/about');
        return response.data;
    } catch (error) {
        console.error("Error fetching about info:", error);
        throw error;
    }
};

export const updateAboutInfo = async (formData) => {
    try {
        // Axios detectará automáticamente que es FormData y establecerá
        // 'Content-Type': 'multipart/form-data' con el boundary adecuado.
        const response = await api.post('/about', formData);
        return response.data;
    } catch (error) {
        console.error("Error updating about info:", error);
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        throw error;
    }
};