import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Grid, CircularProgress, Alert, Paper, IconButton, AppBar, Toolbar, Stack, Menu, MenuItem } from '@mui/material';
import moment from 'moment';
import 'moment/locale/es';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format, isSameDay, isBefore, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

// Iconos
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EditIcon from '@mui/icons-material/Edit';

import SideMenu from '../components/SideMenu.jsx';
import UserProfileModal from '../components/UserProfileModal.jsx';
import ServiceSelectionDialog from '../components/ServiceSelectionDialog.jsx';
import AppointmentConfirmationDialog from '../components/AppointmentConfirmationDialog.jsx';
import ScheduleEditDialog from '../components/ScheduleEditDialog.jsx';
import { useUser } from '../contexts/UserContext.jsx';

// Servicios de API
import barberService from '../services/barberService';
import serviceService from '../services/serviceService';
import appointmentService from '../services/appointmentService';

moment.locale('es');

const COLOR_AVAILABLE = '#A8DDA8'; // Verde Claro para 'Disponible'
const COLOR_UNAVAILABLE = '#D4AF37'; // Oro para 'No Disponible'
const COLOR_OCCUPIED = '#D3D3D3';   // Gris Claro para 'Ocupado'

function AppointmentPage() {
    const { barberId: urlBarberId } = useParams();
    const navigate = useNavigate();
    const { userProfile, isAdmin, isSuperAdmin, isLoadingProfile, incrementAppointments, logout, updateUserProfile } = useUser();

    const [selectedBarberId, setSelectedBarberId] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedService, setSelectedService] = useState('');

    const [barberoInfo, setBarberoInfo] = useState(null);
    const [services, setServices] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [menuOpen, setMenuOpen] = useState(false);
    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };
    const [profileAnchorEl, setProfileAnchorEl] = useState(null);
    const [isProfilePopoverOpen, setIsProfilePopoverOpen] = useState(false);

    const [editMenuAnchorEl, setEditMenuAnchorEl] = useState(null);
    const isEditMenuOpen = Boolean(editMenuAnchorEl);

    const [initialActionForScheduleEditDialog, setInitialActionForScheduleEditDialog] = useState(null);

    const handleOpenProfilePopover = (event) => {
        setProfileAnchorEl(event.currentTarget);
        setIsProfilePopoverOpen(true);
    };

    const handleCloseProfilePopover = () => {
        setProfileAnchorEl(null);
        setIsProfilePopoverOpen(false);
    };

    const [serviceSelectionOpen, setServiceSelectionOpen] = useState(false);
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [confirmedAppointmentDetails, setConfirmedAppointmentDetails] = useState(null);
    const [appointmentSuccess, setAppointmentSuccess] = useState(null);

    const [scheduleEditOpen, setScheduleEditOpen] = useState(false);

    const [dailyAvailabilityStatus, setDailyAvailabilityStatus] = useState({});

    useEffect(() => {
        if (isLoadingProfile) {
            return;
        }

        if (isAdmin && userProfile?.id_barbero) {
            setSelectedBarberId(userProfile.id_barbero);
        } else if (isSuperAdmin && urlBarberId) {
            setSelectedBarberId(parseInt(urlBarberId));
        } else if (isSuperAdmin && userProfile?.id_barbero) {
             setSelectedBarberId(userProfile.id_barbero);
        } else if (!isAdmin && !isSuperAdmin && urlBarberId) {
            setSelectedBarberId(parseInt(urlBarberId));
        } else {
            setError('No se ha podido determinar el barbero a mostrar en la agenda. Por favor, asegúrate de que el ID del barbero sea correcto.');
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
            const barberoData = await barberService.getBarberById(selectedBarberId);
            setBarberoInfo(barberoData);

            const servicesData = await serviceService.getAllServices();
            setServices(servicesData);

            const dateFormatted = format(selectedDate, 'yyyy-MM-dd');
            const availabilityResponse = await appointmentService.getBarberAvailability(selectedBarberId, dateFormatted);

            let slots = [];
            let currentDayStatus = 'occupied'; 

            if (availabilityResponse && Array.isArray(availabilityResponse.disponibilidad)) {
                slots = availabilityResponse.disponibilidad;
                const hasFullDayBlock = availabilityResponse.horariosNoDisponibles?.some(block =>
                    block.hora_inicio === null && block.hora_fin === null
                );

                if (hasFullDayBlock) {
                    currentDayStatus = 'unavailable'; 
                } else {
                    const hasAvailableSlot = slots.some(slot => slot.disponible);
                    if (hasAvailableSlot) {
                        currentDayStatus = 'available'; 
                    } else {
                        const hasOccupiedSlotByCita = slots.some(slot => !slot.disponible && slot.cita_id !== null);
                        const hasBlockedSlot = slots.some(slot => !slot.disponible && slot.cita_id === null);

                        if (hasOccupiedSlotByCita && !hasBlockedSlot) {
                            currentDayStatus = 'occupied'; 
                        } else if (hasBlockedSlot && !hasOccupiedSlotByCita) {
                            currentDayStatus = 'unavailable'; 
                        } else if (hasBlockedSlot && hasOccupiedSlotByCita) {
                            currentDayStatus = 'occupied';
                        } else {
                            currentDayStatus = 'unavailable'; 
                        }
                    }
                }
            } else if (Array.isArray(availabilityResponse)) {
                slots = availabilityResponse;
                const hasAvailableSlot = slots.some(slot => slot.disponible);
                if (!hasAvailableSlot) {
                    currentDayStatus = 'unavailable';
                } else if (hasAvailableSlot && slots.some(slot => !slot.disponible)) {
                    currentDayStatus = 'occupied';
                } else {
                    currentDayStatus = 'available';
                }
            } else {
                setError('No se pudo cargar la disponibilidad para esta fecha. Formato de datos inesperado de la API o no hay datos.');
                setTimeSlots([]);
                currentDayStatus = 'error';
            }

            setTimeSlots(slots);
            setSelectedTime(null);
            setDailyAvailabilityStatus(prev => ({
                ...prev,
                [dateFormatted]: currentDayStatus
            }));

        } catch (err) {
            setError(`Error al cargar datos: ${err.response?.data?.message || err.message || 'Error desconocido'}`);
            console.error("Error loading appointment page data:", err);
            setTimeSlots([]);
            const dateFormatted = format(selectedDate, 'yyyy-MM-dd');
            setDailyAvailabilityStatus(prev => ({ ...prev, [dateFormatted]: 'error' }));
        } finally {
            setLoading(false);
        }
    }, [selectedBarberId, selectedDate]);

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
        const dateFormatted = format(newDate, 'yyyy-MM-dd');

        try {
            const availabilityResponse = await appointmentService.getBarberAvailability(selectedBarberId, dateFormatted);
            let slots = [];
            let currentDayStatus = 'occupied';

            if (availabilityResponse && Array.isArray(availabilityResponse.disponibilidad)) {
                slots = availabilityResponse.disponibilidad;
                const hasFullDayBlock = availabilityResponse.horariosNoDisponibles?.some(block =>
                    block.hora_inicio === null && block.hora_fin === null
                );

                if (hasFullDayBlock) {
                    currentDayStatus = 'unavailable';
                } else {
                    const hasAvailableSlot = slots.some(slot => slot.disponible);
                    if (hasAvailableSlot) {
                        currentDayStatus = 'available';
                    } else {
                        const hasOccupiedSlotByCita = slots.some(slot => !slot.disponible && slot.cita_id !== null);
                        const hasBlockedSlot = slots.some(slot => !slot.disponible && slot.cita_id === null);

                        if (hasOccupiedSlotByCita && !hasBlockedSlot) {
                            currentDayStatus = 'occupied';
                        } else if (hasBlockedSlot && !hasOccupiedSlotByCita) {
                            currentDayStatus = 'unavailable';
                        } else if (hasBlockedSlot && hasOccupiedSlotByCita) {
                            currentDayStatus = 'occupied';
                        } else {
                            currentDayStatus = 'unavailable';
                        }
                    }
                }
            } else if (Array.isArray(availabilityResponse)) {
                slots = availabilityResponse;
                const hasAvailableSlot = slots.some(slot => slot.disponible);
                if (!hasAvailableSlot) {
                    currentDayStatus = 'unavailable';
                } else if (hasAvailableSlot && slots.some(slot => !slot.disponible)) {
                    currentDayStatus = 'occupied';
                } else {
                    currentDayStatus = 'available';
                }
            } else {
                setError('No se pudo cargar la disponibilidad para esta fecha. Formato de datos inesperado de la API o no hay datos.');
                setTimeSlots([]);
                currentDayStatus = 'error';
            }
            setTimeSlots(slots);
            setDailyAvailabilityStatus(prev => ({ ...prev, [dateFormatted]: currentDayStatus }));

        }
        catch (err) {
            setError('Error al cargar la disponibilidad para esta fecha.');
            console.error('Error fetching availability:', err);
            setTimeSlots([]);
            setDailyAvailabilityStatus(prev => ({ ...prev, [dateFormatted]: 'error' }));
        } finally {
            setLoading(false);
        }
    };

    const shouldDisableDate = (date) => {
        return isBefore(date, startOfDay(new Date()));
    };

    const handleTimeSelect = (time) => {
        setSelectedTime(time);
        setServiceSelectionOpen(true);
    };

    const handleServiceSelected = (serviceId) => {
        setSelectedService(serviceId); 
        setServiceSelectionOpen(false); 
        console.log('Servicio seleccionado (en handleServiceSelected):', serviceId);

        const selectedServiceObj = services.find(s => s.id === serviceId);

        if (!selectedBarberId || !selectedDate || !selectedTime || !selectedServiceObj || !userProfile?.id) {
            console.error("Error: Faltan datos para preparar la confirmación de la cita.");
            setError("Por favor, selecciona todos los detalles de la cita (barbero, fecha, hora, servicio).");
            return;
        }

        const timeToSendToBackend = moment(selectedTime, 'HH:mm').format('HH:mm:ss');
        const fechaCitaFormatted = format(selectedDate, 'yyyy-MM-dd');

        const details = {
            id_cliente: userProfile.id,
            id_barbero: selectedBarberId,
            fecha_cita: fechaCitaFormatted,
            hora_inicio: timeToSendToBackend,
            id_servicio: selectedServiceObj.id,

            barberName: barberoInfo?.nombre || 'Barbero Desconocido',
            fecha: fechaCitaFormatted,
            hora: moment(selectedTime, 'HH:mm').format('h:mm A'), 
            serviceName: selectedServiceObj.nombre || 'Servicio Desconocido',
            serviceDescription: selectedServiceObj.descripcion || 'Sin descripción', 
            servicePrice: selectedServiceObj.precio || 0,
        };

        setConfirmedAppointmentDetails(details); 
        setConfirmationOpen(true); 
    };

    const handleCancelFinalAppointment = () => {
        setConfirmationOpen(false);
        setSelectedTime(null);
        setSelectedService('');
        setConfirmedAppointmentDetails(null);
        setAppointmentSuccess(null);
        setError(null); 
        console.log('DEBUG: selectedService antes de enviar:', selectedService);
    };

    const handleConfirmFinalAppointment = async () => {

        console.log('DEBUG: selectedService ANTES DE ENVIAR (en handleConfirmFinalAppointment):', selectedService);
        console.log('DEBUG: confirmedAppointmentDetails EN handleConfirmFinalAppointment:', confirmedAppointmentDetails); // Esto debería mostrar los datos correctos

        if (!confirmedAppointmentDetails) {
            setError('Error: Los detalles de la cita no están completos para confirmar.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setAppointmentSuccess(null); 

            const { id_cliente, id_barbero, fecha_cita, hora_inicio, id_servicio } = confirmedAppointmentDetails;

            if (!id_cliente || !id_barbero || !fecha_cita || !hora_inicio || !id_servicio) {
                throw new Error('Faltan datos obligatorios en los detalles de la cita para crearla.');
            }

            const appointmentData = {
                id_cliente,
                id_barbero,
                fecha_cita,
                hora_inicio,
                id_servicio, 
            };

            const response = await appointmentService.createAppointment(appointmentData);

            setAppointmentSuccess('¡Cita agendada con éxito!');
            setConfirmationOpen(false); 
            await loadPageData(); 

            setTimeout(() => {
                setSelectedTime(null);
                setSelectedService(''); 
                setConfirmedAppointmentDetails(null);
                setAppointmentSuccess(null);
            }, 1500); 

        } catch (err) {
            console.error('Error creando cita:', err);
            const userMessage = err.response?.data?.message || err.message || 'Error al agendar la cita. Por favor, inténtalo de nuevo.';
            setError(userMessage);
            setLoading(false);
        }
    };
    
    const handleOpenEditMenu = (event) => {
        setEditMenuAnchorEl(event.currentTarget);
    };

    const handleCloseEditMenu = () => {
        setEditMenuAnchorEl(null);
    };

    const handleSelectEditOption = (action) => {
        setInitialActionForScheduleEditDialog(action); 
        setScheduleEditOpen(true); 
    };

    const handleCloseScheduleEdit = () => {
        setScheduleEditOpen(false);
        setInitialActionForScheduleEditDialog(null); 
        if (selectedBarberId) {
            loadPageData();
        }
    };

    const handleCloseServiceSelection = () => {
        setServiceSelectionOpen(false);
        setSelectedService(null); 
    };


    const modifiers = {
        available: (day) => {
            const dateFormatted = format(day, 'yyyy-MM-dd');
            return dailyAvailabilityStatus[dateFormatted] === 'available';
        },
        unavailable: (day) => {
            const dateFormatted = format(day, 'yyyy-MM-dd');
            return dailyAvailabilityStatus[dateFormatted] === 'unavailable';
        },
        occupied: (day) => {
            const dateFormatted = format(day, 'yyyy-MM-dd');
            return dailyAvailabilityStatus[dateFormatted] === 'occupied';
        },
    };

    const modifiersStyles = {
        available: {
            backgroundColor: COLOR_AVAILABLE, // Verde Claro
            color: '#333',
            borderRadius: '50%',
        },
        unavailable: {
            backgroundColor: COLOR_UNAVAILABLE, // Oro
            color: 'black',
            borderRadius: '50%',
        },
        occupied: {
            backgroundColor: COLOR_OCCUPIED, // Gris Claro
            color: '#333',
            borderRadius: '50%',
        },
    };

    if (isLoadingProfile) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', backgroundColor: '#EDE0D4' }}>
                <CircularProgress sx={{ color: '#D4AF37' }} />
                <Typography variant="h6" sx={{ mt: 2, color: '#333333' }}>Cargando perfil de usuario...</Typography>
            </Box>
        );
    }

    if (error && !barberoInfo && selectedBarberId === null) {
        return (
            <Box sx={{ p: 3, textAlign: 'center', backgroundColor: '#EDE0D4', minHeight: '100vh' }}>
                <Alert severity="error">{error}</Alert>
                {error.includes('No se ha podido determinar el barbero') && (
                    <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2, backgroundColor: '#D4AF37', '&:hover': { backgroundColor: '#C39F37' }, color: 'black' }}>
                        Volver al inicio
                    </Button>
                )}
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
                    <IconButton
                        color="inherit"
                        sx={{ color: '#D4AF37' }}
                        onClick={handleOpenProfilePopover}
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
                                    {/* CALENDARIO */}
                                    <DayPicker
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={handleDateChange}
                                        locale={es}
                                        disabled={shouldDisableDate}
                                        showOutsideDays
                                        modifiers={modifiers}
                                        modifiersStyles={modifiersStyles}
                                        styles={{
                                            caption: { color: '#333333', fontWeight: 'bold' },
                                            nav: { color: '#D4AF37' },
                                            button: { color: '#D4AF37' },
                                            day: {
                                                borderRadius: '50%',
                                                '&:hover': {
                                                    backgroundColor: '#eee !important',
                                                },
                                            },
                                            day_selected: {
                                                backgroundColor: '#D4AF37', 
                                                color: 'white',
                                                fontWeight: 'bold',
                                                '&:hover': {
                                                    backgroundColor: '#C39F37', 
                                                },
                                            },
                                            day_today: {
                                                borderColor: '#D4AF37', 
                                                borderWidth: '1px',
                                                borderStyle: 'solid',
                                                color: '#333333',
                                            },
                                            day_disabled: {
                                                color: '#cccccc', 
                                                opacity: 0.6,
                                                cursor: 'not-allowed',
                                            },
                                            head_row: {
                                                color: '#333333',
                                                fontWeight: 'bold',
                                            },
                                        }}
                                    />
                                    {/* Leyenda de colores */}
                                    <Box sx={{ mt: 2, p: 1, borderRadius: 1, border: '1px solid #eee' }}>
                                        <Grid container spacing={1} justifyContent="space-around">
                                            <Grid item sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <Box sx={{ width: 12, height: 12, bgcolor: COLOR_AVAILABLE, borderRadius: '2px' }} />
                                                <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>Disponible</Typography>
                                            </Grid>
                                            <Grid item sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <Box sx={{ width: 12, height: 12, bgcolor: COLOR_UNAVAILABLE, borderRadius: '2px' }} />
                                                <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>No Disponible</Typography>
                                            </Grid>
                                            <Grid item sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <Box sx={{ width: 12, height: 12, bgcolor: COLOR_OCCUPIED, borderRadius: '2px' }} />
                                                <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>Ocupado</Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} sm={6} md={4}>
                                <Paper elevation={3} sx={{ p: 3, borderRadius: 2, backgroundColor: 'white' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="h5" sx={{ textAlign: 'left', fontWeight: 'bold' }}>
                                            Agenda de citas
                                        </Typography>
                                        {(isAdmin || isSuperAdmin) && selectedBarberId && (
                                            <IconButton
                                                color="primary"
                                                onClick={handleOpenEditMenu} 
                                                sx={{ color: '#D4AF37' }}
                                                aria-label="editar horario"
                                                aria-controls={isEditMenuOpen ? 'edit-options-menu' : undefined}
                                                aria-haspopup="true"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        )}
                                    </Box>
                                    <Typography variant="subtitle1" sx={{ mb: 1, color: '#555' }}>
                                        Barbero: {barberoInfo?.nombre || 'Barbero'} {barberoInfo?.apellido || ''}
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 2, color: '#555' }}>
                                        Día seleccionado: {format(selectedDate, 'yyyy-MM-dd')}
                                    </Typography>

                                    {loading && selectedBarberId !== null ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                            <CircularProgress sx={{ color: '#D4AF37' }} />
                                        </Box>
                                    ) : error && !error.includes('Formato de datos inesperado') ? (
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
                                                                backgroundColor: 'white',
                                                                color: 'inherit',
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
                                                                        fontWeight: 'bold',
                                                                        minWidth: '100px',
                                                                        textAlign: 'right',
                                                                        color: '#555',
                                                                    }}
                                                                >
                                                                    {/* Si tiene cita_id, está ocupado por una cita */}
                                                                    {slot.cita_id ? (
                                                                        `OCUPADO`  
                                                                    ) : (
                                                                        `NO DISPONIBLE`
                                                                    )}
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

            <Menu
                id="edit-options-menu"
                anchorEl={editMenuAnchorEl}
                open={isEditMenuOpen}
                onClose={handleCloseEditMenu}
                MenuListProps={{
                    'aria-labelledby': 'edit-button', 
                }}
            >
                <MenuItem onClick={() => handleSelectEditOption('viewAppointments')}>Ver Citas Agendadas</MenuItem>
                <MenuItem onClick={() => handleSelectEditOption('editAvailableSlots')}>Editar Horarios Disponibles</MenuItem>
                <MenuItem onClick={() => handleSelectEditOption('blockTime')}>Bloquear Horario</MenuItem>
            </Menu>

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

            <ScheduleEditDialog
                open={scheduleEditOpen}
                onClose={handleCloseScheduleEdit}
                barberId={selectedBarberId}
                barberName={barberoInfo?.nombre || ''}
                selectedDate={format(selectedDate, 'yyyy-MM-dd')}
                initialAction={initialActionForScheduleEditDialog} 
            />
        </Box>
    );
}

export default AppointmentPage;