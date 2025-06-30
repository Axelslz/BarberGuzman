// ScheduleEditDialog.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Box, CircularProgress, Alert,
    FormControlLabel, Checkbox, Grid, Typography, Divider, MenuItem, Select, InputLabel,
    FormControl
} from '@mui/material';
import moment from 'moment';
import 'moment/locale/es';
import appointmentService from '../services/appointmentService';

moment.locale('es');

function ScheduleEditDialog({ open, onClose, barberId, barberName, selectedDate, initialAction }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [currentSchedule, setCurrentSchedule] = useState([]);
    const [unavailableBlocks, setUnavailableBlocks] = useState([]);
    const [newSlotTime, setNewSlotTime] = useState('');
    const [newSlotDuration, setNewSlotDuration] = useState('30');
    const [blockStartTime, setBlockStartTime] = useState('');
    const [blockEndTime, setBlockEndTime] = useState('');
    const [blockReason, setBlockReason] = useState('');
    const [blockFullDay, setBlockFullDay] = useState(false);

    // Refs for sections (optional, if you want to scroll) - Keep these as they might be useful
    const appointmentsRef = useRef(null);
    const availableSlotsRef = useRef(null);
    const addSlotRef = useRef(null);
    const blockTimeRef = useRef(null);

    const fetchBarberSchedule = useCallback(async () => {
        if (!barberId || !selectedDate) {
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await appointmentService.getBarberAvailability(barberId, selectedDate);

            let slots = [];
            let unavailable = [];

            if (response && response.disponibilidad && response.horariosNoDisponibles) {
                slots = response.disponibilidad;
                unavailable = response.horariosNoDisponibles;
            } else if (response && Array.isArray(response)) {
                // If the response is a flat array, distinguish based on a property like 'es_bloqueo_manual' or 'cita_id'
                slots = response.filter(slot => !slot.es_bloqueo_manual); // Assuming 'es_bloqueo_manual' exists for blocks
                unavailable = response.filter(slot => slot.es_bloqueo_manual);
            } else {
                setError('No se pudo cargar el horario actual. Formato de datos inesperado de la API.');
                return;
            }

            // Filter actual appointments from the 'slots' if they are present there
            const actualAppointments = slots.filter(slot => !slot.disponible && slot.cita_id);
            const actualAvailableSlots = slots.filter(slot => slot.disponible && !slot.es_bloqueo_manual);

            setCurrentSchedule(actualAppointments.concat(actualAvailableSlots)); // Combine them if needed or handle separately
            setUnavailableBlocks(unavailable);

        } catch (err) {
            // Mejorar el manejo del error para mostrar el mensaje específico del backend
            setError(`Error al cargar el horario del barbero: ${err.response?.data?.message || err.message || 'Error desconocido'}`);
            console.error("Error fetching barber schedule for edit:", err);
        } finally {
            setLoading(false);
        }
    }, [barberId, selectedDate]);

    useEffect(() => {
        if (open) {
            fetchBarberSchedule();
            // Resetear estados al abrir el diálogo
            setNewSlotTime('');
            setNewSlotDuration('30');
            setBlockStartTime('');
            setBlockEndTime('');
            setBlockReason('');
            setBlockFullDay(false);
            setError(null);
            setSuccess(null);

            // DESPLAZARSE A LA SECCIÓN RELEVANTE BASADO EN initialAction
            if (initialAction) {
                // No need for a timeout if only one section is displayed based on initialAction
                // This scrolling logic might become less critical if only one view is shown at a time
                // but can be kept for cases where a section might still be long within its specific view.
                setTimeout(() => {
                    switch (initialAction) {
                        case 'viewAppointments':
                            appointmentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            break;
                        case 'editAvailableSlots':
                            availableSlotsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            break;
                        case 'blockTime':
                            blockTimeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            break;
                        default:
                            break;
                    }
                }, 100);
            }
        }
    }, [open, fetchBarberSchedule, initialAction]);

    const handleCancelAppointment = async (appointmentId) => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const confirmCancel = window.confirm("¿Estás seguro de que quieres cancelar esta cita y liberar el horario?");
            if (confirmCancel) {
                // *** LA CORRECCIÓN CLAVE ESTÁ AQUÍ ***
                // Asegúrate de que el estado enviado no sea nulo o vacío.
                // Debe ser 'cancelada' (o el valor que uses en tu backend para este estado).
                await appointmentService.updateAppointment(appointmentId, { nuevoEstado: 'cancelada' }); 
                setSuccess('Cita cancelada y horario liberado exitosamente.');
                fetchBarberSchedule(); // Vuelve a cargar el horario para reflejar el cambio
            } else {
                setLoading(false);
                return;
            }
        } catch (err) {
            // Manejo de errores mejorado para capturar el mensaje del backend
            setError(`Error al cancelar la cita: ${err.response?.data?.message || err.message || 'Error desconocido'}`);
            console.error("Error canceling appointment:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSlot = async () => {
        if (!newSlotTime || !moment(newSlotTime, 'HH:mm').isValid()) {
            setError('Por favor, introduce una hora válida para el nuevo slot (HH:mm).');
            return;
        }
        if (!newSlotDuration || isNaN(parseInt(newSlotDuration))) {
            setError('Por favor, selecciona una duración válida para el nuevo slot.');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await appointmentService.addBarberScheduleSlot(barberId, selectedDate, newSlotTime, newSlotDuration);
            setSuccess('Nuevo horario disponible añadido exitosamente.');
            setNewSlotTime('');
            setNewSlotDuration('30');
            fetchBarberSchedule();
        } catch (err) {
            setError(`Error al añadir el horario: ${err.response?.data?.message || err.message || 'Error desconocido'}`);
            console.error("Error adding new slot:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSlot = async (slotId) => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const confirmDelete = window.confirm("¿Estás seguro de que quieres eliminar este horario disponible?");
            if (confirmDelete) {
                await appointmentService.deleteBarberScheduleSlot(slotId);
                setSuccess('Horario disponible eliminado exitosamente.');
                fetchBarberSchedule();
            } else {
                setLoading(false);
                return;
            }
        } catch (err) {
            setError(`Error al eliminar el horario: ${err.response?.data?.message || err.message || 'Error desconocido'}`);
            console.error("Error deleting slot:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleBlockTime = async () => {
        if (!blockFullDay) {
            if (!blockStartTime || !moment(blockStartTime, 'HH:mm').isValid()) {
                setError('Por favor, introduce una hora de inicio válida para el bloqueo (HH:mm).');
                return;
            }
            if (blockEndTime && !moment(blockEndTime, 'HH:mm').isValid()) {
                setError('Por favor, introduce una hora de fin válida para el bloqueo (HH:mm).');
                return;
            }
            if (blockStartTime && blockEndTime && moment(blockStartTime, 'HH:mm').isSameOrAfter(moment(blockEndTime, 'HH:mm'))) {
                setError('La hora de inicio debe ser anterior a la hora de fin para el bloqueo.');
                return;
            }
        }

        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const blockData = {
                id_barbero: barberId,
                fecha: selectedDate,
                hora_inicio: blockFullDay ? null : blockStartTime,
                hora_fin: blockFullDay ? null : blockEndTime,
                motivo: blockReason,
                dia_completo: blockFullDay
            };

            console.log("Datos que se enviarán al backend para bloquear:", blockData);
            await appointmentService.blockBarberTime(blockData);

            setSuccess('Horario bloqueado exitosamente.');
            setBlockStartTime('');
            setBlockEndTime('');
            setBlockReason('');
            setBlockFullDay(false);
            fetchBarberSchedule();
        } catch (err) {
            setError(`Error al bloquear el horario: ${err.response?.data?.message || err.message || 'Error desconocido'}`);
            console.error("Error blocking time:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUnblockTime = async (blockId) => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const confirmUnblock = window.confirm("¿Estás seguro de que quieres liberar este bloqueo de horario?");
            if (confirmUnblock) {
                await appointmentService.unblockBarberTime(blockId);
                setSuccess('Bloqueo de horario liberado exitosamente.');
            } else {
                setLoading(false);
                return;
            }
            fetchBarberSchedule();
        } catch (err) {
            setError(`Error al liberar el horario: ${err.response?.data?.message || err.message || 'Error desconocido'}`);
            console.error("Error unblocking time:", err);
        } finally {
            setLoading(false);
        }
    };

    const generateDurationOptions = () => {
        const durations = [15, 30, 45, 60, 90, 120];
        return durations.map(d => (
            <MenuItem key={d} value={d.toString()}>{`${d} minutos`}</MenuItem>
        ));
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ backgroundColor: '#1a202c', color: '#D4AF37' }}>
                Editar Horario para {barberName} ({selectedDate})
            </DialogTitle>
            <DialogContent dividers>
                {loading && <CircularProgress sx={{ color: '#D4AF37', mb: 2 }} />}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                {/* Vista para 'Ver Citas Agendadas' */}
                {initialAction === 'viewAppointments' && (
                    <Box>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Visualizando citas agendadas. Puedes cancelarlas si es necesario.
                        </Alert>
                        <Typography variant="h6" sx={{ mt: 2, mb: 1, color: '#333333' }} ref={appointmentsRef}>
                            Horarios de Citas Agendadas
                        </Typography>
                        <Grid container spacing={1} sx={{ maxHeight: '300px', overflowY: 'auto', p: 1, border: '1px solid #eee', borderRadius: 1, mb: 3 }}>
                            {currentSchedule.filter(slot => !slot.disponible && slot.cita_id).length > 0 ? (
                                currentSchedule.filter(slot => !slot.disponible && slot.cita_id).map((slot) => (
                                    <Grid item xs={12} key={slot.cita_id || slot.hora_inicio_24h}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderBottom: '1px solid #eee' }}>
                                            <Typography variant="body1">
                                                {moment(slot.hora_inicio_24h, 'HH:mm').format('h:mm A')} - <span style={{ fontWeight: 'bold' }}>OCUPADO</span> (Cita: {slot.cliente_nombre || 'Desconocido'})
                                            </Typography>
                                            {slot.cita_id && (
                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    size="small"
                                                    onClick={() => handleCancelAppointment(slot.cita_id)}
                                                    sx={{ backgroundColor: '#f44336', '&:hover': { backgroundColor: '#d32f2f' } }}
                                                >
                                                    Cancelar Cita
                                                </Button>
                                            )}
                                        </Box>
                                    </Grid>
                                ))
                            ) : (
                                <Grid item xs={12}>
                                    <Typography variant="body2" sx={{ textAlign: 'center', p: 2, color: '#555' }}>
                                        No hay citas agendadas para este día.
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                )}

                {/* Vista para 'Editar Horarios Disponibles' */}
                {initialAction === 'editAvailableSlots' && (
                    <Box>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Administra tus horarios disponibles o añade nuevos.
                        </Alert>
                        <Typography variant="h6" sx={{ mb: 1, color: '#333333' }} ref={availableSlotsRef}>
                            Horarios Disponibles del Día
                        </Typography>
                        <Grid container spacing={1} sx={{ maxHeight: '300px', overflowY: 'auto', p: 1, border: '1px solid #eee', borderRadius: 1 }}>
                            {currentSchedule.filter(slot => slot.disponible && !slot.es_bloqueo_manual).length > 0 ? (
                                currentSchedule.filter(slot => slot.disponible && !slot.es_bloqueo_manual).map((slot) => (
                                    <Grid item xs={12} key={slot.slot_id || slot.hora_inicio_24h}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderBottom: '1px solid #eee' }}>
                                            <Typography variant="body1">
                                                {moment(slot.hora_inicio_24h, 'HH:mm').format('h:mm A')} - Disponible ({slot.duracion_minutos || 'N/A'} min)
                                            </Typography>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                onClick={() => handleDeleteSlot(slot.slot_id)}
                                                sx={{ color: '#f44336', borderColor: '#f44336', '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.1)' } }}
                                            >
                                                Eliminar Slot
                                            </Button>
                                        </Box>
                                    </Grid>
                                ))
                            ) : (
                                <Grid item xs={12}>
                                    <Typography variant="body2" sx={{ textAlign: 'center', p: 2, color: '#555' }}>
                                        No hay horarios disponibles configurados para este día.
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="h6" sx={{ mb: 1, color: '#333333' }} ref={addSlotRef}>
                            Añadir Nuevo Horario Disponible
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <TextField
                                    label="Hora de inicio (HH:mm)"
                                    value={newSlotTime}
                                    onChange={(e) => setNewSlotTime(e.target.value)}
                                    placeholder="Ej. 13:00"
                                    sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#D4AF37' }, '&:hover fieldset': { borderColor: '#C39F37' }, '&.Mui-focused fieldset': { borderColor: '#D4AF37' } }, '& .MuiInputLabel-root': { color: '#333333' } }}
                                />
                                <FormControl sx={{ minWidth: 120 }}>
                                    <InputLabel id="duration-select-label" sx={{ color: '#333333' }}>Duración</InputLabel>
                                    <Select
                                        labelId="duration-select-label"
                                        value={newSlotDuration}
                                        label="Duración"
                                        onChange={(e) => setNewSlotDuration(e.target.value)}
                                        sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D4AF37' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#C39F37' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#D4AF37' }, '& .MuiSvgIcon-root': { color: '#D4AF37' } }}
                                    >
                                        {generateDurationOptions()}
                                    </Select>
                                </FormControl>
                            </Box>
                            <Button
                                variant="contained"
                                onClick={handleAddSlot}
                                sx={{
                                    backgroundColor: '#D4AF37',
                                    '&:hover': { backgroundColor: '#C39F37' },
                                    color: 'black',
                                    fontWeight: 'bold',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                Añadir Slot
                            </Button>
                        </Box>
                    </Box>
                )}

                {/* Vista para 'Bloquear Horario' */}
                {initialAction === 'blockTime' && (
                    <Box>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Bloquea un período de tiempo o el día completo para tu horario.
                        </Alert>
                        <Typography variant="h6" sx={{ mb: 1, color: '#333333' }} ref={blockTimeRef}>
                            Bloquear Horarios / Día Completo
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={blockFullDay}
                                        onChange={(e) => setBlockFullDay(e.target.checked)}
                                        sx={{ color: '#D4AF37', '&.Mui-checked': { color: '#D4AF37' } }}
                                    />
                                }
                                label="Bloquear todo el día"
                            />
                            {!blockFullDay && (
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <TextField
                                        label="Hora de inicio (HH:mm)"
                                        value={blockStartTime}
                                        onChange={(e) => setBlockStartTime(e.target.value)}
                                        placeholder="Ej. 13:00"
                                        sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#D4AF37' }, '&:hover fieldset': { borderColor: '#C39F37' }, '&.Mui-focused fieldset': { borderColor: '#D4AF37' } }, '& .MuiInputLabel-root': { color: '#333333' } }}
                                    />
                                    <TextField
                                        label="Hora de fin (HH:mm, opcional)"
                                        value={blockEndTime}
                                        onChange={(e) => setBlockEndTime(e.target.value)}
                                        placeholder="Ej. 17:00"
                                        sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#D4AF37' }, '&:hover fieldset': { borderColor: '#C39F37' }, '&.Mui-focused fieldset': { borderColor: '#D4AF37' } }, '& .MuiInputLabel-root': { color: '#333333' } }}
                                    />
                                </Box>
                            )}
                            <TextField
                                label="Motivo del bloqueo (opcional)"
                                value={blockReason}
                                onChange={(e) => setBlockReason(e.target.value)}
                                multiline
                                rows={2}
                                sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#D4AF37' }, '&:hover fieldset': { borderColor: '#C39F37' }, '&.Mui-focused fieldset': { borderColor: '#D4AF37' } }, '& .MuiInputLabel-root': { color: '#333333' } }}
                            />
                            <Button
                                variant="contained"
                                onClick={handleBlockTime}
                                sx={{
                                    backgroundColor: '#D4AF37',
                                    '&:hover': { backgroundColor: '#C39F37' },
                                    color: 'black',
                                    fontWeight: 'bold',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {blockFullDay ? 'Bloquear Día Completo' : 'Bloquear Horario Específico'}
                            </Button>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="h6" sx={{ mb: 1, color: '#333333' }}>
                            Horarios Bloqueados Manualmente
                        </Typography>
                        <Grid container spacing={1} sx={{ maxHeight: '200px', overflowY: 'auto', p: 1, border: '1px solid #eee', borderRadius: 1 }}>
                            {unavailableBlocks.length > 0 ? (
                                unavailableBlocks.map((block) => (
                                    <Grid item xs={12} key={block.id || block.hora_inicio_24h}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderBottom: '1px solid #eee' }}>
                                            <Typography variant="body1">
                                                {block.dia_completo ? 'Día Completo' :
                                                    (block.hora_inicio && block.hora_fin ?
                                                        `${moment(block.hora_inicio, 'HH:mm:ss').format('h:mm A')} - ${moment(block.hora_fin, 'HH:mm:ss').format('h:mm A')}` :
                                                        `Desde ${moment(block.hora_inicio, 'HH:mm:ss').format('h:mm A')}`
                                                    )
                                                }
                                                {block.motivo && ` (${block.motivo})`}
                                            </Typography>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                size="small"
                                                onClick={() => handleUnblockTime(block.id)}
                                                sx={{ color: '#D4AF37', borderColor: '#D4AF37', '&:hover': { backgroundColor: 'rgba(212, 175, 55, 0.1)' } }}
                                            >
                                                Liberar
                                            </Button>
                                        </Box>
                                    </Grid>
                                ))
                            ) : (
                                <Grid item xs={12}>
                                    <Typography variant="body2" sx={{ textAlign: 'center', p: 2, color: '#555' }}>
                                        No hay horarios bloqueados manualmente para este día.
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                )}

            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} variant="outlined" sx={{ color: '#D4AF37', borderColor: '#D4AF37', '&:hover': { borderColor: '#C39F37' } }}>
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ScheduleEditDialog;