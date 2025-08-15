// src/theme.js
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme({
  palette: {
    primary: {
      main: '#D4AF37', 
    },
    background: {
      default: '#b08e6b', // beige oscuro para el fondo de la página
      paper: '#b08e6b',   // Si quieres que Paper también sea beige oscuro
    },
  },
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
    MuiAppBar: { 
      styleOverrides: {
        root: {
          backgroundColor: '#D4AF37', 
          boxShadow: 'none', 
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
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
          width: '100%',
        }
      }
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;