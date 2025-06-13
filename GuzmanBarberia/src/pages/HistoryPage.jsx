import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    AppBar,
    Toolbar,
    IconButton,
    Paper,
    Grid,
    Chip,
    ToggleButtonGroup,
    ToggleButton,
    CircularProgress,
    TextField,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SideMenu from '../components/SideMenu.jsx'; // Asegúrate de que esta ruta sea correcta
import UserProfileModal from '../components/UserProfileModal.jsx'; // Asegúrate de que este componente exista y funcione
import { useUser } from '../contexts/UserContext.jsx';
import { format, isSameDay, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import appointmentService from '../services/appointmentService'; // Asegúrate de que este servicio exista

function HistoryPage() {
    const [menuOpen, setMenuOpen] = useState(false); // Estado para controlar la apertura/cierre del SideMenu
    const [profileAnchorEl, setProfileAnchorEl] = useState(null);
    const { userProfile, updateUserProfile, isAdmin, isSuperAdmin, isLoadingProfile } = useUser();

    const [filterType, setFilterType] = useState('day'); // 'day', 'week', 'month', 'all'
    const [filteredCuts, setFilteredCuts] = useState([]);
    const [actualCutsHistory, setActualCutsHistory] = useState([]);
    const [isFetchingHistory, setIsFetchingHistory] = useState(true);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    // Función para alternar el estado del menú
    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleOpenProfilePopover = (event) => {
        setProfileAnchorEl(event.currentTarget);
    };
    const handleCloseProfilePopover = () => {
        setProfileAnchorEl(null);
    };
    const isProfilePopoverOpen = Boolean(profileAnchorEl);

    // Función para transformar los datos de la cita recibidos del backend
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

    // Función para llamar al backend y obtener el historial de citas
    const fetchCutsHistory = useCallback(async () => {
        console.log("HistoryPage - fetchCutsHistory: Iniciando.");

        if (isLoadingProfile || !userProfile) {
            setIsFetchingHistory(true);
            console.log("HistoryPage - Perfil aún cargando o no disponible, regresando.");
            return;
        }

        // Esta condición asegura que solo los roles autorizados puedan ver el historial
        // y que no intentemos hacer la llamada si el perfil no tiene el rol aún.
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
                // Si es super_admin, se obtienen todas las citas del backend,
                // luego el filtro de fecha se aplicará localmente.
                options.allBarbers = true; // Indica al backend que envíe todas las citas
                console.log('[HistoryPage] super_admin: Solicitando TODAS las citas al backend.');
            } else if (isAdmin) { // Es un barbero normal
                options.barberId = userProfile.id_barbero; // Solo sus citas
                console.log(`[HistoryPage] Admin (barbero): Solicitando citas para su propio ID: ${userProfile.id_barbero}`);
            } else if (userProfile.role === 'cliente') {
                options.userId = userProfile.id; // Solo sus citas
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

    // Efecto para llamar al backend cuando cambian las dependencias relevantes
    useEffect(() => {
        fetchCutsHistory();
    }, [fetchCutsHistory]);

    // Efecto para aplicar los filtros (solo fecha ahora) sobre el historial cargado
    useEffect(() => {
        const applyFilter = () => {
            console.log("HistoryPage - useEffect[applyFilter]: Aplicando filtro. FilterType:", filterType, "ActualCutsHistory length:", actualCutsHistory.length);

            if (isFetchingHistory) {
                setFilteredCuts([]);
                return;
            }

            let tempFilteredCuts = [...actualCutsHistory];

            // 1. FILTRADO POR ROL (ya manejado por fetchCutsHistory, pero lo mantenemos para claridad local)
            // Si no es super_admin, o es admin/cliente, las citas ya deberían estar filtradas por el backend.
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


            // 2. FILTRADO POR FECHA (siempre aplicado)
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
                    // Para 'all', no se aplica filtro de fecha adicional, se muestran todos los datos cargados.
                    break;
                default:
                    // Fallback a 'day'
                    tempFilteredCuts = tempFilteredCuts.filter(cut =>
                        isSameDay(parseISO(cut.date), parseISO(selectedDate))
                    );
                    break;
            }

            // Ordenar por fecha y hora
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
        // Si se selecciona una fecha, automáticamente cambia el filtro a 'day'
        setFilterType('day');
    };

    const handleFilterTypeChange = (event, newType) => {
        if (newType !== null) {
            setFilterType(newType);
        }
    };

    return (
        <Box sx={{ flexGrow: 1, backgroundColor: '#8D6E63', minHeight: '100vh' }}>
            <AppBar position="static" sx={{ backgroundColor: '#FFD700', boxShadow: 'none' }}>
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2, color: 'black' }}
                        onClick={toggleMenu} // Llama a toggleMenu para abrir/cerrar tu SideMenu
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1, color: 'black', textAlign: 'center', fontFamily: 'Impact, sans-serif', fontSize: '1.75rem' }}
                    >
                        Barber Guzman
                    </Typography>
                    <IconButton
                        size="large"
                        aria-label="show 17 new notifications"
                        color="inherit"
                        sx={{ color: 'black' }}
                    >
                        <NotificationsIcon />
                    </IconButton>
                    <IconButton
                        size="large"
                        edge="end"
                        aria-label="account of current user"
                        aria-haspopup="true"
                        onClick={handleOpenProfilePopover}
                        color="inherit"
                        sx={{ color: 'black' }}
                    >
                        <AccountCircleIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            {/* Aquí se renderiza tu SideMenu, pasándole las props correctas */}
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
                        {/* Selector de fecha para el filtro "Día" - Solo visible cuando filterType es 'day' */}
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
                        {/* ToggleButtonGroup para filtros de fecha - Siempre visible */}
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
                                {isSuperAdmin && ( // El botón "Todo" solo para SuperAdmin
                                    <ToggleButton value="all" aria-label="mostrar todo">
                                        Todo
                                    </ToggleButton>
                                )}
                            </ToggleButtonGroup>
                        </Grid>
                    </Grid>

                    {isLoadingProfile || isFetchingHistory ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                            <CircularProgress sx={{ color: '#FFD700' }} />
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