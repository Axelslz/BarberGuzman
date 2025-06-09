import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Button, Grid, CircularProgress, Alert,
  Paper, IconButton, TextField, // Importamos TextField para StaticDatePicker
  AppBar, Toolbar, Popover // Aseguramos que AppBar, Toolbar y Popover estén importados
} from '@mui/material';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'; // Usaremos Moment.js
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'; // Usamos DateCalendar para mostrar el mes completo
import moment from 'moment';
import 'moment/locale/es'; // Asegura la localización en español

// Iconos (asegúrate de importar todos los que uses)
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Añadido para el botón de regresar
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

// Tus componentes existentes (importaciones corregidas si están en la carpeta components)
import SideMenu from '../components/SideMenu.jsx';
import UserProfileModal from '../components/UserProfileModal.jsx';
import ServiceSelectionDialog from '../components/ServiceSelectionDialog.jsx';
import AppointmentConfirmationDialog from '../components/AppointmentConfirmationDialog.jsx';

// Contexto de usuario (asumo que lo tienes y lo quieres seguir usando)
import { useUser } from '../contexts/UserContext.jsx';

// Servicios de API (ya implementados y funcionales)
import barberService from '../services/barberService';
import serviceService from '../services/serviceService';
import appointmentService from '../services/appointmentService';

// Ajusta el idioma de moment globalmente
moment.locale('es');

function AppointmentPage() {
  const { barberId } = useParams(); // Obtiene el ID del barbero de la URL
  const navigate = useNavigate();
  // const [searchParams] = useSearchParams(); // No necesitamos searchParams si usamos useParams
  const { userProfile, incrementAppointments, updateUserProfile } = useUser(); // Mantén el contexto de usuario

  // --- Estados para los datos y la lógica de la página (adaptados a la API) ---
  const [selectedDate, setSelectedDate] = useState(moment()); // Fecha seleccionada, inicia hoy (usando moment)
  const [selectedTime, setSelectedTime] = useState(null); // Hora seleccionada (ahora es una string de hora)
  const [selectedService, setSelectedService] = useState(''); // ID del servicio seleccionado (de la API)
  const [barberoInfo, setBarberoInfo] = useState(null); // Información del barbero de la API
  const [services, setServices] = useState([]); // Lista de servicios disponibles de la API
  const [timeSlots, setTimeSlots] = useState([]); // Horarios disponibles de la API
  const [loading, setLoading] = useState(true); // Control de carga
  const [error, setError] = useState(null); // Control de errores

  // --- Estados para la lógica de la AppBar y los popovers (ya los tenías) ---
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const isProfilePopoverOpen = Boolean(profileAnchorEl); // Usa esto para el Popover

  // Estados para los diálogos (adaptados para usar Popover en vez de Dialog si era tu intención)
  const [serviceSelectionOpen, setServiceSelectionOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmedAppointmentDetails, setConfirmedAppointmentDetails] = useState(null);
  const [appointmentSuccess, setAppointmentSuccess] = useState(null); // Para mostrar mensaje de éxito

  // --- Funciones para la AppBar y popovers (las que ya tenías) ---
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleOpenProfilePopover = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleCloseProfilePopover = () => {
    setProfileAnchorEl(null);
  };

  // --- Lógica principal de la página de citas (actualizada para la API) ---

  // Función para cargar la información del barbero, servicios y disponibilidad
  const loadPageData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Cargar información del barbero
      if (barberId) {
        const barberoData = await barberService.getBarberById(barberId);
        setBarberoInfo(barberoData);
      } else {
        setError('No se ha seleccionado un barbero.');
        setLoading(false);
        return;
      }

      // 2. Cargar todos los servicios
      const servicesData = await serviceService.getAllServices();
      setServices(servicesData);

      // 3. Cargar disponibilidad para la fecha inicial y el barbero
      const dateFormatted = selectedDate.format('YYYY-MM-DD');
      const availabilityData = await appointmentService.getBarberAvailability(barberId, dateFormatted);
      setTimeSlots(availabilityData);
      setSelectedTime(null); // Resetear hora al cambiar de fecha/barbero
    } catch (err) {
      setError(`Error al cargar datos: ${err.response?.data?.message || err.message || 'Error desconocido'}`);
      console.error("Error loading appointment page data:", err);
    } finally {
      setLoading(false);
    }
  }, [barberId, selectedDate]); // Dependencias para useCallback

  useEffect(() => {
    loadPageData();
  }, [loadPageData]); // Ejecutar al montar y cuando loadPageData cambie (si sus dependencias cambian)

  // Manejar el cambio de fecha en el calendario
  const handleDateChange = async (newDate) => {
    setSelectedDate(newDate);
    setSelectedTime(null); // Reiniciar la hora seleccionada
    setError(null); // Limpiar errores previos
    setLoading(true);

    try {
      const dateFormatted = newDate.format('YYYY-MM-DD');
      const availabilityData = await appointmentService.getBarberAvailability(barberId, dateFormatted);
      setTimeSlots(availabilityData);
    } catch (err) {
      setError('Error al cargar la disponibilidad para esta fecha.');
      console.error('Error fetching availability:', err);
      setTimeSlots([]); // Limpiar slots si hay error
    } finally {
      setLoading(false);
    }
  };

  // Función para deshabilitar fechas pasadas en el calendario
  const shouldDisableDate = (date) => {
    return date.isBefore(moment(), 'day');
  };

  // Manejar la selección de hora (abre el diálogo de servicio)
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setServiceSelectionOpen(true); // Abre el diálogo para seleccionar el servicio
  };

 const handleServiceSelected = (serviceId) => {
    setSelectedService(serviceId); 
    const serviceDetails = services.find(s => s.id === serviceId); 

    if (!serviceDetails) {
        setError('Servicio seleccionado no encontrado. (ID: ' + serviceId + ')'); // Agrega el ID para depurar
        setServiceSelectionOpen(false);
        return;
    }

    setConfirmedAppointmentDetails({
        barberName: barberoInfo?.nombre || 'Barbero Desconocido',
        date: selectedDate.format('DD [de] MMMM [de] YYYY'),
        time: selectedTime,
        serviceName: serviceDetails.nombre,
        price: serviceDetails.precio,
    });

    // Cierra el primero y luego abre el segundo con un pequeño retraso
    setServiceSelectionOpen(false);
    setTimeout(() => {
        setConfirmationOpen(true);
    }, 50); // Un pequeño retraso en milisegundos
};

  // Cerrar el diálogo de selección de servicio
  const handleCloseServiceSelection = () => {
    setServiceSelectionOpen(false);
    // No reseteamos selectedTime aquí, porque lo necesitamos para el diálogo de confirmación si el usuario vuelve.
    // Solo se resetea si el usuario cancela la cita final o la confirma.
  };

  // Cancelar la cita (desde el diálogo de confirmación)
  const handleCancelFinalAppointment = () => {
    setConfirmationOpen(false);
    setSelectedTime(null); // Reinicia la hora y servicio seleccionados
    setSelectedService('');
    setConfirmedAppointmentDetails(null);
    setAppointmentSuccess(null); // Limpia cualquier mensaje de éxito
  };

  // Enviar la cita al backend desde el diálogo de confirmación final
  const handleConfirmFinalAppointment = async () => {
    setError(null);
    setLoading(true); // Mostrar loading mientras se agenda
    setAppointmentSuccess(null); // Limpiar éxito previo
    const timeToSendToBackend = moment(selectedTime, 'h A').format('HH:mm');

    try {
      const appointmentData = {
        id_barbero: parseInt(barberId),
        fecha_cita: selectedDate.format('YYYY-MM-DD'),
        hora_inicio: timeToSendToBackend,
        id_servicio: selectedService,
        // Aquí podrías añadir id_cliente si lo obtienes del contexto de usuario, por ejemplo:
        // id_cliente: userProfile?.id_cliente, // Suponiendo que userProfile tenga un id_cliente
      };
      await appointmentService.createAppointment(appointmentData);
      setAppointmentSuccess('¡Cita agendada exitosamente!');
      incrementAppointments(); // Llama a tu función del contexto de usuario

      // Recargar la disponibilidad para la fecha actual para reflejar la nueva cita ocupada
      await handleDateChange(selectedDate); // Vuelve a cargar la disponibilidad
      setConfirmedAppointmentDetails(null); // Limpiar detalles
      setSelectedTime(null); // Limpiar la hora seleccionada
      setSelectedService(''); // Limpiar el servicio seleccionado

      // Opcional: Cierra el diálogo de confirmación después de un breve retraso si fue exitoso
      setTimeout(() => setConfirmationOpen(false), 2000);

    } catch (err) {
      setAppointmentSuccess(null);
      setError(err.response?.data?.message || err.message || 'Hubo un error al agendar tu cita.');
      console.error('Error creating appointment:', err);
    } finally {
      setLoading(false); // Ocultar loading
      // El diálogo de confirmación se mantiene abierto para mostrar el mensaje de éxito/error hasta que se cierre automáticamente o manualmente
    }
  };


  // Renderizado de carga y error
  if (loading && !barberoInfo) { // Solo mostrar pantalla de carga completa si no hay info del barbero
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Cargando información del barbero y servicios...</Typography>
      </Box>
    );
  }

  if (error && !barberoInfo) { // Solo mostrar pantalla de error completa si no hay info del barbero
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" onClick={() => navigate('/seleccionar-barbero')} sx={{ mt: 2 }}>
          Volver a Seleccionar Barbero
        </Button>
        <Button variant="outlined" onClick={loadPageData} sx={{ mt: 2, ml: 1 }}>
          Reintentar Carga
        </Button>
      </Box>
    );
  }

  // Si ya tenemos la información del barbero, pero la carga de slots falló, se muestra el error dentro del componente
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#F5F5F5' }}>
      <AppBar position="static" sx={{ backgroundColor: '#D4AF37', boxShadow: 'none' }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="back"
            sx={{ mr: 2, color: 'black' }}
            onClick={() => navigate(-1)} // Para volver a la página anterior
          >
            <ArrowBackIcon />
          </IconButton>
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

      <Box sx={{ flexGrow: 1, p: 3, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', mt: 4 }}>
        <Grid container spacing={4} justifyContent="center">
          {/* Columna del Calendario */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2, backgroundColor: 'white' }}>
              <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
                Elige el día
              </Typography>
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <DateCalendar // Usamos DateCalendar como en la versión anterior
                  value={selectedDate}
                  onChange={(newValue) => handleDateChange(newValue)}
                  shouldDisableDate={shouldDisableDate}
                  views={['day']} // Muestra solo la vista de días
                  disablePast // Deshabilita días pasados (equivalente a shouldDisableDate en este contexto simple)
                  sx={{
                    '& .MuiPickersDay-root.Mui-selected': {
                      backgroundColor: '#D4AF37', // Color dorado seleccionado (lo volví a tu color)
                      color: 'white',
                    },
                    '& .MuiPickersDay-root.Mui-disabled': {
                      color: '#B0B0B0',
                    },
                    '& .MuiPickersDay-root.Mui-selected:hover': {
                      backgroundColor: '#C59A00', // Dorado más oscuro al pasar el ratón
                    },
                    '& .MuiCalendarPicker-root': {
                      width: '100%',
                      height: 'auto',
                    },
                  }}
                />
              </LocalizationProvider>
            </Paper>
          </Grid>

          {/* Columna de Horarios de Cita y Selección de Servicio */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, backgroundColor: '#E0E0E0' }}>
              <Typography variant="h5" sx={{ mb: 1, textAlign: 'center', fontWeight: 'bold', color: 'black' }}>
                Agendar cita
              </Typography>
              {barberoInfo && (
                <Typography variant="subtitle1" sx={{ mb: 3, textAlign: 'center', color: 'black' }}>
                  con: {barberoInfo.nombre} {barberoInfo.apellido}
                </Typography>
              )}
              <Typography variant="subtitle1" sx={{ mb: 3, textAlign: 'center', color: 'black' }}>
                Día seleccionado: {selectedDate.format('dddd, D [de] MMMM [de] YYYY')}
              </Typography>

              {/* Lista de Horarios Disponibles */}
              <Typography variant="h6" sx={{ mt: 3, mb: 2, textAlign: 'center' }}>
                Horarios Disponibles
              </Typography>
              {loading && !barberoInfo && ( // Mostrar CircularProgress solo si no se ha cargado el barbero
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                  <CircularProgress size={30} />
                </Box>
              )}
              {error && barberoInfo && ( // Mostrar error solo si hay info del barbero pero falló la carga de slots
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
              )}
              {!loading && !error && timeSlots.length === 0 && (
                  <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center' }}>
                    No hay horarios disponibles para este día o barbero.
                  </Typography>
              )}
              <Box sx={{ maxHeight: 250, overflowY: 'auto', mb: 3 }}>
                {timeSlots.length > 0 && timeSlots.map((slot) => (
                  <Box
                    key={slot.hora_inicio} // Usamos hora_inicio como clave
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1.5,
                      p: 1.5,
                      backgroundColor: slot.disponible ? '#F0F0F0' : '#CCCCCC', // Usa slot.disponible
                      borderRadius: 1,
                      boxShadow: 1,
                    }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {slot.hora_inicio}
                    </Typography>
                    {slot.disponible ? (
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: '#4CAF50', // Tu color original para agendar
                          '&:hover': { backgroundColor: '#388E3C' },
                          color: 'white',
                          minWidth: 'auto',
                          padding: '6px 12px',
                        }}
                        onClick={() => handleTimeSelect(slot.hora_inicio)} // Llama a handleTimeSelect
                      >
                        Agendar
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        disabled
                        sx={{
                          backgroundColor: '#757575',
                          color: 'white',
                          minWidth: 'auto',
                          padding: '6px 12px',
                        }}
                      >
                        Ocupado
                      </Button>
                    )}
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Popover del perfil de usuario */}
      <UserProfileModal
        isOpen={isProfilePopoverOpen}
        onClose={handleCloseProfilePopover}
        anchorEl={profileAnchorEl}
        userProfile={userProfile}
        updateUserProfile={updateUserProfile}
      />

      {/* DIÁLOGO DE SELECCIÓN DE SERVICIOS */}
      <ServiceSelectionDialog
        isOpen={serviceSelectionOpen}
        onClose={handleCloseServiceSelection}
        services={services} // Ahora viene de la API
        onSelectService={handleServiceSelected}
      />

      {/* DIÁLOGO DE CONFIRMACIÓN DE CITA */}
      {confirmedAppointmentDetails && (
        <AppointmentConfirmationDialog
          isOpen={confirmationOpen}
          onClose={handleCancelFinalAppointment} // Ahora llama a handleCancelFinalAppointment
          onConfirm={handleConfirmFinalAppointment} // Ahora llama a handleConfirmFinalAppointment
          appointmentDetails={confirmedAppointmentDetails}
        />
      )}

      {/* Alerta de éxito/error al agendar la cita */}
      {appointmentSuccess && (
          <Alert
              severity="success"
              sx={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 1300 }}
              onClose={() => setAppointmentSuccess(null)}
          >
              {appointmentSuccess}
          </Alert>
      )}
      {error && !loading && confirmedAppointmentDetails && ( // Mostrar error si hay y no está cargando y es para la confirmación
          <Alert
              severity="error"
              sx={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 1300 }}
              onClose={() => setError(null)}
          >
              {error}
          </Alert>
      )}

    </Box>
  );
}

export default AppointmentPage;