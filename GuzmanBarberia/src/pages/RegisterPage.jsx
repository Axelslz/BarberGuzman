import React, { useState } from 'react';
import { 
    Box, 
    Typography, 
    TextField, 
    Button, 
    Paper, 
    Alert, 
    CircularProgress, 
    useMediaQuery,
    Snackbar // <-- Importa Snackbar
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useFormik } from 'formik';
import * as yup from 'yup';
import barberPoleRegister from '../assets/Registro.jpg'; // Asumo que es la misma imagen o similar
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
    // Reemplazamos errorRegister y successRegister por los estados del Snackbar
    // const [errorRegister, setErrorRegister] = useState(null);
    // const [successRegister, setSuccessRegister] = useState(null);
    const [loading, setLoading] = useState(false);

    // Estados para el Snackbar
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // 'success', 'error', 'info', 'warning'

    const theme = useTheme(); 
    const isMobile = useMediaQuery(theme.breakpoints.down('md')); 

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
            // setErrorRegister(null); // Eliminado
            // setSuccessRegister(null); // Eliminado
            setLoading(true);

            try {
                const { mensaje } = await registrar({
                    name: values.nombre,
                    lastname: values.apellido,
                    correo: values.correo,
                    password: values.contrasena,
                    confirmPassword: values.confirmarContrasena,
                });

                // Usar Snackbar para el mensaje de éxito
                setSnackbarMessage(mensaje || 'Registro exitoso. ¡Ahora inicia sesión!');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
                
                formik.resetForm();
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } catch (error) {
                // Usar Snackbar para el mensaje de error
                setSnackbarMessage(error.message || 'Error al registrar.');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
                console.error('Error al registrar:', error);
            } finally {
                setLoading(false);
            }
        },
    });

    // Función para cerrar el Snackbar
    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: '#EDE0D4', 
                overflow: 'hidden', 
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: 'stretch', 
                    maxWidth: '900px',
                    width: '100%',
                    boxShadow: 3,
                    borderRadius: '20px',
                    overflow: 'hidden', 
                    maxHeight: { xs: '98vh', md: '95vh' }, 
                    margin: 'auto', 
                }}
            >

                {/* Left Section: Image - CAMBIO CLAVE AQUÍ: OCULTA EN XS, MUESTRA EN MD Y SUPERIORES */}
                <Box
                    sx={{
                        flex: 1,
                        display: { xs: 'none', md: 'flex' }, // <-- Este es el cambio
                        justifyContent: 'center',
                        alignItems: 'center',
                        p: { xs: 2, md: 4 },
                        backgroundColor: 'white',
                        borderRadius: isMobile ? '20px 20px 0 0' : '20px 0 0 20px',
                        height: { xs: '30vh', sm: '35vh', md: 'auto' }, 
                        maxHeight: { xs: '300px', md: 'none' }, 
                        overflow: 'hidden',
                        width: '100%',
                    }}
                >
                    <img
                        src={barberPoleRegister} // Asegúrate de que esta sea la imagen correcta para registro
                        alt="Barber Pole"
                        style={{
                            maxWidth: '100%',
                            height: '100%',
                            display: 'block',
                            objectFit: 'contain',
                        }}
                    />
                </Box>

                {/* Right Section: Form - AJUSTES PARA SCROLL Y ALTURA */}
                <Paper
                    elevation={0}
                    sx={{
                        flex: 1,
                        backgroundColor: 'white', 
                        p: { xs: 3, md: 4 }, 
                        borderRadius: isMobile ? '0 0 20px 20px' : '0 20px 20px 0',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        boxSizing: 'border-box',
                        overflowY: 'auto', 
                        maxHeight: isMobile ? '70vh' : 'auto', 
                    }}
                >
                    <Typography
                        variant="h4"
                        component="h2"
                        sx={{ mb: { xs: 2, md: 4 }, textAlign: 'center', color: '#333333', fontWeight: 'bold' }} 
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
                                borderRadius: '8px', 
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
                                borderRadius: '8px', 
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
                            label="Correo Electrónico" 
                            variant="filled"
                            value={formik.values.correo}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.correo && Boolean(formik.errors.correo)}
                            helperText={formik.touched.correo && formik.errors.correo}
                            sx={{
                                mb: 2,
                                backgroundColor: 'white',
                                borderRadius: '8px', 
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
                                borderRadius: '8px', 
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
                                mb: 4, 
                                backgroundColor: 'white',
                                borderRadius: '8px', 
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
                        {/* Ya no se necesitan estos Alerts directamente en el render */}
                        {/* {errorRegister && (
                            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                                {errorRegister}
                            </Alert>
                        )}
                        {successRegister && (
                            <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
                                {successRegister}
                            </Alert>
                        )} */}
                    </form>
                </Paper>
            </Box>

            {/* Snackbar para notificaciones */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000} // Cierra automáticamente después de 3 segundos
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // Posición en la pantalla
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default RegisterPage;