import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Box, Typography, Link as MuiLink, Paper } from '@mui/material';
import SideMenu from '../components/SideMenu.jsx';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import UserProfileModal from '../components/UserProfileModal.jsx';
import { useUser } from '../contexts/UserContext.jsx';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

import Header from '../components/Header.jsx';

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

    const mapRef = useRef(null);

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

    const position = useMemo(() => ([
        16.731935,
        -93.095805
    ]), []);

    const openStreetMapUrl = `https://www.openstreetmap.org/?mlat=${position[0]}&mlon=${position[1]}#map=15/${position[0]}/${position[1]}`;

    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.doubleClickZoom.disable();
            mapRef.current.on('dblclick', () => {
                window.open(openStreetMapUrl, '_blank');
            });

            const resizeObserver = new ResizeObserver(() => {
                mapRef.current.invalidateSize();
            });
            const mapElement = mapRef.current.getContainer();
            if (mapElement) {
                resizeObserver.observe(mapElement);
            }

            return () => {
                mapRef.current.off('dblclick');
                mapRef.current.doubleClickZoom.enable();
                if (mapElement) {
                    resizeObserver.disconnect();
                }
            };
        }
    }, [openStreetMapUrl]);


    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}> 
            <Header toggleMenu={toggleMenu} />

            <SideMenu isOpen={menuOpen} toggleMenu={toggleMenu} />

            {/* Contenedor principal del contenido: ahora ocupará el espacio restante de la vista */}
            <Box
                sx={{
                    flexGrow: 1, 
                    p: 3, 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    overflow: 'hidden', 
                    boxSizing: 'border-box',
                    height: 'calc(100vh - 64px - 48px)', 
                }}
            >
                {/* Contenedor Paper: Ahora incluirá el título "Contáctanos" */}
                <Paper
                    elevation={3}
                    sx={{
                        p: { xs: 2, md: 3 }, 
                        borderRadius: 2,
                        backgroundColor: 'white',
                        maxWidth: 900, 
                        width: '100%',
                        height: '100%', 
                        display: 'flex',
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        overflow: 'hidden', 
                    }}
                >
                    <Typography variant="h4" component="h2" sx={{ mb: { xs: 2, md: 3 }, textAlign: 'center', fontWeight: 'bold', color: '#333333' }}>
                        Contáctanos
                    </Typography>

                    {/* Contenedor Flex para las dos columnas (Mapa e Info) */}
                    <Box
                        sx={{
                            flexGrow: 1, 
                            width: '100%',
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' }, 
                            alignItems: { xs: 'center', md: 'stretch' }, 
                            justifyContent: 'space-around', 
                            gap: { xs: 3, md: 4 }, 
                            overflow: 'hidden', 
                        }}
                    >
                        {/* Sección del Mapa (a la izquierda en escritorio) */}
                        <Box
                            sx={{
                                flex: { xs: '0 0 auto', md: '1 1 45%' }, 
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center', 
                                height: { xs: '300px', md: '100%' }, 
                                width: { xs: '100%', md: 'auto' }, 
                                mb: { xs: 3, md: 0 }, 
                            }}
                        >
                            <MapContainer
                                center={position}
                                zoom={19}
                                scrollWheelZoom={false}
                                style={{
                                    width: '100%',
                                    height: '100%', 
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                }}
                                whenCreated={mapInstance => { mapRef.current = mapInstance; }}
                            >
                                <TileLayer
                                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CartoDB</a>'
                                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                />
                                <Marker position={position}>
                                    <Popup>
                                        ¡Aquí tamo Barber Guzman! <br /> Te esperamos.
                                    </Popup>
                                </Marker>
                            </MapContainer>
                            <Box sx={{ mt: 1, textAlign: 'center', flexShrink: 0 }}>
                                <MuiLink
                                    href={openStreetMapUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{ color: '#D4AF37', fontSize: '0.8rem' }}
                                >
                                    Ver en OpenStreetMap
                                </MuiLink>
                            </Box>
                        </Box>

                        <Box
                            sx={{
                                flex: { xs: '1 1 auto', md: '1 1 50%' }, 
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center', 
                                textAlign: 'left', 
                                mt: { xs: 0, md: 0 },
                                width: { xs: '100%', md: 'auto' },
                                p: { xs: 0, md: 2 },
                            }}
                        >
                            <Typography variant="body1" sx={{ color: 'black', mb: 1 }}>
                                Email: barberguzman77@gmail.com
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'black', mb: 1 }}>
                                Teléfono: 961 171 9868
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'black', mb: 2 }}>
                                Dirección: Libramiento sur ote. km6.5 #6800, Tuxtla Gutierrez,Chiapas,29090
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' }, gap: 2, mt: 2 }}>
                                <MuiLink href="https://www.facebook.com/share/15UWjHGWaa/" target="_blank" rel="noopener noreferrer" color="inherit">
                                    <FacebookIcon sx={{ fontSize: 40, color: '#3b5998' }} />
                                </MuiLink>
                                <MuiLink href="https://www.instagram.com/guzman_barberstudio?igsh=OHlyN2V5bWxudmFz" target="_blank" rel="noopener noreferrer" color="inherit">
                                    <InstagramIcon sx={{ fontSize: 40, color: '#E1306C' }} />
                                </MuiLink>
                            </Box>
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