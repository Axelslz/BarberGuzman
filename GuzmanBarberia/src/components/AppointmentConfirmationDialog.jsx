// AppointmentConfirmationDialog.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button
} from '@mui/material';

const AppointmentConfirmationDialog = ({ open, onClose, onConfirm, appointmentDetails }) => {
  if (!appointmentDetails) {
    return null;
  }

  // Ajusta la desestructuración para que coincida con lo que se envía desde AppointmentPage.jsx
  const { barberName, fecha, hora, serviceName, serviceDescription, servicePrice } = appointmentDetails;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="appointment-confirmation-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="appointment-confirmation-dialog-title" sx={{ textAlign: 'center', fontWeight: 'bold', color: 'black' }}>
        Confirmar tu Cita
      </DialogTitle>
      <DialogContent dividers sx={{ backgroundColor: '#F0F0F0', p: 2, textAlign: 'center' }}>
        <Typography variant="body1" sx={{ mb: 1, color: 'black' }}>
          **Barbero:** {barberName} {/* Usa barberName */}
        </Typography>
        <Typography variant="body1" sx={{ mb: 1, color: 'black' }}>
          **Fecha:** {fecha} {/* Usa fecha */}
        </Typography>
        <Typography variant="body1" sx={{ mb: 1, color: 'black' }}>
          **Hora:** {hora} {/* Usa hora */}
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, mb: 1, color: 'black' }}>
          **Servicio/Paquete:** {serviceName}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic', color: 'black' }}>
          {serviceDescription}
        </Typography>
        <Typography variant="h6" sx={{ mt: 2, mb: 3, color: '#4CAF50', fontWeight: 'bold' }}>
          Total: ${servicePrice}
        </Typography>

        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'black', mb: 3 }}>
          *Todos los servicios incluyen a petición del cliente: Lavado de cabello.*
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-around', p: 2 }}>
        <Button variant="outlined" onClick={onClose} sx={{ flexGrow: 1, mx: 1 }}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={onConfirm} sx={{ backgroundColor: '#D4AF37', '&:hover': { backgroundColor: '#B0902C' }, color: 'black', flexGrow: 1, mx: 1 }}>
          Confirmar Cita
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentConfirmationDialog;