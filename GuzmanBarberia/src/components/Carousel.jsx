// src/components/Carousel.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Box, MobileStepper, Button, Typography, IconButton } from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';

function Carousel({ items, isEditing, handleImageChange, handleRemoveImage, isSuperAdmin, autoPlayInterval = 0, onAddNewImage }) {
    // Usamos 'items' directamente para la visualización, si no hay, la lógica de 'No hay imágenes' se activa.
    const [activeStep, setActiveStep] = useState(0);
    const maxSteps = items.length;

    // Ref para el input de archivo para reemplazar la imagen actual
    const fileInputRef = useRef(null);

    useEffect(() => {
        let timer;
        // Solo auto-play si NO estamos editando y hay más de una imagen real
        if (!isEditing && autoPlayInterval > 0 && maxSteps > 1) {
            timer = setInterval(() => {
                setActiveStep((prevActiveStep) => (prevActiveStep + 1) % maxSteps);
            }, autoPlayInterval);
        }

        return () => {
            clearInterval(timer);
        };
    }, [maxSteps, autoPlayInterval, isEditing]);

    // Asegurarse de que activeStep sea válido si los items cambian (ej. se elimina la imagen actual)
    useEffect(() => {
        if (activeStep >= maxSteps && maxSteps > 0) {
            setActiveStep(maxSteps - 1);
        } else if (maxSteps === 0) {
            setActiveStep(0);
        }
    }, [maxSteps, activeStep]);


    const handleNext = () => {
        if (maxSteps > 0) {
            setActiveStep((prevActiveStep) => (prevActiveStep + 1) % maxSteps);
        }
    };

    const handleBack = () => {
        if (maxSteps > 0) {
            setActiveStep((prevActiveStep) => (prevActiveStep - 1 + maxSteps) % maxSteps);
        }
    };

    // Handler para reemplazar la imagen actual
    const handleReplaceCurrentImg = (e) => {
        handleImageChange(e, activeStep); // Pasamos el evento y el índice actual
    };

    const currentItem = items.length > 0 ? items[activeStep] : null;

    return (
        <Box
            sx={{
                width: '100%',
                maxWidth: 800,
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: { xs: '350px', md: 'auto' },
                maxHeight: '100%',
                overflow: 'hidden',
                position: 'relative',
                // Borde para indicar la zona editable cuando isEditing y es SuperAdmin
                border: isEditing && isSuperAdmin ? '2px dashed #ccc' : 'none',
                borderRadius: 2,
                p: isEditing && isSuperAdmin ? 1 : 0, // Padding para el borde
            }}
        >
            {/* Input de archivo oculto para reemplazar la imagen actual */}
            <input
                accept="image/*"
                style={{ display: 'none' }}
                id={`replace-image-input-${activeStep}`}
                type="file"
                ref={fileInputRef} // Asociamos la ref
                onChange={handleReplaceCurrentImg}
            />

            {/* Botón para AÑADIR una NUEVA imagen (el + grande en la esquina) */}
            {isEditing && isSuperAdmin && items.length < 4 && (
                <IconButton
                    onClick={onAddNewImage} // Llama a la función para añadir nueva imagen
                    sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        zIndex: 10, // Para que esté por encima de todo
                        bgcolor: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                        fontSize: '2rem', // Hazlo más grande
                        padding: '10px',
                        borderRadius: '50%',
                    }}
                    aria-label="add new picture"
                >
                    <AddPhotoAlternateIcon sx={{ fontSize: '1.5em' }} /> {/* Icono más grande */}
                </IconButton>
            )}

            {currentItem ? (
                <>
                    <Box
                        sx={{
                            width: '100%',
                            flexGrow: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            cursor: isEditing && isSuperAdmin ? 'pointer' : 'default', // Cursor de puntero al hacer clic en la imagen
                        }}
                        // Al hacer clic en la imagen, dispara el input de archivo para reemplazarla
                        onClick={isEditing && isSuperAdmin ? () => fileInputRef.current.click() : null}
                    >
                        <Box
                            component="img"
                            sx={{
                                height: { xs: 200, md: 350 },
                                display: 'block',
                                maxWidth: '100%',
                                overflow: 'hidden',
                                width: '100%',
                                objectFit: 'cover',
                                borderRadius: 2,
                                mb: 2,
                            }}
                            src={currentItem.image}
                            alt={`Imagen ${activeStep + 1}`}
                        />
                        {isEditing && isSuperAdmin && items.length > 0 && ( // Solo muestra el icono de borrar si hay imágenes
                            <Box sx={{ position: 'absolute', bottom: 25, right: 10, zIndex: 5, display: 'flex', gap: 1 }}>
                                {/* Botón para ELIMINAR la imagen actual, solo si hay más de una */}
                                {items.length > 1 && ( // Usa items.length (imágenes reales)
                                    <IconButton onClick={(e) => { e.stopPropagation(); handleRemoveImage(activeStep); }} color="secondary" aria-label="delete picture"
                                        sx={{
                                            bgcolor: 'rgba(0,0,0,0.5)',
                                            color: 'white',
                                            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                                        }}
                                    >
                                        <DeleteIcon sx={{ fontSize: 30 }} />
                                    </IconButton>
                                )}
                            </Box>
                        )}
                    </Box>

                    {maxSteps > 0 && ( // MobileStepper para los puntos y las flechas de navegación/edición
                        <MobileStepper
                            steps={maxSteps}
                            position="static"
                            activeStep={activeStep}
                            sx={{
                                width: '100%',
                                // ¡AQUÍ ESTÁ EL CAMBIO PARA HACER EL FONDO DEL STEPPER TRANSPARENTE!
                                background: 'transparent',
                                // Puedes ajustar el color de los puntos si lo necesitas para que contrasten
                                '& .MuiMobileStepper-dot': {
                                    backgroundColor: '#D4AF37', // Puntos inactivos más transparentes
                                },
                                '& .MuiMobileStepper-dotActive': {
                                    backgroundColor: 'white', // Punto activo blanco
                                },
                            }}
                            nextButton={
                                <Button size="small" onClick={handleNext} disabled={maxSteps <= 1} sx={{ color: '#D4AF37' }}> {/* Cambia el color del texto del botón si es necesario */}
                                    {isEditing && isSuperAdmin && "Siguiente"} {/* Texto solo en edición */}
                                    <KeyboardArrowRight />
                                </Button>
                            }
                            backButton={
                                <Button size="small" onClick={handleBack} disabled={maxSteps <= 1} sx={{ color: '#D4AF37' }}> {/* Cambia el color del texto del botón si es necesario */}
                                    <KeyboardArrowLeft />
                                    {isEditing && isSuperAdmin && "Anterior"} {/* Texto solo en edición */}
                                </Button>
                            }

                        />
                    )}
                    {/* Texto "1/4" o similar */}
                    {maxSteps > 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}> {/* Cambiado a color blanco para que se vea sobre fondo oscuro */}
                            {`${activeStep + 1}/${items.length}`} {/* Mostrar solo las imágenes reales */}
                        </Typography>
                    )}
                </>
            ) : (
                // Caso donde no hay imágenes (array 'items' está vacío)
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
                    <Typography variant="h6" color="text.secondary">
                        No hay imágenes para mostrar.
                    </Typography>
                    {/* El botón grande '+' en la esquina superior derecha ya maneja la adición de la primera imagen */}
                </Box>
            )}
        </Box>
    );
}

export default Carousel;