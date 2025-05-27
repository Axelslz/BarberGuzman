import React from 'react';
import {
  Popover, // <--- CAMBIO: Usamos Popover en lugar de Modal
  Box,
  Typography,
  Button,
  Avatar,
  Divider,
  IconButton,
  TextField // Agregamos TextField para la edición
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CloseIcon from '@mui/icons-material/Close';

// Para el modo edición
import { useFormik } from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object({
  name: yup.string('Ingresa tu nombre').required('El nombre es requerido'),
  lastName: yup.string('Ingresa tu apellido').required('El apellido es requerido'),
  email: yup.string('Ingresa tu correo electrónico').email('Ingresa un correo electrónico válido').required('El correo es requerido'),
});

function UserProfileModal({ isOpen, onClose, anchorEl, userProfile, updateUserProfile }) { // <--- anchorEl y updateUserProfile como props
  const [isEditing, setIsEditing] = React.useState(false); // Estado para el modo edición

  const defaultUser = {
    name: 'Invitado',
    lastName: 'Usuario',
    email: 'invitado@example.com',
    appointments: 0,
  };

  const user = userProfile || defaultUser;

  const formik = useFormik({
    initialValues: {
      name: user.name,
      lastName: user.lastName,
      email: user.email,
    },
    validationSchema: validationSchema,
    enableReinitialize: true, // Importante para que los valores se actualicen si userProfile cambia
    onSubmit: (values) => {
      console.log('Guardando cambios del perfil:', values);
      updateUserProfile(values); // Actualiza el contexto/estado global del usuario
      setIsEditing(false); // Sale del modo edición
    },
  });

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    formik.resetForm(); // Resetea los valores del formulario a los iniciales
    setIsEditing(false);
  };

  return (
    <Popover
      open={isOpen}
      anchorEl={anchorEl} // <--- Elemento al que se anclará el popover
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom', // El popover se ancla debajo del anchorEl
        horizontal: 'right', // El popover se alinea a la derecha del anchorEl
      }}
      transformOrigin={{
        vertical: 'top', // El popover comienza desde la parte superior
        horizontal: 'right', // El popover se alinea a la derecha de sí mismo
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

        {isEditing ? (
          <form onSubmit={formik.handleSubmit}>
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
              >
                Guardar
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCancelEdit}
                size="small"
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
              No. Cortes: <span style={{ color: '#4CAF50' }}>{user.appointments}</span>
            </Typography>

            <Button
              variant="outlined"
              onClick={handleEditClick}
              size="small"
            >
              Editar
            </Button>
            {/* Aquí podrías añadir un botón de cerrar sesión si lo deseas */}
            {/* <Button
              variant="contained"
              sx={{ mt: 1, backgroundColor: '#FF5722', '&:hover': { backgroundColor: '#E64A19' } }}
              onClick={onClose}
              size="small"
            >
              Cerrar
            </Button> */}
          </>
        )}
      </Box>
    </Popover>
  );
}

export default UserProfileModal;