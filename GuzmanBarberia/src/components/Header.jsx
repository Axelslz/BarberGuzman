import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Box from '@mui/material/Box';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext.jsx';

import UserProfileModal from './UserProfileModal.jsx'; // Asegúrate de que esta ruta sea correcta

function Header({ toggleMenu }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile, isAdmin, isLoadingProfile, logout } = useUser();

  const [anchorEl, setAnchorEl] = useState(null);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
    setIsUserProfileModalOpen(true);
  };

  const handleUserProfileModalClose = () => {
    setIsUserProfileModalOpen(false);
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleUserProfileModalClose();
    navigate('/login');
  };

  const isMarketingPage = ['/', '/login', '/register', '/forgot-password'].includes(location.pathname);
  const showAdminButton = isAdmin && location.pathname !== '/admin';

  // Define el color dorado para ser reutilizado
  const goldColor = '#D4AF37';

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: '#1a202c', // Color gris oscuro para el AppBar
        boxShadow: 'none',
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
      }}
    >
      <Toolbar>
        {!isMarketingPage && (
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2, color: goldColor }} // Color dorado para el icono del menú
            onClick={toggleMenu}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, color: goldColor, fontFamily: 'cursive', fontSize: '2rem' }} // Título en dorado
        >
          Barber Guzman
        </Typography>

        {/* Botones de navegación con color dorado */}
        <Button color="inherit" component={Link} to="/" sx={{ color: goldColor }}>Home</Button>
        <Button color="inherit" component={Link} to="/agendar" sx={{ color: goldColor }}>Agendar</Button>
        <Button color="inherit" component={Link} to="/sobre-mi" sx={{ color: goldColor }}>Sobre Mi</Button>
        <Button color="inherit" component={Link} to="/contacto" sx={{ color: goldColor }}>Contacto</Button>

        {showAdminButton && (
          <Button color="inherit" component={Link} to="/admin" sx={{ color: goldColor, ml: 2 }}>
            Administrador
          </Button>
        )}

        {!isLoadingProfile && userProfile && (
          <>
            <IconButton size="large" aria-label="show 17 new notifications" color="inherit" sx={{ color: goldColor }}>
              <NotificationsIcon />
            </IconButton>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls={isUserProfileModalOpen ? 'profile-popover' : undefined}
              aria-haspopup="true"
              onClick={handleProfileClick}
              color="inherit"
              sx={{ color: goldColor }} // Color dorado para el icono de perfil
            >
              <AccountCircle />
            </IconButton>

            <UserProfileModal
              open={isUserProfileModalOpen}
              onClose={handleUserProfileModalClose}
              anchorEl={anchorEl}
            />
          </>
        )}

        {!isLoadingProfile && !userProfile && isMarketingPage && (
          <>
            <Button color="inherit" component={Link} to="/login" sx={{ color: goldColor }}>
              Iniciar Sesión
            </Button>
            <Button color="inherit" component={Link} to="/register" sx={{ color: goldColor }}>
              Registrarse
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Header;