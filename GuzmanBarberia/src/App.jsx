import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import BarberSelectionPage from './pages/BarberSelectionPage.jsx';
import AppointmentPage from './pages/AppointmentPage.jsx';
import AboutPage from './pages/AboutPage.jsx';     // <-- Nueva importación
import ContactPage from './pages/ContactPage.jsx';
import { UserProvider } from './contexts/UserContext.jsx';

function App() {
  return (
    <Router>
      <UserProvider> 
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Ruta para la selección de barbero (ej: /seleccionar-barbero) */}
        <Route path="/seleccionar-barbero" element={<BarberSelectionPage />} />
        
        {/* Ruta para la página de agendamiento de citas (ej: /agendar-cita) */}
        {/* Aquí es donde se llega DESPUÉS de seleccionar un barbero */}
        <Route path="/agendar-cita" element={<AppointmentPage />} />

        {/* Las rutas adicionales que mencionaste */}
        <Route path="/sobre-mi" element={<AboutPage />} />     
        <Route path="/contacto" element={<ContactPage />} />   
        <Route path="/forgot-password" element={<div>Página para recuperar contraseña (próximamente)</div>} />
      </Routes>
      </UserProvider>
    </Router>
  );
}

export default App;