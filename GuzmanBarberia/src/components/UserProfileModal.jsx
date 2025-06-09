import React, { useState, useEffect } from 'react'; // Agregamos useEffect si lo necesitamos
import {
  Popover,
  Box,
  Typography,
  Button,
  Avatar,
  Divider,
  IconButton,
  TextField,
  CircularProgress, // Para el estado de carga
  Alert // Para mensajes de error
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CloseIcon from '@mui/icons-material/Close';

// Para el modo edición
import { useFormik } from 'formik';
import * as yup from 'yup';

// Importa el contexto de usuario
import { useUser } from '../contexts/UserContext.jsx'; // Asegúrate de la ruta correcta

// Esquema de validación para Formik
const validationSchema = yup.object({
  name: yup.string('Ingresa tu nombre').required('El nombre es requerido'),
  lastName: yup.string('Ingresa tu apellido').required('El apellido es requerido'),
  email: yup.string('Ingresa tu correo electrónico').email('Ingresa un correo electrónico válido').required('El correo es requerido'),
});

function UserProfileModal({ isOpen, onClose, anchorEl }) {
  // Obtener los datos del usuario, estado de carga, y función de actualización del contexto
  const { userProfile, isLoadingProfile, logout, updateUserProfile } = useUser();
  
  const [isEditing, setIsEditing] = useState(false); // Estado para el modo edición
  const [saveError, setSaveError] = useState(null); // Estado para errores al guardar

  // El "usuario actual" es el perfil del contexto o un valor por defecto si no está logeado
  // Asegúrate de que las propiedades del userProfile del contexto coincidan con lo que espera el formulario (name, lastName, email)
  const user = userProfile || {
    name: 'Invitado',
    lastName: 'Usuario',
    email: 'invitado@example.com',
    citas_completadas: 0, // Usar citas_completadas, no 'appointments'
  };

  // Configuración de Formik
  const formik = useFormik({
    initialValues: {
      name: user.name,
      lastName: user.lastName,
      email: user.email,
    },
    validationSchema: validationSchema,
    enableReinitialize: true, // Crucial: Permite que Formik se reinicie con los valores del contexto
    onSubmit: async (values) => {
      setSaveError(null); // Limpiar errores anteriores
      try {
        // Llama a la función de tu UserContext para actualizar el perfil
        // Asume que updateUserProfile en el contexto maneja la llamada a la API
        // y actualiza el estado local del contexto.
        // Si updateUserProfile solo actualiza el estado local sin llamar a la API,
        // tendrías que hacer la llamada a la API aquí.
        // Ejemplo: await authService.updateProfile(values); // Si tienes un servicio para esto
        
        // Asumiendo que `updateUserProfile` en tu contexto maneja la llamada al backend:
        await updateUserProfile(values); 
        setIsEditing(false); // Sale del modo edición al guardar con éxito
        // Opcional: Mostrar un mensaje de éxito temporal
        // alert('Perfil actualizado exitosamente!');
      } catch (error) {
        console.error('Error al guardar el perfil:', error);
        setSaveError('Error al actualizar el perfil. Intenta de nuevo.');
      }
    },
  });

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    formik.resetForm(); // Resetea los valores del formulario a los iniciales del contexto
    setIsEditing(false);
    setSaveError(null); // Limpiar cualquier error de guardado
  };

  const handleLogout = () => {
    logout(); // Llama a la función de logout del contexto
    onClose(); // Cierra el popover
  };

  // Mostrar spinner de carga si el perfil aún no se ha cargado
  if (isLoadingProfile) {
    return (
      <Popover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 1 }}
      >
        <Box sx={{ p: 2, minWidth: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" sx={{ ml: 2 }}>Cargando perfil...</Typography>
        </Box>
      </Popover>
    );
  }

  return (
    <Popover
      open={isOpen}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      sx={{
        mt: 1, // Pequeño margen superior para separar del ícono
      }}
    >
      <Box sx={{
        p: 2,
        minWidth: 280, // Ancho mínimo del popover
        maxWidth: 350, // Ancho máximo
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative', // Para posicionar el botón de cerrar
      }}>
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 4, right: 4 }}
          size="small"
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <Avatar sx={{ width: 70, height: 70, mb: 1, bgcolor: '#D4AF37' }}>
          <AccountCircleIcon sx={{ fontSize: 50 }} />
        </Avatar>

        {saveError && <Alert severity="error" sx={{ width: '100%', mb: 1 }}>{saveError}</Alert>}

        {isEditing ? (
          <form onSubmit={formik.handleSubmit} style={{ width: '100%' }}> {/* Asegura que el formulario ocupe todo el ancho */}
            <TextField
              fullWidth
              size="small"
              margin="dense"
              id="name"
              name="name"
              label="Nombre"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
            <TextField
              fullWidth
              size="small"
              margin="dense"
              id="lastName"
              name="lastName"
              label="Apellido"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.lastName && Boolean(formik.errors.lastName)}
              helperText={formik.touched.lastName && formik.errors.lastName}
            />
            <TextField
              fullWidth
              size="small"
              margin="dense"
              id="email"
              name="email"
              label="Correo"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, gap: 1 }}>
              <Button
                variant="contained"
                sx={{ backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#388E3C' } }}
                type="submit"
                size="small"
                disabled={formik.isSubmitting} // Deshabilita el botón mientras se envía
              >
                Guardar
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCancelEdit}
                size="small"
                disabled={formik.isSubmitting}
              >
                Cancelar
              </Button>
            </Box>
          </form>
        ) : (
          <>
            <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 0.5 }}>
              Nombre: {user.name}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 0.5 }}>
              Apellido: {user.lastName}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Correo: {user.email}
            </Typography>

            <Divider sx={{ width: '80%', my: 1 }} />

            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              No. Cortes: <span style={{ color: '#4CAF50' }}>{user.citas_completadas}</span> {/* USA citas_completadas */}
            </Typography>

           <Button
              variant="outlined"
              onClick={handleEditClick}
              size="small"
              >
              Editar
            </Button>
          </>
        )}
      </Box>
    </Popover>
  );
}

export default UserProfileModal;