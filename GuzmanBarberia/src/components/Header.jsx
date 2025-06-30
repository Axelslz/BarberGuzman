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
import UserProfileModal from './UserProfileModal.jsx'; 
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

function Header({ toggleMenu }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile, isAdmin, isLoadingProfile, logout } = useUser();

  const [anchorEl, setAnchorEl] = useState(null);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md')); 

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
  const goldColor = '#D4AF37';
  const white = '#0000';

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: '#1a202c',
        boxShadow: 'none',
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
      }}
    >
      <Toolbar>
        {/* Ícono de menú */}
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2, color: goldColor }} 
          onClick={toggleMenu}
        >
          <MenuIcon />
        </IconButton>

        {/* Título de la barbería */}
        <Typography
          variant="h6"
          component="div"
          sx={{ 
              flexGrow: 1, 
              color: goldColor, 
              fontFamily: 'cursive', 
              fontSize: '2rem',
              textAlign: 'left' 
          }} 
        >
          Barber Guzman
        </Typography>

        {!isLoadingProfile && userProfile && (
          <Box sx={{ display: 'flex' }}>
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
              sx={{ color: goldColor }} 
            >
              <AccountCircle />
            </IconButton>

            <UserProfileModal
              open={isUserProfileModalOpen}
              onClose={handleUserProfileModalClose}
              anchorEl={anchorEl}
            />
          </Box>
        )}

       
        {!isLoadingProfile && !userProfile && isMarketingPage && (
          <Box sx={{ display: { xs: 'none', md: 'none' } }}> 
            
            <Button color="inherit" component={Link} to="/login" sx={{ color: goldColor }}>
              Iniciar Sesión
            </Button>
            <Button color="inherit" component={Link} to="/register" sx={{ color: goldColor }}>
              Registrarse
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Header;