import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Chip,
    ToggleButtonGroup,
    ToggleButton,
    CircularProgress,
    TextField,
} from '@mui/material';
// Eliminamos AppBar, Toolbar, IconButton, MenuIcon, NotificationsIcon, AccountCircleIcon de aquí
import SideMenu from '../components/SideMenu.jsx';
import UserProfileModal from '../components/UserProfileModal.jsx';
import { useUser } from '../contexts/UserContext.jsx';
import { format, isSameDay, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import appointmentService from '../services/appointmentService';

import Header from '../components/Header.jsx'; // Importamos el Header global

function HistoryPage() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileAnchorEl, setProfileAnchorEl] = useState(null); // Mantener para UserProfileModal
    const { userProfile, updateUserProfile, isAdmin, isSuperAdmin, isLoadingProfile } = useUser();

    const [filterType, setFilterType] = useState('day'); // 'day', 'week', 'month', 'all'
    const [filteredCuts, setFilteredCuts] = useState([]);
    const [actualCutsHistory, setActualCutsHistory] = useState([]);
    const [isFetchingHistory, setIsFetchingHistory] = useState(true);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    // Estas funciones `handleOpenProfilePopover` y `handleCloseProfilePopover`
    // serán pasadas como props al Header, pero se mantienen aquí si UserProfileModal
    // requiere control directo desde esta página o si quieres que el modal
    // se abra por otra interacción que no sea el Header.
    const handleOpenProfilePopover = (event) => {
        setProfileAnchorEl(event.currentTarget);
    };
    const handleCloseProfilePopover = () => {
        setProfileAnchorEl(null);
    };
    const isProfilePopoverOpen = Boolean(profileAnchorEl);

    const transformAppointmentData = (appointment) => {
        const clientName = appointment.cliente_name ? `${appointment.cliente_name} ${appointment.cliente_lastname || ''}`.trim() : 'Cliente Desconocido';
        const barberName = appointment.barbero_name ? `${appointment.barbero_name} ${appointment.barbero_lastname || ''}`.trim() : 'Barbero Desconocido';
        const serviceName = appointment.servicio_nombre ? appointment.servicio_nombre : 'Servicio Desconocido';
        const servicePrice = appointment.servicio_precio ? parseFloat(appointment.servicio_precio).toFixed(2) : '0.00';

        const time24h = appointment.hora_inicio ? appointment.hora_inicio.substring(0, 5) : '00:00';
        const formattedTime = appointment.hora_inicio ? format(parseISO(`2000-01-01T${appointment.hora_inicio}`), 'h:mm aa', { locale: es }) : '';

        let statusDisplay = 'DESCONOCIDO';
        if (appointment.estado) {
            switch (appointment.estado.toLowerCase()) {
                case 'completada':
                    statusDisplay = 'FINALIZADO';
                    break;
                case 'confirmada':
                case 'pendiente':
                    statusDisplay = 'EN ESPERA';
                    break;
                case 'cancelada':
                    statusDisplay = 'CANCELADA';
                    break;
                default:
                    statusDisplay = appointment.estado.toUpperCase();
            }
        }

        return {
            id: appointment.id,
            date: appointment.fecha_cita,
            time: formattedTime,
            status: statusDisplay,
            hora_inicio_24h: time24h,
            id_barbero: appointment.id_barbero,
            id_cliente: appointment.id_cliente,
            cliente_name: clientName,
            barbero_name: barberName,
            service_name: serviceName,
            service_price: servicePrice,
            display_service_price: `$${servicePrice}`
        };
    };

    const fetchCutsHistory = useCallback(async () => {
        console.log("HistoryPage - fetchCutsHistory: Iniciando.");

        if (isLoadingProfile || !userProfile) {
            setIsFetchingHistory(true);
            console.log("HistoryPage - Perfil aún cargando o no disponible, regresando.");
            return;
        }

        if (!(isAdmin || isSuperAdmin || userProfile.role === 'cliente')) {
            setActualCutsHistory([]);
            setFilteredCuts([]);
            setIsFetchingHistory(false);
            console.log("HistoryPage - No autorizado o perfil no disponible para ver historial.");
            return;
        }

        setIsFetchingHistory(true);
        try {
            let options = {};

            if (isSuperAdmin) {
                options.allBarbers = true;
                console.log('[HistoryPage] super_admin: Solicitando TODAS las citas al backend.');
            } else if (isAdmin) {
                options.barberId = userProfile.id_barbero;
                console.log(`[HistoryPage] Admin (barbero): Solicitando citas para su propio ID: ${userProfile.id_barbero}`);
            } else if (userProfile.role === 'cliente') {
                options.userId = userProfile.id;
                console.log(`[HistoryPage] Cliente: Solicitando citas para su propio ID: ${userProfile.id}`);
            }

            const response = await appointmentService.getAppointmentsHistory(options);
            const transformedData = response.map(transformAppointmentData);
            setActualCutsHistory(transformedData);
            console.log(`[HistoryPage] Historial de citas cargado: ${transformedData.length} citas.`);
        } catch (error) {
            console.error("Error al cargar el historial de cortes del backend:", error);
            setActualCutsHistory([]);
            setFilteredCuts([]);
        } finally {
            setIsFetchingHistory(false);
            console.log("HistoryPage - Finalizada la carga del historial.");
        }
    }, [isLoadingProfile, userProfile, isAdmin, isSuperAdmin]);

    useEffect(() => {
        fetchCutsHistory();
    }, [fetchCutsHistory]);

    useEffect(() => {
        const applyFilter = () => {
            console.log("HistoryPage - useEffect[applyFilter]: Aplicando filtro. FilterType:", filterType, "ActualCutsHistory length:", actualCutsHistory.length);

            if (isFetchingHistory) {
                setFilteredCuts([]);
                return;
            }

            let tempFilteredCuts = [...actualCutsHistory];

            if (!isSuperAdmin) {
                   if (isAdmin && userProfile?.id_barbero) {
                       tempFilteredCuts = tempFilteredCuts.filter(cut =>
                           cut.id_barbero?.toString() === userProfile.id_barbero.toString()
                       );
                   } else if (userProfile?.role === 'cliente' && userProfile?.id) {
                       tempFilteredCuts = tempFilteredCuts.filter(cut =>
                           cut.id_cliente?.toString() === userProfile.id.toString()
                       );
                   }
            }


            const today = new Date();
            switch (filterType) {
                case 'day':
                    tempFilteredCuts = tempFilteredCuts.filter(cut =>
                        isSameDay(parseISO(cut.date), parseISO(selectedDate))
                    );
                    break;
                case 'week':
                    const startOfWeekDate = startOfWeek(today, { locale: es });
                    const endOfWeekDate = endOfWeek(today, { locale: es });
                    tempFilteredCuts = tempFilteredCuts.filter(cut =>
                        isWithinInterval(parseISO(cut.date), { start: startOfWeekDate, end: endOfWeekDate })
                    );
                    break;
                case 'month':
                    const startOfMonthDate = startOfMonth(today);
                    const endOfMonthDate = endOfMonth(today);
                    tempFilteredCuts = tempFilteredCuts.filter(cut =>
                        isWithinInterval(parseISO(cut.date), { start: startOfMonthDate, end: endOfMonthDate })
                    );
                    break;
                case 'all':
                    break;
                default:
                    tempFilteredCuts = tempFilteredCuts.filter(cut =>
                        isSameDay(parseISO(cut.date), parseISO(selectedDate))
                    );
                    break;
            }

            setFilteredCuts(tempFilteredCuts.sort((a, b) => {
                const dateA = parseISO(a.date);
                const dateB = parseISO(b.date);
                if (dateA.getTime() !== dateB.getTime()) {
                    return dateA.getTime() - dateB.getTime();
                }
                return a.hora_inicio_24h.localeCompare(b.hora_inicio_24h);
            }));
            console.log("HistoryPage - Filtro aplicado. Cortes filtrados:", tempFilteredCuts.length);
        };

        applyFilter();
    }, [filterType, actualCutsHistory, isFetchingHistory, selectedDate, isSuperAdmin, isAdmin, userProfile]);

    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
        setFilterType('day');
    };

    const handleFilterTypeChange = (event, newType) => {
        if (newType !== null) {
            setFilterType(newType);
        }
    };

    return (
        <Box sx={{ flexGrow: 1, backgroundColor: '#8D6E63', minHeight: '100vh' }}>
            {/* Reemplazamos el AppBar local por el componente Header global */}
            <Header toggleMenu={toggleMenu} />

            <SideMenu isOpen={menuOpen} toggleMenu={toggleMenu} />

            <UserProfileModal
                anchorEl={profileAnchorEl}
                open={isProfilePopoverOpen}
                onClose={handleCloseProfilePopover}
                userProfile={userProfile}
                updateUserProfile={updateUserProfile}
                isLoadingProfile={isLoadingProfile}
            />

            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <Paper elevation={3} sx={{
                    p: 3,
                    borderRadius: '16px',
                    backgroundColor: 'white',
                    width: '100%',
                    maxWidth: 800
                }}>
                    <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', color: '#333' }}>
                        Historial de Cortes
                    </Typography>

                    <Grid container spacing={2} alignItems="center" justifyContent="center" sx={{ mb: 3 }}>
                        {filterType === 'day' && (
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Seleccionar Fecha"
                                    type="date"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                        )}
                        <Grid item xs={12} md={filterType === 'day' ? 6 : 12}>
                            <ToggleButtonGroup
                                value={filterType}
                                exclusive
                                onChange={handleFilterTypeChange}
                                aria-label="filtro de historial"
                                fullWidth
                                size="small"
                            >
                                <ToggleButton value="day" aria-label="filtro por día">
                                    Día
                                </ToggleButton>
                                <ToggleButton value="week" aria-label="filtro por semana">
                                    Semana
                                </ToggleButton>
                                <ToggleButton value="month" aria-label="filtro por mes">
                                    Mes
                                </ToggleButton>
                                {isSuperAdmin && (
                                    <ToggleButton value="all" aria-label="mostrar todo">
                                        Todo
                                    </ToggleButton>
                                )}
                            </ToggleButtonGroup>
                        </Grid>
                    </Grid>

                    {isLoadingProfile || isFetchingHistory ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                            <CircularProgress sx={{ color: '#D4AF37' }} /> {/* Cambiado a color dorado */}
                        </Box>
                    ) : filteredCuts.length === 0 ? (
                        <Typography variant="h6" sx={{ textAlign: 'center', color: '#555', mt: 4 }}>
                            No hay citas en el historial para los filtros seleccionados.
                        </Typography>
                    ) : (
                        <Box sx={{ maxHeight: 600, overflowY: 'auto' }}>
                            <Grid container spacing={2}>
                                {filteredCuts.map((cut) => (
                                    <Grid item xs={12} key={cut.id}>
                                        <Paper elevation={1} sx={{ p: 2, backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                                            <Grid container alignItems="center" spacing={1}>
                                                <Grid item xs={12} sm={4}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Día: {format(parseISO(cut.date), 'dd/MM/yyyy')}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={8}>
                                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                        Cliente: {cut.cliente_name}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={4}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Horario: {cut.time}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={4}>
                                                    <Chip
                                                        label={cut.status}
                                                        color={
                                                            cut.status === 'FINALIZADO' ? 'success' :
                                                                cut.status === 'CANCELADA' ? 'error' : 'warning'
                                                        }
                                                        size="small"
                                                        sx={{ fontWeight: 'bold' }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={4}>
                                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                        Barbero: {cut.barbero_name}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Typography variant="body1">
                                                        Servicio: {cut.service_name} ({cut.display_service_price})
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}
                </Paper>
            </Box>
        </Box>
    );
}

export default HistoryPage;