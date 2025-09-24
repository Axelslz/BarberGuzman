import React, { useState, useEffect, useCallback } from 'react';
import {CalendarDays} from 'lucide-react'; 
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Grid, CircularProgress, Alert, Paper, IconButton, AppBar, Toolbar, Stack, Menu, MenuItem, TextField } from '@mui/material';
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

const COLOR_AVAILABLE = '#10B981'; 
const COLOR_UNAVAILABLE = '#F59E0B'; 
const COLOR_OCCUPIED = '#6B7280';   

function AppointmentPage() {
    const { barberId: urlBarberId } = useParams();
    const navigate = useNavigate();
    const { userProfile, isAdmin, isSuperAdmin, isLoadingProfile, incrementAppointments, logout, updateUserProfile } = useUser();

    const [selectedBarberId, setSelectedBarberId] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedService, setSelectedService] = useState('');
    const [clientName, setClientName] = useState(''); 
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

        let barberIdToSet = null;

        if (isAdmin && userProfile?.id_barbero) {
            barberIdToSet = userProfile.id_barbero;
        } else if (isSuperAdmin) {
            const numericUrlId = parseInt(urlBarberId);
            if (!isNaN(numericUrlId)) {
                barberIdToSet = numericUrlId;
            } else if (userProfile?.id_barbero) {
                barberIdToSet = userProfile.id_barbero;
            }
        } else if (urlBarberId && urlBarberId !== 'undefined') { 
            const numericUrlId = parseInt(urlBarberId);
            if (!isNaN(numericUrlId)) {
                barberIdToSet = numericUrlId;
            }
        }

        if (barberIdToSet !== null) {
            setSelectedBarberId(barberIdToSet);
        } else if (!isLoadingProfile) { 
            setError('No se pudo determinar un ID de barbero válido. Por favor, verifica la URL o tu perfil.');
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
            nombre_cliente: (isAdmin || isSuperAdmin) ? clientName : null,

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
        if (!confirmedAppointmentDetails) {
            setError('Error: Los detalles de la cita no están completos para confirmar.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setAppointmentSuccess(null); 

            const appointmentData = { ...confirmedAppointmentDetails };

            if ((isAdmin || isSuperAdmin) && clientName.trim() !== '') {
                appointmentData.nombre_cliente = clientName.trim();
            }

            const response = await appointmentService.createAppointment(appointmentData);

            setAppointmentSuccess('¡Cita agendada con éxito!');
            setConfirmationOpen(false); 
            await loadPageData(); 

            setTimeout(() => {
                setSelectedTime(null);
                setSelectedService(''); 
                setConfirmedAppointmentDetails(null);
                setAppointmentSuccess(null);
                setClientName(''); 
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
            backgroundColor: COLOR_AVAILABLE,
            color: 'white',
            borderRadius: '50%',
            fontWeight: 'bold',
        },
        unavailable: {
            backgroundColor: COLOR_UNAVAILABLE,
            color: 'white',
            borderRadius: '50%',
            fontWeight: 'bold',
        },
        occupied: {
            backgroundColor: COLOR_OCCUPIED,
            color: 'white',
            borderRadius: '50%',
            fontWeight: 'bold',
        },
    };

    if (isLoadingProfile) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
                <div className="text-center">
                    <CircularProgress sx={{ color: '#D4AF37' }} />
                    <Typography variant="h6" sx={{ mt: 2, color: '#333333' }}>Cargando perfil de usuario...</Typography>
                </div>
            </div>
        );
    }

    if (error && !barberoInfo && selectedBarberId === null) {
        return (
            <div className="p-6 text-center bg-gradient-to-br from-amber-50 to-orange-100 min-h-screen">
                <Alert severity="error">{error}</Alert>
                {error.includes('No se ha podido determinar el barbero') && (
                    <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2, backgroundColor: '#D4AF37', '&:hover': { backgroundColor: '#C39F37' }, color: 'black' }}>
                        Volver al inicio
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
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

            <div className="flex-1 p-6 flex justify-center items-start mt-4">
                <div className="w-full max-w-7xl">
                    <Grid container spacing={8} justifyContent="center">
                        {selectedBarberId !== null && (
                            <>
                                {/* Sección del Calendario - Mejorada */}
                                <Grid item xs={12} md={5} className='content-center'>
                                    <div className="bg-white rounded-3xl shadow-2xl p-8 border border-amber-200 hover:shadow-3xl transition-all duration-300">
                                        <div className="text-center mb-6">
                                            <h2 className="text-3xl font-bold text-slate-800 mb-2">
                                                📅 Selecciona tu día
                                            </h2>
                                            <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-orange-400 mx-auto rounded-full"></div>
                                        </div>
                                        
                                        {/* Contenedor del calendario con bordes redondeados */}
                                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100">
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
                                                    caption: { 
                                                        color: '#1F2937', 
                                                        fontWeight: 'bold',
                                                        fontSize: '1.2rem',
                                                        marginBottom: '1rem'
                                                    },
                                                    nav: { color: '#D4AF37' },
                                                    button: { 
                                                        color: '#D4AF37',
                                                        fontWeight: '600'
                                                    },
                                                    day: {
                                                        borderRadius: '50%',
                                                        fontWeight: '500',
                                                        '&:hover': {
                                                            backgroundColor: '#FEF3C7 !important',
                                                            transform: 'scale(1.05)',
                                                            transition: 'all 0.2s ease'
                                                        },
                                                    },
                                                    day_selected: {
                                                        backgroundColor: '#D4AF37 !important', 
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        transform: 'scale(1.1)',
                                                        boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)',
                                                        '&:hover': {
                                                            backgroundColor: '#C39F37 !important', 
                                                        },
                                                    },
                                                    day_today: {
                                                        borderColor: '#D4AF37', 
                                                        borderWidth: '2px',
                                                        borderStyle: 'solid',
                                                        color: '#1F2937',
                                                        fontWeight: 'bold'
                                                    },
                                                    day_disabled: {
                                                        color: '#D1D5DB', 
                                                        opacity: 0.4,
                                                        cursor: 'not-allowed',
                                                    },
                                                    head_row: {
                                                        color: '#374151',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.9rem'
                                                    },
                                                }}
                                            />
                                        </div>
                                        
                                        {/* Leyenda mejorada */}
                                        <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                                            <h4 className="text-sm font-semibold text-gray-600 mb-3 text-center">
                                                Estado de disponibilidad
                                            </h4>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="flex items-center justify-center gap-2 p-2 bg-white rounded-lg shadow-sm">
                                                    <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-lg"></div>
                                                    <span className="text-xs font-medium text-gray-700">Disponible</span>
                                                </div>
                                                <div className="flex items-center justify-center gap-2 p-2 bg-white rounded-lg shadow-sm">
                                                    <div className="w-4 h-4 bg-amber-500 rounded-full shadow-lg"></div>
                                                    <span className="text-xs font-medium text-gray-700">Bloqueado</span>
                                                </div>
                                                <div className="flex items-center justify-center gap-2 p-2 bg-white rounded-lg shadow-sm">
                                                    <div className="w-4 h-4 bg-gray-500 rounded-full shadow-lg"></div>
                                                    <span className="text-xs font-medium text-gray-700">Ocupado</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Grid>

                                {/* Sección de Agenda - Completamente Rediseñada */}
                                <Grid item xs={12} md={7} className="items-stretch content-center">
                                    <div className="bg-white rounded-3xl shadow-2xl p-8 border border-amber-200 hover:shadow-3xl transition-all duration-300">
                                        {/* Header de la agenda */}
                                        <div className="flex justify-between items-center mb-6">
                                            <div className='text-center'>
                                                <h2 className="text-3xl font-bold text-slate-800 mb-1">
                                                    ⏰ Agenda de citas
                                                </h2>
                                                <div className="w-32 h-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full mx-auto"></div>
                                            </div>
                                            {(isAdmin || isSuperAdmin) && selectedBarberId && (
                                                <button
                                                    onClick={handleOpenEditMenu}
                                                    className="p-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-full shadow-lg hover:from-amber-500 hover:to-amber-600 transform hover:scale-110 transition-all duration-200"
                                                    aria-label="editar horario"
                                                >
                                                    <EditIcon />
                                                </button>
                                            )}
                                        </div>

                                        {/* Información del barbero y fecha */}
                                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 mb-6 border border-amber-100">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center">
                                                        <span className="text-white text-xl font-bold">
                                                            ✂️
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-bold text-gray-800">
                                                            {barberoInfo?.nombre || 'Barbero'} {barberoInfo?.apellido || ''}
                                                        </p>
                                                        <p className="text-sm text-gray-600 font-medium">
                                                            Barbero Profesional
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-gray-600">Fecha seleccionada</p>
                                                    <p className="text-lg font-bold text-amber-600">
                                                        {format(selectedDate, 'dd/MM/yyyy')}
                                                    </p>
                                                </div>
                                            </div>
                                            {(isAdmin || isSuperAdmin) && (
                                                        <div className="mt-4">
                                                            <TextField
                                                                fullWidth
                                                                label="Nombre del cliente"
                                                                variant="outlined"
                                                                value={clientName}
                                                                onChange={(e) => setClientName(e.target.value)}
                                                                sx={{
                                                                    '& .MuiOutlinedInput-root': {
                                                                        '& fieldset': {
                                                                            borderColor: '#D4AF37',
                                                                        },
                                                                        '&:hover fieldset': {
                                                                            borderColor: '#C39F37',
                                                                        },
                                                                        '&.Mui-focused fieldset': {
                                                                            borderColor: '#D4AF37',
                                                                        },
                                                                    },
                                                                    '& .MuiInputLabel-root': {
                                                                        color: '#D4AF37',
                                                                    },
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                        </div>

                                        {/* Contenedor de horarios */}
                                        {loading && selectedBarberId !== null ? (
                                            <div className="flex flex-col justify-center items-center py-12">
                                                <CircularProgress sx={{ color: '#D4AF37', marginBottom: 2 }} />
                                                <p className="text-gray-600 font-medium">Cargando horarios disponibles...</p>
                                            </div>
                                        ) : error && !error.includes('Formato de datos inesperado') ? (
                                            <div className="p-6 bg-red-50 border border-red-200 rounded-2xl">
                                                <Alert severity="warning">{error}</Alert>
                                            </div>
                                        ) : (
                                            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                                {timeSlots.length > 0 ? (
                                                    timeSlots.map((slot, index) => (
                                                        <div
                                                            key={slot.hora_inicio_24h}
                                                            className={`flex justify-between items-center p-4 rounded-2xl border-2 transition-all duration-300 ${
                                                                slot.disponible
                                                                    ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 hover:border-emerald-300 hover:shadow-lg transform hover:scale-[1.02]'
                                                                    : slot.cita_id
                                                                    ? 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 opacity-75'
                                                                    : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 opacity-75'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className={`w-3 h-3 rounded-full ${
                                                                    slot.disponible 
                                                                        ? 'bg-emerald-500 shadow-lg shadow-emerald-200'
                                                                        : slot.cita_id 
                                                                        ? 'bg-gray-500 shadow-lg shadow-gray-200'
                                                                        : 'bg-amber-500 shadow-lg shadow-amber-200'
                                                                }`}></div>
                                                                <div>
                                                                    <p className="text-xl font-bold text-gray-800">
                                                                        {moment(slot.hora_inicio_24h, 'HH:mm').format('h:mm A')}
                                                                    </p>
                                                                    <p className={`text-sm font-medium ${
                                                                        slot.disponible 
                                                                            ? 'text-emerald-600'
                                                                            : slot.cita_id 
                                                                            ? 'text-gray-500'
                                                                            : 'text-amber-600'
                                                                    }`}>
                                                                        {slot.disponible 
                                                                            ? 'Horario disponible'
                                                                            : slot.cita_id 
                                                                            ? 'Ocupado por cita'
                                                                            : 'Horario bloqueado'
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            
                                                            {slot.disponible ? (
                                                                <button
                                                                    onClick={() => handleTimeSelect(slot.hora_inicio_24h)}
                                                                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-xl shadow-lg hover:from-emerald-600 hover:to-green-600 transform hover:scale-105 transition-all duration-200 hover:shadow-xl"
                                                                >
                                                                    AGENDAR
                                                                </button>
                                                            ) : (
                                                                <div className={`px-6 py-3 rounded-xl font-bold text-sm ${
                                                                    slot.cita_id 
                                                                        ? 'bg-gray-200 text-gray-600'
                                                                        : 'bg-amber-200 text-amber-700'
                                                                }`}>
                                                                    {slot.cita_id ? ' OCUPADO' : ' BLOQUEADO'}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-12">
                                                        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                                            <span className="text-4xl">📅</span>
                                                        </div>
                                                        <h3 className="text-xl font-bold text-gray-700 mb-2">
                                                            No hay horarios disponibles
                                                        </h3>
                                                        <p className="text-gray-500 max-w-md mx-auto">
                                                            No hay horarios disponibles para esta fecha. 
                                                            Selecciona otro día del calendario.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Mensaje de éxito */}
                                        {appointmentSuccess && (
                                            <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                                                        <span className="text-white text-lg">✓</span>
                                                    </div>
                                                    <p className="text-emerald-700 font-semibold">{appointmentSuccess}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Grid>
                            </>
                        )}
                    </Grid>
                </div>
            </div>

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
        </div>
    );
}

export default AppointmentPage;