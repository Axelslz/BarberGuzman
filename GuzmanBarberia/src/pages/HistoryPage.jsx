import React, { useState, useEffect, useCallback } from 'react';
import {
    ToggleButtonGroup,
    ToggleButton,
    CircularProgress,
    Chip,
} from '@mui/material';
import SideMenu from '../components/SideMenu.jsx';
import UserProfileModal from '../components/UserProfileModal.jsx';
import { useUser } from '../contexts/UserContext.jsx';
import { format, parseISO, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import appointmentService from '../services/appointmentService.js';
import Header from '../components/Header.jsx';

function HistoryPage() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileAnchorEl, setProfileAnchorEl] = useState(null);
    const { userProfile, updateUserProfile, isSuperAdmin, isLoadingProfile } = useUser();

    const [historyCuts, setHistoryCuts] = useState([]);
    const [isFetchingHistory, setIsFetchingHistory] = useState(true);
    const [filterType, setFilterType] = useState('day');

    const toggleMenu = () => setMenuOpen(!menuOpen);
    const handleOpenProfilePopover = (event) => setProfileAnchorEl(event.currentTarget);
    const handleCloseProfilePopover = () => setProfileAnchorEl(null);
    const isProfilePopoverOpen = Boolean(profileAnchorEl);

    const transformAppointmentData = (appointment) => {
        const clientName = appointment.cliente_name ? `${appointment.cliente_name} ${appointment.cliente_lastname || ''}`.trim() : 'Cliente Anónimo';
        const barberName = appointment.barbero_name ? `${appointment.barbero_name} ${appointment.barbero_lastname || ''}`.trim() : 'Barbero Desconocido';
        const serviceName = appointment.servicio_nombre || 'Servicio Desconocido';
        const servicePrice = appointment.servicio_precio ? parseFloat(appointment.servicio_precio).toFixed(2) : '0.00';
        const formattedTime = appointment.hora_inicio ? format(parse(appointment.hora_inicio, 'HH:mm:ss', new Date()), 'h:mm aa', { locale: es }) : '';
        let statusDisplay = 'DESCONOCIDO';
        if (appointment.estado) {
            switch (appointment.estado.toLowerCase()) {
                case 'completada': statusDisplay = 'FINALIZADO'; break;
                case 'confirmada': case 'pendiente': statusDisplay = 'EN ESPERA'; break;
                case 'cancelada': statusDisplay = 'CANCELADA'; break;
                default: statusDisplay = appointment.estado.toUpperCase();
            }
        }
        return {
            id: appointment.id,
            date: appointment.fecha_cita,
            time: formattedTime,
            status: statusDisplay,
            cliente_name: clientName,
            barbero_name: barberName,
            service_name: serviceName,
            display_service_price: `$${servicePrice}`,
        };
    };

    const fetchCutsHistory = useCallback(async () => {
        if (isLoadingProfile) return; 

        setIsFetchingHistory(true);
        try {
            const response = await appointmentService.getAppointmentsHistory(filterType);
            const transformedData = response.map(transformAppointmentData);
            setHistoryCuts(transformedData);
        } catch (error) {
            console.error("Error al cargar el historial de cortes:", error);
            setHistoryCuts([]);
        } finally {
            setIsFetchingHistory(false);
        }
    }, [filterType, isLoadingProfile]); 

    useEffect(() => {
        fetchCutsHistory();
    }, [fetchCutsHistory]);
  

    const handleFilterTypeChange = (event, newType) => {
        if (newType !== null) {
            setFilterType(newType);
        }
    };
   
    const formatDate = (dateString) => {
        try {
            return format(parseISO(dateString), 'dd/MM/yyyy');
        } catch (error) {
            return "Fecha inválida";
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
            <Header toggleMenu={toggleMenu} handleOpenProfilePopover={handleOpenProfilePopover}/>
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
                    <div className="bg-slate-900 px-6 py-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-amber-400 text-center">
                            📋 Historial de Cortes
                        </h1>
                    </div>
                    <div className="p-6 bg-gray-50 border-b">
                        <div className="flex justify-center">
                            <ToggleButtonGroup
                                value={filterType}
                                exclusive
                                onChange={handleFilterTypeChange}
                                size="small"
                                className="bg-white rounded-lg shadow-sm"
                            >
                                <ToggleButton value="day" className="px-4 py-2 text-sm font-medium">📅 Día</ToggleButton>
                                <ToggleButton value="week" className="px-4 py-2 text-sm font-medium">📊 Semana</ToggleButton>
                                <ToggleButton value="month" className="px-4 py-2 text-sm font-medium">📈 Mes</ToggleButton>
                                {isSuperAdmin && (
                                    <ToggleButton value="all" className="px-4 py-2 text-sm font-medium">🗂️ Todo</ToggleButton>
                                )}
                            </ToggleButtonGroup>
                        </div>
                    </div>
                    <div className="p-6">
                        {isFetchingHistory ? (
                            <div className="flex justify-center py-12"><CircularProgress sx={{ color: '#D4AF37' }} /></div>
                        ) : historyCuts.length === 0 ? (
                            <div className="text-center py-12">
                                <h3 className="text-xl font-semibold text-gray-700">No se encontraron citas</h3>
                                <p className="text-gray-500">No hay citas registradas para el período seleccionado.</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                                        <p className="text-sm text-green-700">Finalizados</p>
                                        <p className="text-2xl font-bold text-green-800">{historyCuts.filter(c => c.status === 'FINALIZADO').length}</p>
                                    </div>
                                    <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                                        <p className="text-sm text-red-700">Cancelados</p>
                                        <p className="text-2xl font-bold text-red-800">{historyCuts.filter(c => c.status === 'CANCELADA').length}</p>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                                        <p className="text-sm text-blue-700">Total</p>
                                        <p className="text-2xl font-bold text-blue-800">{historyCuts.length}</p>
                                    </div>
                                </div>
                                <div className="hidden lg:block">
                                    <table className="w-full">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Fecha</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Hora</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Cliente</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Barbero</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Servicio</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Precio</th>
                                                <th className="px-4 py-3 text-center text-sm font-semibold">Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {historyCuts.map((cut) => (
                                                <tr key={cut.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-4">{formatDate(cut.date)}</td>
                                                    <td className="px-4 py-4">{cut.time}</td>
                                                    <td className="px-4 py-4 font-medium">{cut.cliente_name}</td>
                                                    <td className="px-4 py-4">{cut.barbero_name}</td>
                                                    <td className="px-4 py-4">{cut.service_name}</td>
                                                    <td className="px-4 py-4 font-semibold">{cut.display_service_price}</td>
                                                    <td className="px-4 py-4 text-center">
                                                        <Chip label={cut.status} color={cut.status === 'FINALIZADO' ? 'success' : cut.status === 'CANCELADA' ? 'error' : 'warning'} size="small" />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="lg:hidden space-y-3">
                                    {historyCuts.map((cut) => (
                                        <div key={cut.id} className="bg-white border rounded-lg p-4 shadow-sm">
                                            <div className="flex justify-between mb-2">
                                                <h3 className="font-bold">{cut.cliente_name}</h3>
                                                <Chip label={cut.status} color={cut.status === 'FINALIZADO' ? 'success' : cut.status === 'CANCELADA' ? 'error' : 'warning'} size="small" />
                                            </div>
                                            <p className="text-sm text-gray-600">📅 {formatDate(cut.date)} • ⏰ {cut.time}</p>
                                            <p className="text-sm text-gray-600">✂️ {cut.barbero_name}</p>
                                            <p className="text-sm text-gray-600">🛠️ {cut.service_name} ({cut.display_service_price})</p>
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