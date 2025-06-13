// src/components/Carousel.jsx
import React, { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';

function Carousel({ items, isEditing, handleImageChange, handleRemoveImage }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const goToPrevious = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? items.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = () => {
        const isLastSlide = currentIndex === items.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    if (!items || items.length === 0) {
        return (
            <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                {isEditing ? (
                    <p>Agrega contenido para el carrusel.</p>
                ) : (
                    <p>No hay contenido disponible para el carrusel.</p>
                )}
            </Box>
        );
    }

    const currentItem = items[currentIndex];

    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                maxWidth: 900, // Ajusta el ancho máximo según tu diseño
                height: 450, // Ajusta la altura según tu diseño
                overflow: 'hidden',
                borderRadius: 2,
                boxShadow: 3,
                mt: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {/* Controles de navegación */}
            <IconButton
                onClick={goToPrevious}
                sx={{
                    position: 'absolute',
                    left: 0,
                    zIndex: 1,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                    ml: 1,
                }}
            >
                <ArrowBackIosIcon />
            </IconButton>

            {/* Contenido del slide actual */}
            <Box
                sx={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${currentItem.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    p: 2,
                    color: 'white',
                    textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
                }}
            >
                {/* Controles de edición de imagen (lápiz para subir, tacho para eliminar) */}
                {isEditing && (
                    <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
                        {/* Botón para subir/cambiar imagen */}
                        <IconButton
                            component="label"
                            sx={{ bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'white' } }}
                            color="primary"
                        >
                            <AddPhotoAlternateIcon />
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                // El itemIndex + 1 se usa para saber si es imagen1 o imagen2 en AboutPage
                                onChange={(e) => handleImageChange(e, currentIndex + 1)} 
                            />
                        </IconButton>
                        {/* Botón para eliminar imagen (solo si hay una imagen que no sea placeholder) */}
                        {currentItem.image && !currentItem.image.includes('placeholder') && (
                            <IconButton
                                sx={{ bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'white' } }}
                                color="error"
                                // El itemIndex + 1 se usa para saber si es imagen1 o imagen2 en AboutPage
                                onClick={() => handleRemoveImage(currentIndex + 1)} 
                            >
                                <DeleteIcon />
                            </IconButton>
                        )}
                    </Box>
                )}

                {/* Descripción/Párrafo del slide (pasado como children o prop) */}
                <Box
                    sx={{
                        bgcolor: 'rgba(0,0,0,0.5)',
                        p: 1.5,
                        borderRadius: 1,
                        mt: 'auto', // Alinea el párrafo al final
                        width: '90%',
                        textAlign: 'center',
                    }}
                >
                    {currentItem.description}
                </Box>
            </Box>

            {/* Controles de navegación */}
            <IconButton
                onClick={goToNext}
                sx={{
                    position: 'absolute',
                    right: 0,
                    zIndex: 1,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                    mr: 1,
                }}
            >
                <ArrowForwardIosIcon />
            </IconButton>
        </Box>
    );
}

export default Carousel;