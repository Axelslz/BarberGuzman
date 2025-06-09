import React, { useState, useEffect } from 'react';
import { Box, Typography, AppBar, Toolbar, IconButton, Paper, TextField, Button, CircularProgress } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EditIcon from '@mui/icons-material/Edit'; // Importa el icono de lápiz
import SaveIcon from '@mui/icons-material/Save'; // Icono para guardar
import CancelIcon from '@mui/icons-material/Cancel'; // Icono para cancelar
import CloseIcon from '@mui/icons-material/Close'; // Icono para eliminar imagen
import SideMenu from '../components/SideMenu.jsx';
import Carousel from 'react-material-ui-carousel';
import UserProfileModal from '../components/UserProfileModal.jsx';
import { useUser } from '../contexts/UserContext.jsx';
import { getAboutInfo, updateAboutInfo } from '../services/aboutService.js'; // Importa los servicios
import { getUserRole } from '../services/authService.js'; // Importa para obtener el rol del usuario

// Nota: Ya no importaremos las imágenes estáticas aquí, las cargaremos dinámicamente
// import aboutImage1 from '../assets/about_us_1.jpg'; 
// import aboutImage2 from '../assets/about_us_2.jpg'; 
// import aboutImage3 from '../assets/about_us_3.jpg'; 

function AboutPage() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const { userProfile, updateUserProfile } = useUser();
    
    // Estado para la información "Sobre mí"
    const [aboutContent, setAboutContent] = useState({
        titulo: '',
        parrafo1: '',
        parrafo2: '',
        imagen_url1: '',
        imagen_url2: '',
    });
    const [isEditing, setIsEditing] = useState(false); // Nuevo estado para el modo de edición
    const [loading, setLoading] = useState(true); // Estado de carga
    const [error, setError] = useState(null); // Estado para errores

    // Estados para las nuevas imágenes a subir (objetos File)
    const [newImage1, setNewImage1] = useState(null);
    const [newImage2, setNewImage2] = useState(null);

    // Determinar si el usuario es administrador
    const isAdmin = getUserRole() === 'admin'; // Asume que getUserRole() devuelve 'admin' o 'cliente'

    useEffect(() => {
        const fetchAboutInfo = async () => {
            try {
                const data = await getAboutInfo();
                setAboutContent(data);
            } catch (err) {
                console.error("Error al cargar la información 'Sobre Mí':", err);
                setError("Error al cargar la información. Intente de nuevo más tarde.");
            } finally {
                setLoading(false);
            }
        };
        fetchAboutInfo();
    }, []);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleOpenProfilePopover = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseProfilePopover = () => {
        setAnchorEl(null);
    };

    const isProfilePopoverOpen = Boolean(anchorEl);

    // Manejador para el cambio en los campos de texto
    const handleTextChange = (e) => {
        const { name, value } = e.target;
        setAboutContent(prev => ({ ...prev, [name]: value }));
    };

    // Manejador para el cambio de archivos de imagen
    const handleImageChange = (e, imageNumber) => {
        const file = e.target.files[0];
        if (imageNumber === 1) {
            setNewImage1(file);
            setAboutContent(prev => ({ ...prev, imagen_url1: file ? URL.createObjectURL(file) : '' })); // Previsualización
        } else if (imageNumber === 2) {
            setNewImage2(file);
            setAboutContent(prev => ({ ...prev, imagen_url2: file ? URL.createObjectURL(file) : '' })); // Previsualización
        }
    };

    // Manejador para eliminar una imagen existente
    const handleRemoveImage = (imageNumber) => {
        if (imageNumber === 1) {
            setNewImage1(null); // Elimina el archivo nuevo si lo había
            setAboutContent(prev => ({ ...prev, imagen_url1: '' })); // Borra la URL existente
        } else if (imageNumber === 2) {
            setNewImage2(null); // Elimina el archivo nuevo si lo había
            setAboutContent(prev => ({ ...prev, imagen_url2: '' })); // Borra la URL existente
        }
    };

    // Guardar cambios
    const handleSave = async () => {
        setLoading(true);
        setError(null);
        try {
            const dataToUpdate = {
                titulo: aboutContent.titulo,
                parrafo1: aboutContent.parrafo1,
                parrafo2: aboutContent.parrafo2,
                imagen1: newImage1 || aboutContent.imagen_url1, // Envía el File o la URL existente
                imagen2: newImage2 || aboutContent.imagen_url2, // Envía el File o la URL existente
            };
            await updateAboutInfo(dataToUpdate);
            alert('Información actualizada exitosamente!');
            setIsEditing(false); // Sale del modo de edición
            // Vuelve a cargar la info para asegurar URLs correctas después de la subida
            const updatedData = await getAboutInfo();
            setAboutContent(updatedData);
            setNewImage1(null); // Limpia los estados de nuevas imágenes
            setNewImage2(null);
        } catch (err) {
            console.error("Error al guardar la información 'Sobre Mí':", err);
            setError("Error al guardar la información. Verifique la consola para más detalles.");
        } finally {
            setLoading(false);
        }
    };

    // Cancelar edición
    const handleCancel = () => {
        // Recargar la información original para descartar cambios
        setLoading(true);
        setError(null);
        getAboutInfo().then(data => {
            setAboutContent(data);
            setNewImage1(null);
            setNewImage2(null);
            setLoading(false);
        }).catch(err => {
            console.error("Error al recargar la información al cancelar:", err);
            setError("Error al recargar la información.");
            setLoading(false);
        });
        setIsEditing(false);
    };


    // URLs para el carrusel, ahora dinámicas
    // Asegúrate de que tu backend sirva los archivos estáticos desde 'uploads/about'
    const dynamicCarouselItems = [
        {
            image: aboutContent.imagen_url1 ? `http://localhost:4000/${aboutContent.imagen_url1}` : 'placeholder_image_1.jpg', // Ruta relativa desde el servidor
            description: aboutContent.parrafo1, // El primer párrafo se usa para la descripción de la primera imagen
        },
        {
            image: aboutContent.imagen_url2 ? `http://localhost:4000/${aboutContent.imagen_url2}` : 'placeholder_image_2.jpg', // Ruta relativa desde el servidor
            description: aboutContent.parrafo2, // El segundo párrafo se usa para la descripción de la segunda imagen
        },
        // Puedes agregar más si tienes más imágenes en el backend
        // Si necesitas una tercera imagen estática para el carrusel mientras solo tienes dos editables,
        // puedes usar una aquí como fallback o añadir lógica en el backend para una tercera imagen
        {
             image: 'https://via.placeholder.com/400x400?text=Barberia+Guzman', // Imagen por defecto si no hay segunda imagen
             description: 'Siempre brindando el mejor servicio y calidad.',
        }
    ].filter(item => item.image); // Filtra los elementos que no tienen imagen si quieres evitar placeholders vacíos

    // Si estás usando los párrafos en el carrusel, no los muestres de nuevo abajo como párrafos separados
    // o ajusta la lógica. Por ahora, asumiré que los párrafos `parrafo1` y `parrafo2` son los que quieres editar
    // y que los usas para el carrusel o como texto general, no ambos.

    // Define las URLs de las imágenes para el carrusel, priorizando las nuevas si están cargadas
    const currentCarouselImages = [
        newImage1 ? URL.createObjectURL(newImage1) : (aboutContent.imagen_url1 ? `http://localhost:4000/${aboutContent.imagen_url1}` : 'placeholder_image_1.jpg'),
        newImage2 ? URL.createObjectURL(newImage2) : (aboutContent.imagen_url2 ? `http://localhost:4000/${aboutContent.imagen_url2}` : 'placeholder_image_2.jpg'),
    ].filter(url => url !== 'placeholder_image_1.jpg' && url !== 'placeholder_image_2.jpg'); // Solo imágenes reales

    const finalCarouselItems = currentCarouselImages.map((imgUrl, index) => ({
        image: imgUrl,
        description: index === 0 ? aboutContent.parrafo1 : aboutContent.parrafo2 // Asumiendo que el primer párrafo va con la primera imagen y el segundo con la segunda. Ajusta si tienes otro mapping.
    }));

    // Si solo tienes una imagen y un párrafo, o si las imágenes del carrusel son solo decorativas
    // y los párrafos son independientes, puedes simplificar esto.
    // Para el caso de la imagen de tu captura, parece que es una sola imagen en la vista.
    // Ajustaremos el carrusel para que muestre las imágenes cargadas, y si no hay, las de placeholder.

    // Si solo quieres mostrar la primera imagen de `aboutContent` y un párrafo general
    // en lugar de un carrusel con múltiples ítems, ajusta aquí.
    // Basándonos en tu imagen de pantalla, parece que es una sola imagen y un texto.
    // Si tienes dos `imagen_url1` y `imagen_url2`, podemos mostrarlas como dos ítems del carrusel.
    const carouselDisplayItems = [];
    if (aboutContent.imagen_url1) {
        carouselDisplayItems.push({
            image: newImage1 ? URL.createObjectURL(newImage1) : `http://localhost:4000/${aboutContent.imagen_url1}`,
            description: aboutContent.parrafo1
        });
    } else if (newImage1) { // Si no había imagen_url1 pero ya hay una nueva cargada
        carouselDisplayItems.push({
            image: URL.createObjectURL(newImage1),
            description: aboutContent.parrafo1
        });
    }

    if (aboutContent.imagen_url2) {
        carouselDisplayItems.push({
            image: newImage2 ? URL.createObjectURL(newImage2) : `http://localhost:4000/${aboutContent.imagen_url2}`,
            description: aboutContent.parrafo2
        });
    } else if (newImage2) { // Si no había imagen_url2 pero ya hay una nueva cargada
        carouselDisplayItems.push({
            image: URL.createObjectURL(newImage2),
            description: aboutContent.parrafo2
        });
    }

    // Si no hay ninguna imagen guardada ni nueva, usa un placeholder para el carrusel
    if (carouselDisplayItems.length === 0) {
        carouselDisplayItems.push({
            image: 'https://via.placeholder.com/400x400?text=Imagen+Barberia',
            description: 'Imagen principal de la barbería.'
        });
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
                    <IconButton color="inherit" sx={{ color: 'black' }}>
                        <NotificationsIcon />
                    </IconButton>
                    <IconButton 
                        color="inherit" 
                        sx={{ color: 'black' }} 
                        onClick={handleOpenProfilePopover} 
                        aria-controls={isProfilePopoverOpen ? 'profile-popover' : undefined}
                        aria-haspopup="true"
                    >
                        <AccountCircleIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            <SideMenu isOpen={menuOpen} toggleMenu={toggleMenu} />

            <Box sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {loading ? (
                    <CircularProgress sx={{ mt: 5 }} />
                ) : error ? (
                    <Typography color="error" sx={{ mt: 5 }}>{error}</Typography>
                ) : (
                    <>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, mt: 4 }}>
                            {isEditing ? (
                                <TextField
                                    label="Título"
                                    name="titulo"
                                    value={aboutContent.titulo}
                                    onChange={handleTextChange}
                                    variant="outlined"
                                    size="small"
                                    sx={{ mr: 2, width: 'auto' }}
                                />
                            ) : (
                                <Typography 
                                    variant="h4" 
                                    component="h2" 
                                    sx={{ 
                                        fontWeight: 'bold',
                                        color: '#333333'
                                    }}
                                >
                                    {aboutContent.titulo || 'Sobre mí'} {/* Usa el título del backend o un default */}
                                </Typography>
                            )}
                            
                            {isAdmin && (
                                <IconButton onClick={() => setIsEditing(!isEditing)} sx={{ ml: 1 }}>
                                    <EditIcon />
                                </IconButton>
                            )}
                        </Box>

                        <Box sx={{ maxWidth: 800, width: '100%', mb: 4 }}>
                            <Carousel
                                animation="slide" 
                                indicators={true} 
                                navButtonsAlwaysVisible={true} 
                            >
                                {carouselDisplayItems.map((item, i) => (
                                    <Paper key={i} elevation={3} sx={{ p: 2, textAlign: 'center', position: 'relative' }}>
                                        {isEditing && (
                                            <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                                                <IconButton 
                                                    component="label" 
                                                    color="primary"
                                                    sx={{ bgcolor: 'white', '&:hover': { bgcolor: 'lightgray' } }}
                                                >
                                                    <EditIcon />
                                                    <input 
                                                        type="file" 
                                                        hidden 
                                                        accept="image/*" 
                                                        onChange={(e) => handleImageChange(e, i + 1)} // Pasa 1 o 2
                                                    />
                                                </IconButton>
                                                {(aboutContent[`imagen_url${i + 1}`] || newImage1 || newImage2) && ( // Muestra el botón de eliminar solo si hay una imagen
                                                    <IconButton 
                                                        onClick={() => handleRemoveImage(i + 1)} 
                                                        color="error" 
                                                        sx={{ ml: 1, bgcolor: 'white', '&:hover': { bgcolor: 'lightgray' } }}
                                                    >
                                                        <CloseIcon />
                                                    </IconButton>
                                                )}
                                            </Box>
                                        )}
                                        <Box
                                            component="img"
                                            src={item.image}
                                            alt={`Imagen ${i + 1}`}
                                            sx={{
                                                width: '100%',
                                                height: 400, 
                                                objectFit: 'cover', 
                                                borderRadius: 2,
                                                mb: 2,
                                            }}
                                        />
                                        {isEditing ? (
                                            <TextField
                                                label={`Párrafo ${i + 1}`}
                                                name={`parrafo${i + 1}`}
                                                value={item.description}
                                                onChange={handleTextChange}
                                                multiline
                                                fullWidth
                                                rows={3}
                                                variant="outlined"
                                            />
                                        ) : (
                                            <Typography variant="body1" sx={{ color: '#333333' }}>
                                                {item.description}
                                            </Typography>
                                        )}
                                    </Paper>
                                ))}
                            </Carousel>
                        </Box>

                        {/* Si no usas parrafo1 y parrafo2 en el carrusel, puedes mostrarlos aquí: */}
                        {/* {!isEditing && (
                            <Typography variant="body1" sx={{ maxWidth: 800, textAlign: 'justify', mb: 4, color: '#333333' }}>
                                {aboutContent.parrafo1}
                            </Typography>
                        )}
                        {!isEditing && (
                            <Typography variant="body1" sx={{ maxWidth: 800, textAlign: 'justify', mb: 4, color: '#333333' }}>
                                {aboutContent.parrafo2}
                            </Typography>
                        )} 
                        */}

                        {isEditing && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<SaveIcon />}
                                    onClick={handleSave}
                                    disabled={loading}
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Guardar'}
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    startIcon={<CancelIcon />}
                                    onClick={handleCancel}
                                    disabled={loading}
                                >
                                    Cancelar
                                </Button>
                            </Box>
                        )}
                    </>
                )}
            </Box>

            <UserProfileModal
                isOpen={isProfilePopoverOpen} 
                onClose={handleCloseProfilePopover}
                anchorEl={anchorEl} 
                userProfile={userProfile}
                updateUserProfile={updateUserProfile} 
            />
        </Box>
    );
}

export default AboutPage;