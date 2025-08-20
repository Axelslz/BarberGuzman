// ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext.jsx';
import { CircularProgress } from '@mui/material';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { userProfile, isLoadingProfile } = useUser();

    if (isLoadingProfile) {
        return (
            <div className="flex items-center justify-center h-screen">
                <CircularProgress />
                <p className="ml-4">Cargando autenticación...</p>
            </div>
        );
    }

    if (!userProfile) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userProfile.role)) {
        
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;