import React, { useState } from 'react';
import { Box, Typography, AppBar, Toolbar, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BarberCard from '../components/BarberCard.jsx';
import SideMenu from '../components/SideMenu.jsx';
import UserProfileModal from '../components/UserProfileModal.jsx'; // Importa el componente del modal/popover
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext.jsx'; // Importa el hook del contexto de usuario

function BarberSelectionPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  // Estado para el ancla del Popover del perfil de usuario
  const [anchorEl, setAnchorEl] = useState(null); 
  const navigate = useNavigate();
  // Obtener userProfile y updateUserProfile del contexto de usuario
  const { userProfile, updateUserProfile } = useUser(); 

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleBarberSelect = (barberName) => {
    navigate(`/agendar-cita?barber=${barberName}`);
    console.log(`Navegando a /agendar-cita?barber=${barberName}`);
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

  const barbers = [
    { id: 'barber1', name: 'Barbee', imageUrl: '' },
    { id: 'barber2', name: 'Barber 1', imageUrl: '' },
    { id: 'barber3', name: 'Barber 2', imageUrl: '' },
  ];

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
            onClick={handleOpenProfilePopover} // Llama a la función para abrir el popover
            aria-controls={isProfilePopoverOpen ? 'profile-popover' : undefined}
            aria-haspopup="true"
          >
            <AccountCircleIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <SideMenu isOpen={menuOpen} toggleMenu={toggleMenu} />

      <Box sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ mb: 4, mt: 4, textAlign: 'center', fontWeight: 'bold' }}>
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
          {barbers.map((barber) => (
            <BarberCard
              key={barber.id}
              name={barber.name}
              imageUrl={barber.imageUrl}
              onSelect={() => handleBarberSelect(barber.name)}
            />
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