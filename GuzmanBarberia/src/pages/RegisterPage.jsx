// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Alert, CircularProgress, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles'; // Importar useTheme
import { useFormik } from 'formik';
import * as yup from 'yup';
import barberPoleRegister from '../assets/Registro.jpg';
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
    const [loading, setLoading] = useState(false);

    const theme = useTheme(); // Inicializar useTheme
    const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Usar useMediaQuery

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
            setLoading(true);

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
                backgroundColor: '#EDE0D4', // Principal (Background)
                // Eliminamos el padding aquí para que ocupe todo el espacio y el contenido interno lo controle
                // p: 2,
                overflow: 'hidden', // Evita el scroll global
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: 'stretch', // Asegura que los hijos se estiren a la misma altura
                    maxWidth: '900px',
                    width: '100%',
                    boxShadow: 3,
                    borderRadius: '20px',
                    overflow: 'hidden', // Importante para bordes redondeados y evitar scroll interno si el contenido se desborda
                    // Ajuste de altura para que el díptico no se desborde del viewport en móviles
                    maxHeight: { xs: '98vh', md: '95vh' }, // Limita la altura del contenedor principal
                    margin: 'auto', // Centra el contenedor si hay espacio
                }}
            >
                {/* Left Section: Image - AJUSTES PARA RESPONSIVIDAD Y AJUSTE DE IMAGEN */}
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        p: { xs: 2, md: 4 },
                        backgroundColor: 'white', // Secundario (Elementos de Contenedor)
                        borderRadius: isMobile ? '20px 20px 0 0' : '20px 0 0 20px',
                        // === Cambios para que la imagen sea más responsiva ===
                        height: { xs: '30vh', sm: '35vh', md: 'auto' }, // Altura definida en vh para móviles y tabletas
                        maxHeight: { xs: '300px', md: 'none' }, // Límite de altura en px para evitar que crezca demasiado en pantallas pequeñas
                        overflow: 'hidden', // Asegura que la imagen no se desborde del contenedor
                        width: '100%', // Asegura que el contenedor de la imagen ocupe todo el ancho disponible en su flex item
                    }}
                >
                    <img
                        src={barberPoleRegister}
                        alt="Barber Pole"
                        style={{
                            maxWidth: '100%',
                            height: '100%', // La imagen ocupa el 100% de la altura de su contenedor
                            display: 'block',
                            objectFit: 'contain', // Mantiene la proporción de la imagen, ajustándola dentro del contenedor
                        }}
                    />
                </Box>

                {/* Right Section: Form - AJUSTES PARA SCROLL Y ALTURA */}
                <Paper
                    elevation={0}
                    sx={{
                        flex: 1,
                        backgroundColor: 'white', // Secundario (Elementos de Contenedor)
                        p: { xs: 3, md: 4 }, // Ajuste de padding para móviles
                        borderRadius: isMobile ? '0 0 20px 20px' : '0 20px 20px 0',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        boxSizing: 'border-box',
                        overflowY: 'auto', // Solo scroll vertical si es necesario
                        maxHeight: isMobile ? '70vh' : 'auto', // Ajustado para complementar el 30vh de la imagen
                    }}
                >
                    <Typography
                        variant="h4"
                        component="h2"
                        sx={{ mb: { xs: 2, md: 4 }, textAlign: 'center', color: '#333333', fontWeight: 'bold' }} // Ajuste de mb
                    >
                        Crear Cuenta
                    </Typography>
                    <form onSubmit={formik.handleSubmit}>
                        {/* TextField Nombre */}
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
                            sx={{
                                mb: 2,
                                backgroundColor: 'white',
                                borderRadius: '8px', // Cambiado de 1 a 8px para consistencia
                                '& .MuiInputBase-input': {
                                    paddingTop: '25px', // Más espacio arriba para la etiqueta y valor
                                    paddingBottom: '10px',
                                    paddingLeft: '14px',
                                    paddingRight: '14px',
                                    color: '#333333',
                                },
                                '& .MuiInputLabel-root': {
                                    transform: 'translate(14px, 12px) scale(1)',
                                    color: '#555',
                                },
                                '& .MuiInputLabel-root.Mui-focused, & .MuiInputLabel-root.Mui-active': {
                                    transform: 'translate(14px, 5px) scale(0.75)',
                                    color: '#D4AF37',
                                },
                                '& .MuiInputLabel-shrink': {
                                    transform: 'translate(14px, 5px) scale(0.75)',
                                },
                                '& .MuiFilledInput-root': {
                                    backgroundColor: 'white',
                                    '&:hover': { backgroundColor: 'white' },
                                    '&.Mui-focused': { backgroundColor: 'white' },
                                    border: '1px solid #eee',
                                },
                            }}
                            InputProps={{ disableUnderline: true }}
                        />
                        {/* TextField Apellido */}
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
                            sx={{
                                mb: 2,
                                backgroundColor: 'white',
                                borderRadius: '8px', // Cambiado de 1 a 8px para consistencia
                                '& .MuiInputBase-input': {
                                    paddingTop: '25px',
                                    paddingBottom: '10px',
                                    paddingLeft: '14px',
                                    paddingRight: '14px',
                                    color: '#333333',
                                },
                                '& .MuiInputLabel-root': {
                                    transform: 'translate(14px, 12px) scale(1)',
                                    color: '#555',
                                },
                                '& .MuiInputLabel-root.Mui-focused, & .MuiInputLabel-root.Mui-active': {
                                    transform: 'translate(14px, 5px) scale(0.75)',
                                    color: '#D4AF37',
                                },
                                '& .MuiInputLabel-shrink': {
                                    transform: 'translate(14px, 5px) scale(0.75)',
                                },
                                '& .MuiFilledInput-root': {
                                    backgroundColor: 'white',
                                    '&:hover': { backgroundColor: 'white' },
                                    '&.Mui-focused': { backgroundColor: 'white' },
                                    border: '1px solid #eee',
                                },
                            }}
                            InputProps={{ disableUnderline: true }}
                        />
                        {/* TextField Correo */}
                        <TextField
                            fullWidth
                            id="correo"
                            name="correo"
                            label="Correo Electrónico" // Cambiado a "Correo Electrónico" para consistencia con LoginPage
                            variant="filled"
                            value={formik.values.correo}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.correo && Boolean(formik.errors.correo)}
                            helperText={formik.touched.correo && formik.errors.correo}
                            sx={{
                                mb: 2,
                                backgroundColor: 'white',
                                borderRadius: '8px', // Cambiado de 1 a 8px para consistencia
                                '& .MuiInputBase-input': {
                                    paddingTop: '25px',
                                    paddingBottom: '10px',
                                    paddingLeft: '14px',
                                    paddingRight: '14px',
                                    color: '#333333',
                                },
                                '& .MuiInputLabel-root': {
                                    transform: 'translate(14px, 12px) scale(1)',
                                    color: '#555',
                                },
                                '& .MuiInputLabel-root.Mui-focused, & .MuiInputLabel-root.Mui-active': {
                                    transform: 'translate(14px, 5px) scale(0.75)',
                                    color: '#D4AF37',
                                },
                                '& .MuiInputLabel-shrink': {
                                    transform: 'translate(14px, 5px) scale(0.75)',
                                },
                                '& .MuiFilledInput-root': {
                                    backgroundColor: 'white',
                                    '&:hover': { backgroundColor: 'white' },
                                    '&.Mui-focused': { backgroundColor: 'white' },
                                    border: '1px solid #eee',
                                },
                            }}
                            InputProps={{ disableUnderline: true }}
                        />
                        {/* TextField Contraseña */}
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
                            sx={{
                                mb: 2,
                                backgroundColor: 'white',
                                borderRadius: '8px', // Cambiado de 1 a 8px para consistencia
                                '& .MuiInputBase-input': {
                                    paddingTop: '25px',
                                    paddingBottom: '10px',
                                    paddingLeft: '14px',
                                    paddingRight: '14px',
                                    color: '#333333',
                                },
                                '& .MuiInputLabel-root': {
                                    transform: 'translate(14px, 12px) scale(1)',
                                    color: '#555',
                                },
                                '& .MuiInputLabel-root.Mui-focused, & .MuiInputLabel-root.Mui-active': {
                                    transform: 'translate(14px, 5px) scale(0.75)',
                                    color: '#D4AF37',
                                },
                                '& .MuiInputLabel-shrink': {
                                    transform: 'translate(14px, 5px) scale(0.75)',
                                },
                                '& .MuiFilledInput-root': {
                                    backgroundColor: 'white',
                                    '&:hover': { backgroundColor: 'white' },
                                    '&.Mui-focused': { backgroundColor: 'white' },
                                    border: '1px solid #eee',
                                },
                            }}
                            InputProps={{ disableUnderline: true }}
                        />
                        {/* TextField Confirmar Contraseña */}
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
                            sx={{
                                mb: 4, // Ajustado a mb: 4 para más espacio antes del botón
                                backgroundColor: 'white',
                                borderRadius: '8px', // Cambiado de 1 a 8px para consistencia
                                '& .MuiInputBase-input': {
                                    paddingTop: '25px',
                                    paddingBottom: '10px',
                                    paddingLeft: '14px',
                                    paddingRight: '14px',
                                    color: '#333333',
                                },
                                '& .MuiInputLabel-root': {
                                    transform: 'translate(14px, 12px) scale(1)',
                                    color: '#555',
                                },
                                '& .MuiInputLabel-root.Mui-focused, & .MuiInputLabel-root.Mui-active': {
                                    transform: 'translate(14px, 5px) scale(0.75)',
                                    color: '#D4AF37',
                                },
                                '& .MuiInputLabel-shrink': {
                                    transform: 'translate(14px, 5px) scale(0.75)',
                                },
                                '& .MuiFilledInput-root': {
                                    backgroundColor: 'white',
                                    '&:hover': { backgroundColor: 'white' },
                                    '&.Mui-focused': { backgroundColor: 'white' },
                                    border: '1px solid #eee',
                                },
                            }}
                            InputProps={{ disableUnderline: true }}
                        />
                        {/* Botón de Registrarse */}
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                                <CircularProgress size={24} sx={{ color: '#D4AF37' }} />
                            </Box>
                        ) : (
                            <Button
                                color="primary"
                                variant="contained"
                                fullWidth
                                type="submit"
                                sx={{
                                    backgroundColor: '#D4AF37',
                                    '&:hover': {
                                        backgroundColor: '#C39F37',
                                    },
                                    color: '#1a202c',
                                    fontSize: '1.1rem',
                                    padding: '10px 0',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                }}
                            >
                                Registrarse
                            </Button>
                        )}
                    </form>
                    {errorRegister && (
                        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                            {errorRegister}
                        </Alert>
                    )}
                    {successRegister && (
                        <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
                            {successRegister}
                        </Alert>
                    )}
                </Paper>
            </Box>
        </Box>
    );
}

export default RegisterPage;