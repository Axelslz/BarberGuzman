// UserContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    login,
    registrar,
    getProfile,
    logout,
    getToken,
    getUserRole,
    updateProfilePhoto, 
    updateUserProfile as updateProfileService 
} from '../services/authService';

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

    const updateUserProfileState = useCallback((profile) => {
        console.log("UserContext - Perfil que se intenta actualizar:", profile);
        setUserProfile(profile);
        setIsAdmin(profile?.role === 'admin');
        setIsSuperAdmin(profile?.role === 'super_admin');
        setIsBarber(profile?.role === 'admin' && profile?.id_barbero !== undefined && profile.id_barbero !== null);
        setLocalAppointmentCount(profile?.citas_completadas || 0);
    }, []);

    const loadUserProfile = useCallback(async () => {
        setIsLoadingProfile(true);
        console.log("UserContext - Iniciando carga de perfil. ¿Hay token?", !!localStorage.getItem('token'));
        const token = localStorage.getItem('token');

        if (token) {
            try {
                const profileData = await getProfile();

                if (!profileData || !profileData.role) {
                    console.warn("UserContext - loadUserProfile: Perfil inválido o rol no definido. Limpiando sesión.");
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    updateUserProfileState(null);
                } else {
                    updateUserProfileState({
                        id: profileData.id,
                        name: profileData.name,
                        lastName: profileData.lastname,
                        email: profileData.correo,
                        role: profileData.role,
                        id_barbero: profileData.id_barbero,
                        citas_completadas: profileData.citas_completadas || 0,
                        photoUrl: profileData.photoUrl || null, // ¡AQUÍ SE AÑADE LA URL DE LA FOTO!
                    });
                }
            } catch (error) {
                console.error("UserContext - Error al cargar el perfil del usuario:", error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                updateUserProfileState(null);
            } finally {
                setIsLoadingProfile(false);
                console.log("UserContext - Carga de perfil finalizada. isLoadingProfile: false.");
            }
        } else {
            setIsLoadingProfile(false);
            updateUserProfileState(null);
            console.log("UserContext - No hay token, perfil no cargado. isLoadingProfile: false.");
        }
    }, [updateUserProfileState]);

    useEffect(() => {
        loadUserProfile();
    }, [loadUserProfile]);

    // Lógica para actualizar los datos de texto (nombre, apellido)
    const updateUserProfile = useCallback(async (updates) => {
        if (!userProfile) return;
        try {
            // Llama al servicio que actualiza el perfil en tu BD
            await updateProfileService(userProfile.id, updates); 
            // Actualiza el estado local del perfil con los nuevos datos
            setUserProfile(prevProfile => ({
                ...prevProfile,
                ...updates,
            }));
        } catch (error) {
            console.error('Error al actualizar el perfil de texto:', error);
            throw error;
        }
    }, [userProfile]);

    // Lógica para actualizar la foto de perfil
    const updateUserPhoto = useCallback(async (imageFile) => {
        if (!userProfile) return;
        try {
            // Llama al servicio que sube la imagen y devuelve la nueva URL
            const newPhotoUrl = await updateProfilePhoto(userProfile.id, imageFile);
            // Actualiza el estado local del perfil con la nueva URL
            setUserProfile(prevProfile => ({
                ...prevProfile,
                photoUrl: newPhotoUrl,
            }));
            return newPhotoUrl;
        } catch (error) {
            console.error('Error al actualizar la foto de perfil:', error);
            throw error;
        }
    }, [userProfile]);

    const value = {
        userProfile,
        isAdmin,
        isSuperAdmin,
        isBarber,
        isLoadingProfile,
        updateUserProfile,
        updateUserPhoto, // ¡AQUÍ SE EXPORTA LA FUNCIÓN!
        logout: () => {
            logout();
            updateUserProfileState(null);
            setLocalAppointmentCount(0);
        }
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};