// src/components/ServiceSelectionDialog.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';

const ServiceSelectionDialog = ({ isOpen, onClose, services, onSelectService }) => {
  const [selectedServiceId, setSelectedServiceId] = useState('');

  const handleRadioChange = (event) => {
    setSelectedServiceId(parseInt(event.target.value, 10));
  };

  const handleConfirm = () => {
    if (selectedServiceId) {
      onSelectService(selectedServiceId);
      setSelectedServiceId('');
      onClose();
    } else {
      alert('Por favor, selecciona un servicio o paquete.');
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      aria-labelledby="service-selection-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="service-selection-dialog-title" sx={{ textAlign: 'center', fontWeight: 'bold', color: 'black' }}>
        Selecciona un Servicio/Paquete
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ p: 1, backgroundColor: '#F0F0F0' }}>
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <FormLabel component="legend" sx={{ fontWeight: 'bold', color: 'black', mb: 1 }}>
              Servicios Individuales:
            </FormLabel>
            <RadioGroup
              aria-label="individual-service"
              name="individual-service-group"
              value={selectedServiceId}
              onChange={handleRadioChange}
            >
              {/* CAMBIO CLAVE: Usamos 'tipo' y 'nombre' */}
              {services.filter(s => s.tipo === 'individual').map((service) => (
                <FormControlLabel
                  key={service.id}
                  value={service.id}
                  control={<Radio size="small" />}
                  label={`${service.nombre} - $${service.precio}`} 
                  sx={{ color: 'black' }}
                />
              ))}
            </RadioGroup>

            <FormLabel component="legend" sx={{ fontWeight: 'bold', color: 'black', mt: 3, mb: 1 }}>
              Paquetes Especiales:
            </FormLabel>
            <RadioGroup
              aria-label="package-service"
              name="package-service-group"
              value={selectedServiceId}
              onChange={handleRadioChange}
            >
              {/* CAMBIO CLAVE: Usamos 'tipo' y 'nombre' */}
              {services.filter(s => s.tipo === 'paquete').map((service) => (
                <FormControlLabel
                  key={service.id}
                  value={service.id}
                  control={<Radio size="small" />}
                  label={`${service.nombre} (${service.descripcion}) - $${service.precio}`} 
                  sx={{ color: 'black' }}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-around', p: 2 }}>
        <Button variant="outlined" onClick={onClose} sx={{ flexGrow: 1, mx: 1 }}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleConfirm} disabled={!selectedServiceId} sx={{ flexGrow: 1, mx: 1 }}>
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServiceSelectionDialog;