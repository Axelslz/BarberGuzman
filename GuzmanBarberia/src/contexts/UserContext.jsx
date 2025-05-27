import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. Crear el Contexto
export const UserContext = createContext(null);

// 2. Crear el Proveedor del Contexto
// Lo exportamos como una exportación nombrada 'UserProvider'
// Si cambias esto a 'export default UserProviderComponent;',
// recuerda ajustar la importación en App.jsx a 'import UserProvider from ...'
export const UserProvider = ({ children }) => {
  // Intentar cargar el perfil del localStorage al inicio
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const storedProfile = localStorage.getItem('userProfile');
      return storedProfile ? JSON.parse(storedProfile) : {
        name: 'Axel', // Valores iniciales por defecto, puedes cambiarlos
        lastName: 'Belozar',
        email: 'axel@gmail.com',
        appointments: 3, // Ejemplo inicial de cortes
      };
    } catch (error) {
      console.error("Error parsing user profile from localStorage", error);
      // En caso de error, devuelve un perfil por defecto para que la app no falle
      return {
        name: 'Invitado',
        lastName: 'Usuario',
        email: 'invitado@example.com',
        appointments: 0,
      };
    }
  });

  // Guardar el perfil en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  // Función para incrementar los cortes
  const incrementAppointments = () => {
    setUserProfile(prevProfile => ({
      ...prevProfile,
      appointments: prevProfile.appointments + 1,
    }));
  };

  // Función para actualizar cualquier parte del perfil
  const updateUserProfile = (newProfileData) => {
    setUserProfile(prevProfile => ({
      ...prevProfile,
      ...newProfileData,
    }));
  };

  const contextValue = {
    userProfile, // El perfil actual del usuario
    incrementAppointments, // Función para aumentar el contador de cortes
    updateUserProfile,     // Función para actualizar otros datos del perfil
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Hook personalizado para usar el contexto fácilmente en cualquier componente
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    // Esto es crucial para depurar: si se llama useUser() fuera del UserProvider, lanzará este error
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};