import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles'; 
import theme from './theme'; 

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
import GuestRoute from './components/GuestRoute.jsx';

const AdminDashboard = () => <div>Panel de Administración (Solo para Admin y Super Admin)</div>;
const SuperAdminManagement = () => <div>Gestión de Barberos/Servicios (Solo para Super Admin)</div>;

function App() {
  return (
    <Router>
      <UserProvider>
        <ThemeProvider theme={theme}>
          <Routes>
            {/* Rutas Públicas para todos */}
            <Route path="/" element={<HomePage />} />
            <Route path="/sobre-mi" element={<AboutPage />} />
            <Route path="/contacto" element={<ContactPage />} />

            {/* --- 2. APLICA GuestRoute A ESTAS RUTAS --- */}
            <Route 
              path="/login" 
              element={<GuestRoute><LoginPage /></GuestRoute>} 
            />
            <Route 
              path="/register" 
              element={<GuestRoute><RegisterPage /></GuestRoute>} 
            />
            <Route 
              path="/forgot-password" 
              element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} 
            />
            <Route 
              path="/reset-password" 
              element={<GuestRoute><ResetPasswordPage /></GuestRoute>} 
            />
            <Route 
              path="/set-password" 
              element={<GuestRoute><SetPasswordPage /></GuestRoute>} 
            />

            {/* Rutas Protegidas (Estas ya estaban bien) */}
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