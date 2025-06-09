// src/services/aboutService.js
import axios from 'axios';
// Esta importación funcionará correctamente una vez que authService.js exporte getToken con nombre
import { getToken } from './authService'; 

const API_URL = 'http://localhost:4000/api/about'; // Ajusta esto a la URL de tu backend si es diferente

const getAboutInfo = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Error al obtener la información "Sobre Mí":', error);
        throw error;
    }
};

const updateAboutInfo = async (data) => {
    try {
        const token = getToken(); // Obtén el token de autenticación
        if (!token) {
            throw new Error('No hay token de autenticación disponible.');
        }

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data', // Importante para la subida de archivos con Multer
                'Authorization': `Bearer ${token}`
            }
        };

        // Crea un FormData para enviar texto e imágenes
        const formData = new FormData();
        formData.append('titulo', data.titulo);
        formData.append('parrafo1', data.parrafo1);
        formData.append('parrafo2', data.parrafo2);
        
        // Adjunta las imágenes si existen
        if (data.imagen1 instanceof File) { // Verifica si es un objeto File (nueva imagen)
            formData.append('imagen1', data.imagen1);
        } else if (typeof data.imagen1 === 'string' && data.imagen1 !== '') { // Si es una URL existente y no se quiere borrar
            formData.append('imagen_url1_existente', data.imagen1);
        } else if (data.imagen1 === '') { // Si se quiere borrar la imagen
            formData.append('imagen_url1_existente', '');
        }


        if (data.imagen2 instanceof File) { // Verifica si es un objeto File (nueva imagen)
            formData.append('imagen2', data.imagen2);
        } else if (typeof data.imagen2 === 'string' && data.imagen2 !== '') { // Si es una URL existente y no se quiere borrar
            formData.append('imagen_url2_existente', data.imagen2);
        } else if (data.imagen2 === '') { // Si se quiere borrar la imagen
            formData.append('imagen_url2_existente', '');
        }

        const response = await axios.post(API_URL, formData, config);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar la información "Sobre Mí":', error);
        throw error;
    }
};

export { getAboutInfo, updateAboutInfo };