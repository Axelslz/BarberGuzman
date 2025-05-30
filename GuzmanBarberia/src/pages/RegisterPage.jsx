import React from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import barberPoleRegister from '../assets/barber_pole_register.png'; // Assuming this image is the one from your screenshot
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

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
      console.log('Datos de registro:', values);

      setTimeout(() => {
        alert('Registro exitoso. ¡Ahora inicia sesión!');
        navigate('/login');
      }, 500);
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
            borderTopLeftRadius: { xs: '20px', md: '20px' }, // Rounded top-left for small, top-left for large
            borderTopRightRadius: { xs: '20px', md: '0' }, // Rounded top-right for small, no rounded top-right for large
            borderBottomLeftRadius: { xs: '0', md: '20px' }, // No rounded bottom-left for small, rounded bottom-left for large
            borderBottomRightRadius: { xs: '0', md: '0' }, // No rounded bottom-right for small, no rounded bottom-right for large
          }}
        >
          {/* Ensure the image fills its container but respects aspect ratio */}
          <img
            src={barberPoleRegister}
            alt="Barber Pole"
            style={{
              maxWidth: '80%', // Adjusted to make the image slightly larger but still fit
              height: 'auto',
              display: 'block', // Helps in removing extra space below the image if any
              objectFit: 'contain', // Ensures the image scales nicely
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
            Crear Cuenta
          </Typography>
          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              id="nombre"
              name="nombre"
              label="Nombre"
              variant="filled" // 'filled' variant is good for this style
              value={formik.values.nombre}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.nombre && Boolean(formik.errors.nombre)}
              helperText={formik.touched.nombre && formik.errors.nombre}
              sx={{ mb: 2, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 1 }} // Slightly more opaque white background
              InputProps={{ disableUnderline: true }} // Remove default underline
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
              sx={{ mb: 2, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 1 }}
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
              sx={{ mb: 2, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 1 }}
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
                  backgroundColor: '#388E3C', // Darker green on hover
                },
                color: 'white',
                fontSize: '1.1rem',
                padding: '10px 0',
                borderRadius: '8px', // Slightly more rounded button
                fontWeight: 'bold', // Make text bold
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