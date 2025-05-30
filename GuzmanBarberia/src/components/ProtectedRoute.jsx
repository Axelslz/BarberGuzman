import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext.jsx';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { userProfile } = useUser();

  // Si la ruta es solo para admin, y el usuario NO es admin, redirige al inicio
  if (adminOnly && !userProfile.isAdmin) {
    alert("Acceso denegado: Se requiere rol de administrador.");
    return <Navigate to="/" replace />;
  }

  // Si no hay restricciones de rol o el usuario cumple el rol, renderiza los children
  return children;
};

export default ProtectedRoute;