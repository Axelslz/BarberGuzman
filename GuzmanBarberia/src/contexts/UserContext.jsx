import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// Cambia esta línea:
// import authService from '../services/authService'; 
// Por esta:
import { login, registrar, getProfile, logout, getToken, getUserRole } from '../services/authService'; // Importa las funciones con nombre

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBarber, setIsBarber] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [localAppointmentCount, setLocalAppointmentCount] = useState(0);

  const updateUserProfile = useCallback((profile) => {
    setUserProfile(profile);
    // Asegúrate de que 'profile?.role' sea el campo correcto para el rol
    setIsAdmin(profile?.role === 'admin'); 
    setIsBarber(profile?.role === 'barbero');
    setLocalAppointmentCount(profile?.citas_completadas || 0);
  }, []);

  const loadUserProfile = useCallback(async () => {
    // Aquí puedes usar getToken() directamente si lo necesitas,
    // o seguir con localStorage.getItem('token') si te sientes más cómodo.
    // Lo importante es que getProfile ya usa el token internamente si se lo pasa Axios.
    const token = localStorage.getItem('token'); // O const token = getToken();
    if (token) {
      try {
        setIsLoadingProfile(true);
        // Cambia esta línea:
        // const profileData = await authService.getProfile();
        // Por esta:
        const profileData = await getProfile(); // Llama directamente a la función getProfile importada
        
        updateUserProfile({
          id: profileData.id,
          name: profileData.name,
          lastName: profileData.lastname,
          email: profileData.correo,
          role: profileData.role, // Asegúrate que el campo de rol sea 'role' o 'rol' en tu backend
          id_barbero: profileData.id_barbero,
          citas_completadas: profileData.citas_completadas || 0,
        });
      } catch (error) {
        console.error("Error al cargar el perfil del usuario:", error);
        localStorage.removeItem('token');
        localStorage.removeItem('user'); // Asegúrate de limpiar también el 'user'
        updateUserProfile(null);
      } finally {
        setIsLoadingProfile(false);
      }
    } else {
      setIsLoadingProfile(false);
      updateUserProfile(null);
    }
  }, [updateUserProfile]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const incrementAppointments = useCallback(() => {
    setLocalAppointmentCount(prevCount => {
      const newCount = prevCount + 1;
      if (userProfile) {
        setUserProfile(prevProfile => ({
          ...prevProfile,
          citas_completadas: newCount,
        }));
      }
      return newCount;
    });
  }, [userProfile]);

  const value = {
    userProfile,
    isAdmin,
    isBarber,
    isLoadingProfile,
    updateUserProfile,
    setAdminStatus: setIsAdmin,
    incrementAppointments,
    appointmentCount: localAppointmentCount,
    logout: () => {
      // Cambia esta línea:
      // authService.logout();
      // Por esta:
      logout(); // Llama directamente a la función logout importada
      updateUserProfile(null);
      setLocalAppointmentCount(0);
    }
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};