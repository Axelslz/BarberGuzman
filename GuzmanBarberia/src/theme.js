import { createTheme } from '@mui/material/styles';

const theme = createTheme({
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
  components: {
    MuiAppBar: { // Estilos para el componente AppBar de Material-UI
      styleOverrides: {
        root: {
          backgroundColor: '#D4AF37', // Define el color de fondo del AppBar aquí
          boxShadow: 'none', // O '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)', // Sombra por defecto si la quieres
        },
      },
    },
    // ... otros overrides de componentes si tienes
  },
});

export default theme;