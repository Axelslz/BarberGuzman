import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Paper,
  Button,
  Grid,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SideMenu from '../components/SideMenu.jsx';
import UserProfileModal from '../components/UserProfileModal.jsx';
import { useUser } from '../contexts/UserContext.jsx';
import { format, isSameDay, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// Datos de ejemplo para el historial de cortes
const mockCutsHistory = [
  { id: 1, date: '2025-05-28', clientPackage: 'CARLOS VAGANTE CORTE CABELLO', time: '4:00 PM', status: 'FINALIZADO' },
  { id: 2, date: '2025-05-28', clientPackage: 'JAHIR PUIG CORTE CABELLO', time: '5:00 PM', status: 'FINALIZADO' },
  { id: 3, date: '2025-05-28', clientPackage: 'ANTHONY CORTE CABELLO', time: '6:00 PM', status: 'EN ESPERA' },
  { id: 4, date: '2025-05-29', clientPackage: 'DANY RAMOS CORTE CABELLO', time: '7:00 PM', status: 'EN ESPERA' },
  { id: 5, date: '2025-05-27', clientPackage: 'MARIA LOPEZ CORTE CABELLO', time: '10:00 AM', status: 'FINALIZADO' },
  { id: 6, date: '2025-05-26', clientPackage: 'PEDRO GOMEZ PAQUETE BASICO', time: '9:00 AM', status: 'FINALIZADO' },
  { id: 7, date: '2025-06-01', clientPackage: 'ANA MARTINEZ EXFOLIACION', time: '11:00 AM', status: 'EN ESPERA' }, // Próximo mes
  { id: 8, date: '2025-05-29', clientPackage: 'JUAN PEREZ CORTE BARBA', time: '3:00 PM', status: 'FINALIZADO' }, // Más para el día 29
];

function HistoryPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const { userProfile, updateUserProfile } = useUser();

  const [filterType, setFilterType] = useState('day'); // 'day', 'week', 'month'
  const [filteredCuts, setFilteredCuts] = useState([]);

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

  useEffect(() => {
    const applyFilter = () => {
      const today = new Date();
      let tempFilteredCuts = [];

      switch (filterType) {
        case 'day':
          tempFilteredCuts = mockCutsHistory.filter(cut =>
            isSameDay(parseISO(cut.date), today)
          );
          break;
        case 'week':
          const start = startOfWeek(today, { locale: es });
          const end = endOfWeek(today, { locale: es });
          tempFilteredCuts = mockCutsHistory.filter(cut =>
            isWithinInterval(parseISO(cut.date), { start, end })
          );
          break;
        case 'month':
          const startM = startOfMonth(today);
          const endM = endOfMonth(today);
          tempFilteredCuts = mockCutsHistory.filter(cut =>
            isWithinInterval(parseISO(cut.date), { start: startM, end: endM })
          );
          break;
        default:
          tempFilteredCuts = mockCutsHistory; // Sin filtro por defecto
          break;
      }
      // Ordenar por fecha y luego por hora para consistencia
      setFilteredCuts(tempFilteredCuts.sort((a, b) => {
        const dateA = parseISO(a.date);
        const dateB = parseISO(b.date);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA.getTime() - dateB.getTime();
        }
        // Asumiendo que la hora está en formato HH:MM AM/PM y se puede comparar directamente si el formato es consistente.
        // Para una comparación más robusta de tiempo, podrías necesitar un parser más sofisticado.
        return a.time.localeCompare(b.time);
      }));
    };

    applyFilter();
  }, [filterType]); // Se ejecuta cada vez que filterType cambia

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#F5F5F5' }}>
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

              {/* Controles de filtro */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <ToggleButtonGroup
                  value={filterType}
                  exclusive
                  onChange={(event, newType) => {
                    if (newType !== null) { // Evita deselección si ya está seleccionado
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

              {/* Tabla/Lista de Historial de Cortes */}
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