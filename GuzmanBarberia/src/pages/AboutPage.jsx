import React, { useState } from 'react';
import { Box, Typography, AppBar, Toolbar, IconButton, Paper } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SideMenu from '../components/SideMenu.jsx';
import Carousel from 'react-material-ui-carousel'; // Importa el componente Carousel
import UserProfileModal from '../components/UserProfileModal.jsx'; // Importa el componente del modal/popover
import { useUser } from '../contexts/UserContext.jsx'; // Importa el hook del contexto de usuario

// Importa tus imágenes para el carrusel
// Asegúrate de tener estas imágenes en tu carpeta src/assets/
import aboutImage1 from '../assets/about_us_1.jpg'; 
import aboutImage2 from '../assets/about_us_2.jpg'; 
import aboutImage3 from '../assets/about_us_3.jpg'; 

function AboutPage() {
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

  const carouselItems = [
    {
      image: aboutImage1,
      description: 'Nuestra barbería ofrece cortes clásicos y modernos.',
    },
    {
      image: aboutImage2,
      description: 'Expertos en cuidado de barba y afeitado tradicional.',
    },
    {
      image: aboutImage3,
      description: 'Un ambiente único y relajado para nuestros clientes.',
    },
  ];

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

      <Box sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Título "Sobre mí" */}
        <Typography 
          variant="h4" 
          component="h2" 
          sx={{ 
            mb: 4, 
            mt: 4, 
            textAlign: 'center', 
            fontWeight: 'bold',
            color: '#333333' // Color gris oscuro para mejor contraste, puedes probar '#000000' (negro puro) o un tono más oscuro si prefieres.
          }}
        >
          Sobre mí
        </Typography>

        <Box sx={{ maxWidth: 800, width: '100%', mb: 4 }}>
          <Carousel
            animation="slide" 
            indicators={true} 
            navButtonsAlwaysVisible={true} 
          >
            {carouselItems.map((item, i) => (
              <Paper key={i} elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                <Box
                  component="img"
                  src={item.image}
                  alt={`Imagen ${i + 1}`}
                  sx={{
                    width: '100%',
                    height: 400, 
                    objectFit: 'cover', 
                    borderRadius: 2,
                    mb: 2,
                  }}
                />
                <Typography variant="body1" sx={{ color: '#333333' }}> {/* Color para la descripción del carrusel */}
                  {item.description}
                </Typography>
              </Paper>
            ))}
          </Carousel>
        </Box>

        {/* Contenido adicional de "Sobre mí" */}
        <Typography 
          variant="body1" 
          sx={{ 
            maxWidth: 800, 
            textAlign: 'justify', 
            mb: 4,
            color: '#333333' // Color gris oscuro para el texto del párrafo
          }}
        >
          Bienvenido a Barber Guzmán, un lugar donde la tradición se fusiona con las tendencias modernas para ofrecerte una experiencia de barbería inigualable. Nos enorgullecemos de cada corte, cada afeitado y cada arreglo de barba que realizamos, asegurando que cada cliente salga sintiéndose renovado y con el estilo perfecto. Nuestro equipo de barberos profesionales está altamente capacitado y se mantiene al día con las últimas técnicas y estilos, garantizando resultados impecables. Más allá de un simple servicio de corte, en Barber Guzmán creamos un ambiente relajado y amigable, donde puedes desconectar y disfrutar de un verdadero momento de cuidado personal. Ven y descubre por qué somos la elección preferida para quienes buscan excelencia y un servicio al cliente de primera. ¡Te esperamos para transformar tu look y ofrecerte una experiencia memorable!
        </Typography>
      </Box>

      <UserProfileModal
        isOpen={isProfilePopoverOpen} 
        onClose={handleCloseProfilePopover}
        anchorEl={anchorEl} 
        userProfile={userProfile}
        updateUserProfile={updateUserProfile} 
      />
    </Box>
  );
}

export default AboutPage;