import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles'; // Importa ThemeProvider
import theme from './theme'; // Asegúrate de que esta ruta sea correcta a tu archivo de tema

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
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'; 
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'; 
import SetPasswordPage from "./pages/SetPasswordPage.jsx"; 

const AdminDashboard = () => <div>Panel de Administración (Solo para Admin y Super Admin)</div>;
const SuperAdminManagement = () => <div>Gestión de Barberos/Servicios (Solo para Super Admin)</div>;

function App() {
  return (
    <Router>
      <UserProvider>
        {/* Envuelve todo el contenido de tu aplicación con ThemeProvider */}
        <ThemeProvider theme={theme}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/sobre-mi" element={<AboutPage />} />
            <Route path="/contacto" element={<ContactPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/set-password" element={<SetPasswordPage />} />

            {/* Rutas Protegidas */}
            <Route 
              path="/seleccionar-barbero" 
              element={
                <ProtectedRoute allowedRoles={['cliente', 'admin', 'super_admin']}>
                  <BarberSelectionPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/agendar-cita/:barberId?" 
              element={
                <ProtectedRoute allowedRoles={['cliente', 'admin', 'super_admin']}>
                  <AppointmentPage />
                </ProtectedRoute>
              } 
            />

            <Route
              path="/historial-cortes/:userId?" 
              element={
                <ProtectedRoute allowedRoles={['cliente', 'admin', 'super_admin']}>
                  <HistoryPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                  <AdminDashboard /> 
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/super-admin-management" 
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminManagement /> 
                </ProtectedRoute>
              }
            />
          </Routes>
        </ThemeProvider>
      </UserProvider>
    </Router>
  );
}

export default App;