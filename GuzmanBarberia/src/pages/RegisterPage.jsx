import React, { useState } from 'react'; 
import { Box, Typography, TextField, Button, Paper, Alert } from '@mui/material'; 
import { useFormik } from 'formik';
import * as yup from 'yup';
import barberPoleRegister from '../assets/barber_pole_register.png';
import { useNavigate } from 'react-router-dom';
import { registrar } from '../services/authService'; 

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
  const [errorRegister, setErrorRegister] = useState(null); 
  const [successRegister, setSuccessRegister] = useState(null); 

  const formik = useFormik({
    initialValues: {
      nombre: '',
      apellido: '',
      correo: '',
      contrasena: '',
      confirmarContrasena: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => { 
      setErrorRegister(null); 
      setSuccessRegister(null); 

      try {
        const { mensaje } = await registrar({
          name: values.nombre,
          lastname: values.apellido,
          correo: values.correo,
          password: values.contrasena,
          confirmPassword: values.confirmarContrasena,
        });
        
        setSuccessRegister(mensaje || 'Registro exitoso. ¡Ahora inicia sesión!');
        formik.resetForm(); 
        setTimeout(() => {
          navigate('/login');
        }, 2000); 
      } catch (error) {
        setErrorRegister(error.message); 
        console.error('Error al registrar:', error);
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
          {/* Ensure the image fills its container but respects aspect ratio */}
          <img
            src={barberPoleRegister}
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
              sx={{ mb: 2, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 1 }} 
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
              Registrarse
            </Button>
          </form>
        </Paper>
      </Box>
    </Box>
  );
}

export default RegisterPage;