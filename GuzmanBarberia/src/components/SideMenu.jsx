import React from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

function SideMenu({ isOpen, toggleMenu }) {
  return (
    <Drawer
      anchor="left"
      open={isOpen}
      onClose={toggleMenu}
      sx={{
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: '#E6E6FA',
          color: 'black',
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          HOME
        </Typography>
        <IconButton onClick={toggleMenu} sx={{ color: 'black' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/" onClick={toggleMenu}>
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/seleccionar-barbero" onClick={toggleMenu}> {/* CAMBIO: Ruta para seleccionar barbero */}
            <ListItemText primary="Agendar" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/sobre-mi" onClick={toggleMenu}> {/* NUEVA RUTA */}
            <ListItemText primary="Sobre mí" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/contacto" onClick={toggleMenu}> {/* NUEVA RUTA */}
            <ListItemText primary="Contacto" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
}

export default SideMenu;