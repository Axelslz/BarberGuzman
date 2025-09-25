import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    login as apiLogin, 
    getProfile,
    logout as apiLogout,
    refreshAccessToken,
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
    const [isLoadingProfile, setIsLoadingProfile] = useState(true); 

    const updateUserProfileState = useCallback((profile) => {
        setUserProfile(profile);
   
    }, []);

    const loginUser = async (credentials) => {
        try {
            const { user } = await apiLogin(credentials.correo, credentials.contrasena);
            updateUserProfileState(user);
            return user;
        } catch (error) {
            console.error("UserContext - Error en loginUser:", error);
            updateUserProfileState(null); 
            throw error; 
        }
    };

    const logoutUser = () => {
        apiLogout();
        updateUserProfileState(null);
    };

    useEffect(() => {
        const restoreSession = async () => {
            try {
                await refreshAccessToken();
                const profileData = await getProfile();
                updateUserProfileState(profileData);
            } catch (error) {
                console.log("No se pudo restaurar la sesión, se requiere inicio de sesión.");
                updateUserProfileState(null);
            } finally {
                setIsLoadingProfile(false);
            }
        };

        restoreSession();
    }, [updateUserProfileState]); 

    const value = {
        userProfile,
        isLoadingProfile,
        loginUser,
        logoutUser,
        updateUserProfile: updateUserProfileState, 
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};