import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import BarberSelectionPage from './pages/BarberSelectionPage.jsx';
import AppointmentPage from './pages/AppointmentPage.jsx';
import AboutPage from './pages/AboutPage.jsx'; // Ruta original: /sobre-mi
import ContactPage from './pages/ContactPage.jsx'; // Ruta original: /contacto
import HistoryPage from './pages/HistoryPage.jsx';
import { UserProvider } from './contexts/UserContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx'; // ¡Importa ProtectedRoute!
import Header from './components/Header.jsx';
import SideMenu from './components/SideMenu.jsx'; // Importa el SideMenu
import { Box } from '@mui/material'

function App() {
  return (
    <Router>
      {/* UserProvider DEBE ENVOLVER TODAS las rutas que necesiten acceder a la información del usuario */}
      <UserProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Rutas que hacen uso del UserContext deben estar dentro del UserProvider */}
          <Route path="/seleccionar-barbero" element={<BarberSelectionPage />} />
          <Route path="/agendar-cita" element={<AppointmentPage />} />

          {/* Las rutas adicionales */}
          <Route path="/sobre-mi" element={<AboutPage />} />
          <Route path="/contacto" element={<ContactPage />} />

          {/* ¡Ruta protegida para el historial de cortes (solo admin)! */}
          <Route
            path="/historial-cortes"
            element={
              <ProtectedRoute adminOnly={true}>
                <HistoryPage />
              </ProtectedRoute>
            }
          />

          {/* Ruta para recuperar contraseña (ejemplo, puedes crear el componente real) */}
          <Route path="/forgot-password" element={<div>Página para recuperar contraseña (próximamente)</div>} />
        </Routes>
      </UserProvider>
    </Router>
  );
}

export default App;