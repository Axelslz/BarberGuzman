// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Link as MuiLink, Alert, CircularProgress } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import barberPoleLogin from '../assets/barber_pole_login.png';
import { useUser } from '../contexts/UserContext.jsx';
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
  const { updateUserProfile } = useUser();
  const [errorLogin, setErrorLogin] = useState(null);
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      correo: '',
      contrasena: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setErrorLogin(null);
      setLoading(true);

      try {
        // Asumiendo que la función 'login' en authService.js
        // guarda el token y el objeto 'user' en localStorage
        // y retorna el objeto 'user' directamente.
        await login(values.correo, values.contrasena); 
        
        // Se sigue haciendo una llamada a getProfile() para asegurar que el UserContext
        // tenga la información más fresca y completa del perfil al inicio de la sesión.
        const profileData = await getProfile(); 

        console.log("ProfileData después de getProfile en LoginPage:", profileData); // Verifica esto en consola
        
        // Ahora, los datos de `profileData` deberían ser el objeto del usuario completo
        // tal como lo esperamos después de ajustar `authService.js`
        updateUserProfile({
            id: profileData.id,
            name: profileData.name,
            lastName: profileData.lastname,
            email: profileData.correo,
            role: profileData.role,
            id_barbero: profileData.id_barbero,
            citas_completadas: profileData.citas_completadas || 0,
        });

        alert('Inicio de sesión exitoso. ¡Bienvenido!');
        
        // *** CAMBIO CLAVE AQUÍ: Redirección uniforme para todos los roles ***
        // Todos los usuarios irán a la misma página inicial.
        // La lógica de permisos para "historial de cortes" u otras funcionalidades
        // se gestionará dentro de las rutas protegidas o los componentes mismos.
        navigate('/seleccionar-barbero'); // O la ruta principal que quieres para todos los usuarios

      } catch (error) {
          setErrorLogin(error.message);
          console.error('Error al iniciar sesión:', error);
      } finally {
          setLoading(false);
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
            {loading ? ( 
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                <CircularProgress size={24} color="inherit" />
              </Box>
            ) : (
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
            )}
            
            {errorLogin && (
              <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                {errorLogin}
              </Alert>
            )}

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