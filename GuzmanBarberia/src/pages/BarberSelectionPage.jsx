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
  
  return (
    <Popover
      id="profile-popover"
      open={isOpen}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <Box sx={{ p: 2, minWidth: 200 }}>
        <Typography variant="h6" gutterBottom>{currentUser.name}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{currentUser.email}</Typography>
        <Divider sx={{ my: 1 }} />
        <List dense>
          <ListItem button>
            <ListItemText primary="Mi Perfil" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Configuración" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Cerrar Sesión" />
          </ListItem>
        </List>
      </Box>
    </Popover>
  );
};
// --- FIN DE COMPONENTES BÁSICOS ---


function BarberSelectionPage() {
  const [barberos, setBarberos] = useState([]); // Usamos 'barberos' (plural)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Estados para el menú lateral
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Estados para el popover del perfil de usuario
  const [anchorEl, setAnchorEl] = useState(null);
  const [isProfilePopoverOpen, setIsProfilePopoverOpen] = useState(false);
  // Simulación de datos de usuario (en un caso real, vendrían de un UserContext)
  const [userProfile, setUserProfile] = useState({
    name: 'Nombre de Usuario',
    email: 'usuario@ejemplo.com',
  });
  const updateUserProfile = (newProfileData) => {
    setUserProfile(prev => ({ ...prev, ...newProfileData }));
  };

  const handleOpenProfilePopover = (event) => {
    setAnchorEl(event.currentTarget);
    setIsProfilePopoverOpen(true);
  };

  const handleCloseProfilePopover = () => {
    setAnchorEl(null);
    setIsProfilePopoverOpen(false);
  };


  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const data = await barberService.getAllBarbers();
        setBarberos(data);
      } catch (err) {
        setError('Error al cargar la lista de barberos. Inténtalo de nuevo más tarde.');
        console.error('Error fetching barbers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBarbers();
  }, []);

  const handleSelectBarber = (barberId) => {
    navigate(`/agendar-cita/${barberId}`); // Redirige a la página de agendar con el ID del barbero
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Cargando barberos...</Typography>
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
            onClick={toggleMenu} // Llama a la función toggleMenu definida en este componente
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
            onClick={handleOpenProfilePopover} // Llama a la función para abrir el popover
            aria-controls={isProfilePopoverOpen ? 'profile-popover' : undefined}
            aria-haspopup="true"
          >
            <AccountCircleIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* SideMenu se renderiza aquí y usa el estado y la función de este componente */}
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
          {barberos.map((barbero) => ( // Usamos 'barberos' (plural) y mapeamos sobre ello
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
                }}
              >
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
                      border: '3px solid #D4AF37', // Borde dorado
                    }}
                  />
                ) : (
                  // Si no hay foto, usa el icono AccountCircle
                  <AccountCircle sx={{ fontSize: 120, color: '#bdbdbd', mb: 2 }} />
                )}
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#555' }}>
                  {barbero.nombre} {barbero.apellido}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {barbero.especialidad || 'Barbero General'}
                </Typography>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: '#D4AF37',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#C59A00',
                    },
                    mt: 'auto', // Para empujar el botón hacia abajo
                  }}
                  onClick={() => handleSelectBarber(barbero.id)} // Usamos barber.id y handleSelectBarber
                >
                  Seleccionar
                </Button>
              </Box>
            </Grid>
          ))}
        </Box>
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

export default BarberSelectionPage;