import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import moment from 'moment'; 
import 'moment/locale/es';

import EditIcon from '@mui/icons-material/Edit';
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; 

import Header from '../components/Header.jsx';
import SideMenu from '../components/SideMenu.jsx';
import UserProfileModal from '../components/UserProfileModal.jsx';
import BarberEditModal from '../components/BarberEditModal.jsx';

import { useUser } from '../contexts/UserContext.jsx';
import barberService from '../services/barberService';

moment.locale('es');

function BarberSelectionPage() {
    const [barberos, setBarberos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [menuOpen, setMenuOpen] = useState(false);
    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const [anchorEl, setAnchorEl] = useState(null);
    const [isProfilePopoverOpen, setIsProfilePopoverOpen] = useState(false);

    const { userProfile, isAdmin, isSuperAdmin, isLoadingProfile } = useUser();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedBarberId, setSelectedBarberId] = useState(null);

    const handleOpenProfilePopover = (event) => {
        setAnchorEl(event.currentTarget);
        setIsProfilePopoverOpen(true);
    };

    const handleCloseProfilePopover = () => {
        setAnchorEl(null);
        setIsProfilePopoverOpen(false);
    };

    const fetchBarbers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await barberService.getAllBarbers();
            setBarberos(data);
        } catch (err) {
            setError('Error al cargar la lista de barberos. Inténtalo de nuevo más tarde.');
            console.error('Error fetching barbers:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isLoadingProfile) {
            fetchBarbers();
        }
    }, [fetchBarbers, isLoadingProfile]);

    const handleSelectBarber = (barberId) => {
        navigate(`/agendar-cita/${barberId}`);
    };

    const handleOpenEditModal = (barberId) => {
        setSelectedBarberId(barberId);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedBarberId(null);
        fetchBarbers(); 
    };

    const canEditBarbers = isAdmin || isSuperAdmin;

    if (loading || isLoadingProfile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <div className="flex items-center space-x-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
                    <h2 className="text-xl font-semibold text-gray-700">Cargando información...</h2>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full text-center">
                    <div className="text-red-600 mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <p className="text-red-700 mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
            <Header toggleMenu={toggleMenu} onOpenProfilePopover={handleOpenProfilePopover} /> 
            <SideMenu isOpen={menuOpen} toggleMenu={toggleMenu} />

            <div className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-8 mt-4">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-state-800 mb-2">
                            Selecciona a tu Barbero
                        </h1>
                        <div className="w-24 h-1 bg-yellow-600 mx-auto rounded-full"></div>
                    </div>

                    {/* Barbers Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 justify-center">
                        {barberos.map((barbero) => (
                            <div
                                key={barbero.id}
                                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden relative group"
                            >
                                {/* Edit Button */}
                                {canEditBarbers && (
                                    <button
                                        onClick={() => handleOpenEditModal(barbero.id)}
                                        className="absolute top-3 right-3 z-10 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-md transition-all duration-200 hover:scale-110"
                                    >
                                        <EditIcon className="text-yellow-600" fontSize="small" />
                                    </button>
                                )}

                                {/* Card Content */}
                                <div className="p-6 flex flex-col items-center text-center h-full">
                                    {/* Profile Image */}
                                    <div className="mb-4 relative">
                                        {barbero.foto_perfil_url ? (
                                            <img
                                                src={barbero.foto_perfil_url}
                                                alt={`${barbero.nombre} ${barbero.apellido}`}
                                                className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full object-cover border-4 border-yellow-600 shadow-lg transition-transform duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-yellow-600 shadow-lg transition-transform duration-300 group-hover:scale-105">
                                                <AccountCircleIcon className="text-gray-400 text-5xl sm:text-6xl" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Barber Info */}
                                    <div className="flex-1 flex flex-col justify-between w-full">
                                        <div className="mb-4">
                                            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
                                                {barbero.nombre} {barbero.apellido}
                                            </h3>
                                            
                                            <p className="text-sm text-yellow-600 font-medium mb-2">
                                                {barbero.especialidad || 'Barbero General'}
                                            </p>

                                            {barbero.descripcion && (
                                                <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                                                    {barbero.descripcion}
                                                </p>
                                            )}
                                        </div>

                                        {/* Select Button */}
                                        <button
                                            onClick={() => handleSelectBarber(barbero.id)}
                                            className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                                        >
                                            Seleccionar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* No Barbers Message */}
                    {barberos.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                No hay barberos disponibles
                            </h3>
                            <p className="text-gray-500">
                                Por favor, inténtalo más tarde o contacta al administrador.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <UserProfileModal
                open={isProfilePopoverOpen}
                onClose={handleCloseProfilePopover}
                anchorEl={anchorEl}
                userProfile={userProfile}
            />

            <BarberEditModal
                open={isEditModalOpen}
                onClose={handleCloseEditModal}
                barberoId={selectedBarberId}
                onBarberUpdated={handleCloseEditModal}
            />
        </div>
    );
}

export default BarberSelectionPage;