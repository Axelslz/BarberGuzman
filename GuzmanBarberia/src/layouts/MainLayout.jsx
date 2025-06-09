import React, { useState } from 'react';
import { Box } from '@mui/material';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu'; // Asegúrate de importar SideMenu
import { Outlet, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext.jsx'; // Importa useUser para la visibilidad del menú

function MainLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { userProfile, isLoadingProfile } = useUser(); // Obtén userProfile y isLoadingProfile

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Determinar si mostrar el menú lateral.
  // Lo mostramos si el usuario está logeado y no es una página de marketing,
  // y cuando el perfil ya ha terminado de cargar.
  const shouldShowSideMenu = !isLoadingProfile && userProfile && 
                             !['/', '/login', '/register', '/forgot-password'].includes(location.pathname);


  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh', 
        backgroundColor: '#b08e6b', // Tu color de fondo global
      }}
    >
      {/* Pasa toggleMenu al Header */}
      <Header toggleMenu={toggleMenu} /> 
      
      {/* Mostrar SideMenu condicionalmente */}
      {shouldShowSideMenu && (
        <SideMenu isOpen={isMenuOpen} toggleMenu={toggleMenu} />
      )}

      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, // Padding para el contenido principal
          ml: shouldShowSideMenu && isMenuOpen ? '240px' : '0', // Ajusta el margen si el menú está abierto
          transition: 'margin-left 0.3s ease', // Transición suave al abrir/cerrar el menú
        }}
      >
        <Outlet /> {/* Aquí se renderizarán las páginas anidadas */}
      </Box>
    </Box>
  );
}

export default MainLayout;