import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext.jsx';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { userProfile, isLoadingProfile } = useUser();

  if (isLoadingProfile) {
    return <div>Cargando autenticación...</div>;
  }

  if (!userProfile) {
    return <Navigate to="/login" replace />;
  }

  if (userProfile.role === undefined || userProfile.role === null) {
      console.error("ProtectedRoute: Rol del usuario no definido.", userProfile);
      return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userProfile.role)) {
    return <Navigate to="/" replace />; 
  }

  return children;
};

export default ProtectedRoute;