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
  TextField, // Necesario para renderInput en StaticDatePicker
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SideMenu from '../components/SideMenu.jsx';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { format, isSameDay, isPast } from 'date-fns';
import { es } from 'date-fns/locale'; // Para que el calendario esté en español
import { useSearchParams } from 'react-router-dom';
import UserProfileModal from '../components/UserProfileModal.jsx'; // Importa el componente del modal/popover
import { useUser } from '../contexts/UserContext.jsx'; // Importa el hook del contexto de usuario

function AppointmentPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  // Estado para el ancla del Popover del perfil de usuario
  const [anchorEl, setAnchorEl] = useState(null); 
  const [selectedDate, setSelectedDate] = useState(new Date()); 
  const [searchParams] = useSearchParams();
  const selectedBarber = searchParams.get('barber') || 'Barber'; 
  // Obtener userProfile, incrementAppointments y updateUserProfile del contexto de usuario
  const { userProfile, incrementAppointments, updateUserProfile } = useUser(); // <--- CORRECCIÓN AQUÍ

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Función para abrir el Popover del perfil, estableciendo el elemento que lo abre como ancla
  const handleOpenProfilePopover = (event) => { // <--- CAMBIO: RECIBE EL EVENTO
    setAnchorEl(event.currentTarget);
  };

  // Función para cerrar el Popover del perfil
  const handleCloseProfilePopover = () => {
    setAnchorEl(null);
  };

  // Booleano para controlar la visibilidad del Popover
  const isProfilePopoverOpen = Boolean(anchorEl); // <--- CAMBIO: AHORA DEPENDE DE anchorEl

  // Horarios de ejemplo.
  const allAvailableTimes = [
    { time: '9:00am', available: true },
    { time: '10:00am', available: true },
    { time: '11:00am', available: true },
    { time: '12:00pm', available: false }, 
    { time: '1:00pm', available: true },
    { time: '2:00pm', available: true },
    { time: '3:00pm', available: true },
    { time: '4:00pm', available: true },
    { time: '5:00pm', available: false },
  ];

  // Simulación de lógica para deshabilitar fechas pasadas o días específicos
  const shouldDisableDate = (date) => {
    return isPast(date) && !isSameDay(date, new Date()); 
  };

  const handleAgendaClick = (time) => {
    // Alerta de confirmación
    const confirmBooking = window.confirm(
      `¿Confirmar cita con ${selectedBarber} el ${format(selectedDate, 'PPP', { locale: es })} a las ${time}?`
    );

    if (confirmBooking) {
      // Aquí iría la lógica para enviar la cita a tu backend
      console.log('Cita confirmada y enviada al backend.');
      
      // Simula el registro del corte después de una cita exitosa
      // En una aplicación real, esto se haría después de una confirmación del backend
      incrementAppointments(); // Incrementa el contador de cortes del usuario
      alert("¡Cita agendada y corte registrado!");
    } else {
      alert("Cita cancelada.");
    }
  };

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
          {/* Ícono de perfil de usuario que abre el Popover */}
          <IconButton 
            color="inherit" 
            sx={{ color: 'black' }} 
            onClick={handleOpenProfilePopover} // <--- CAMBIO: Llama a la nueva función para el popover
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
                {allAvailableTimes.map((slot) => (
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
                        onClick={() => handleAgendaClick(slot.time)}
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

      {/* Renderiza el Popover de perfil de usuario */}
      <UserProfileModal
        isOpen={isProfilePopoverOpen} // Pasa el estado de apertura del popover
        onClose={handleCloseProfilePopover} // Pasa la función para cerrar el popover
        anchorEl={anchorEl} // Pasa el elemento ancla para posicionar el popover
        userProfile={userProfile} // Pasa los datos del perfil del usuario
        updateUserProfile={updateUserProfile} // Pasa la función para actualizar el perfil
      />
    </Box>
  );
}

export default AppointmentPage;