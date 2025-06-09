import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Link as MuiLink, Alert, CircularProgress } from '@mui/material'; // Importa CircularProgress también para el loading
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import barberPoleLogin from '../assets/barber_pole_login.png';
import { useUser } from '../contexts/UserContext.jsx';
// CAMBIO IMPORTANTE AQUÍ: Importa 'login' Y 'getProfile' con nombre
import { login, getProfile } from '../services/authService'; 

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
  const { setAdminStatus, updateUserProfile } = useUser();
  const [errorLogin, setErrorLogin] = useState(null); // Estado para manejar errores de login
  const [loading, setLoading] = useState(false); // Estado para manejar el loading del botón

  const formik = useFormik({
    initialValues: {
      correo: '',
      contrasena: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setErrorLogin(null);
      setLoading(true); // Activa el loading

      try {
        // CAMBIO IMPORTANTE AQUÍ: Llama directamente a 'login'
        await login(values.correo, values.contrasena); // Solo necesitamos que el token se guarde

        // CAMBIO IMPORTANTE AQUÍ: Llama directamente a 'getProfile'
        const profileData = await getProfile(); // Esta llamada usa el token recién guardado
        
        updateUserProfile({
            id: profileData.id,
            name: profileData.name,
            lastName: profileData.lastname, // Ahora profileData.lastname sí estará disponible
            email: profileData.correo,
            role: profileData.role,
            id_barbero: profileData.id_barbero,
            citas_completadas: profileData.citas_completadas || 0,
        });
        
        setAdminStatus(profileData.role === 'admin'); // Usa el rol del perfil completo

        alert('Inicio de sesión exitoso. ¡Bienvenido!');
        navigate('/seleccionar-barbero');

      } catch (error) {
          setErrorLogin(error.message);
          console.error('Error al iniciar sesión:', error);
      } finally {
          setLoading(false); // Desactiva el loading al finalizar
      }
    },
  });

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        p: 2,
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
          borderRadius: '20px',
          overflow: 'hidden',
        }}
      >
        {/* Left Section: Image */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: { xs: 2, md: 4 },
            backgroundColor: 'white', 
            borderTopLeftRadius: { xs: '20px', md: '20px' },
            borderTopRightRadius: { xs: '20px', md: '0' },
            borderBottomLeftRadius: { xs: '0', md: '20px' },
            borderBottomRightRadius: { xs: '0', md: '0' },
          }}
        >
          <img
            src={barberPoleLogin}
            alt="Barber Pole"
            style={{
              maxWidth: '80%',
              height: 'auto',
              display: 'block',
              objectFit: 'contain',
            }}
          />
        </Box>

        {/* Right Section: Form */}
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            backgroundColor: '#D4AF37', 
            p: 4,
            borderRadius: { xs: '0 0 20px 20px', md: '0 20px 20px 0' },
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
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
              sx={{ mb: 2, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 1 }}
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
                backgroundColor: '#4CAF50',
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
              sx={{ mt: 2, display: 'block', textAlign: 'center', color: 'white', textDecoration: 'none' }}
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
                backgroundColor: '#DB4437',
                '&:hover': {
                  backgroundColor: '#C32F27',
                },
                color: 'white',
                fontSize: '1.1rem',
                padding: '10px 0',
                mt: 2,
                borderRadius: '8px',
                fontWeight: 'bold',
              }}
            >
              Continuar con Google
            </Button>
            <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'white' }}>
              ¿Aún no tienes una cuenta?{' '}
              <MuiLink component={Link} to="/register" sx={{ color: '#64B5F6', textDecoration: 'none' }}>
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