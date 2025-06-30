import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login, registrar, getProfile, logout, getToken, getUserRole } from '../services/authService';

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
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [isBarber, setIsBarber] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true); 

    const [localAppointmentCount, setLocalAppointmentCount] = useState(0);

    const updateUserProfile = useCallback((profile) => {
        console.log("UserContext - Perfil que se intenta actualizar:", profile);
        setUserProfile(profile);
        setIsAdmin(profile?.role === 'admin');
        setIsSuperAdmin(profile?.role === 'super_admin');
        setIsBarber(profile?.role === 'admin' && profile?.id_barbero !== undefined && profile.id_barbero !== null); 
        setLocalAppointmentCount(profile?.citas_completadas || 0);
        console.log("UserContext - isAdmin después de actualizar:", profile?.role === 'admin');
        console.log("UserContext - isSuperAdmin después de actualizar:", profile?.role === 'super_admin');
        console.log("UserContext - isBarber después de actualizar:", (profile?.role === 'admin' && profile?.id_barbero !== undefined && profile.id_barbero !== null));
    }, []);

    const loadUserProfile = useCallback(async () => {
        setIsLoadingProfile(true); 
        console.log("UserContext - Iniciando carga de perfil. ¿Hay token?", !!localStorage.getItem('token'));
        const token = localStorage.getItem('token');
        
        if (token) {
            try {
                const profileData = await getProfile(); 

                console.log("UserContext - ProfileData de getProfile:", profileData);
                
                if (!profileData || !profileData.role) {
                    console.warn("UserContext - loadUserProfile: Perfil inválido o rol no definido. Limpiando sesión.");
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    updateUserProfile(null); 
                } else {
                    updateUserProfile({
                        id: profileData.id,
                        name: profileData.name,
                        lastName: profileData.lastname,
                        email: profileData.correo,
                        role: profileData.role, 
                        id_barbero: profileData.id_barbero, 
                        citas_completadas: profileData.citas_completadas || 0,
                    });
                }
            } catch (error) {
                console.error("UserContext - Error al cargar el perfil del usuario:", error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                updateUserProfile(null);
            } finally {
                setIsLoadingProfile(false); 
                console.log("UserContext - Carga de perfil finalizada. isLoadingProfile: false.");
            }
        } else {
            setIsLoadingProfile(false); 
            updateUserProfile(null);
            console.log("UserContext - No hay token, perfil no cargado. isLoadingProfile: false.");
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
        isSuperAdmin,
        isBarber,
        isLoadingProfile, 
        updateUserProfile,
        incrementAppointments,
        appointmentCount: localAppointmentCount,
        logout: () => {
            logout();
            updateUserProfile(null);
            setLocalAppointmentCount(0);
        }
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};