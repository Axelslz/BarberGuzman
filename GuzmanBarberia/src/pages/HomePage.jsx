import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
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
    "Estilo y Elegancia",
    "Para dar y compartir",
    "Look Aquí",
    "CUT, MIND, TYPER FADE Y TAUPAIPAI",
    "Guzman Guzmán",
    "Tradición Barbera de Calidad",
    "Interesados en Tu Imagen",
    "Hala Madrid",
    "YNWA", 
    "O NO SOMOS?",
    "Vibra Positiva",
];

function HomePage() {
    
    const { userProfile, isLoadingProfile } = useUser();
    const navigate = useNavigate();

    const [currentFontIndex, setCurrentFontIndex] = useState(0);
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

    useEffect(() => {
        
        if (!isLoadingProfile && userProfile) {
        
            navigate('/seleccionar-barbero', { replace: true });
        }
    }, [userProfile, isLoadingProfile, navigate]);

    useEffect(() => {
        const timerId = setInterval(() => {
            setCurrentFontIndex(prevIndex => (prevIndex + 1) % fontFamilies.length);
            setCurrentPhraseIndex(prevIndex => (prevIndex + 1) % phrases.length);
        }, 3500); 

        return () => {
            clearInterval(timerId);
        };
    }, []); 

   
    if (isLoadingProfile) {
        return (
            <div className="w-screen h-screen flex justify-center items-center bg-gray-900">
                <CircularProgress sx={{ color: '#FBBF24' }} />
            </div>
        );
    }

    return (
        <div
            className="w-screen h-screen flex flex-col justify-center items-center text-center text-white relative bg-cover bg-center bg-no-repeat"
            style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${homeBackground})`,
                textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
            }}
        >
            {/* Título principal SOMOS */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
                SOMOS
            </h1>
            
            {/* Frase animada */}
            <h1
                key={currentPhraseIndex}
                className="text-3xl md:text-5xl lg:text-7xl font-bold mb-6 md:mb-8 lg:mb-12 px-4 transition-all duration-500 ease-in-out min-h-[1.2em] animate-fadeIn"
                style={{
                    fontFamily: fontFamilies[currentFontIndex]
                }}
            >
                {phrases[currentPhraseIndex]} 
            </h1>
            
            {/* Subtítulo */}
            <h2 className="text-lg md:text-xl lg:text-2xl mb-8 md:mb-12 lg:mb-16 px-4 max-w-2xl">
                Barbería con estilo, confianza y puntualidad
            </h2>
            
            {/* Contenedor de botones */}
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 px-4 w-full max-w-md sm:max-w-none justify-center items-center">
                <Link
                    to="/login"
                    className="bg-yellow-500 hover:bg-yellow-600 !text-white font-semibold text-lg md:text-xl py-3 md:py-4 px-6 md:px-8 rounded-lg transition-colors duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl w-full sm:w-auto text-center min-w-[160px] md:min-w-[180px]"
                >
                    Iniciar Sesión
                </Link>
                <Link
                    to="/register"
                    className="bg-yellow-500 hover:bg-yellow-600 !text-white font-semibold text-lg md:text-xl py-3 md:py-4 px-6 md:px-8 rounded-lg transition-colors duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl w-full sm:w-auto text-center min-w-[160px] md:min-w-[180px]"
                >
                    Registrarse
                </Link>
            </div>
        </div>
    );
}

export default HomePage;