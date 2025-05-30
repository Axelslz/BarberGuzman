import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import homeBackground from '../assets/home_background.jpg'; // Asegúrate de que la ruta sea correcta

// Define un array de fuentes que quieras usar
const fontFamilies = [
  'cursive',
  'Arial, sans-serif',
  'Georgia, serif',
  'Times New Roman, Times, serif',
  'Courier New, Courier, monospace',
  'Verdana, Geneva, sans-serif',
  'Impact, Charcoal, sans-serif',
  'fantasy',
  'monospace'
];

// Define un array con las frases que quieres mostrar
const phrases = [
  "Barber Guzmán",
  "Estilo y Precisión",
  "Tu Mejor Look Aquí",
  "Cortes Clásicos y Modernos",
  "Barber Guzmán",
  "Tradición Barbera de Calidad",
  "Expertos en Tu Imagen",
  "Hala Madrid"
  // Puedes agregar más frases aquí
];

function HomePage() {
  const [currentFontIndex, setCurrentFontIndex] = useState(0);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  useEffect(() => {
    const timerId = setInterval(() => {
      // Actualiza el índice de la fuente
      setCurrentFontIndex(prevIndex => (prevIndex + 1) % fontFamilies.length);
      // Actualiza el índice de la frase
      setCurrentPhraseIndex(prevIndex => (prevIndex + 1) % phrases.length);
    }, 3500); // Cambia cada 3.5 segundos

    return () => {
      clearInterval(timerId);
    };
  }, []); // El array vacío de dependencias asegura que esto se ejecute solo una vez

  return (
    <Box
      sx={{
        backgroundImage: `url(${homeBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        color: 'white',
        textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
      }}
    >
      <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
        SOMOS
      </Typography>
      <Typography
        // Añadir una 'key' ayuda a React a manejar mejor las transiciones cuando el contenido cambia
        key={currentPhraseIndex} 
        variant="h1"
        component="h1"
        sx={{
          fontWeight: 'bold',
          mb: 4,
          fontFamily: fontFamilies[currentFontIndex], // Aplica la fuente actual
          transition: 'font-family 0.5s ease-in-out, opacity 0.3s ease-in-out', // Transición para fuente y opacidad
          minHeight: '1.2em', // Para evitar saltos de altura si las fuentes tienen alturas muy diferentes
                               // Ajusta este valor según el tamaño de tu h1
          animation: 'fadeIn 0.5s ease-in-out' // Animación simple para el cambio de texto
        }}
        // Agregamos una animación simple con @keyframes para el cambio de texto
        // Puedes definir 'fadeIn' en tu archivo CSS global o App.css
        // @keyframes fadeIn {
        //   from { opacity: 0.4; }
        //   to { opacity: 1; }
        // }
      >
        {phrases[currentPhraseIndex]} {/* Muestra la frase actual */}
      </Typography>
      <Typography variant="h5" sx={{ mb: 6 }}>
        Barbería con estilo, confianza y puntualidad
      </Typography>
      <Box>
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#4CAF50',
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
            backgroundColor: '#64B5F6',
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