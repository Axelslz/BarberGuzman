import React, { useState, useEffect, useCallback, useRef } from 'react'; 
import {
    Box, Typography, TextField, Button, CircularProgress, IconButton, Popover 
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

const MAX_IMAGES = 4;

function AboutPage() {
    const { isSuperAdmin, isLoadingProfile } = useUser();

    const [aboutContent, setAboutContent] = useState({
        titulo: '',
        parrafo1: '',
        parrafo2: '',
        imagenes: [], 
    });
    const [originalAboutContent, setOriginalAboutContent] = useState(null);     
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null); 
    const [feedbackPopoverOpen, setFeedbackPopoverOpen] = useState(false);
    const [feedbackPopoverAnchorEl, setFeedbackPopoverAnchorEl] = useState(null);
    const [feedbackPopoverMessage, setFeedbackPopoverMessage] = useState('');
    const [feedbackPopoverSeverity, setFeedbackPopoverSeverity] = useState('info'); 

    const saveButtonRef = useRef(null);
    const addImageButtonRef = useRef(null); 
                                            

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

    // Function to show the feedback Popover
    const showFeedbackPopover = (message, severity = 'info', eventTarget = saveButtonRef.current) => {
        setFeedbackPopoverMessage(message);
        setFeedbackPopoverSeverity(severity);
        setFeedbackPopoverAnchorEl(eventTarget);
        setFeedbackPopoverOpen(true);
    };

    // Function to close the feedback Popover
    const handleCloseFeedbackPopover = () => {
        setFeedbackPopoverOpen(false);
        setFeedbackPopoverAnchorEl(null);
        setFeedbackPopoverMessage('');
        setFeedbackPopoverSeverity('info');
    };

    const fetchAboutInformation = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAboutInfo();
            const fetchedImages = [];

            for (let i = 1; i <= MAX_IMAGES; i++) {
                const imageUrlField = `imagen_url${i}`;
                if (data[imageUrlField]) {
                    fetchedImages.push({
                        id: `db_img_${i}`, 
                        url: data[imageUrlField],
                        originalUrl: data[imageUrlField], 
                        file: null, 
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
          
            setOriginalAboutContent({
                titulo: data.titulo,
                parrafo1: data.parrafo1,
                parrafo2: data.parrafo2,
                imagenes: fetchedImages.map(img => ({ ...img })), 
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

    const handleAddNewImage = () => {
        if (aboutContent.imagenes.length < MAX_IMAGES) { 
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
            showFeedbackPopover(`Has alcanzado el límite máximo de ${MAX_IMAGES} imágenes.`, 'warning', addImageButtonRef.current || saveButtonRef.current);
        }
    };

    const handleImageChange = (e, index) => {
        const file = e.target.files[0];
        if (file) {
            setAboutContent(prev => {
                const newImages = [...prev.imagenes];
                if (newImages[index]?.url?.startsWith('blob:')) {
                    URL.revokeObjectURL(newImages[index].url);
                }
                newImages[index] = {
                    ...newImages[index], 
                    url: URL.createObjectURL(file), 
                    file: file, 
                    markedForDeletion: false, 
                };
                return { ...prev, imagenes: newImages };
            });
        }
    };

    const handleRemoveImage = (index) => {
    
        if (aboutContent.imagenes.length <= 1 && originalAboutContent?.imagenes?.length === 0) {
            showFeedbackPopover("No se puede eliminar la última imagen si no hay ninguna guardada en la base de datos. Debes tener al menos una.", 'error', saveButtonRef.current);
            return;
        }

        setAboutContent(prev => {
            const newImages = [...prev.imagenes];
            const removedImage = newImages[index];

            if (removedImage?.url?.startsWith('blob:')) {
                URL.revokeObjectURL(removedImage.url);
            }

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

            const imagesToDelete = []; 

            if (originalAboutContent && originalAboutContent.imagenes) {
                originalAboutContent.imagenes.forEach(originalImg => {
                    const foundInCurrent = aboutContent.imagenes.some(currentImg =>
                        currentImg.originalUrl === originalImg.originalUrl ||
                        (currentImg.file && originalImg.originalUrl && currentImg.originalUrl === originalImg.originalUrl)
                    );
                    if (!foundInCurrent) {
                        imagesToDelete.push(originalImg.originalUrl);
                    }
                });
            }

            aboutContent.imagenes.forEach((img, index) => {
                if (img.file) { 
                    formData.append(`newImage_${index}`, img.file);
                    if (img.originalUrl && !imagesToDelete.includes(img.originalUrl)) {
                         imagesToDelete.push(img.originalUrl);
                    }
                } else if (img.originalUrl) { 
                    formData.append(`existingImageUrl_${index}`, img.originalUrl);
                }
            });

            if (imagesToDelete.length > 0) {
                formData.append('deletedImageUrls', JSON.stringify(imagesToDelete));
            }

            await updateAboutInfo(formData);

            showFeedbackPopover('Información actualizada exitosamente!', 'success', saveButtonRef.current);
            
            setIsEditing(false);
            fetchAboutInformation(); 

        } catch (err) {
            console.error("Error al guardar la información 'Sobre Mí':", err);
            setError(`Error al guardar la información: ${err.message || 'Verifique la consola para más detalles.'}`);
            showFeedbackPopover(`Error al guardar la información: ${err.message || 'Verifique la consola para más detalles.'}`, 'error', saveButtonRef.current);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {

        aboutContent.imagenes.forEach(img => {
            if (img.url && img.url.startsWith('blob:') && img.file) {
                URL.revokeObjectURL(img.url);
            }
        });

        setAboutContent(originalAboutContent);
        setIsEditing(false);
        setError(null);
    };

    const carouselDisplayItems = aboutContent.imagenes.map(img => ({
        image: img.url,
        id: img.id, 
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
                            backgroundColor: 'transparent', 
                            borderRadius: '8px', 
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
                                // Pass the ref for the "Add New Image" button if it's rendered inside Carousel
                                // Otherwise, create a dedicated button here.
                                // For now, let's add a button here for adding images.
                            />
                        )}
                        {isEditing && isSuperAdmin && (
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={handleAddNewImage}
                                disabled={aboutContent.imagenes.length >= MAX_IMAGES}
                                sx={{ mt: 2 }}
                                ref={addImageButtonRef} // Assign ref to this button
                            >
                                Añadir Nueva Imagen
                            </Button>
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
                            ref={saveButtonRef} // Assign ref to this button
                            sx={{
                                backgroundColor: '#D4AF37',
                                '&:hover': {
                                    backgroundColor: '#C39F37',
                                },
                                color: '#1a202c',
                                fontSize: '1.0rem',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                boxShadow: '0px 4px 10px rgba(0,0,0,0.2)',
                            }}
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

            {/* Feedback Popover */}
            <Popover
                open={feedbackPopoverOpen}
                anchorEl={feedbackPopoverAnchorEl}
                onClose={handleCloseFeedbackPopover}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                sx={{
                    '& .MuiPaper-root': {
                        p: 2,
                        borderRadius: '8px',
                        boxShadow: '0px 4px 10px rgba(0,0,0,0.3)',
                        // Dynamic background color based on severity
                        backgroundColor: feedbackPopoverSeverity === 'success' ? '#4CAF50' :
                                         feedbackPopoverSeverity === 'error' ? '#EF5350' :
                                         feedbackPopoverSeverity === 'warning' ? '#FF9800' :
                                         '#D4AF37', // Default for 'info'
                        color: 'white', // Text color
                        fontWeight: 'bold',
                        textAlign: 'center',
                    }
                }}
            >
                <Typography variant="body1">{feedbackPopoverMessage}</Typography>
            </Popover>
        </Box>
    );
}

export default AboutPage;