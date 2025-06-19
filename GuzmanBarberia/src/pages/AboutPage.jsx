// src/pages/AboutPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, TextField, Button, CircularProgress, IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import Carousel from '../components/Carousel';
import UserProfileModal from '../components/UserProfileModal';
import { getAboutInfo, updateAboutInfo } from '../services/aboutService';
import { useUser } from '../contexts/UserContext';

// Define el número máximo de imágenes permitidas
const MAX_IMAGES = 4;

function AboutPage() {
    const { isSuperAdmin, isLoadingProfile } = useUser();

    const [aboutContent, setAboutContent] = useState({
        titulo: '',
        parrafo1: '',
        parrafo2: '',
        imagenes: [], // [{ id: 'unique_id', url: '...', originalUrl: '...', file: null, markedForDeletion: false }]
    });
    const [originalAboutContent, setOriginalAboutContent] = useState(null); // Para restaurar en caso de cancelación
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleProfileClick = (event) => {
        setAnchorEl(event.currentTarget);
        setIsProfileModalOpen(true);
    };

    const handleCloseProfileModal = () => {
        setIsProfileModalOpen(false);
        setAnchorEl(null);
    };

    const fetchAboutInformation = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAboutInfo();
            const fetchedImages = [];

            // Iterar hasta MAX_IMAGES para recuperar todas las URLs de imágenes
            for (let i = 1; i <= MAX_IMAGES; i++) {
                const imageUrlField = `imagen_url${i}`;
                if (data[imageUrlField]) {
                    fetchedImages.push({
                        id: `db_img_${i}`, // Un ID único para la clave en React
                        url: data[imageUrlField],
                        originalUrl: data[imageUrlField], // La URL original de la DB
                        file: null, // No hay archivo nuevo por ahora
                        markedForDeletion: false
                    });
                }
            }

            setAboutContent({
                titulo: data.titulo,
                parrafo1: data.parrafo1,
                parrafo2: data.parrafo2,
                imagenes: fetchedImages,
            });
            // Hacemos una copia profunda para el originalAboutContent
            setOriginalAboutContent({
                titulo: data.titulo,
                parrafo1: data.parrafo1,
                parrafo2: data.parrafo2,
                imagenes: fetchedImages.map(img => ({ ...img })), // Clonar objetos del array también
            });

        } catch (err) {
            console.error("Error al cargar la información 'Sobre Mí':", err);
            setError("Error al cargar la información. Intente de nuevo más tarde.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAboutInformation();
    }, [fetchAboutInformation]);

    // Cleanup object URLs when component unmounts or images change
    useEffect(() => {
        return () => {
            aboutContent.imagenes.forEach(img => {
                if (img.url && img.url.startsWith('blob:')) {
                    URL.revokeObjectURL(img.url);
                }
            });
        };
    }, [aboutContent.imagenes]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setAboutContent(prev => ({ ...prev, [name]: value }));
    };

    // Función para añadir una nueva imagen placeholder
    const handleAddNewImage = () => {
        if (aboutContent.imagenes.length < MAX_IMAGES) { // Limitar a un máximo de 4 imágenes
            setAboutContent(prev => ({
                ...prev,
                imagenes: [...prev.imagenes, {
                    id: `new_img_${Date.now()}`,
                    url: 'https://placehold.co/800x400?text=Nueva+Imagen',
                    file: null,
                    originalUrl: null,
                    markedForDeletion: false
                }]
            }));
        } else {
            alert(`Has alcanzado el límite máximo de ${MAX_IMAGES} imágenes.`);
        }
    };


    // Manejo de cambio de imagen para el carrusel
    // `index` es el índice de la imagen en el array `aboutContent.imagenes`
    const handleImageChange = (e, index) => {
        const file = e.target.files[0];
        if (file) {
            setAboutContent(prev => {
                const newImages = [...prev.imagenes];
                // Revocar la URL anterior si era una URL de objeto (blob)
                if (newImages[index]?.url?.startsWith('blob:')) {
                    URL.revokeObjectURL(newImages[index].url);
                }
                newImages[index] = {
                    ...newImages[index], // Mantener id y originalUrl
                    url: URL.createObjectURL(file), // URL temporal para la vista previa
                    file: file, // El archivo real para enviar al backend
                    markedForDeletion: false, // Asegurarse de que no esté marcada para borrar
                };
                return { ...prev, imagenes: newImages };
            });
        }
    };

    // Manejo de eliminación de imagen para el carrusel
    // `index` es el índice de la imagen en el array `aboutContent.imagenes`
    const handleRemoveImage = (index) => {
        if (aboutContent.imagenes.length <= 1 && originalAboutContent?.imagenes?.length === 0) {
            // No permitir eliminar si es la única imagen y no hay ninguna original en la BD
            alert("No se puede eliminar la última imagen si no hay ninguna guardada en la base de datos. Debes tener al menos una.");
            return;
        }

        setAboutContent(prev => {
            const newImages = [...prev.imagenes];
            const removedImage = newImages[index];

            // Si la imagen a eliminar es una blob URL, revocamos el objeto URL
            if (removedImage?.url?.startsWith('blob:')) {
                URL.revokeObjectURL(removedImage.url);
            }

            // Eliminar la imagen del array
            newImages.splice(index, 1);

            return { ...prev, imagenes: newImages };
        });
    };


    const handleSave = async () => {
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('titulo', aboutContent.titulo);
            formData.append('parrafo1', aboutContent.parrafo1);
            formData.append('parrafo2', aboutContent.parrafo2);

            const imagesToDelete = []; // URLs de imágenes de DB que fueron eliminadas

            // 1. Identificar imágenes que fueron eliminadas del carrusel original
            if (originalAboutContent && originalAboutContent.imagenes) {
                originalAboutContent.imagenes.forEach(originalImg => {
                    // Si una imagen original no se encuentra en el estado actual de aboutContent.imagenes, fue eliminada
                    const foundInCurrent = aboutContent.imagenes.some(currentImg =>
                        // Coincide por originalUrl (si es una imagen de DB que se mantuvo)
                        currentImg.originalUrl === originalImg.originalUrl ||
                        // O si fue reemplazada por un nuevo archivo (para no eliminar la vieja si se subió una nueva)
                        (currentImg.file && originalImg.originalUrl && currentImg.originalUrl === originalImg.originalUrl)
                    );
                     // Si no fue encontrada en el estado actual, Y no es una imagen nueva que la haya reemplazado
                    if (!foundInCurrent) {
                        imagesToDelete.push(originalImg.originalUrl);
                    }
                });
            }

            // 2. Añadir imágenes al formData en el orden y con los nombres esperados por el backend
            // El backend espera `newImage_X` para archivos nuevos y `existingImageUrl_X` para URLs existentes
            aboutContent.imagenes.forEach((img, index) => {
                if (img.file) { // Es una imagen nueva (o una existente que fue reemplazada)
                    formData.append(`newImage_${index}`, img.file);
                    // Si se reemplazó una imagen existente, la URL original también debe ser tratada como eliminada
                    if (img.originalUrl && !imagesToDelete.includes(img.originalUrl)) {
                         imagesToDelete.push(img.originalUrl);
                    }
                } else if (img.originalUrl) { // Es una imagen que ya estaba en la DB y no fue modificada
                    formData.append(`existingImageUrl_${index}`, img.originalUrl);
                }
                // Si la imagen está marcada para eliminación (aunque ya la manejamos arriba), no se añade
                // Si no hay img.file ni img.originalUrl (ej. placeholder que se quedó vacío), no se añade nada
            });

            // 3. Añadir las URLs de imágenes a eliminar
            if (imagesToDelete.length > 0) {
                formData.append('deletedImageUrls', JSON.stringify(imagesToDelete));
            }

            await updateAboutInfo(formData);
            alert('Información actualizada exitosamente!');
            setIsEditing(false);
            fetchAboutInformation(); // Vuelve a cargar la información para reflejar los cambios guardados

        } catch (err) {
            console.error("Error al guardar la información 'Sobre Mí':", err);
            setError(`Error al guardar la información: ${err.message || 'Verifique la consola para más detalles.'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        // Revocar URLs de objetos si se habían creado nuevas al subir archivos antes de cancelar
        aboutContent.imagenes.forEach(img => {
            if (img.url && img.url.startsWith('blob:') && img.file) {
                URL.revokeObjectURL(img.url);
            }
        });

        // Restaurar el contenido original
        setAboutContent(originalAboutContent);
        setIsEditing(false);
        setError(null);
    };

    // Prepara los items para el Carousel
    const carouselDisplayItems = aboutContent.imagenes.map(img => ({
        image: img.url,
        id: img.id, // Asegúrate de pasar un ID único para las claves de React
    }));


    if (loading && !originalAboutContent) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress sx={{ mt: 5 }} />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            <Header toggleMenu={toggleMenu} />
            <SideMenu isOpen={menuOpen} toggleMenu={toggleMenu} />

            <Box
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, md: 3 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                    height: 'calc(100vh - 64px)',
                }}
            >
                {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}

                {/* Título de la sección "Bienvenidos a Guzman Peluqueria" */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 3 }, mt: 0 }}>
                    {isEditing && isSuperAdmin ? (
                        <TextField
                            label="Título"
                            name="titulo"
                            value={aboutContent.titulo}
                            onChange={handleChange}
                            variant="outlined"
                            sx={{ mr: 1, width: 'auto' }}
                        />
                    ) : (
                        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold', color: '#333333' }}>
                            {aboutContent.titulo || 'Bienvenidos a Guzman Peluqueria'}
                        </Typography>
                    )}
                    {isSuperAdmin && (
                        <IconButton onClick={() => setIsEditing(!isEditing)} sx={{ ml: 1 }}>
                            {isEditing ? <SaveIcon /> : <EditIcon />}
                        </IconButton>
                    )}
                </Box>

                <Box
                    sx={{
                        flexGrow: 1,
                        width: '100%',
                        maxWidth: 1200,
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: { xs: 'center', md: 'stretch' },
                        justifyContent: 'center',
                        gap: { xs: 3, md: 5 },
                        overflow: 'hidden',
                        p: { xs: 0, md: 2 },
                        boxSizing: 'border-box',
                        height: 'calc(100% - 70px)',
                        // Asegura que el contenedor principal también sea transparente o no tenga un fondo blanco
                    }}
                >
                    {/* Columna de Texto */}
                    <Box
                        sx={{
                            flex: { xs: '1 1 auto', md: '1 1 50%' },
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            textAlign: 'left',
                            overflowY: 'auto',
                            p: { xs: 2, md: 0 },
                            minHeight: { xs: 'auto', md: '200px' },
                            maxHeight: { xs: '30%', md: '100%' },
                            // Establece el fondo transparente para la columna de texto
                            backgroundColor: 'transparent', // ¡AQUÍ ESTÁ EL CAMBIO PARA EL FONDO TRANSPARENTE!
                            borderRadius: '8px', // Opcional: si quieres bordes redondeados
                        }}
                    >
                        {isEditing && isSuperAdmin ? (
                            <>
                                <TextField
                                    label="Párrafo 1"
                                    name="parrafo1"
                                    value={aboutContent.parrafo1}
                                    onChange={handleChange}
                                    fullWidth
                                    multiline
                                    rows={6}
                                    margin="normal"
                                />
                                <TextField
                                    label="Párrafo 2"
                                    name="parrafo2"
                                    value={aboutContent.parrafo2}
                                    onChange={handleChange}
                                    fullWidth
                                    multiline
                                    rows={6}
                                    margin="normal"
                                />
                            </>
                        ) : (
                            <>
                                <Typography variant="body1" sx={{ color: 'black', mb: 2 }}>
                                    {aboutContent.parrafo1 || 'Somos un equipo de barberos apasionados por el arte del cuidado masculino. Ofrecemos cortes modernos, afeitados clásicos y tratamientos de barba personalizados para que siempre luzcas tu mejor versión.'}
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'black' }}>
                                    {aboutContent.parrafo2 || 'En nuestra barbería, la tradición se encuentra con la innovación. Utilizamos productos de alta calidad y técnicas vanguardistas para garantizar resultados excepcionales y una experiencia inigualable en cada visita. ¡Te esperamos para transformar tu estilo!'}
                                </Typography>
                            </>
                        )}
                    </Box>

                    {/* Columna de Carrusel de Imágenes */}
                    <Box
                        sx={{
                            flex: { xs: '1 1 auto', md: '1 1 50%' },
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: { xs: '300px', md: 'auto' },
                            maxHeight: '100%',
                            overflow: 'hidden',
                            pb: { xs: 2, md: 0 },
                        }}
                    >
                        {aboutContent.imagenes && (
                            <Carousel
                                items={carouselDisplayItems}
                                isEditing={isEditing}
                                handleImageChange={handleImageChange}
                                handleRemoveImage={handleRemoveImage}
                                isSuperAdmin={isSuperAdmin}
                                autoPlayInterval={5000}
                                onAddNewImage={handleAddNewImage}
                                maxImages={MAX_IMAGES}
                            />
                        )}
                    </Box>
                </Box>

                {isEditing && isSuperAdmin && (
                    <Box sx={{ mt: { xs: 3, md: 3 }, display: 'flex', gap: 2, flexShrink: 0 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSave}
                            startIcon={<SaveIcon />}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Guardar'}
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={handleCancel}
                            startIcon={<CancelIcon />}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                    </Box>
                )}
            </Box>
            <UserProfileModal
                open={isProfileModalOpen}
                onClose={handleCloseProfileModal}
                anchorEl={anchorEl}
            />
        </Box>
    );
}

export default AboutPage;