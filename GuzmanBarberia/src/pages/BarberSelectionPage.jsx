import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
    Box, Typography, Button, Grid, CircularProgress, Alert,
    Paper, IconButton,
    AppBar, Toolbar,
} from '@mui/material';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import moment from 'moment';
import 'moment/locale/es';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EditIcon from '@mui/icons-material/Edit'; // Importar el icono de edición

import SideMenu from '../components/SideMenu.jsx';
import UserProfileModal from '../components/UserProfileModal.jsx';
import BarberEditModal from '../components/BarberEditModal.jsx'; // Importar el nuevo modal de edición

import { useUser } from '../contexts/UserContext.jsx'; // Importar useUser
import barberService from '../services/barberService';

moment.locale('es');

function BarberSelectionPage() {
    const [barberos, setBarberos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [menuOpen, setMenuOpen] = useState(false);
    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const [anchorEl, setAnchorEl] = useState(null);
    const [isProfilePopoverOpen, setIsProfilePopoverOpen] = useState(false);

    // *** CAMBIO CLAVE: Obtener userProfile e isAdmin/isSuperAdmin directamente del contexto ***
    const { userProfile, isAdmin, isSuperAdmin, isLoadingProfile } = useUser();

    // Estados para el modal de edición
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedBarberId, setSelectedBarberId] = useState(null);

    const handleOpenProfilePopover = (event) => {
        setAnchorEl(event.currentTarget);
        setIsProfilePopoverOpen(true);
    };

    const handleCloseProfilePopover = () => {
        setAnchorEl(null);
        setIsProfilePopoverOpen(false);
    };

    // Función para cargar los barberos (se usará en useEffect y al actualizar)
    const fetchBarbers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await barberService.getAllBarbers();
            setBarberos(data);
        } catch (err) {
            setError('Error al cargar la lista de barberos. Inténtalo de nuevo más tarde.');
            console.error('Error fetching barbers:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Solo intentamos cargar los barberos si el perfil de usuario ya se ha cargado (o al menos se ha intentado)
        // Esto evita que intentemos cargar barberos antes de saber si hay un token o no.
        if (!isLoadingProfile) { 
            fetchBarbers();
        }
    }, [fetchBarbers, isLoadingProfile]); // Añadimos isLoadingProfile a las dependencias

    const handleSelectBarber = (barberId) => {
        navigate(`/agendar-cita/${barberId}`);
    };

    // Función para abrir el modal de edición
    const handleOpenEditModal = (barberId) => {
        setSelectedBarberId(barberId);
        setIsEditModalOpen(true);
    };

    // Función para cerrar el modal de edición y recargar la lista de barberos
    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedBarberId(null);
        fetchBarbers(); // Recargar la lista para ver los cambios
    };

    // *** CAMBIO CLAVE: Usa isAdmin o isSuperAdmin directamente del contexto ***
    const canEditBarbers = isAdmin || isSuperAdmin; // El nombre de la variable es más claro

    if (loading || isLoadingProfile) { // Combina la carga de barberos con la carga del perfil
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ ml: 2 }}>Cargando información...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Alert severity="error">{error}</Alert>
                <Button variant="contained" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
                    Reintentar
                </Button>
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
                <Typography variant="h5" sx={{ mb: 4, mt: 4, textAlign: 'center', fontWeight: 'bold', color: 'black' }}>
                    Selecciona a tu Barbero
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: 4,
                        mt: 2,
                    }}
                >
                    {barberos.map((barbero) => (
                        <Grid item xs={12} sm={6} md={4} key={barbero.id}>
                            <Box
                                sx={{
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    p: 2,
                                    textAlign: 'center',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                                    },
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    backgroundColor: '#fff',
                                    position: 'relative', // Necesario para posicionar el icono de edición
                                }}
                            >
                                {/* Icono de edición (lápiz) - Renderizado condicionalmente */}
                                {canEditBarbers && ( // Usa la nueva variable de control
                                    <IconButton
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            color: '#D4AF37',
                                            backgroundColor: 'rgba(255,255,255,0.7)',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255,255,255,0.9)',
                                            }
                                        }}
                                        onClick={() => handleOpenEditModal(barbero.id)}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                )}

                                {barbero.foto_perfil_url ? (
                                    <Box
                                        component="img"
                                        src={barbero.foto_perfil_url}
                                        alt={`${barbero.nombre} ${barbero.apellido}`}
                                        sx={{
                                            width: 120,
                                            height: 120,
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            mb: 2,
                                            border: '3px solid #D4AF37',
                                        }}
                                    />
                                ) : (
                                    <AccountCircleIcon sx={{ fontSize: 120, color: '#bdbdbd', mb: 2 }} />
                                )}
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#555' }}>
                                    {barbero.nombre} {barbero.apellido}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                    {barbero.especialidad || 'Barbero General'}
                                </Typography>
                                {barbero.descripcion && (
                                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2, fontSize: '0.9rem' }}>
                                        {barbero.descripcion}
                                    </Typography>
                                )}
                                <Button
                                    variant="contained"
                                    sx={{
                                        backgroundColor: '#D4AF37',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: '#C59A00',
                                        },
                                        mt: 'auto',
                                    }}
                                    onClick={() => handleSelectBarber(barbero.id)}
                                >
                                    Seleccionar
                                </Button>
                            </Box>
                        </Grid>
                    ))}
                </Box>
            </Box>

            <UserProfileModal
                open={isProfilePopoverOpen}
                onClose={handleCloseProfilePopover}
                anchorEl={anchorEl}
                userProfile={userProfile}
                // No necesitas pasar updateUserProfile y user al UserProfileModal a menos que el modal las use directamente.
                // Generalmente, UserProfileModal también usaría `useUser` para obtenerlas.
            />

            {/* Modal de Edición del Barbero */}
            <BarberEditModal
                open={isEditModalOpen}
                onClose={handleCloseEditModal}
                barberoId={selectedBarberId}
                onBarberUpdated={handleCloseEditModal} // Cuando se actualiza, cierra el modal y recarga
            />
        </Box>
    );
}

export default BarberSelectionPage;