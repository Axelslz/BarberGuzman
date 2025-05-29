import React, { useState } from 'react';
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Paper,
  Button,
  Grid,
  TextField,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SideMenu from '../components/SideMenu.jsx';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { format, isSameDay, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSearchParams } from 'react-router-dom';
import UserProfileModal from '../components/UserProfileModal.jsx';
import { useUser } from '../contexts/UserContext.jsx';

import ServiceSelectionDialog from '../components/ServiceSelectionDialog.jsx';
import AppointmentConfirmationDialog from '../components/AppointmentConfirmationDialog.jsx';


function AppointmentPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchParams] = useSearchParams();
  const selectedBarber = searchParams.get('barber') || 'Barber';
  const { userProfile, incrementAppointments, updateUserProfile } = useUser();

  const [availableTimes, setAvailableTimes] = useState([
    { time: '9:00am', available: true },
    { time: '10:00am', available: true },
    { time: '11:00am', available: true },
    { time: '12:00pm', available: false },
    { time: '1:00pm', available: true },
    { time: '2:00pm', available: true },
    { time: '3:00pm', available: true },
    { time: '4:00pm', available: true },
    { time: '5:00pm', available: false },
  ]);

  const [serviceSelectionOpen, setServiceSelectionOpen] = useState(false);
  const [timeSlotToBook, setTimeSlotToBook] = useState(null); // Guarda la hora seleccionada (ej. '9:00am')

  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmedAppointmentDetails, setConfirmedAppointmentDetails] = useState(null);

  const servicesAndPackages = [
    { id: 'corte-cabello', type: 'individual', name: 'Corte de cabello', price: 100, description: 'Corte de cabello' },
    { id: 'corte-barba', type: 'individual', name: 'Corte de barba', price: 100, description: 'Corte de barba' },
    { id: 'exfoliacion', type: 'individual', name: 'Exfoliación', price: 100, description: 'Exfoliación' },
    { id: 'paquete-basico', type: 'paquete', name: 'Paquete Básico', price: 150, description: 'Corte de cabello y barba' },
    { id: 'paquete-beck', type: 'paquete', name: 'Paquete Beck', price: 170, description: 'Corte de cabello y barba con vapor' },
    { id: 'paquete-invulnerable', type: 'paquete', name: 'Paquete Invulnerable', price: 180, description: 'Corte de cabello o barba + exfoliación' },
    { id: 'paquete-guzman-deluxe', type: 'paquete', name: 'Paquete Guzmán de Luxe', price: 250, description: 'Corte de cabello, barba y exfoliación' },
  ];

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleOpenProfilePopover = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };
  const handleCloseProfilePopover = () => {
    setProfileAnchorEl(null);
  };
  const isProfilePopoverOpen = Boolean(profileAnchorEl);

  const shouldDisableDate = (date) => {
    return isPast(date) && !isSameDay(date, new Date());
  };

  const handlePreAgendaClick = (timeSlot) => {
    console.log("Pre-Agenda: Hora seleccionada para booking:", timeSlot);
    setTimeSlotToBook(timeSlot); // GUARDA LA HORA AQUÍ
    setServiceSelectionOpen(true);
  };

  const handleServiceSelected = (selectedServiceId) => {
    const service = servicesAndPackages.find(s => s.id === selectedServiceId);
    if (!service) {
      console.error('Error: Servicio o paquete no encontrado para ID:', selectedServiceId);
      alert('Error: Servicio o paquete no encontrado.');
      setServiceSelectionOpen(false);
      // No limpiar timeSlotToBook aquí, porque es un error de selección de servicio, no de cancelación de cita.
      return;
    }

    const details = {
      barber: selectedBarber,
      date: format(selectedDate, 'PPP', { locale: es }),
      time: timeSlotToBook, // Usamos la hora guardada
      serviceName: service.name,
      serviceDescription: service.description,
      servicePrice: service.price,
    };

    setConfirmedAppointmentDetails(details);
    setConfirmationOpen(true);
    setServiceSelectionOpen(false); // Cierra el diálogo de selección de servicios
  };

  const handleConfirmFinalAppointment = () => {
    console.log('--- Intentando confirmar cita ---');
    console.log('Hora a marcar como ocupada (timeSlotToBook):', timeSlotToBook);

    if (timeSlotToBook) {
      setAvailableTimes(prevTimes => {
        const newTimes = prevTimes.map(slot => {
          console.log(`Comparando: '${slot.time}' con '${timeSlotToBook}'`);
          if (slot.time === timeSlotToBook) {
            console.log(`¡Coincidencia encontrada para ${timeSlotToBook}! Marcando como no disponible.`);
            return { ...slot, available: false }; // Crea un nuevo objeto para asegurar la inmutabilidad
          }
          return slot;
        });
        console.log('Estado de availableTimes DESPUÉS de la actualización:', newTimes);
        return newTimes;
      });
    } else {
      console.warn("timeSlotToBook es null. No se pudo marcar la hora como ocupada.");
    }

    incrementAppointments();
    alert("¡Cita agendada y corte registrado!");

    setConfirmationOpen(false);
    setTimeSlotToBook(null); // ¡LIMPIAR timeSlotToBook SOLO DESPUÉS DE LA CONFIRMACIÓN FINAL EXITOSA!
    setConfirmedAppointmentDetails(null);
  };

  const handleCancelFinalAppointment = () => {
    alert("Cita cancelada.");
    setConfirmationOpen(false);
    setTimeSlotToBook(null); // ¡LIMPIAR timeSlotToBook AQUÍ, SI SE CANCELA LA CITA!
    setConfirmedAppointmentDetails(null);
  };

  // ***** CAMBIO CLAVE AQUÍ: YA NO RESETEA timeSlotToBook *****
  const handleCloseServiceSelection = () => {
    setServiceSelectionOpen(false);
    // REMOVIDO: setTimeSlotToBook(null);
    // No limpiamos timeSlotToBook aquí, porque la cita aún no se ha cancelado o confirmado.
    // Necesitamos timeSlotToBook para pasarlo al diálogo de confirmación.
  }


  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#F5F5F5' }}>
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

      <Box sx={{ flexGrow: 1, p: 3, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', mt: 4 }}>
        <Grid container spacing={4} justifyContent="center">
          {/* Columna del Calendario */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2, backgroundColor: 'white' }}>
              <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
                Elige el día
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <StaticDatePicker
                  displayStaticWrapperAs="desktop"
                  value={selectedDate}
                  onChange={(newValue) => {
                    setSelectedDate(newValue);
                  }}
                  shouldDisableDate={shouldDisableDate}
                  renderInput={(params) => <TextField {...params} />}
                  sx={{
                    '& .MuiPickersDay-root.Mui-selected': {
                      backgroundColor: '#64B5F6',
                      color: 'white',
                    },
                    '& .MuiPickersDay-root.Mui-disabled': {
                      color: '#B0B0B0',
                    },
                    '& .MuiPickersDay-root.Mui-selected:hover': {
                      backgroundColor: '#2196F3',
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

          {/* Columna de Horarios de Cita */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2, backgroundColor: '#E0E0E0' }}>
              <Typography variant="h5" sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold', color: 'black' }}>
                Agendar cita
              </Typography>
              <Typography variant="subtitle1" sx={{ mb: 3, textAlign: 'center', color: 'black' }}>
                con: {selectedBarber}
              </Typography>
              <Typography variant="subtitle1" sx={{ mb: 3, textAlign: 'center', color: 'black' }}>
                Día seleccionado: {format(selectedDate, 'yyyy-MM-dd')}
              </Typography>

              <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                {availableTimes.map((slot) => (
                  <Box
                    key={slot.time}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1.5,
                      p: 1.5,
                      backgroundColor: slot.available ? '#F0F0F0' : '#CCCCCC',
                      borderRadius: 1,
                      boxShadow: 1,
                    }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {slot.time}
                    </Typography>
                    {slot.available ? (
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: '#4CAF50',
                          '&:hover': { backgroundColor: '#388E3C' },
                          color: 'white',
                          minWidth: 'auto',
                          padding: '6px 12px',
                        }}
                        onClick={() => handlePreAgendaClick(slot.time)}
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
        services={servicesAndPackages}
        onSelectService={handleServiceSelected}
      />

      {/* DIÁLOGO DE CONFIRMACIÓN DE CITA */}
      {confirmedAppointmentDetails && (
        <AppointmentConfirmationDialog
          isOpen={confirmationOpen}
          onClose={handleCancelFinalAppointment}
          onConfirm={handleConfirmFinalAppointment}
          appointmentDetails={confirmedAppointmentDetails}
        />
      )}

    </Box>
  );
}

export default AppointmentPage;