import React, { useState, useMemo } from 'react';
import { Box, Typography, AppBar, Toolbar, IconButton, Link as MuiLink, Paper } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SideMenu from '../components/SideMenu.jsx';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api'; 
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import UserProfileModal from '../components/UserProfileModal.jsx'; // Importa el componente del modal/popover
import { useUser } from '../contexts/UserContext.jsx'; // Importa el hook del contexto de usuario

// Bibliotecas necesarias para el mapa
const libraries = ['places']; 

function ContactPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  // Estado para el ancla del Popover del perfil de usuario
  const [anchorEl, setAnchorEl] = useState(null); 
  // Obtener userProfile y updateUserProfile del contexto de usuario
  const { userProfile, updateUserProfile } = useUser(); // <-- Destructura updateUserProfile también

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Función para abrir el Popover del perfil, estableciendo el elemento que lo abre como ancla
  const handleOpenProfilePopover = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Función para cerrar el Popover del perfil
  const handleCloseProfilePopover = () => {
    setAnchorEl(null);
  };

  // Booleano para controlar la visibilidad del Popover
  const isProfilePopoverOpen = Boolean(anchorEl);

  // Coordenadas de tu barbería (ejemplo: Zócalo de Tuxtla Gutiérrez)
  const center = useMemo(() => ({
    lat: 16.755490, 
    lng: -93.116669, 
  }), []);

  // Carga el script de la API de Google Maps
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'TU_API_KEY_DE_Maps', // <--- ¡REEMPLAZA CON TU API KEY REAL!
    libraries,
  });

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

      <Box sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" component="h2" sx={{ mb: 4, mt: 4, textAlign: 'center', fontWeight: 'bold' }}>
          Contáctanos
        </Typography>

        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, backgroundColor: 'white', maxWidth: 800, width: '100%' }}>
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '400px', borderRadius: '8px' }} 
              center={center}
              zoom={15} 
              options={{
                disableDefaultUI: true, 
                zoomControl: true, 
              }}
            >
              <MarkerF position={center} /> 
            </GoogleMap>
          ) : (
            <Box sx={{ width: '100%', height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#e0e0e0', borderRadius: '8px' }}>
              <Typography>Cargando mapa...</Typography>
            </Box>
          )}
          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'black' }}>
            Haz clic aquí para ver la ubicación (esto sería un link a Google Maps si no incrustas el mapa)
          </Typography>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ color: 'black', mb: 1 }}>
              Email: info@barberguzman.com
            </Typography>
            <Typography variant="body1" sx={{ color: 'black', mb: 1 }}>
              Teléfono: +52 123 456 7890
            </Typography>
            <Typography variant="body1" sx={{ color: 'black', mb: 2 }}>
              Dirección: Calle de los Barberos #123, Ciudad, País
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <MuiLink href="https://www.facebook.com/barberguzman" target="_blank" rel="noopener noreferrer" color="inherit">
                <FacebookIcon sx={{ fontSize: 40, color: '#3b5998' }} />
              </MuiLink>
              <MuiLink href="https://www.instagram.com/barberguzman" target="_blank" rel="noopener noreferrer" color="inherit">
                <InstagramIcon sx={{ fontSize: 40, color: '#E1306C' }} />
              </MuiLink>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Renderiza el Popover de perfil de usuario */}
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

export default ContactPage;