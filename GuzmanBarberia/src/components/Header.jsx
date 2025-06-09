import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton'; // Importa IconButton
import MenuIcon from '@mui/icons-material/Menu'; // Icono para el menú lateral
import AccountCircle from '@mui/icons-material/AccountCircle'; // Icono de perfil
import NotificationsIcon from '@mui/icons-material/Notifications'; // Icono de notificaciones
import Popover from '@mui/material/Popover'; // Importa Popover
import Box from '@mui/material/Box'; // Para el contenido del popover
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext.jsx'; // Importa useUser

function Header({ toggleMenu }) { // Recibe toggleMenu como prop
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile, isAdmin, isLoadingProfile, logout } = useUser(); // Usa los datos del contexto

  // Estados para el Popover del perfil
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const id = open ? 'profile-popover' : undefined;

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout(); // Llama a la función de logout del UserContext
    handleProfileClose(); // Cierra el popover
    navigate('/login'); // Redirige al login
  };

  // Determinar si es una página de marketing o una página logeada
  const isMarketingPage = ['/', '/login', '/register', '/forgot-password'].includes(location.pathname);

  // Determinar si mostrar el botón de administrador
  const showAdminButton = isAdmin && location.pathname !== '/admin'; // Asegúrate de que no estés ya en /admin

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: '#D4AF37', // Color dorado/cobre para el Header
        boxShadow: 'none',
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
      }}
    >
      <Toolbar>
        {/* Ícono de menú solo si no es página de marketing */}
        {!isMarketingPage && (
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2, color: 'white' }}
            onClick={toggleMenu} // Llama a la función del SideMenu
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'white' }}>
          BarberGuzman/{
            // Mostrar la ruta actual de forma amigable o "Home" por defecto
            location.pathname === '/' ? 'Home' :
            location.pathname.startsWith('/agendar') ? 'Agendar' :
            location.pathname.startsWith('/perfil') ? 'Perfil' :
            location.pathname.startsWith('/seleccionar-barbero') ? 'Seleccionar Barbero' :
            location.pathname.startsWith('/admin') ? 'Administrador' :
            location.pathname.replace('/', '').charAt(0).toUpperCase() + location.pathname.slice(2) // Capitalizar
          }
        </Typography>

        {/* Botones de navegación (visibles en todas las páginas) */}
        <Button color="inherit" component={Link} to="/" sx={{ color: 'white' }}>Home</Button>
        <Button color="inherit" component={Link} to="/agendar" sx={{ color: 'white' }}>Agendar</Button>
        <Button color="inherit" component={Link} to="/sobre-mi" sx={{ color: 'white' }}>Sobre Mi</Button>
        <Button color="inherit" component={Link} to="/contacto" sx={{ color: 'white' }}>Contacto</Button>

        {/* Botón de Administrador (solo si es admin y no en la página de admin) */}
        {showAdminButton && (
          <Button color="inherit" component={Link} to="/admin" sx={{ color: 'white', ml: 2 }}>
            Administrador
          </Button>
        )}

        {/* Iconos de notificaciones y perfil (solo si el usuario está logeado y el perfil ha cargado) */}
        {!isLoadingProfile && userProfile && (
          <>
            <IconButton size="large" aria-label="show 17 new notifications" color="inherit" sx={{ color: 'white' }}>
              <NotificationsIcon />
            </IconButton>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls={id}
              aria-haspopup="true"
              onClick={handleProfileClick}
              color="inherit"
              sx={{ color: 'white' }}
            >
              <AccountCircle />
            </IconButton>

            {/* Popover del perfil */}
            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handleProfileClose}
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
                {userProfile ? (
                  <>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      Nombre: {userProfile.name}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Apellido: {userProfile.lastName || ''}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Correo: {userProfile.email}
                    </Typography>
                    {/* Muestra el número de cortes si está disponible */}
                    {typeof userProfile.citas_completadas === 'number' && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            No. Cortes: {userProfile.citas_completadas}
                        </Typography>
                    )}
                    <Button 
                      variant="outlined" 
                      sx={{ mt: 2 }} 
                      fullWidth 
                      component={Link} 
                      to="/perfil" // Link a la página de perfil si tienes una
                      onClick={handleProfileClose}
                    >
                      Editar Perfil
                    </Button>
                    <Button 
                      variant="contained" 
                      color="error" 
                      sx={{ mt: 1 }} 
                      fullWidth 
                      onClick={handleLogout}
                    >
                      Cerrar Sesión
                    </Button>
                  </>
                ) : (
                  <Typography>Cargando perfil...</Typography> // O un mensaje de "No logeado"
                )}
              </Box>
            </Popover>
          </>
        )}

        {/* Mostrar botones de Login/Registro si no está logeado y no está cargando */}
        {!isLoadingProfile && !userProfile && isMarketingPage && ( // Solo si es página de marketing
          <>
            <Button color="inherit" component={Link} to="/login" sx={{ color: 'white' }}>
              Iniciar Sesión
            </Button>
            <Button color="inherit" component={Link} to="/register" sx={{ color: 'white' }}>
              Registrarse
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Header;