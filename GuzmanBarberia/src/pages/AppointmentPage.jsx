import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, Grid, CircularProgress, Alert,
    Paper, IconButton,
    AppBar, Toolbar,
    Stack
} from '@mui/material';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import moment from 'moment';
import 'moment/locale/es';

// Iconos
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import SideMenu from '../components/SideMenu.jsx';
import UserProfileModal from '../components/UserProfileModal.jsx'; // Ahora se abre como Popover
import ServiceSelectionDialog from '../components/ServiceSelectionDialog.jsx';
import AppointmentConfirmationDialog from '../components/AppointmentConfirmationDialog.jsx';
import { useUser } from '../contexts/UserContext.jsx';

// Servicios de API
import barberService from '../services/barberService';
import serviceService from '../services/serviceService';
import appointmentService from '../services/appointmentService';

moment.locale('es');

function AppointmentPage() {
    const { barberId: urlBarberId } = useParams();
    const navigate = useNavigate();
    const { userProfile, isAdmin, isSuperAdmin, isLoadingProfile, incrementAppointments, logout, updateUserProfile } = useUser();

    // --- Estados para los datos y la lógica de la página ---
    const [selectedBarberId, setSelectedBarberId] = useState(null);
    const [allBarbers, setAllBarbers] = useState([]);
    const [selectedDate, setSelectedDate] = useState(moment());
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedService, setSelectedService] = useState('');
    const [barberoInfo, setBarberoInfo] = useState(null);
    const [services, setServices] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Estados para el menú lateral ---
    const [menuOpen, setMenuOpen] = useState(false);
    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    // --- Estados para el popover del perfil de usuario (reintroducidos) ---
    const [profileAnchorEl, setProfileAnchorEl] = useState(null);
    const [isProfilePopoverOpen, setIsProfilePopoverOpen] = useState(false);

    const handleOpenProfilePopover = (event) => {
        setProfileAnchorEl(event.currentTarget);
        setIsProfilePopoverOpen(true);
    };

    const handleCloseProfilePopover = () => {
        setProfileAnchorEl(null);
        setIsProfilePopoverOpen(false);
    };

    // --- Estados para los diálogos de cita ---
    const [serviceSelectionOpen, setServiceSelectionOpen] = useState(false);
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [confirmedAppointmentDetails, setConfirmedAppointmentDetails] = useState(null);
    const [appointmentSuccess, setAppointmentSuccess] = useState(null);

    // Efecto para determinar el ID del barbero a mostrar en la agenda
    useEffect(() => {
        if (isLoadingProfile) {
            return; 
        }

        if (isSuperAdmin && urlBarberId) { 
            setSelectedBarberId(parseInt(urlBarberId));
        } else if (isAdmin && userProfile?.id_barbero) { 
            setSelectedBarberId(userProfile.id_barbero);
        } else if (urlBarberId) { 
            setSelectedBarberId(parseInt(urlBarberId));
        } else {
            setError('No se ha podido determinar el barbero a mostrar en la agenda. Por favor, selecciona un barbero.');
            setLoading(false);
        }
    }, [urlBarberId, userProfile, isAdmin, isSuperAdmin, isLoadingProfile]);

    const loadPageData = useCallback(async () => {
        if (selectedBarberId === null) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // 1. Cargar información del barbero seleccionado
            const barberoData = await barberService.getBarberById(selectedBarberId);
            setBarberoInfo(barberoData);

            // 2. Cargar todos los servicios
            const servicesData = await serviceService.getAllServices();
            setServices(servicesData);

            // 3. Cargar todos los barberos (solo si es SuperAdmin)
            if (isSuperAdmin) {
                const allBarbersData = await barberService.getAllBarbers();
                setAllBarbers(allBarbersData);
            }

            // 4. Cargar disponibilidad para la fecha y el barbero activo
            const dateFormatted = selectedDate.format('YYYY-MM-DD');
            const availabilityData = await appointmentService.getBarberAvailability(selectedBarberId, dateFormatted);

            if (availabilityData && Array.isArray(availabilityData)) {
                setTimeSlots(availabilityData);
            } else {
                setTimeSlots([]);
                setError('No se pudo cargar la disponibilidad para esta fecha. Formato de datos inesperado.');
            }
            setSelectedTime(null);

        } catch (err) {
            setError(`Error al cargar datos: ${err.response?.data?.message || err.message || 'Error desconocido'}`);
            console.error("Error loading appointment page data:", err);
        } finally {
            setLoading(false);
        }
    }, [selectedBarberId, selectedDate, isSuperAdmin]);

    useEffect(() => {
        if (selectedBarberId !== null) {
            loadPageData();
        }
    }, [selectedBarberId, loadPageData]);

    const handleDateChange = async (newDate) => {
        setSelectedDate(newDate);
        setSelectedTime(null);
        setError(null);
        setLoading(true);

        try {
            const dateFormatted = newDate.format('YYYY-MM-DD');
            const availabilityData = await appointmentService.getBarberAvailability(selectedBarberId, dateFormatted);

            if (availabilityData && Array.isArray(availabilityData)) {
                setTimeSlots(availabilityData);
            } else {
                setTimeSlots([]);
                setError('No se pudo cargar la disponibilidad para esta fecha. Formato de datos inesperado.');
            }
        } catch (err) {
            setError('Error al cargar la disponibilidad para esta fecha.');
            console.error('Error fetching availability:', err);
            setTimeSlots([]);
        } finally {
            setLoading(false);
        }
    };

    const shouldDisableDate = (date) => {
        return date.isBefore(moment(), 'day');
    };

    const handleTimeSelect = (time) => {
        setSelectedTime(time);
        setServiceSelectionOpen(true);
    };

    const handleServiceSelected = (serviceId) => {
        setSelectedService(serviceId);
        const serviceDetails = services.find(s => s.id === serviceId);

        if (!serviceDetails) {
            setError('Servicio seleccionado no encontrado. (ID: ' + serviceId + ')');
            setServiceSelectionOpen(false);
            return;
        }

        setConfirmedAppointmentDetails({
            barber: barberoInfo?.nombre || 'Barbero Desconocido',
            date: selectedDate.format('DD [de] MMMM [de]YYYY'),
            time: serviceDetails.duracion_minutos ? moment(selectedTime, 'HH:mm').format('h:mm A') + ` (${serviceDetails.duracion_minutos} min)` : moment(selectedTime, 'HH:mm').format('h:mm A'),
            serviceName: serviceDetails.nombre,
            serviceDescription: serviceDetails.descripcion || '',
            servicePrice: serviceDetails.precio,
        });

        setServiceSelectionOpen(false);
        setTimeout(() => {
            setConfirmationOpen(true);
        }, 50);
    };

    // Cerrar el diálogo de selección de servicio
    const handleCloseServiceSelection = () => {
        setServiceSelectionOpen(false);
    };

    // Cancelar la cita (desde el diálogo de confirmación)
    const handleCancelFinalAppointment = () => {
        setConfirmationOpen(false);
        setSelectedTime(null);
        setSelectedService('');
        setConfirmedAppointmentDetails(null);
        setAppointmentSuccess(null);
    };

    // Enviar la cita al backend desde el diálogo de confirmación final
    const handleConfirmFinalAppointment = async () => {
        setError(null);
        setLoading(true);
        setAppointmentSuccess(null);
        const timeToSendToBackend = moment(selectedTime, 'HH:mm').format('HH:mm:ss');

        try {
            if (!userProfile?.id) {
                throw new Error('ID de cliente no disponible. Por favor, inicia sesión de nuevo.');
            }

            const appointmentData = {
                id_cliente: userProfile.id,
                id_barbero: selectedBarberId,
                fecha_cita: selectedDate.format('YYYY-MM-DD'),
                hora_inicio: timeToSendToBackend,
                id_servicio: selectedService,
            };
            await appointmentService.createAppointment(appointmentData);
            setAppointmentSuccess('¡Cita agendada exitosamente!');

            if (userProfile.role === 'cliente') {
                incrementAppointments();
            }

            await handleDateChange(selectedDate);
            setConfirmedAppointmentDetails(null);
            setSelectedTime(null);
            setSelectedService('');

            setTimeout(() => setConfirmationOpen(false), 2000);

        } catch (err) {
            setAppointmentSuccess(null);
            setError(err.response?.data?.message || err.message || 'Hubo un error al agendar tu cita.');
            console.error('Error creating appointment:', err);
        } finally {
            setLoading(false);
        }
    };

    if (isLoadingProfile) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', backgroundColor: '#EDE0D4' }}>
                <CircularProgress sx={{ color: '#D4AF37' }} />
                <Typography variant="h6" sx={{ mt: 2, color: '#333333' }}>Cargando perfil de usuario...</Typography>
            </Box>
        );
    }

    if (error && !barberoInfo && selectedBarberId === null && !isSuperAdmin) {
        return (
            <Box sx={{ p: 3, textAlign: 'center', backgroundColor: '#EDE0D4', minHeight: '100vh' }}>
                <Alert severity="error">{error}</Alert>
                <Button variant="contained" onClick={() => navigate('/seleccionar-barbero')} sx={{ mt: 2, backgroundColor: '#D4AF37', '&:hover': { backgroundColor: '#C39F37' }, color: 'black' }}>
                    Volver a Seleccionar Barbero
                </Button>
            </Box>
        );
    }

    if (isSuperAdmin && !selectedBarberId && allBarbers.length === 0 && loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', backgroundColor: '#EDE0D4' }}>
                <CircularProgress sx={{ color: '#D4AF37' }} />
                <Typography variant="h6" sx={{ mt: 2, color: '#333333' }}>Cargando barberos para Super Administrador...</Typography>
            </Box>
        );
    }
    if (isSuperAdmin && !selectedBarberId && allBarbers.length === 0 && !loading) {
        return (
            <Box sx={{ p: 3, textAlign: 'center', backgroundColor: '#EDE0D4', minHeight: '100vh' }}>
                <Alert severity="warning">No hay barberos registrados para seleccionar. Por favor, añade barberos.</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#EDE0D4' }}>
            <AppBar position="static" sx={{ backgroundColor: '#1a202c', boxShadow: 'none' }}>
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="back"
                        sx={{ mr: 2, color: '#D4AF37' }}
                        onClick={() => navigate(-1)}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2, color: '#D4AF37' }}
                        onClick={toggleMenu}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1, textAlign: 'center', fontFamily: 'cursive', fontSize: '2rem', color: '#D4AF37' }}
                    >
                        Barber Guzman
                    </Typography>
                    <IconButton color="inherit" sx={{ color: '#D4AF37' }}>
                        <NotificationsIcon />
                    </IconButton>
                    {/* Ícono de perfil de usuario que abre el Popover */}
                    <IconButton
                        color="inherit"
                        sx={{ color: '#D4AF37' }}
                        onClick={handleOpenProfilePopover} // Usa la función para abrir el Popover
                        aria-controls={isProfilePopoverOpen ? 'profile-popover' : undefined}
                        aria-haspopup="true"
                    >
                        <AccountCircleIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            <SideMenu isOpen={menuOpen} toggleMenu={toggleMenu} />

            <Box sx={{ flexGrow: 1, p: 3, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', mt: 4 }}>
                <Grid container spacing={4} justifyContent="center">
                    {selectedBarberId !== null && (
                        <>
                            <Grid item xs={12} sm={6} md={4}> 
                                <Paper elevation={3} sx={{ p: 2, borderRadius: 2, backgroundColor: 'white' }}>
                                    <Typography variant="h6" sx={{ mb: 1, textAlign: 'left', fontWeight: 'bold' }}>
                                        Elige el día
                                    </Typography>
                                    <LocalizationProvider dateAdapter={AdapterMoment}>
                                        <DateCalendar
                                            value={selectedDate}
                                            onChange={(newValue) => handleDateChange(newValue)}
                                            shouldDisableDate={shouldDisableDate}
                                            sx={{
                                                width: '100%',
                                                '& .MuiPickersDay-root': {
                                                    '&.Mui-selected': {
                                                        backgroundColor: '#D4AF37',
                                                        color: 'white',
                                                        '&:hover': {
                                                            backgroundColor: '#C39F37',
                                                        },
                                                    },
                                                    '&.MuiPickersDay-today': {
                                                        borderColor: '#D4AF37',
                                                        color: '#333333',
                                                    },
                                                    '&.Mui-disabled': {
                                                        color: '#cccccc',
                                                    },
                                                },
                                                '& .MuiPickersCalendarHeader-root': {
                                                    '& .MuiPickersCalendarHeader-labelContainer': {
                                                        color: '#333333',
                                                        fontWeight: 'bold',
                                                    },
                                                    '& .MuiPickersCalendarHeader-switchViewButton': {
                                                        color: '#D4AF37',
                                                    },
                                                    '& .MuiIconButton-root': {
                                                        color: '#D4AF37',
                                                    },
                                                },
                                                '& .MuiDayCalendar-weekDayLabel': {
                                                    color: '#333333',
                                                    fontWeight: 'bold',
                                                },
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} sm={6} md={4}> 
                                <Paper elevation={3} sx={{ p: 3, borderRadius: 2, backgroundColor: 'white' }}>
                                    <Typography variant="h5" sx={{ mb: 1, textAlign: 'left', fontWeight: 'bold' }}>
                                        Agendar cita
                                    </Typography>
                                    <Typography variant="subtitle1" sx={{ mb: 1, color: '#555' }}>
                                        con: {barberoInfo?.nombre || 'Barbero'} {barberoInfo?.apellido || ''}
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 2, color: '#555' }}>
                                        Día seleccionado: {selectedDate.format('YYYY-MM-DD')}
                                    </Typography>

                                    {loading && selectedBarberId !== null ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                            <CircularProgress sx={{ color: '#D4AF37' }} />
                                        </Box>
                                    ) : error ? (
                                        <Alert severity="warning" sx={{ mt: 2 }}>{error}</Alert>
                                    ) : (
                                        <Box sx={{ maxHeight: '400px', overflowY: 'auto', pr: 1 }}>
                                            <Stack spacing={1}>
                                                {timeSlots.length > 0 ? (
                                                    timeSlots.map((slot) => (
                                                        <Box
                                                            key={slot.hora_inicio_24h}
                                                            sx={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                p: 1.5,
                                                                borderRadius: 1,
                                                                border: '1px solid #eee',
                                                                backgroundColor: slot.disponible ? 'transparent' : '#f5f5f5',
                                                            }}
                                                        >
                                                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                                {moment(slot.hora_inicio_24h, 'HH:mm').format('h:mm A')}
                                                            </Typography>
                                                            {slot.disponible ? (
                                                                <Button
                                                                    variant="contained"
                                                                    size="small"
                                                                    sx={{
                                                                        backgroundColor: '#D4AF37',
                                                                        '&:hover': {
                                                                            backgroundColor: '#C39F37',
                                                                        },
                                                                        color: 'black',
                                                                        fontWeight: 'bold',
                                                                        minWidth: '80px',
                                                                    }}
                                                                    onClick={() => handleTimeSelect(slot.hora_inicio_24h)}
                                                                >
                                                                    AGENDAR
                                                                </Button>
                                                            ) : (
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{
                                                                        color: '#9E9E9E',
                                                                        fontWeight: 'bold',
                                                                        minWidth: '80px',
                                                                        textAlign: 'right',
                                                                    }}
                                                                >
                                                                    OCUPADO
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    ))
                                                ) : (
                                                    <Typography variant="body1" sx={{ textAlign: 'center', mt: 3, color: '#555' }}>
                                                        No hay horarios disponibles para esta fecha.
                                                    </Typography>
                                                )}
                                            </Stack>
                                        </Box>
                                    )}
                                </Paper>
                            </Grid>
                        </>
                    )}
                </Grid>
            </Box>

            <UserProfileModal
                open={isProfilePopoverOpen}
                onClose={handleCloseProfilePopover}
                anchorEl={profileAnchorEl} 
            />

            <ServiceSelectionDialog
                open={serviceSelectionOpen}
                onClose={handleCloseServiceSelection}
                services={services}
                onSelectService={handleServiceSelected}
            />

            <AppointmentConfirmationDialog
                open={Boolean(confirmationOpen)}
                onClose={handleCancelFinalAppointment}
                onConfirm={handleConfirmFinalAppointment}
                appointmentDetails={confirmedAppointmentDetails}
                loading={loading}
                successMessage={appointmentSuccess}
                errorMessage={error}
            />
        </Box>
    );
}

export default AppointmentPage;