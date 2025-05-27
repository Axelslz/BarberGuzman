import React from 'react';
import { Box, Typography, TextField, Button, Paper, Link as MuiLink } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom'; // Importar useNavigate
import barberPoleLogin from '../assets/barber_pole_login.png';

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
  const navigate = useNavigate(); // Inicializar useNavigate

  const formik = useFormik({
    initialValues: {
      correo: '',
      contrasena: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      // alert(JSON.stringify(values, null, 2)); // Quitar esta alerta o dejarla solo para depuración
      console.log('Datos de login:', values);

      // Simula un login exitoso y luego redirige
      // En una aplicación real, aquí harías una llamada a tu API
      // y si la autenticación es exitosa, entonces llamarías a navigate.
      setTimeout(() => { // Simulamos un retardo de red
        alert('Inicio de sesión exitoso. ¡Bienvenido!');
        navigate('/seleccionar-barbero'); // Redirige a la página de selección de barbero
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
        backgroundColor: '#f0f0f0',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          maxWidth: '900px',
          width: '100%',
          boxShadow: 3,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 3,
            backgroundColor: 'black',
          }}
        >
          <img src={barberPoleLogin} alt="Barber Pole" style={{ maxWidth: '100%', height: 'auto' }} />
        </Box>
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            backgroundColor: '#D4AF37',
            p: 4,
            borderRadius: { xs: '0 0 8px 8px', md: '0 8px 8px 0' },
            width: '100%',
          }}
        >
          <Typography variant="h4" component="h2" sx={{ mb: 4, textAlign: 'center', color: 'white', fontWeight: 'bold' }}>
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
              sx={{ mb: 2, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 1 }}
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
              sx={{ mb: 4, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 1 }}
              InputProps={{ disableUnderline: true }}
            />
            <Button
              color="primary"
              variant="contained"
              fullWidth
              type="submit"
              sx={{
                backgroundColor: '#4CAF50',
                '&:hover': {
                  backgroundColor: '#388E3C',
                },
                color: 'white',
                fontSize: '1.1rem',
                padding: '10px 0',
              }}
            >
              Iniciar Sesión
            </Button>
            <MuiLink component={Link} to="/forgot-password" variant="body2" sx={{ mt: 2, display: 'block', textAlign: 'center', color: 'white' }}>
              ¿Olvidaste tu contraseña?
            </MuiLink>
            <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'white' }}>
              O
            </Typography>
            <Button
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: '#DB4437',
                '&:hover': {
                  backgroundColor: '#C32F27',
                },
                color: 'white',
                fontSize: '1.1rem',
                padding: '10px 0',
                mt: 2,
              }}
              // onClick={() => console.log('Continuar con Google')}
            >
              Continuar con Google
            </Button>
            <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'white' }}>
              ¿Aún no tienes una cuenta? <MuiLink component={Link} to="/register" sx={{ color: '#64B5F6' }}>Regístrate</MuiLink>
            </Typography>
          </form>
        </Paper>
      </Box>
    </Box>
  );
}

export default LoginPage;