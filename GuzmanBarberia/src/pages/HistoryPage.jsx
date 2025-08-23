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
import SideMenu from '../components/SideMenu.jsx';
import UserProfileModal from '../components/UserProfileModal.jsx';
import { useUser } from '../contexts/UserContext.jsx';
import { format, isSameDay, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import appointmentService from '../services/appointmentService';

import Header from '../components/Header.jsx'; 

function HistoryPage() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileAnchorEl, setProfileAnchorEl] = useState(null); 
    const { userProfile, updateUserProfile, isAdmin, isSuperAdmin, isLoadingProfile } = useUser();

    const [filterType, setFilterType] = useState('day'); 
    const [filteredCuts, setFilteredCuts] = useState([]);
    const [actualCutsHistory, setActualCutsHistory] = useState([]);
    const [isFetchingHistory, setIsFetchingHistory] = useState(true);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

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

    const transformAppointmentData = (appointment) => {
        const clientName = appointment.cliente_nombre || (appointment.cliente_name ? `${appointment.cliente_name} ${appointment.cliente_lastname || ''}`.trim() : 'Cliente Desconocido');
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
        setIsFetchingHistory(true);
        try {
            // La lógica para construir las opciones es ahora mucho más simple
            const options = {
                filterType: filterType,
                // Solo añadimos la fecha si el filtro no es 'all'
                ...(filterType !== 'all' && { selectedDate: selectedDate })
            };
            
            const response = await appointmentService.getAppointmentsHistory(options);
            
            const transformedData = response.map(transformAppointmentData);
            setActualCutsHistory(transformedData);
            
        } catch (error) {
            console.error("Error al cargar el historial de cortes del backend:", error);
            setActualCutsHistory([]); // En caso de error, vaciamos el historial
        } finally {
            setIsFetchingHistory(false);
        }
    }, [selectedDate, filterType]);

    useEffect(() => {
        if (!isLoadingProfile) { 
            fetchCutsHistory();
        }
    }, [fetchCutsHistory, isLoadingProfile]);

   useEffect(() => {
        const applyFilter = () => {
            if (isFetchingHistory) {
                setFilteredCuts([]);
                return;
            }

            let tempFilteredCuts = [...actualCutsHistory];

            const referenceDate = new Date(selectedDate + 'T12:00:00');

            switch (filterType) {
                case 'day':
                    tempFilteredCuts = tempFilteredCuts.filter(cut => {
                        const cutDate = new Date(cut.date + 'T12:00:00');
                        return isSameDay(cutDate, referenceDate);
                    });
                    break;
                case 'week':
                    const startOfWeekDate = startOfWeek(referenceDate, { locale: es });
                    const endOfWeekDate = endOfWeek(referenceDate, { locale: es });
                    tempFilteredCuts = tempFilteredCuts.filter(cut => {
                        const cutDate = new Date(cut.date + 'T12:00:00');
                        return isWithinInterval(cutDate, { start: startOfWeekDate, end: endOfWeekDate });
                    });
                    break;
                case 'month':
                    const startOfMonthDate = startOfMonth(referenceDate);
                    const endOfMonthDate = endOfMonth(referenceDate);
                    tempFilteredCuts = tempFilteredCuts.filter(cut => {
                        const cutDate = new Date(cut.date + 'T12:00:00');
                        return isWithinInterval(cutDate, { start: startOfMonthDate, end: endOfMonthDate });
                    });
                    break;
                case 'all':
                    break;
                default:
                    const defaultTargetDate = new Date(selectedDate + 'T12:00:00');
                    tempFilteredCuts = tempFilteredCuts.filter(cut =>
                        isSameDay(new Date(cut.date + 'T12:00:00'), defaultTargetDate)
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
        };

        applyFilter();
    }, [filterType, actualCutsHistory, isFetchingHistory, selectedDate]);

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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
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

        <div className="flex justify-center p-4 md:p-6">
            <div className="w-full max-w-7xl bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-slate-900 px-6 py-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-amber-400 text-center">
                        📋 Historial de Cortes
                    </h1>
                </div>

                {/* Filters Section */}
                <div className="p-6 bg-gray-50 border-b">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-center">
                        {filterType === 'day' && (
                            <div className="w-full lg:w-auto">
                                <TextField
                                    label="Seleccionar Fecha"
                                    type="date"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                    className="w-full lg:w-64"
                                />
                            </div>
                        )}
                        <div className="w-full lg:w-auto">
                            <ToggleButtonGroup
                                value={filterType}
                                exclusive
                                onChange={handleFilterTypeChange}
                                aria-label="filtro de historial"
                                size="small"
                                className="bg-white rounded-lg shadow-sm"
                            >
                                <ToggleButton 
                                    value="day" 
                                    aria-label="filtro por día"
                                    className="px-4 py-2 text-sm font-medium"
                                >
                                    📅 Día
                                </ToggleButton>
                                <ToggleButton 
                                    value="week" 
                                    aria-label="filtro por semana"
                                    className="px-4 py-2 text-sm font-medium"
                                >
                                    📊 Semana
                                </ToggleButton>
                                <ToggleButton 
                                    value="month" 
                                    aria-label="filtro por mes"
                                    className="px-4 py-2 text-sm font-medium"
                                >
                                    📈 Mes
                                </ToggleButton>
                                {isSuperAdmin && (
                                    <ToggleButton 
                                        value="all" 
                                        aria-label="mostrar todo"
                                        className="px-4 py-2 text-sm font-medium"
                                    >
                                        🗂️ Todo
                                    </ToggleButton>
                                )}
                            </ToggleButtonGroup>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-6">
                    {isLoadingProfile || isFetchingHistory ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <CircularProgress sx={{ color: '#D4AF37' }} size={48} />
                            <p className="mt-4 text-gray-600 font-medium">Cargando historial...</p>
                        </div>
                    ) : filteredCuts.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📋</div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                No hay citas registradas
                            </h3>
                            <p className="text-gray-500">
                                No se encontraron citas para los filtros seleccionados.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Stats Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border-l-4 border-green-500">
                                    <div className="flex items-center">
                                        <span className="text-2xl mr-3">✅</span>
                                        <div>
                                            <p className="text-sm text-green-600 font-medium">Finalizados</p>
                                            <p className="text-xl font-bold text-green-700">
                                                {filteredCuts.filter(cut => cut.status === 'FINALIZADO').length}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border-l-4 border-red-500">
                                    <div className="flex items-center">
                                        <span className="text-2xl mr-3">❌</span>
                                        <div>
                                            <p className="text-sm text-red-600 font-medium">Cancelados</p>
                                            <p className="text-xl font-bold text-red-700">
                                                {filteredCuts.filter(cut => cut.status === 'CANCELADA').length}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
                                    <div className="flex items-center">
                                        <span className="text-2xl mr-3">📊</span>
                                        <div>
                                            <p className="text-sm text-blue-600 font-medium">Total</p>
                                            <p className="text-xl font-bold text-blue-700">{filteredCuts.length}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Desktop Table */}
                            <div className="hidden lg:block overflow-hidden rounded-lg border border-gray-200">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fecha</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Hora</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Cliente</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Barbero</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Servicio</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Precio</th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredCuts.map((cut, index) => (
                                            <tr key={cut.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                                                <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                                                    {format(parseISO(cut.date), 'dd/MM/yyyy')}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-700">
                                                    {cut.time}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                                                    {cut.cliente_name}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                                                    {cut.barbero_name}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-700">
                                                    {cut.service_name}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-900 font-semibold">
                                                    {cut.display_service_price}
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <Chip
                                                        label={cut.status}
                                                        color={
                                                            cut.status === 'FINALIZADO' ? 'success' :
                                                                cut.status === 'CANCELADA' ? 'error' : 'warning'
                                                        }
                                                        size="small"
                                                        sx={{ fontWeight: 'bold' }}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="lg:hidden space-y-4 max-h-96 overflow-y-auto">
                                {filteredCuts.map((cut) => (
                                    <div key={cut.id} className="bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                        <div className="p-4">
                                            {/* Header with status */}
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <p className="text-sm text-gray-500 mb-1">
                                                        📅 {format(parseISO(cut.date), 'dd/MM/yyyy')} • ⏰ {cut.time}
                                                    </p>
                                                    <h3 className="font-semibold text-gray-900 text-lg">
                                                        {cut.cliente_name}
                                                    </h3>
                                                </div>
                                                <Chip
                                                    label={cut.status}
                                                    color={
                                                        cut.status === 'FINALIZADO' ? 'success' :
                                                            cut.status === 'CANCELADA' ? 'error' : 'warning'
                                                    }
                                                    size="small"
                                                    sx={{ fontWeight: 'bold' }}
                                                />
                                            </div>
                                            
                                            {/* Details */}
                                            <div className="space-y-2">
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <span className="mr-2">✂️</span>
                                                    <span className="font-medium">Barbero:</span>
                                                    <span className="ml-1">{cut.barbero_name}</span>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <span className="mr-2">🛠️</span>
                                                    <span className="font-medium">Servicio:</span>
                                                    <span className="ml-1">{cut.service_name}</span>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <span className="mr-2">💰</span>
                                                    <span className="font-medium">Precio:</span>
                                                    <span className="ml-1 font-semibold text-green-600">
                                                        {cut.display_service_price}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    </div>
);
}

export default HistoryPage;