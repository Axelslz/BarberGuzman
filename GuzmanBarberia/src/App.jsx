// src/App.jsx
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
import ProtectedRoute from './components/ProtectedRoute.jsx'; 

// Componentes placeholder para las rutas de administración
const AdminDashboard = () => <div>Panel de Administración (Solo para Admin y Super Admin)</div>;
const SuperAdminManagement = () => <div>Gestión de Barberos/Servicios (Solo para Super Admin)</div>;

function App() {
  return (
    <Router>
      <UserProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/sobre-mi" element={<AboutPage />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/forgot-password" element={<div>Página para recuperar contraseña (próximamente)</div>} />

          {/* Rutas Protegidas */}

          {/* Selección de barbero: Generalmente accesible para clientes logueados */}
          <Route 
            path="/seleccionar-barbero" 
            element={
              <ProtectedRoute allowedRoles={['cliente', 'admin', 'super_admin']}>
                <BarberSelectionPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Agendar Cita: Accesible para clientes logueados */}
          {/* El :barberId ahora puede ser el ID del barbero a agendar, o 0/null para que el admin vea su propia agenda */}
          <Route 
            path="/agendar-cita/:barberId?" // '?' hace que barberId sea opcional
            element={
              <ProtectedRoute allowedRoles={['cliente', 'admin', 'super_admin']}>
                <AppointmentPage />
              </ProtectedRoute>
            } 
          />

          {/* Historial de Cortes: Accesible para clientes (ver su historial) y admins/super_admins (ver su historial o el de otros) */}
          {/* Mantén esta ruta como estaba, ya que es correcta. */}
          <Route
            path="/historial-cortes/:userId?" // Opcional: para que un admin/super_admin pueda ver el historial de un usuario específico
            element={
              <ProtectedRoute allowedRoles={['cliente', 'admin', 'super_admin']}>
                <HistoryPage />
              </ProtectedRoute>
            }
          />

          {/* RUTAS ESPECÍFICAS DE ADMINISTRACIÓN - CORREGIDAS CON PATHS ÚNICOS */}
          <Route
            path="/admin-dashboard" // Nueva ruta única para el dashboard de admin
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <AdminDashboard /> {/* Usamos el componente placeholder */}
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/super-admin-management" // Nueva ruta única para gestión de super admin
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <SuperAdminManagement /> {/* Usamos el componente placeholder */}
              </ProtectedRoute>
            }
          />

        </Routes>
      </UserProvider>
    </Router>
  );
}

export default App;