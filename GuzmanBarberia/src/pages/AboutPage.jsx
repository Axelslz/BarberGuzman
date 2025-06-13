import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, TextField, Button, CircularProgress, IconButton,
    AppBar, Toolbar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import SideMenu from '../components/SideMenu';
import Carousel from '../components/Carousel';
import UserProfileModal from '../components/UserProfileModal';
import { getAboutInfo, updateAboutInfo } from '../services/aboutService';
import { useUser } from '../contexts/UserContext'; // Importamos useUser

function AboutPage() {
    // Desestructuramos isSuperAdmin de useUser, que es lo que necesitamos
    const { isSuperAdmin, isLoadingProfile } = useUser(); // <-- CAMBIO AQUÍ: Usamos isSuperAdmin

    const [aboutContent, setAboutContent] = useState({
        titulo: '',
        parrafo1: '',
        parrafo2: '',
        imagen_url1: '',
        imagen_url2: '',
    });
    const [originalAboutContent, setOriginalAboutContent] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const [newImage1File, setNewImage1File] = useState(null);
    const [newImage2File, setNewImage2File] = useState(null);

    // ELIMINA ESTA LÍNEA: const isAdmin = getUserRole() === 'admin'; // Ya no es necesaria

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
            setAboutContent(data);
            setOriginalAboutContent(data);
            setNewImage1File(null);
            setNewImage2File(null);
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAboutContent(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e, imageNumber) => {
        const file = e.target.files[0];
        if (file) {
            if (imageNumber === 1 && newImage1File) {
                URL.revokeObjectURL(aboutContent.imagen_url1);
            } else if (imageNumber === 2 && newImage2File) {
                URL.revokeObjectURL(aboutContent.imagen_url2);
            }

            const objectURL = URL.createObjectURL(file);
            if (imageNumber === 1) {
                setNewImage1File(file);
                setAboutContent(prev => ({ ...prev, imagen_url1: objectURL }));
            } else if (imageNumber === 2) {
                setNewImage2File(file);
                setAboutContent(prev => ({ ...prev, imagen_url2: objectURL }));
            }
        }
    };

    const handleRemoveImage = (imageNumber) => {
        if (imageNumber === 1 && newImage1File) {
            URL.revokeObjectURL(aboutContent.imagen_url1);
        } else if (imageNumber === 2 && newImage2File) {
            URL.revokeObjectURL(aboutContent.imagen_url2);
        }

        if (imageNumber === 1) {
            setNewImage1File(null);
            setAboutContent(prev => ({ ...prev, imagen_url1: '' }));
        } else if (imageNumber === 2) {
            setNewImage2File(null);
            setAboutContent(prev => ({ ...prev, imagen_url2: '' }));
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('titulo', aboutContent.titulo);
            formData.append('parrafo1', aboutContent.parrafo1);
            formData.append('parrafo2', aboutContent.parrafo2);

            // Lógica para imagen 1
            if (newImage1File) {
                formData.append('imagen1', newImage1File);
            } else if (aboutContent.imagen_url1 === '') {
                formData.append('imagen1_eliminar', 'true');
            } else if (originalAboutContent && aboutContent.imagen_url1 === originalAboutContent.imagen_url1) { // Mantener si no se cambió
                formData.append('imagen_url1_existente', originalAboutContent.imagen_url1);
            }

            // Lógica para imagen 2
            if (newImage2File) {
                formData.append('imagen2', newImage2File);
            } else if (aboutContent.imagen_url2 === '') {
                formData.append('imagen2_eliminar', 'true');
            } else if (originalAboutContent && aboutContent.imagen_url2 === originalAboutContent.imagen_url2) { // Mantener si no se cambió
                formData.append('imagen_url2_existente', originalAboutContent.imagen_url2);
            }
            
            await updateAboutInfo(formData);
            alert('Información actualizada exitosamente!');
            setIsEditing(false);

            fetchAboutInformation();

        } catch (err) {
            console.error("Error al guardar la información 'Sobre Mí':", err);
            setError(`Error al guardar la información: ${err.message || 'Verifique la consola para más detalles.'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (newImage1File && aboutContent.imagen_url1) {
            URL.revokeObjectURL(aboutContent.imagen_url1);
        }
        if (newImage2File && aboutContent.imagen_url2) {
            URL.revokeObjectURL(aboutContent.imagen_url2);
        }

        setAboutContent(originalAboutContent);
        setNewImage1File(null);
        setNewImage2File(null);
        setIsEditing(false);
        setError(null);
    };

    const carouselItems = [];

    const getImageSrc = (imageNumber) => {
        if (imageNumber === 1 && newImage1File) {
            return URL.createObjectURL(newImage1File);
        }
        if (imageNumber === 2 && newImage2File) {
            return URL.createObjectURL(newImage2File);
        }
        return imageNumber === 1 ? aboutContent.imagen_url1 : aboutContent.imagen_url2;
    };

    const image1Src = getImageSrc(1);
    // Solo añade al carrusel si hay una imagen o si el super_admin está editando
    if (image1Src || isEditing && isSuperAdmin) { // <-- CAMBIO AQUÍ: Añadimos isSuperAdmin
        carouselItems.push({
            image: image1Src || 'https://placehold.co/800x400?text=Imagen+1+de+la+Barberia',
            description: isEditing && isSuperAdmin ? ( // <-- CAMBIO AQUÍ: Añadimos isSuperAdmin
                <TextField
                    label="Párrafo 1"
                    name="parrafo1"
                    value={aboutContent.parrafo1}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={4}
                    margin="normal"
                />
            ) : (
                aboutContent.parrafo1
            )
        });
    }

    const image2Src = getImageSrc(2);
    // Solo añade al carrusel si hay una imagen o si el super_admin está editando
    if (image2Src || isEditing && isSuperAdmin) { // <-- CAMBIO AQUÍ: Añadimos isSuperAdmin
        carouselItems.push({
            image: image2Src || 'https://placehold.co/800x400?text=Imagen+2+de+la+Barberia',
            description: isEditing && isSuperAdmin ? ( // <-- CAMBIO AQUÍ: Añadimos isSuperAdmin
                <TextField
                    label="Párrafo 2"
                    name="parrafo2"
                    value={aboutContent.parrafo2}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={4}
                    margin="normal"
                />
            ) : (
                aboutContent.parrafo2
            )
        });
    }

    if (loading && !originalAboutContent) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress sx={{ mt: 5 }} />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="static" sx={{ backgroundColor: '#D4AF37', boxShadow: 'none' }}>
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2, color: 'black' }}
                        onClick={toggleMenu}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1, textAlign: 'center', fontFamily: 'cursive', fontSize: '2rem', color: 'black' }}
                    >
                        Barber Guzman
                    </Typography>
                    <IconButton
                        color="inherit"
                        sx={{ color: 'black' }}
                        onClick={handleProfileClick}
                        aria-controls={isProfileModalOpen ? 'profile-popover' : undefined}
                        aria-haspopup="true"
                    >
                        <NotificationsIcon />
                    </IconButton>
                    <IconButton
                        color="inherit"
                        sx={{ color: 'black' }}
                        onClick={handleProfileClick}
                        aria-controls={isProfileModalOpen ? 'profile-popover' : undefined}
                        aria-haspopup="true"
                    >
                        <AccountCircleIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            <SideMenu isOpen={menuOpen} toggleMenu={toggleMenu} />

            <Box sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, mt: 4 }}>
                    {isEditing && isSuperAdmin ? ( // <-- CAMBIO AQUÍ: Solo editable si es super_admin
                        <TextField
                            label="Título"
                            name="titulo"
                            value={aboutContent.titulo}
                            onChange={handleChange}
                            variant="outlined"
                            sx={{ mr: 1, width: 'auto' }}
                        />
                    ) : (
                        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
                            {aboutContent.titulo || 'Bienvenido a nuestra Barbería'}
                        </Typography>
                    )}
                    {isSuperAdmin && ( // <-- CAMBIO AQUÍ: Solo el super_admin ve el botón de edición
                        <IconButton onClick={() => setIsEditing(!isEditing)} sx={{ ml: 1 }}>
                            {isEditing ? <SaveIcon /> : <EditIcon />}
                        </IconButton>
                    )}
                </Box>

                {originalAboutContent && (
                    // Pasamos isSuperAdmin al Carousel para que pueda controlar la visibilidad de los botones de imagen
                    <Carousel items={carouselItems} isEditing={isEditing} handleImageChange={handleImageChange} handleRemoveImage={handleRemoveImage} isSuperAdmin={isSuperAdmin} /> 
                )}

                {isEditing && isSuperAdmin && ( // <-- CAMBIO AQUÍ: Solo el super_admin ve los botones Guardar/Cancelar
                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
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