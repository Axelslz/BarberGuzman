import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <AppBar position="static" sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'white' }}>
          BarberGuzman/Home
        </Typography>
        {/* Aquí puedes añadir botones de navegación si los deseas en el header global */}
        <Button color="inherit" component={Link} to="/" sx={{ color: 'white' }}>Home</Button>
        <Button color="inherit" component={Link} to="/agendar" sx={{ color: 'white' }}>Agendar</Button>
        <Button color="inherit" component={Link} to="/sobre-mi" sx={{ color: 'white' }}>Sobre Mi</Button>
        <Button color="inherit" component={Link} to="/contacto" sx={{ color: 'white' }}>Contacto</Button>
      </Toolbar>
    </AppBar>
  );
}

export default Header;