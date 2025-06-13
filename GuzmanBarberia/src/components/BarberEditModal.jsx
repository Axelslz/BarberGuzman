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
            <Box sx={style}>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <Typography id="barber-edit-modal-title" variant="h6" component="h2" sx={{ mb: 2, color: '#333' }}>
                    Editar Perfil
                </Typography>

                {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

                {barberoData ? ( 
                    <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Avatar
                            src={previewFotoUrl || ''}
                            sx={{
                                width: 120,
                                height: 120,
                                mb: 2,
                                border: '4px solid #D4AF37',
                                boxShadow: '0px 0px 10px rgba(0,0,0,0.1)',
                            }}
                            alt="Previsualización de Perfil"
                        >
                            {!previewFotoUrl && <PhotoCameraIcon sx={{ fontSize: 60, color: '#bdbdbd' }} />}
                        </Avatar>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <Button
                                variant="contained"
                                component="label"
                                startIcon={<PhotoCameraIcon />}
                                sx={{
                                    backgroundColor: '#D4AF37',
                                    color: 'white',
                                    '&:hover': { backgroundColor: '#C59A00' },
                                    fontSize: '0.75rem',
                                    px: 1.5, py: 0.8,
                                }}
                            >
                                Cambiar Foto
                                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                            </Button>
                            {previewFotoUrl && (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={handleClearPhoto}
                                    sx={{
                                        fontSize: '0.75rem',
                                        px: 1.5, py: 0.8,
                                    }}
                                >
                                    Quitar
                                </Button>
                            )}
                        </Box>

                        <TextField
                            label="Nombre"
                            variant="outlined"
                            fullWidth
                            margin="dense"
                            value={barberoData.nombre || ''}
                            InputProps={{ readOnly: true }}
                            sx={{ mb: 1 }}
                        />
                        <TextField
                            label="Apellido"
                            variant="outlined"
                            fullWidth
                            margin="dense"
                            value={barberoData.apellido || ''}
                            InputProps={{ readOnly: true }}
                            sx={{ mb: 1 }}
                        />

                        <TextField
                            label="Especialidad"
                            variant="outlined"
                            fullWidth
                            margin="dense"
                            value={especialidad}
                            onChange={(e) => setEspecialidad(e.target.value)}
                            required
                            sx={{ mb: 1 }}
                        />
                        <TextField
                            label="Descripción"
                            variant="outlined"
                            fullWidth
                            margin="dense"
                            multiline
                            rows={3}
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            sx={{ mb: 2 }}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            sx={{
                                mt: 1,
                                backgroundColor: '#D4AF37',
                                color: 'white',
                                '&:hover': { backgroundColor: '#C59A00' },
                                fontSize: '1rem',
                                py: 1.2,
                            }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Guardar Cambios'}
                        </Button>
                    </form>
                ) : (
                    !loading && !initialLoad && !error && <Typography>No se pudieron cargar los datos del barbero.</Typography>
                )}
            </Box>
        </Modal>
    );
}

export default BarberEditModal;