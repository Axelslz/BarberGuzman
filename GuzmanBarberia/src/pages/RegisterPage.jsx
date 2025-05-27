import React from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import barberPoleRegister from '../assets/barber_pole_register.png';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate

const validationSchema = yup.object({
  nombre: yup
    .string('Ingresa tu nombre')
    .required('El nombre es requerido'),
  apellido: yup
    .string('Ingresa tu apellido')
    .required('El apellido es requerido'),
  correo: yup
    .string('Ingresa tu correo electrónico')
    .email('Ingresa un correo electrónico válido')
    .required('El correo electrónico es requerido'),
  contrasena: yup
    .string('Ingresa tu contraseña')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .required('La contraseña es requerida'),
  confirmarContrasena: yup
    .string('Confirma tu contraseña')
    .oneOf([yup.ref('contrasena'), null], 'Las contraseñas no coinciden')
    .required('Confirmar contraseña es requerido'),
});

function RegisterPage() {
  const navigate = useNavigate(); // Inicializar useNavigate

  const formik = useFormik({
    initialValues: {
      nombre: '',
      apellido: '',
      correo: '',
      contrasena: '',
      confirmarContrasena: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      // alert(JSON.stringify(values, null, 2)); // Quitar esta alerta o dejarla solo para depuración
      console.log('Datos de registro:', values);

      // Simula un registro exitoso y luego redirige
      // En una aplicación real, aquí harías una llamada a tu API
      // y si la respuesta es exitosa, entonces llamarías a navigate.
      setTimeout(() => { // Simulamos un retardo de red
        alert('Registro exitoso. ¡Ahora inicia sesión!');
        navigate('/login'); // Redirige a la página de login
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
          <img src={barberPoleRegister} alt="Barber Pole" style={{ maxWidth: '100%', height: 'auto' }} />
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
            Crear Cuenta
          </Typography>
          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              id="nombre"
              name="nombre"
              label="Nombre"
              variant="filled"
              value={formik.values.nombre}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.nombre && Boolean(formik.errors.nombre)}
              helperText={formik.touched.nombre && formik.errors.nombre}
              sx={{ mb: 2, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 1 }}
              InputProps={{ disableUnderline: true }}
            />
            <TextField
              fullWidth
              id="apellido"
              name="apellido"
              label="Apellido"
              variant="filled"
              value={formik.values.apellido}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.apellido && Boolean(formik.errors.apellido)}
              helperText={formik.touched.apellido && formik.errors.apellido}
              sx={{ mb: 2, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 1 }}
              InputProps={{ disableUnderline: true }}
            />
            <TextField
              fullWidth
              id="correo"
              name="correo"
              label="Correo"
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
              sx={{ mb: 2, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 1 }}
              InputProps={{ disableUnderline: true }}
            />
            <TextField
              fullWidth
              id="confirmarContrasena"
              name="confirmarContrasena"
              label="Confirmar Contraseña"
              type="password"
              variant="filled"
              value={formik.values.confirmarContrasena}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.confirmarContrasena && Boolean(formik.errors.confirmarContrasena)}
              helperText={formik.touched.confirmarContrasena && formik.errors.confirmarContrasena}
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
              Registrarse
            </Button>
          </form>
        </Paper>
      </Box>
    </Box>
  );
}

export default RegisterPage;