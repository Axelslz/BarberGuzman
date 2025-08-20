import React, { useState, useEffect, useRef } from 'react'; // Importamos useRef
import {
  Popover,
  IconButton,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import LogoutIcon from '@mui/icons-material/Logout';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'; // Nuevo icono
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useUser } from '../contexts/UserContext.jsx';

const validationSchema = yup.object({
  name: yup.string('Ingresa tu nombre').required('El nombre es requerido'),
  lastName: yup.string('Ingresa tu apellido').required('El apellido es requerido'),
  email: yup.string('Ingresa tu correo electrónico').email('Ingresa un correo electrónico válido').required('El correo es requerido'),
});

function UserProfileModal({ open, onClose, anchorEl }) {
  const { userProfile, isLoadingProfile, logout, updateUserProfile, updateUserPhoto } = useUser(); // Añadimos updateUserPhoto
  const [isEditing, setIsEditing] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [profileImage, setProfileImage] = useState(null); // Estado para la imagen seleccionada
  const [previewUrl, setPreviewUrl] = useState(''); // Estado para la URL de la vista previa
  const fileInputRef = useRef(null); // Referencia al input de archivo

  const user = userProfile || {
    name: 'Invitado',
    lastName: 'Usuario',
    email: 'invitado@example.com',
    citas_completadas: 0,
    photoUrl: null, // Asume que el perfil del usuario tiene una propiedad `photoUrl`
  };

  useEffect(() => {
    // Cuando el perfil de usuario se carga o actualiza, actualiza la vista previa
    if (user.photoUrl) {
      setPreviewUrl(user.photoUrl);
    }
  }, [user.photoUrl]);

  const formik = useFormik({
    initialValues: {
      name: user.name,
      lastName: user.lastName,
      email: user.email,
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setSaveError(null);
      try {
        await updateUserProfile(values); // Actualiza los datos de texto
        if (profileImage) {
          await updateUserPhoto(profileImage); // Si hay una nueva imagen, la sube
        }
        setIsEditing(false);
        setProfileImage(null); // Limpia el estado de la imagen
      } catch (error) {
        console.error('Error al guardar el perfil:', error);
        setSaveError('Error al actualizar el perfil. Intenta de nuevo.');
      }
    },
  });

  const handleEditClick = () => {
    setIsEditing(true);
    setProfileImage(null); // Resetea la imagen al entrar en modo edición
    setPreviewUrl(user.photoUrl || ''); // Mantiene la imagen actual en la vista previa
  };

  const handleCancelEdit = () => {
    formik.resetForm();
    setIsEditing(false);
    setSaveError(null);
    setProfileImage(null);
    setPreviewUrl(user.photoUrl || '');
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file)); // Crea una URL de vista previa para la imagen seleccionada
    }
  };

  if (isLoadingProfile) {
    return (
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 1 }}
      >
        <div className="p-6 min-w-80 bg-white rounded-xl shadow-2xl">
          <div className="flex items-center justify-center h-24">
            <CircularProgress size={32} sx={{ color: '#D4AF37' }} />
            <span className="ml-3 text-gray-600 font-medium">Cargando perfil...</span>
          </div>
        </div>
      </Popover>
    );
  }

  return (
    <Popover
      open={open}
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
      sx={{ mt: 1 }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-80 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 relative">
          <IconButton
            onClick={onClose}
            className="absolute top-2 right-2 text-white hover:bg-white hover:bg-opacity-20"
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          <div className="flex flex-col items-center text-white">
            <div className="relative">
              {/* Contenedor de la foto de perfil */}
              <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center border-2 border-white border-opacity-30">
                {previewUrl ? (
                  <img src={previewUrl} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <AccountCircleIcon sx={{ fontSize: 40, color: 'white' }} />
                )}
              </div>
              {/* Botón para editar la foto solo en modo edición */}
              {isEditing && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                  />
                  <IconButton
                    onClick={() => fileInputRef.current.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-white text-gray-800 rounded-full border border-gray-300 shadow-md hover:bg-gray-100 transition-colors"
                    size="small"
                    sx={{ p: '4px' }}
                  >
                    <PhotoCameraIcon fontSize="small" />
                  </IconButton>
                </>
              )}
            </div>
            <h3 className="mt-3 text-lg font-bold">
              {isEditing ? formik.values.name : user.name} {isEditing ? formik.values.lastName : user.lastName}
            </h3>
            <p className="text-white text-opacity-80 text-sm">Mi Perfil</p>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {saveError && (
            <Alert severity="error" className="mb-4 text-sm">
              {saveError}
            </Alert>
          )}

          {isEditing ? (
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-1">
                  <TextField
                    fullWidth
                    size="small"
                    id="name"
                    name="name"
                    label="Nombre"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                    InputProps={{
                      startAdornment: <PersonIcon className="text-gray-400 mr-2" fontSize="small" />,
                    }}
                    className="bg-gray-50 rounded-lg"
                    sx={{ mb: 1 }}
                  />
                </div>

                <div className="space-y-1">
                  <TextField
                    fullWidth
                    size="small"
                    id="lastName"
                    name="lastName"
                    label="Apellido"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                    helperText={formik.touched.lastName && formik.errors.lastName}
                    InputProps={{
                      startAdornment: <PersonIcon className="text-gray-400 mr-2" fontSize="small" />,
                    }}
                    className="bg-gray-50 rounded-lg"
                    sx={{ mb: 1 }}
                  />
                </div>

                <div className="space-y-1">
                  <TextField
                    fullWidth
                    size="small"
                    id="email"
                    name="email"
                    label="Correo"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                    InputProps={{
                      readOnly: true,
                      startAdornment: <EmailIcon className="text-gray-400 mr-2" fontSize="small" />,
                    }}
                    className="bg-gray-50 rounded-lg"
                    sx={{ mb: 1 }}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={formik.isSubmitting}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <SaveIcon fontSize="small" />
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={formik.isSubmitting}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CancelIcon fontSize="small" />
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {/* User Info Cards */}
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center">
                    <PersonIcon className="text-blue-500 mr-3" fontSize="small" />
                    <div>
                      <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Nombre Completo</p>
                      <p className="text-gray-900 font-semibold">{user.name} {user.lastName}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border-l-4 border-purple-500">
                  <div className="flex items-center">
                    <EmailIcon className="text-purple-500 mr-3" fontSize="small" />
                    <div>
                      <p className="text-xs text-purple-600 font-medium uppercase tracking-wide">Correo Electrónico</p>
                      <p className="text-gray-900 font-semibold break-all">{user.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
                <div className="flex items-center justify-center">
                  <ContentCutIcon className="text-amber-600 mr-3" fontSize="medium" />
                  <div className="text-center">
                    <p className="text-sm text-amber-700 font-medium">Cortes Completados</p>
                    <p className="text-2xl font-bold text-amber-800">{user.citas_completadas}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleEditClick}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-md"
                >
                  <EditIcon fontSize="small" />
                  Editar Perfil
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md"
                >
                  <LogoutIcon fontSize="small" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Popover>
  );
}

export default UserProfileModal;