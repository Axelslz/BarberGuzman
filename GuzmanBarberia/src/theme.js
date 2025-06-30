// src/theme.js
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme({
  palette: {
    primary: {
      main: '#D4AF37', // Tu color dorado que podría ser el primary de tu app
    },
    // ... otros colores de la paleta
    background: {
      default: '#b08e6b', // Tu beige oscuro para el fondo de la página
      paper: '#b08e6b',   // Si quieres que Paper también sea beige oscuro
    },
  },
  // BREAKPOINTS VA AQUÍ, FUERA DE 'components'
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  components: {
    MuiAppBar: { // Estilos para el componente AppBar de Material-UI
      styleOverrides: {
        root: {
          backgroundColor: '#D4AF37', // Define el color de fondo del AppBar aquí
          boxShadow: 'none', // O '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)', // Sombra por defecto si la quieres
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          // Por ejemplo, un padding base que se ajusta
          padding: '10px 20px',
          '@media (min-width:600px)': {
            padding: '12px 24px',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          // Asegurar que los TextFields siempre ocupen el 100% de su contenedor
          width: '100%',
        }
      }
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;