import React, { useState, useEffect } from 'react';
import {
    Modal, Box, Typography, TextField, Button, IconButton, CircularProgress, Alert,
    Avatar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import barberService from '../services/barberService';
import { useUser } from '../contexts/UserContext'; 

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 400 },
    bgcolor: 'background.paper',
    border: '2px solid #D4AF37',
    boxShadow: 24,
    p: 3,
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    outline: 'none',
};

function BarberEditModal({ open, onClose, barberoId, onBarberUpdated }) {
    const { userProfile, isLoadingProfile } = useUser(); 

    const [barberoData, setBarberoData] = useState(null);
    const [especialidad, setEspecialidad] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fotoPerfilFile, setFotoPerfilFile] = useState(null);
    const [previewFotoUrl, setPreviewFotoUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [initialLoad, setInitialLoad] = useState(true);

    useEffect(() => {
        if (open && barberoId) {
            setLoading(true);
            setError(null);
            setInitialLoad(true);
            const fetchBarberDetails = async () => {
                try {
                    const data = await barberService.getBarberById(barberoId);
                    setBarberoData(data);
                    setEspecialidad(data.especialidad || '');
                    setDescripcion(data.descripcion || '');
                    setPreviewFotoUrl(data.foto_perfil_url || '');
                    setFotoPerfilFile(null);
                } catch (err) {
                    setError('Error al cargar los datos del barbero.');
                    console.error('Error fetching barber details for edit:', err);
                } finally {
                    setLoading(false);
                    setInitialLoad(false);
                }
            };
           
            if (!isLoadingProfile && userProfile) { 
                fetchBarberDetails();
            } else if (!isLoadingProfile && !userProfile) { 
                setError('No tienes permisos para editar este barbero. Inicia sesión.');
                setLoading(false);
                setInitialLoad(false);
            }
        } else if (!open) {
            setBarberoData(null);
            setEspecialidad('');
            setDescripcion('');
            setFotoPerfilFile(null);
            setPreviewFotoUrl('');
            setLoading(false);
            setError(null);
        }
    }, [open, barberoId, isLoadingProfile, userProfile]); 

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFotoPerfilFile(file);
            setPreviewFotoUrl(URL.createObjectURL(file));
        } else {
            setFotoPerfilFile(null);
            setPreviewFotoUrl(barberoData?.foto_perfil_url || '');
        }
    };

    const handleClearPhoto = () => {
        setFotoPerfilFile(null);
        setPreviewFotoUrl('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!userProfile || !localStorage.getItem('token')) { 
            setError('No estás autenticado para realizar esta acción.');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('especialidad', especialidad);
        formData.append('descripcion', descripcion);

        if (fotoPerfilFile) {
            formData.append('foto_perfil', fotoPerfilFile);
        } else if (previewFotoUrl === '') {
            formData.append('clear_foto_perfil', 'true');
        }

        try {
            const token = localStorage.getItem('token'); 
            await barberService.updateBarbero(barberoId, formData, token);
            
            onClose();
            onBarberUpdated();
        } catch (err) {
            setError('Error al actualizar el barbero: ' + (err.response?.data?.message || 'Hubo un error inesperado.'));
            console.error('Error updating barber:', err);
        } finally {
            setLoading(false);
        }
    };

    if (isLoadingProfile || (loading && initialLoad)) { 
        return (
            <Modal open={open} onClose={onClose}>
                <Box sx={{ ...style, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>Cargando datos...</Typography>
                </Box>
            </Modal>
        );
    }

    if (!userProfile) { 
        return (
            <Modal open={open} onClose={onClose}>
                <Box sx={{ ...style }}>
                    <Alert severity="warning">
                        Necesitas iniciar sesión para editar un barbero o no tienes los permisos necesarios.
                    </Alert>
                    <Button onClick={onClose} sx={{ mt: 2 }}>Cerrar</Button>
                </Box>
            </Modal>
        );
    }

    return (
    <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="barber-edit-modal-title"
        aria-describedby="barber-edit-modal-description"
    >
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            {/* Modal Container */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-3 top-3 p-2 rounded-full hover:bg-gray-100 transition-colors z-10 group"
                    aria-label="Cerrar modal"
                >
                    <CloseIcon className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
                </button>

                {/* Modal Content */}
                <div className="p-6 sm:p-8">
                    {/* Title */}
                    <h2 
                        id="barber-edit-modal-title" 
                        className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 pr-8"
                    >
                        Editar Perfil
                    </h2>

                    {/* Error Alert */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
                            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {/* Form */}
                    {barberoData ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Avatar Section */}
                            <div className="flex flex-col items-center space-y-4">
                                {/* Avatar */}
                                <div className="relative">
                                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-yellow-500 shadow-lg overflow-hidden bg-gray-100">
                                        {previewFotoUrl ? (
                                            <img
                                                src={previewFotoUrl}
                                                alt="Previsualización de Perfil"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <PhotoCameraIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Photo Buttons */}
                                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                    <label className="cursor-pointer">
                                        <div className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-2 min-w-[140px]">
                                            <PhotoCameraIcon className="w-4 h-4" />
                                            Cambiar Foto
                                        </div>
                                        <input
                                            type="file"
                                            hidden
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                    {previewFotoUrl && (
                                        <button
                                            type="button"
                                            onClick={handleClearPhoto}
                                            className="border border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 min-w-[140px]"
                                        >
                                            <DeleteIcon className="w-4 h-4" />
                                            Quitar
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-4">
                                {/* Nombre (Read-only) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre
                                    </label>
                                    <input
                                        type="text"
                                        value={barberoData.nombre || ''}
                                        readOnly
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500"
                                    />
                                </div>

                                {/* Apellido (Read-only) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Apellido
                                    </label>
                                    <input
                                        type="text"
                                        value={barberoData.apellido || ''}
                                        readOnly
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500"
                                    />
                                </div>

                                {/* Especialidad */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Especialidad <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={especialidad}
                                        onChange={(e) => setEspecialidad(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all duration-200"
                                        placeholder="Ej: Cortes modernos, barbas, etc."
                                    />
                                </div>

                                {/* Descripción */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Descripción
                                    </label>
                                    <textarea
                                        value={descripcion}
                                        onChange={(e) => setDescripcion(e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all duration-200 resize-none"
                                        placeholder="Describe tu experiencia y servicios..."
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-base sm:text-lg shadow-lg hover:shadow-xl"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Guardando...</span>
                                    </>
                                ) : (
                                    'Guardar Cambios'
                                )}
                            </button>
                        </form>
                    ) : (
                        !loading && !initialLoad && !error && (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <p className="text-gray-600">No se pudieron cargar los datos del barbero.</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    </Modal>
);
}

export default BarberEditModal;