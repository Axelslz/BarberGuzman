import React, { useState } from 'react';
import {
  Dialog, // Cambiado de Popover
  DialogTitle, // Nuevo
  DialogContent, // Nuevo
  DialogActions, // Nuevo
  Box,
  Typography,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';

// Cambia el nombre del componente
const ServiceSelectionDialog = ({ isOpen, onClose, services, onSelectService }) => {
  const [selectedServiceId, setSelectedServiceId] = useState('');

  const handleRadioChange = (event) => {
    setSelectedServiceId(event.target.value);
  };

  const handleConfirm = () => {
    if (selectedServiceId) {
      onSelectService(selectedServiceId);
      setSelectedServiceId(''); // Reinicia el estado local
      onClose(); // Cierra el diálogo después de confirmar
    } else {
      alert('Por favor, selecciona un servicio o paquete.');
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      aria-labelledby="service-selection-dialog-title"
      maxWidth="sm" // Ancho máximo del diálogo (sm, md, lg, xl, false)
      fullWidth // Ocupa todo el ancho máximo definido
    >
      <DialogTitle id="service-selection-dialog-title" sx={{ textAlign: 'center', fontWeight: 'bold', color: 'black' }}>
        Selecciona un Servicio/Paquete
      </DialogTitle>
      <DialogContent dividers> {/* `dividers` añade una línea divisoria */}
        <Box sx={{ p: 1, backgroundColor: '#F0F0F0' }}> {/* Reduje el padding aquí, se ajusta al DialogContent */}
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
              {services.filter(s => s.type === 'individual').map((service) => (
                <FormControlLabel
                  key={service.id}
                  value={service.id}
                  control={<Radio size="small" />}
                  label={`${service.name} - $${service.price}`}
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
              {services.filter(s => s.type === 'paquete').map((service) => (
                <FormControlLabel
                  key={service.id}
                  value={service.id}
                  control={<Radio size="small" />}
                  label={`${service.name} (${service.description}) - $${service.price}`}
                  sx={{ color: 'black' }}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-around', p: 2 }}> {/* Ajusta la justificación y padding */}
        <Button variant="outlined" onClick={onClose} sx={{ flexGrow: 1, mx: 1 }}> {/* Añadido margin horizontal */}
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