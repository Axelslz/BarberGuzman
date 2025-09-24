import React, { useState } from 'react';
import { Box } from '@mui/material';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu'; 
import { Outlet, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext.jsx'; 

function MainLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { userProfile, isLoadingProfile } = useUser();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const shouldShowSideMenu = !isLoadingProfile && userProfile && 
     !['/', '/login', '/register', '/forgot-password'].includes(location.pathname);


  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh', 
        backgroundColor: '#b08e6b', 
      }}
    >
      <Header toggleMenu={toggleMenu} /> 
      
      {shouldShowSideMenu && (
        <SideMenu isOpen={isMenuOpen} toggleMenu={toggleMenu} />
      )}

      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          ml: shouldShowSideMenu && isMenuOpen ? '240px' : '0', 
          transition: 'margin-left 0.3s ease', 
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default MainLayout;