// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../assets/css/Home.css'; // Asegúrate de que este archivo existe y contiene tus estilos

const phrases = ['Tu mejor opción', 'Expertos en estilo', 'Barber Guzmán'];

const Home = ({ onLogin, isLoggedIn }) => { // Recibe isLoggedIn como prop
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Si el usuario ya está logueado, redirigirlo inmediatamente al dashboard
    if (isLoggedIn) {
      navigate('/dashboard', { replace: true });
      return; // Detiene la ejecución del efecto si se redirige
    }

    // Animación de texto solo si el usuario no está logueado
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 3000); // cambia cada 3 segundos
    return () => clearInterval(interval);
  }, [isLoggedIn, navigate]); // Dependencias: isLoggedIn y navigate

  // Si el usuario está logueado (y la redirección ya ha sido manejada), no renderizar nada aquí
  if (isLoggedIn) {
    return null;
  }

  return (
    <div className="home-container">
      <div className="content-box text-center">
        <h1 className="main-title">SOMOS <span className="dynamic-text">{phrases[index]}</span></h1>
        <p className="subtitle">Barbería con estilo, confianza y puntualidad.</p>
        <div className="mt-4">
          <Button variant="primary" className="mx-2" size="lg" onClick={() => navigate('/login')}>
            Iniciar sesión
          </Button>
          <Button variant="outline-light" className="mx-2" size="lg" onClick={() => navigate('/register')}>
            Registrarse
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;


