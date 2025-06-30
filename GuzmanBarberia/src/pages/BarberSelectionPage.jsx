import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
    Box, Typography, Button, Grid, CircularProgress, Alert,
    Paper, IconButton,
} from '@mui/material';    
import moment from 'moment'; 
import 'moment/locale/es';

import EditIcon from '@mui/icons-material/Edit';
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; 

import Header from '../components/Header.jsx';
import SideMenu from '../components/SideMenu.jsx';
import UserProfileModal from '../components/UserProfileModal.jsx';
import BarberEditModal from '../components/BarberEditModal.jsx';

import { useUser } from '../contexts/UserContext.jsx';
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

    const { userProfile, isAdmin, isSuperAdmin, isLoadingProfile } = useUser();

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
        if (!isLoadingProfile) {
            fetchBarbers();
        }
    }, [fetchBarbers, isLoadingProfile]);

    const handleSelectBarber = (barberId) => {
        navigate(`/agendar-cita/${barberId}`);
    };

    const handleOpenEditModal = (barberId) => {
        setSelectedBarberId(barberId);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedBarberId(null);
        fetchBarbers(); 
    };

    const canEditBarbers = isAdmin || isSuperAdmin;

    if (loading || isLoadingProfile) {
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
            <Header toggleMenu={toggleMenu} onOpenProfilePopover={handleOpenProfilePopover} /> 
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
                                    position: 'relative',
                                }}
                            >
                                {canEditBarbers && (
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
            />

            <BarberEditModal
                open={isEditModalOpen}
                onClose={handleCloseEditModal}
                barberoId={selectedBarberId}
                onBarberUpdated={handleCloseEditModal}
            />
        </Box>
    );
}

export default BarberSelectionPage;