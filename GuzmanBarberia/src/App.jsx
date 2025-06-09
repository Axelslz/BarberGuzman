import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import BarberSelectionPage from './pages/BarberSelectionPage.jsx';
import AppointmentPage from './pages/AppointmentPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import { UserProvider } from './contexts/UserContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx'; // ¡Importa ProtectedRoute!
// import Header from './components/Header.jsx'; // Estos pueden no ser necesarios si MainLayout los maneja
// import SideMenu from './components/SideMenu.jsx'; // Estos pueden no ser necesarios si MainLayout los maneja
// import { Box } from '@mui/material' // Este import solo es necesario si Box se usa directamente en App.jsx, que no es el caso aquí.

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
          {/* Aquí puedes decidir si quieres que BarberSelectionPage y AppointmentPage estén protegidas. */}
          {/* Si quieres que cualquier usuario (incluso no logeado) pueda ver barberos y agendar, déjalas así. */}
          {/* Si solo usuarios logeados pueden agendar, envuélvelas en ProtectedRoute. */}
          <Route path="/seleccionar-barbero" element={<BarberSelectionPage />} />
          {/* ERROR RESUELTO: Añadimos la barra diagonal / antes de :barberId */}
          <Route path="/agendar-cita/:barberId" element={<AppointmentPage />} />

          {/* Las rutas adicionales */}
          <Route path="/sobre-mi" element={<AboutPage />} />
          <Route path="/contacto" element={<ContactPage />} />

          {/* ¡Ruta protegida para el historial de cortes! */}
          {/* NOTA: Tu `ProtectedRoute` recibe `adminOnly`, pero en tu `barberRoutes.js` y `citasRoutes.js` */}
          {/* se usaba `authorizeRole(['cliente', 'admin'])` para ciertas rutas de cliente. */}
          {/* Asegúrate de que `adminOnly` en ProtectedRoute sea consistente con tus roles. */}
          {/* Si `HistoryPage` es solo para clientes o clientes y admins, ajusta `adminOnly` o tu `ProtectedRoute`. */}
          {/* Por ejemplo, si un cliente debe ver su historial, `adminOnly` debe ser `false` o no enviarse, */}
          {/* y tu ProtectedRoute debe verificar el rol del usuario logeado. */}
          <Route
            path="/historial-cortes"
            element={
              <ProtectedRoute /* adminOnly={true} // Revisa si esto es lo que quieres. Un cliente normal también debería ver su historial. */>
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