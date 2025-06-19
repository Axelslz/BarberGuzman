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
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}> {/* Usamos height: '100vh' y overflow: 'hidden' */}
            <Header toggleMenu={toggleMenu} />

            <SideMenu isOpen={menuOpen} toggleMenu={toggleMenu} />

            {/* Contenedor principal del contenido: ahora ocupará el espacio restante de la vista */}
            <Box
                sx={{
                    flexGrow: 1, // Ocupa todo el espacio vertical disponible
                    p: 3, // Padding alrededor del Paper
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center', // Centra el Paper horizontalmente
                    justifyContent: 'center', // Centra el Paper verticalmente
                    overflow: 'hidden', // Asegura que no haya scroll en este Box
                    boxSizing: 'border-box',
                    // Calculamos la altura para que el Paper se ajuste sin scroll
                    height: 'calc(100vh - 64px - 48px)', // 100vh - altura del Header - padding vertical del Box
                                                          // Ajusta 64px (altura del Header) y 48px (p:3 = 2*16px = 32px + margen extra) según sea necesario
                }}
            >
                {/* Contenedor Paper: Ahora incluirá el título "Contáctanos" */}
                <Paper
                    elevation={3}
                    sx={{
                        p: { xs: 2, md: 3 }, // Padding dentro del Paper
                        borderRadius: 2,
                        backgroundColor: 'white',
                        maxWidth: 900, // Ancho máximo
                        width: '100%',
                        height: '100%', // El Paper ocupa el 100% de la altura de su padre (Box de contenido)
                        display: 'flex',
                        flexDirection: 'column', // Por defecto, apila el título y las columnas
                        alignItems: 'center', // Centra horizontalmente el título
                        overflow: 'hidden', // Evita scroll interno en el Paper a menos que sea estrictamente necesario
                    }}
                >
                    <Typography variant="h4" component="h2" sx={{ mb: { xs: 2, md: 3 }, textAlign: 'center', fontWeight: 'bold', color: '#333333' }}>
                        Contáctanos
                    </Typography>

                    {/* Contenedor Flex para las dos columnas (Mapa e Info) */}
                    <Box
                        sx={{
                            flexGrow: 1, // Permite que este Box ocupe el espacio restante dentro del Paper
                            width: '100%',
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' }, // Columna en móvil, fila en escritorio
                            alignItems: { xs: 'center', md: 'stretch' }, // Centra en móvil, estira en escritorio
                            justifyContent: 'space-around', // Distribuye el espacio
                            gap: { xs: 3, md: 4 }, // Espacio entre las columnas/secciones
                            overflow: 'hidden', // Evita scroll aquí también
                        }}
                    >
                        {/* Sección del Mapa (a la izquierda en escritorio) */}
                        <Box
                            sx={{
                                flex: { xs: '0 0 auto', md: '1 1 45%' }, // Ocupa espacio necesario en móvil, 45% en escritorio
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center', // Centra el mapa y el enlace
                                // Ajusta la altura del mapa para que se ajuste a la vista sin scroll
                                height: { xs: '300px', md: '100%' }, // Fijo en móvil, 100% del contenedor en escritorio
                                width: { xs: '100%', md: 'auto' }, // Ocupa todo el ancho en móvil, se ajusta en escritorio
                                mb: { xs: 3, md: 0 }, // Margen inferior en móvil para separar de la info
                            }}
                        >
                            <MapContainer
                                center={position}
                                zoom={19}
                                scrollWheelZoom={false}
                                style={{
                                    width: '100%',
                                    height: '100%', // El mapa ocupa el 100% de la altura de su Box padre
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

                        {/* Sección de Información de Contacto (a la derecha en escritorio) */}
                        <Box
                            sx={{
                                flex: { xs: '1 1 auto', md: '1 1 50%' }, // Ocupa todo el espacio en móvil, 50% en escritorio
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center', // Centra el contenido verticalmente
                                textAlign: 'left', // Siempre a la izquierda, como solicitaste
                                mt: { xs: 0, md: 0 },
                                width: { xs: '100%', md: 'auto' },
                                p: { xs: 0, md: 2 }, // Padding para separar el texto de los bordes
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