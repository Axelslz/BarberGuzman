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

  const { barber, date, time, serviceName, serviceDescription, servicePrice } = appointmentDetails;

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
          **Barbero:** {barber}
        </Typography>
        <Typography variant="body1" sx={{ mb: 1, color: 'black' }}>
          **Fecha:** {date}
        </Typography>
        <Typography variant="body1" sx={{ mb: 1, color: 'black' }}>
          **Hora:** {time}
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