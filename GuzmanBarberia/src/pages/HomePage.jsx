import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import homeBackground from '../assets/home_background.jpg'; 

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
            setCurrentFontIndex(prevIndex => (prevIndex + 1) % fontFamilies.length);
            setCurrentPhraseIndex(prevIndex => (prevIndex + 1) % phrases.length);
        }, 3500); 

        return () => {
            clearInterval(timerId);
        };
    }, []); 

    return (
        <Box
            sx={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${homeBackground})`, // Añade un overlay oscuro
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

                key={currentPhraseIndex}
                variant="h1"
                component="h1"
                sx={{
                    fontWeight: 'bold',
                    mb: 4,
                    fontFamily: fontFamilies[currentFontIndex], 
                    transition: 'font-family 0.5s ease-in-out, opacity 0.3s ease-in-out', 
                    minHeight: '1.2em', 
                    animation: 'fadeIn 0.5s ease-in-out' 
                }}
            >
                {phrases[currentPhraseIndex]} 
            </Typography>
            <Typography variant="h5" sx={{ mb: 6 }}>
                Barbería con estilo, confianza y puntualidad
            </Typography>
            <Box>
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: '#D4AF37', 
                        '&:hover': {
                            backgroundColor: '#C39F37', 
                        },
                        color: 'white', 
                        fontSize: '1.2rem',
                        padding: '12px 30px',
                        marginRight: '20px',
                        borderRadius: '8px', 
                    }}
                    component={Link}
                    to="/login"
                >
                    Iniciar Sesión
                </Button>
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: '#D4AF37', 
                        '&:hover': {
                            backgroundColor: '#C39F37', 
                        },
                        color: 'white', 
                        fontSize: '1.2rem',
                        padding: '12px 30px',
                        borderRadius: '8px', 
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