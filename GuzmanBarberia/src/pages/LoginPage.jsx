import React from 'react';
import { Box, Typography, TextField, Button, Paper, Link as MuiLink } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import barberPoleLogin from '../assets/barber_pole_login.png'; // Assuming this is the correct image for login
import { useUser } from '../contexts/UserContext.jsx'; // Importa useUser

const validationSchema = yup.object({
  correo: yup
    .string('Ingresa tu correo electrónico')
    .email('Ingresa un correo electrónico válido')
    .required('El correo electrónico es requerido'),
  contrasena: yup
    .string('Ingresa tu contraseña')
    .required('La contraseña es requerida'),
});

function LoginPage() {
  const navigate = useNavigate();
  // Obtén setAdminStatus y updateUserProfile del contexto de usuario
  const { setAdminStatus, updateUserProfile } = useUser();

  const formik = useFormik({
    initialValues: {
      correo: '',
      contrasena: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      console.log('Datos de login:', values);

      // Simula un retardo de red para la autenticación
      setTimeout(() => {
        // --- Lógica de AUTENTICACIÓN SIMULADA con roles ---
        if (values.correo === 'adrianbarbe@gmail.com' && values.contrasena === 'admin123') {
          setAdminStatus(true); // Marca al usuario como admin en el contexto
          // Puedes actualizar otros datos del perfil si es necesario para el admin
          updateUserProfile({ name: 'Adrian', lastName: 'Guzman', email: 'adrianbarbe@gmail.com' });
          alert('Inicio de sesión como Administrador exitoso. ¡Bienvenido!');
          navigate('/seleccionar-barbero'); // Redirige a la página de selección de barbero
        } else if (values.correo === 'axel@gmail.com' && values.contrasena === '12345678') {
          // Ejemplo de un usuario normal
          setAdminStatus(false); // Asegúrate de que no sea admin
          updateUserProfile({ name: 'Axel', lastName: 'salazar', email: 'axel@gmail.com' });
          alert('Inicio de sesión exitoso. ¡Bienvenido!');
          navigate('/seleccionar-barbero'); // Redirige a la página de selección de barbero
        } else {
          setAdminStatus(false); // Si las credenciales no coinciden, asegúrate de que no sea admin
          alert('Credenciales incorrectas. Por favor, inténtalo de nuevo.');
        }
        // --- FIN Lógica de AUTENTICACIÓN SIMULADA ---
      }, 500); // Retardo de 500ms para simular una petición
    },
  });

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f0f0', // Light grey background as in the screenshot
        p: 2, // Add some padding around the whole container for small screens
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' }, // Stack vertically on small screens, horizontally on medium and up
          alignItems: 'center',
          maxWidth: '900px', // A reasonable max width for the combined box
          width: '100%',
          boxShadow: 3,
          borderRadius: '20px', // More pronounced rounded corners for the whole container
          overflow: 'hidden', // Ensures the image and form respect the border radius
        }}
      >
        {/* Left Section: Image */}
        <Box
          sx={{
            flex: 1, // Takes equal space
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: { xs: 2, md: 4 }, // Padding around the image, more on larger screens
            backgroundColor: 'white', // Changed to white to match the screenshot's image background
            borderTopLeftRadius: { xs: '20px', md: '20px' },
            borderTopRightRadius: { xs: '20px', md: '0' },
            borderBottomLeftRadius: { xs: '0', md: '20px' },
            borderBottomRightRadius: { xs: '0', md: '0' },
          }}
        >
          {/* Ensure the image fills its container but respects aspect ratio */}
          <img
            src={barberPoleLogin}
            alt="Barber Pole"
            style={{
              maxWidth: '80%', // Adjusted to make the image slightly larger but still fit
              height: 'auto',
              display: 'block',
              objectFit: 'contain',
            }}
          />
        </Box>

        {/* Right Section: Form */}
        <Paper
          elevation={0} // No shadow on the paper itself, shadow is on the parent Box
          sx={{
            flex: 1, // Takes equal space
            backgroundColor: '#D4AF37', // Gold color as in the screenshot
            p: 4, // Padding inside the form container
            borderRadius: { xs: '0 0 20px 20px', md: '0 20px 20px 0' }, // Rounded bottom corners for small, right corners for large
            width: '100%', // Ensure it takes full width when stacked
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center', // Center content vertically within the form
          }}
        >
          <Typography
            variant="h4"
            component="h2"
            sx={{ mb: 4, textAlign: 'center', color: 'white', fontWeight: 'bold' }}
          >
            Iniciar Sesión
          </Typography>
          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              id="correo"
              name="correo"
              label="Correo Electronico"
              variant="filled"
              value={formik.values.correo}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.correo && Boolean(formik.errors.correo)}
              helperText={formik.touched.correo && formik.errors.correo}
              sx={{ mb: 2, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 1 }} // Slightly more opaque white background
              InputProps={{ disableUnderline: true }}
            />
            <TextField
              fullWidth
              id="contrasena"
              name="contrasena"
              label="Contraseña"
              type="password"
              variant="filled"
              value={formik.values.contrasena}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.contrasena && Boolean(formik.errors.contrasena)}
              helperText={formik.touched.contrasena && formik.errors.contrasena}
              sx={{ mb: 4, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 1 }}
              InputProps={{ disableUnderline: true }}
            />
            <Button
              color="primary"
              variant="contained"
              fullWidth
              type="submit"
              sx={{
                backgroundColor: '#4CAF50', // Green button as in the screenshot
                '&:hover': {
                  backgroundColor: '#388E3C',
                },
                color: 'white',
                fontSize: '1.1rem',
                padding: '10px 0',
                borderRadius: '8px',
                fontWeight: 'bold',
              }}
            >
              Iniciar Sesión
            </Button>
            <MuiLink
              component={Link}
              to="/forgot-password"
              variant="body2"
              sx={{ mt: 2, display: 'block', textAlign: 'center', color: 'white', textDecoration: 'none' }} // Ensure no underline by default
            >
              ¿Olvidaste tu contraseña?
            </MuiLink>
            <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'white' }}>
              O
            </Typography>
            <Button
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: '#DB4437', // Red for Google button
                '&:hover': {
                  backgroundColor: '#C32F27',
                },
                color: 'white',
                fontSize: '1.1rem',
                padding: '10px 0',
                mt: 2,
                borderRadius: '8px', // Match other button radius
                fontWeight: 'bold',
              }}
            >
              Continuar con Google
            </Button>
            <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'white' }}>
              ¿Aún no tienes una cuenta?{' '}
              <MuiLink component={Link} to="/register" sx={{ color: '#64B5F6', textDecoration: 'none' }}> {/* Lighter blue link, no underline */}
                Regístrate
              </MuiLink>
            </Typography>
          </form>
        </Paper>
      </Box>
    </Box>
  );
}

export default LoginPage;