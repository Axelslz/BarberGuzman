import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext.jsx';
import { CircularProgress } from '@mui/material';

const GuestRoute = ({ children }) => {
    const { userProfile, isLoadingProfile } = useUser();

    if (isLoadingProfile) {
        return (
            <div className="flex items-center justify-center h-screen">
                <CircularProgress />
            </div>
        );
    }

    if (userProfile) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default GuestRoute;