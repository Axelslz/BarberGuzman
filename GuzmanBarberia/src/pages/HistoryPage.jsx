import React, { useState, useEffect } from 'react';
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
  CircularProgress 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SideMenu from '../components/SideMenu.jsx';
import UserProfileModal from '../components/UserProfileModal.jsx';
import { useUser } from '../contexts/UserContext.jsx';
import { format, isSameDay, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import appointmentService from '../services/appointmentService'; 

function HistoryPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const { userProfile, updateUserProfile, isAdmin, isLoadingProfile } = useUser();

  const [filterType, setFilterType] = useState('day'); 
  const [filteredCuts, setFilteredCuts] = useState([]);
  const [actualCutsHistory, setActualCutsHistory] = useState([]); 
  const [isFetchingHistory, setIsFetchingHistory] = useState(true); 

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
    const clientName = appointment.cliente_name ? `${appointment.cliente_name} ${appointment.cliente_lastname || ''}`.trim() : 'Cliente Desconocido';
    const serviceName = appointment.servicio_nombre ? appointment.servicio_nombre : 'Servicio Desconocido';
    
    const clientPackage = `${clientName} ${serviceName}`;
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
      clientPackage: clientPackage,
      time: formattedTime, 
      status: statusDisplay,
      hora_inicio_24h: time24h, 
    };
  };

  useEffect(() => {
    const fetchCutsHistory = async () => {

      if (isLoadingProfile) {
        setIsFetchingHistory(true); 
        return;
      }

      if (!isAdmin) {
        setActualCutsHistory([]); 
        setIsFetchingHistory(false); 
        return;
      }

      setIsFetchingHistory(true); 
      try {
        const response = await appointmentService.getAllAppointmentsForAdmin();
        const transformedData = response.map(transformAppointmentData);
        setActualCutsHistory(transformedData);
      } catch (error) {
        console.error("Error al cargar el historial de cortes del backend:", error);
        setActualCutsHistory([]); 
      } finally {
        setIsFetchingHistory(false);
      }
    };

    fetchCutsHistory();
  }, [isAdmin, isLoadingProfile]); 

  useEffect(() => {
    const applyFilter = () => {
      const today = new Date();
      let tempFilteredCuts = [];

      if (isFetchingHistory || actualCutsHistory.length === 0) {
        setFilteredCuts([]);
        return;
      }

      switch (filterType) {
        case 'day':
          tempFilteredCuts = actualCutsHistory.filter(cut =>
            isSameDay(parseISO(cut.date), today)
          );
          break;
        case 'week':
          const startOfWeekDate = startOfWeek(today, { locale: es });
          const endOfWeekDate = endOfWeek(today, { locale: es });
          tempFilteredCuts = actualCutsHistory.filter(cut =>
            isWithinInterval(parseISO(cut.date), { start: startOfWeekDate, end: endOfWeekDate })
          );
          break;
        case 'month':
          const startOfMonthDate = startOfMonth(today);
          const endOfMonthDate = endOfMonth(today);
          tempFilteredCuts = actualCutsHistory.filter(cut =>
            isWithinInterval(parseISO(cut.date), { start: startOfMonthDate, end: endOfMonthDate })
          );
          break;
        default:
          tempFilteredCuts = actualCutsHistory; 
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
  }, [filterType, actualCutsHistory, isFetchingHistory]); 

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
      <AppBar position="static" sx={{ backgroundColor: '#D4AF37', boxShadow: 'none' }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2, color: 'black' }}
            onClick={toggleMenu}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, textAlign: 'center', fontFamily: 'cursive', fontSize: '2rem', color: 'black' }}
          >
            Barber Guzman
          </Typography>
          <IconButton color="inherit" sx={{ color: 'black' }}>
            <NotificationsIcon />
          </IconButton>
          <IconButton
            color="inherit"
            sx={{ color: 'black' }}
            onClick={handleOpenProfilePopover}
            aria-controls={isProfilePopoverOpen ? 'profile-popover' : undefined}
            aria-haspopup="true"
          >
            <AccountCircleIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <SideMenu isOpen={menuOpen} toggleMenu={toggleMenu} />

      <Box sx={{ flexGrow: 1, p: 3, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', mt: 4 }}>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2, backgroundColor: 'white' }}>
              <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
                Historial de Cortes
              </Typography>

              {!isLoadingProfile && isAdmin && !isFetchingHistory && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <ToggleButtonGroup
                    value={filterType}
                    exclusive
                    onChange={(event, newType) => {
                      if (newType !== null) {
                        setFilterType(newType);
                      }
                    }}
                    aria-label="filtro de historial"
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
                  </ToggleButtonGroup>
                </Box>
              )}

              {isLoadingProfile || isFetchingHistory ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                  <CircularProgress />
                  <Typography sx={{ ml: 2 }}>Cargando historial...</Typography>
                </Box>
              ) : !isAdmin ? (
                <Typography variant="body1" sx={{ textAlign: 'center', mt: 3, color: 'black' }}>
                  No tienes permiso para ver este historial.
                </Typography>
              ) : (
               
                <Box sx={{ maxHeight: 600, overflowY: 'auto' }}>
                  {filteredCuts.length > 0 ? (
                    filteredCuts.map((cut) => (
                      <Box
                        key={cut.id}
                        sx={{
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          justifyContent: 'space-between',
                          alignItems: { xs: 'flex-start', sm: 'center' },
                          mb: 1.5,
                          p: 1.5,
                          backgroundColor: '#F0F0F0',
                          borderRadius: 1,
                          boxShadow: 1,
                        }}
                      >
                        <Grid container spacing={1} sx={{ width: '100%' }}>
                          <Grid item xs={12} sm={3}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'black' }}>
                              Día:
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'black' }}>
                              {format(parseISO(cut.date), 'dd/MM/yyyy', { locale: es })}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'black' }}>
                              Cliente/Paquete:
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'black' }}>
                              {cut.clientPackage}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={2}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'black' }}>
                              Horario:
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'black' }}>
                              {cut.time}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, alignItems: 'center' }}>
                            <Chip
                              label={cut.status}
                              color={cut.status === 'FINALIZADO' ? 'success' : 'warning'}
                              sx={{ fontWeight: 'bold' }}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body1" sx={{ textAlign: 'center', mt: 3, color: 'black' }}>
                      No hay cortes en el historial para el filtro seleccionado.
                    </Typography>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <UserProfileModal
        isOpen={isProfilePopoverOpen}
        onClose={handleCloseProfilePopover}
        anchorEl={profileAnchorEl}
        userProfile={userProfile}
        updateUserProfile={updateUserProfile}
      />
    </Box>
  );
}

export default HistoryPage;