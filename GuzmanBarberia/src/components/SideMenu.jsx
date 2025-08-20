import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Divider } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InfoIcon from '@mui/icons-material/Info';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import HistoryIcon from '@mui/icons-material/History';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext.jsx';

const SideMenu = ({ isOpen, toggleMenu }) => {
    const navigate = useNavigate();
    const { userProfile, logout, isAdmin, isSuperAdmin, isLoadingProfile } = useUser();

    const handleNavigation = (path) => {
        navigate(path);
        toggleMenu();
    };

    const handleLogout = () => {
        logout();
        navigate('/'); 
        toggleMenu();
    };

    // --- 👇 PASO 1: AGREGA ESTA NUEVA FUNCIÓN ---
    const handleAgendaNavigation = () => {
        // Si el usuario es admin o super_admin, lo llevamos a su propia agenda
        if (isAdmin || isSuperAdmin) {
            navigate('/agendar-cita');
        } else {
            // Si es un cliente, lo llevamos a la página de selección
            navigate('/seleccionar-barbero');
        }
        toggleMenu(); // Cierra el menú después de navegar
    };

    return (
        <Drawer
            anchor="left"
            open={isOpen}
            onClose={toggleMenu}
            PaperProps={{
                sx: {
                    backgroundColor: '#E6E6FA',
                    width: 240,
                },
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    p: 1,
                }}
            >
                <ListItemButton onClick={toggleMenu} sx={{ justifyContent: 'flex-end' }}>
                    <ListItemIcon sx={{ minWidth: 0 }}>
                        <CloseIcon />
                    </ListItemIcon>
                </ListItemButton>
            </Box>
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => handleNavigation('/home')}>
                        <ListItemIcon>
                            <HomeIcon />
                        </ListItemIcon>
                        <ListItemText primary="HOME" />
                    </ListItemButton>
                </ListItem>

                {/* --- 👇 PASO 2: MODIFICA ESTE BOTÓN --- */}
                <ListItem disablePadding>
                    <ListItemButton onClick={handleAgendaNavigation}> {/* <-- USA LA NUEVA FUNCIÓN AQUÍ */}
                        <ListItemIcon>
                            <CalendarTodayIcon />
                        </ListItemIcon>
                        <ListItemText primary="Agenda" /> {/* Cambié "Agendar" por "Agenda" para más claridad */}
                    </ListItemButton>
                </ListItem>
                
                <ListItem disablePadding>
                    <ListItemButton onClick={() => handleNavigation('/sobre-mi')}>
                        <ListItemIcon>
                            <InfoIcon />
                        </ListItemIcon>
                        <ListItemText primary="Sobre mi" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => handleNavigation('/contacto')}>
                        <ListItemIcon>
                            <ContactMailIcon />
                        </ListItemIcon>
                        <ListItemText primary="Contacto" />
                    </ListItemButton>
                </ListItem>
            
                {/* Esta sección para el historial ya está bien */}
                {!isLoadingProfile && (isAdmin || isSuperAdmin) && (
                    <>
                        <Divider sx={{ my: 1 }} />
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => handleNavigation('/historial-cortes')}>
                                <ListItemIcon>
                                    <HistoryIcon />
                                </ListItemIcon>
                                <ListItemText primary="Historial Cortes" />
                            </ListItemButton>
                        </ListItem>
                    </>
                )}
                <Divider sx={{ my: 1 }} />
                <ListItem disablePadding>
                    <ListItemButton onClick={handleLogout}>
                        <ListItemIcon>
                            <ExitToAppIcon />
                        </ListItemIcon>
                        <ListItemText primary="Cerrar Sesión" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Drawer>
    );
};

export default SideMenu;