import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(() => {
    const savedProfile = localStorage.getItem('userProfile');
    // Asegurarse de que el perfil inicial sea un objeto con la propiedad isAdmin
    return savedProfile ? JSON.parse(savedProfile) : { name: '', email: '', noCortes: 0, isAdmin: false };
  });

  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  const incrementAppointments = () => {
    setUserProfile(prevProfile => ({
      ...prevProfile,
      noCortes: prevProfile.noCortes + 1,
    }));
  };

  const updateUserProfile = (updatedFields) => {
    setUserProfile(prevProfile => ({
      ...prevProfile,
      ...updatedFields,
    }));
  };

  const setAdminStatus = (status) => {
    setUserProfile(prevProfile => ({
      ...prevProfile,
      isAdmin: status,
    }));
  };

  // NUEVA FUNCIÓN: logout
  const logout = () => {
    localStorage.removeItem('userProfile'); // Limpia el localStorage
    setUserProfile({ name: '', email: '', noCortes: 0, isAdmin: false }); // Restablece el estado del perfil
  };

  return (
    <UserContext.Provider value={{ userProfile, incrementAppointments, updateUserProfile, setAdminStatus, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};