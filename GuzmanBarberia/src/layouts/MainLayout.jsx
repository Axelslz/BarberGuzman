import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Box } from '@mui/material';

import Header from '../components/Header.jsx';
import SideMenu from '../components/SideMenu.jsx';

const MainLayout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation(); // useLocation AHORA sí está dentro del Router (definido en main.jsx)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const marketingRoutes = ['/', '/login', '/register', '/forgot-password'];
  const shouldShowSideMenu = !marketingRoutes.includes(location.pathname);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header toggleMenu={toggleMenu} />
      
      {shouldShowSideMenu && (
        <SideMenu isOpen={isMenuOpen} toggleMenu={toggleMenu} />
      )}

      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;