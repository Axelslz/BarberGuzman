import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import homeBackground from '../assets/home_background.jpg'; // Asegúrate de que la ruta sea correcta

function HomePage() {
  return (
    <Box
      sx={{
        backgroundImage: `url(${homeBackground})`,
        backgroundSize: 'cover', // Asegura que la imagen cubra todo el espacio
        backgroundPosition: 'center', // Centra la imagen en el contenedor
        backgroundRepeat: 'no-repeat', // Evita que la imagen se repita si es pequeña
        width: '100vw', // Ocupa el 100% del ancho del viewport
        height: '100vh', // Ocupa el 100% de la altura del viewport
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        color: 'white',
        textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
        // Asegúrate de que no haya padding o margin en el body/html que lo esté encogiendo
        // Puedes añadir esto al final de tu index.css o App.css
        // body { margin: 0; padding: 0; overflow: hidden; }
      }}
    >
      <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
        SOMOS
      </Typography>
      <Typography variant="h1" component="h1" sx={{ fontWeight: 'bold', mb: 4, fontFamily: 'cursive' }}>
        Barber Guzmán
      </Typography>
      <Typography variant="h5" sx={{ mb: 6 }}>
        Barbería con estilo, confianza y puntualidad
      </Typography>
      <Box>
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#4CAF50', // Verde similar al de la imagen
            '&:hover': {
              backgroundColor: '#388E3C',
            },
            color: 'white',
            fontSize: '1.2rem',
            padding: '12px 30px',
            marginRight: '20px',
          }}
          component={Link}
          to="/login"
        >
          Iniciar Sesión
        </Button>
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#64B5F6', // Azul similar al de la imagen
            '&:hover': {
              backgroundColor: '#2196F3',
            },
            color: 'white',
            fontSize: '1.2rem',
            padding: '12px 30px',
          }}
          component={Link}
          to="/register"
        >
          Registrarse
        </Button>
      </Box>
    </Box>
  );
}

export default HomePage;