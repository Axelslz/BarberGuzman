import React, { useState, useMemo } from 'react';
import { Box, Typography, AppBar, Toolbar, IconButton, Link as MuiLink, Paper } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SideMenu from '../components/SideMenu.jsx';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import UserProfileModal from '../components/UserProfileModal.jsx';
import { useUser } from '../contexts/UserContext.jsx';

// Importa los componentes de React-Leaflet
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // ¡Importa el CSS de Leaflet!

// Importa y configura el icono de marcador por defecto de Leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Configuración para que el icono del marcador de Leaflet se vea bien
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function ContactPage() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const { userProfile, updateUserProfile } = useUser();

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleOpenProfilePopover = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseProfilePopover = () => {
        setAnchorEl(null);
    };

    const isProfilePopoverOpen = Boolean(anchorEl);

    // Coordenadas de tu barbería (ejemplo: Zócalo de Tuxtla Gutiérrez)
    const position = useMemo(() => ([
        16.731935, 
        -93.095805 // Longitud (Tuxtla Gutiérrez)
    ]), []);

    // URL para abrir en Google Maps
    const googleMapsUrl = `https://www.google.com/search?q=https://maps.app.goo.gl/VFxEdAdJwFvb1WoH8${position[0]},${position[1]}`;
    // URL para abrir en OpenStreetMap (más básico, pero si Google Maps no funciona)
    const openStreetMapUrl = `https://www.google.com/maps0zoom=15&lat=<span class="math-inline">\{position\[0\]\}&lon\=</span>{position[1]}`;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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

            <Box sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h4" component="h2" sx={{ mb: 4, mt: 4, textAlign: 'center', fontWeight: 'bold' }}>
                    Contáctanos
                </Typography>

                <Paper elevation={3} sx={{ p: 3, borderRadius: 2, backgroundColor: 'white', maxWidth: 800, width: '100%' }}>
                    {/* Sección del mapa con React-Leaflet y CartoDB Positron */}
                    <MapContainer
                        center={position}
                        zoom={19}
                        scrollWheelZoom={false}
                        style={{ width: '100%', height: '400px', borderRadius: '8px' }}
                    >
                        {/* Capa base de CartoDB Positron */}
                        <TileLayer
                            attribution='&copy; <a href="https://www.google.com/maps1">OpenStreetMap</a> contributors &copy; <a href="https://www.google.com/maps2">CartoDB</a>'
                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        />
                        <Marker position={position}>
                            <Popup>
                                ¡Aquí tamo Barber Guzman! <br /> Te esperamos.
                            </Popup>
                        </Marker>
                    </MapContainer>
                    {/* Fin de la sección del mapa */}

                    

                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                        <Typography variant="body1" sx={{ color: 'black', mb: 1 }}>
                            Email: barberguzman77@gmail.com
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'black', mb: 1 }}>
                            Teléfono: 961 171 9868
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'black', mb: 2 }}>
                            Dirección: Libramiento sur ote. km6.5 #6800, Tuxtla Gutierrez,Chiapas,29090
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                            <MuiLink href="https://www.facebook.com/barberguzman" target="_blank" rel="noopener noreferrer" color="inherit">
                                <FacebookIcon sx={{ fontSize: 40, color: '#3b5998' }} />
                            </MuiLink>
                            <MuiLink href="https://www.instagram.com/barberguzman" target="_blank" rel="noopener noreferrer" color="inherit">
                                <InstagramIcon sx={{ fontSize: 40, color: '#E1306C' }} />
                            </MuiLink>
                        </Box>
                    </Box>
                </Paper>
            </Box>

            <UserProfileModal
                open={isProfilePopoverOpen}
                onClose={handleCloseProfilePopover}
                anchorEl={anchorEl}
                userProfile={userProfile}
                updateUserProfile={updateUserProfile}
            />
        </Box>
    );
}

export default ContactPage;