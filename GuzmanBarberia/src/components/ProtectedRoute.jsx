// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext.jsx';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { userProfile, isLoadingProfile } = useUser();

  // 1. Mientras el perfil esté cargando, mostramos un indicador o simplemente null.
  // Esto previene que se intente verificar el rol antes de que el perfil esté disponible.
  if (isLoadingProfile) {
    // Puedes mostrar un spinner aquí para una mejor UX
    return <div>Cargando autenticación...</div>;
  }

  // 2. Si no hay perfil de usuario (no logueado) DESPUÉS de que la carga ha terminado,
  // redirige al usuario a la página de login.
  if (!userProfile) {
    // console.log("ProtectedRoute: Usuario no logueado, redirigiendo a /login");
    // alert("Necesitas iniciar sesión para acceder a esta página."); // Esto puede ser molesto, considera quitarlo
    return <Navigate to="/login" replace />;
  }

  // 3. Si el usuario está logueado, pero su rol no está definido (aunque debería estarlo si el login fue exitoso)
  // Esto es una medida de seguridad, pero el problema real podría estar en `getProfile` o `login`.
  if (userProfile.role === undefined || userProfile.role === null) {
      console.error("ProtectedRoute: Rol del usuario no definido.", userProfile);
      // alert("Error de perfil: Tu rol no está definido. Por favor, inicia sesión de nuevo.");
      return <Navigate to="/login" replace />;
  }


  // 4. Si se especificaron roles permitidos y el rol del usuario no está en la lista.
  if (allowedRoles && !allowedRoles.includes(userProfile.role)) {
    // console.log(`Acceso denegado: Rol del usuario (${userProfile.role}) no permitido. Redirigiendo a /.`);
    // alert(`Acceso denegado: Tu rol (${userProfile.role}) no tiene permisos para esta página.`); // También puede ser molesto
    return <Navigate to="/" replace />; // O a una página de "acceso denegado"
  }

  // Si todas las verificaciones pasan, renderiza los children
  return children;
};

export default ProtectedRoute;