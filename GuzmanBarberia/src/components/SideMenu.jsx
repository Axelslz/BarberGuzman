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

    const handleAgendaNavigation = () => {
        if (isAdmin || isSuperAdmin) {
            navigate('/agendar-cita');
        } else {
            navigate('/seleccionar-barbero');
        }
        toggleMenu(); 
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
                    <ListItemButton onClick={() => handleNavigation('/seleccionar-barbero')}>
                        <ListItemIcon>
                            <HomeIcon />
                        </ListItemIcon>
                        <ListItemText primary="HOME" />
                    </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                    <ListItemButton onClick={handleAgendaNavigation}> 
                        <ListItemIcon>
                            <CalendarTodayIcon />
                        </ListItemIcon>
                        <ListItemText primary="Agenda" /> 
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