import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link as MuiLink } from '@mui/material';
import SideMenu from '../components/SideMenu.jsx';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TikTokIcon from '@mui/icons-material/TikTok';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
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
                if (mapRef.current) {
                    mapRef.current.off('dblclick');
                    mapRef.current.doubleClickZoom.enable();
                }
                if (mapElement) {
                    resizeObserver.disconnect();
                }
            };
        }
    }, [openStreetMapUrl]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
            <Header toggleMenu={toggleMenu} />
            <SideMenu isOpen={menuOpen} toggleMenu={toggleMenu} />

            <div className="p-4 md:p-6">
                <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                    
                    {/* Header */}
                    <div className="bg-slate-900 px-6 py-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-amber-400 text-center mb-2">
                             Contáctanos
                        </h1>
                        <p className="text-amber-400 text-opacity-90 text-center max-w-2xl mx-auto">
                            Estamos aquí para brindarte el mejor servicio
                        </p>
                    </div>

                    <div className="p-6">
                        {/* Main Content Grid */}
                        <div className="grid lg:grid-cols-2 gap-8">
                            
                            {/* Left Column - Map */}
                            <div className="space-y-4">
                                <div className="text-center lg:text-left">
                                    <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center lg:justify-start gap-2">
                                        <span>🗺️</span> Nuestra Ubicación
                                    </h2>
                                </div>

                                {/* Map Container - Fixed height and proper styling */}
                                <div className="relative bg-gray-100 rounded-xl overflow-hidden border-2 border-amber-200">
                                    <div style={{ height: '400px', width: '100%' }}>
                                        <MapContainer
                                            center={position}
                                            zoom={18}
                                            scrollWheelZoom={true}
                                            style={{
                                                height: '100%',
                                                width: '100%',
                                                borderRadius: '0.75rem'
                                            }}
                                            ref={mapRef}
                                        >
                                            <TileLayer
                                                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            <Marker position={position}>
                                                <Popup>
                                                    <div className="text-center">
                                                        <strong>Barber Guzman</strong><br />
                                                        ¡Te esperamos! 💈
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        </MapContainer>
                                    </div>
                                    
                                    {/* Map Link Overlay */}
                                    <div className="absolute bottom-3 right-3">
                                        <MuiLink
                                            href={openStreetMapUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="no-underline"
                                        >
                                            <button className="bg-white shadow-lg px-3 py-2 rounded-lg text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors">
                                                Ver mapa completo
                                            </button>
                                        </MuiLink>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Contact Info */}
                            <div className="space-y-6">
                                <div className="text-center lg:text-left">
                                    <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center lg:justify-start gap-2">
                                        <span>📞</span> Información de Contacto
                                    </h2>
                                </div>

                                {/* Contact Cards */}
                                <div className="space-y-6">
                                    {/* Email */}
                                    <a href="mailto:guz.art.97@gmail.com" className="block no-underline">
                                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl hover:shadow-md transition-all duration-200 hover:border-blue-300 group">
                                            <div className="flex items-center space-x-3">
                                                <EmailIcon className="text-blue-600 text-2xl" />
                                                <div>
                                                    <h3 className="font-semibold text-gray-800 group-hover:text-blue-700">Email</h3>
                                                    <p className="text-gray-600 text-sm">guz.art.97@gmail.com</p>
                                                </div>
                                            </div>
                                        </div>
                                    </a>

                                    {/* Phone */}
                                    <a href="tel:+529611719868" className="block no-underline">
                                        <div className="bg-green-50 border border-green-200 p-4 rounded-xl hover:shadow-md transition-all duration-200 hover:border-green-300 group">
                                            <div className="flex items-center space-x-3">
                                                <PhoneIcon className="text-green-600 text-2xl" />
                                                <div>
                                                    <h3 className="font-semibold text-gray-800 group-hover:text-green-700">Teléfono</h3>
                                                    <p className="text-gray-600 text-sm">961 171 9868</p>
                                                </div>
                                            </div>
                                        </div>
                                    </a>

                                    {/* WhatsApp */}
                                    <a href="https://wa.me/529611719868" target="_blank" rel="noopener noreferrer" className="block no-underline">
                                        <div className="bg-green-50 border border-green-200 p-4 rounded-xl hover:shadow-md transition-all duration-200 hover:border-green-300 group">
                                            <div className="flex items-center space-x-3">
                                                <WhatsAppIcon className="text-green-500 text-2xl" />
                                                <div>
                                                    <h3 className="font-semibold text-gray-800 group-hover:text-green-700">WhatsApp</h3>
                                                    <p className="text-gray-600 text-sm">961 171 9868</p>
                                                </div>
                                            </div>
                                        </div>
                                    </a>

                                    {/* Address */}
                                    <a href={openStreetMapUrl} target="_blank" rel="noopener noreferrer" className="block no-underline">
                                        <div className="bg-red-50 border border-red-200 p-4 rounded-xl hover:shadow-md transition-all duration-200 hover:border-red-300 group">
                                            <div className="flex items-center space-x-3">
                                                <LocationOnIcon className="text-red-600 text-2xl flex-shrink-0" />
                                                <div>
                                                    <h3 className="font-semibold text-gray-800 group-hover:text-red-700">Dirección</h3>
                                                    <p className="text-gray-600 text-sm">Libramiento sur ote. km6.5 #6800, Tuxtla Gutierrez, Chiapas, 29090</p>
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Section - Schedule and Social */}
                        <div className="grid md:grid-cols-2 gap-6 mt-8">
                            
                            {/* Schedule */}
                            <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl">
                                <div className="flex items-center mb-4">
                                    <AccessTimeIcon className="text-amber-600 mr-3 text-2xl" />
                                    <h3 className="text-xl font-bold text-gray-800">Horarios</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between py-2 border-b border-amber-200">
                                        <span className="font-medium text-gray-700">Lunes - Viernes</span>
                                        <span className="text-amber-700 font-semibold">10:00 AM - 8:00 PM</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-amber-200">
                                        <span className="font-medium text-gray-700">Sábado</span>
                                        <span className="text-amber-700 font-semibold">09:00 AM - 6:00 PM</span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="font-medium text-gray-700">Domingo</span>
                                        <span className="text-amber-700 font-semibold">09:00 AM - 3:00 PM</span>
                                    </div>
                                </div>
                            </div>

                            {/* Social Media */}
                            <div className="bg-purple-50 border border-purple-200 p-6 rounded-xl content-center">
                                <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                                    🌟 Redes Sociales
                                </h3>
                                <div className="flex justify-center gap-4">
                                    <MuiLink href="https://www.facebook.com/share/15UWjHGWaa/" target="_blank" rel="noopener noreferrer">
                                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-700 transform hover:scale-110 transition-all duration-200">
                                            <FacebookIcon className="text-white text-xl" />
                                        </div>
                                    </MuiLink>
                                    <MuiLink href="https://www.instagram.com/guzman_barberstudio?igsh=OHlyN2V5bWxudmFz" target="_blank" rel="noopener noreferrer">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center hover:from-purple-600 hover:to-pink-600 transform hover:scale-110 transition-all duration-200">
                                            <InstagramIcon className="text-white text-xl" />
                                        </div>
                                    </MuiLink>
                                    <MuiLink href="https://www.tiktok.com/@guzman_peluqueria" target="_blank" rel="noopener noreferrer">
                                        <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center hover:bg-gray-900 transform hover:scale-110 transition-all duration-200">
                                            {/* Reemplazado con un ícono SVG de TikTok si no está disponible */}
                                            <TikTokSvgIcon className="text-white text-xl" />
                                        </div>
                                    </MuiLink>
                                </div>
                                <p className="text-center text-gray-600 mt-3 text-sm">
                                    ¡Síguenos para promociones!
                                </p>
                            </div>
                        </div>

                        {/* Call to Action */}
                        <div className="mt-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-6 text-center text-white">
                            <h2 className="text-2xl font-bold mb-3">✂️ ¿Listo para tu próximo corte?</h2>
                            <p className="mb-4 opacity-90">Agenda tu cita o visítanos directamente</p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <MuiLink href="https://wa.me/529611719868?text=Hola,%20me%20gustaría%20agendar%20una%20cita" target="_blank" rel="noopener noreferrer">
                                    <button className="bg-white text-amber-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                                        📱 Agendar por WhatsApp
                                    </button>
                                </MuiLink>
                                <MuiLink href={openStreetMapUrl} target="_blank" rel="noopener noreferrer">
                                    <button className="border-2 border-white text-white px-6 py-2 rounded-lg font-semibold hover:bg-white hover:text-amber-600 transition-colors">
                                        🗺️ Cómo llegar
                                    </button>
                                </MuiLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <UserProfileModal
                open={isProfilePopoverOpen}
                onClose={handleCloseProfilePopover}
                anchorEl={anchorEl}
                userProfile={userProfile}
                updateUserProfile={updateUserProfile}
            />
        </div>
    );
}

export default ContactPage;