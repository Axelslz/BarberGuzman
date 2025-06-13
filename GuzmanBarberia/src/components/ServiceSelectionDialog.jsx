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

const ServiceSelectionDialog = ({ open, onClose, services, onSelectService }) => { // CAMBIO: isOpen -> open
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
            open={open} // CAMBIO: isOpen -> open
            onClose={onClose}
            aria-labelledby="service-selection-dialog-title"
            maxWidth="sm"
            fullWidth
            sx={{
                '& .MuiPaper-root': {
                    backgroundColor: '#EDE0D4', // Color de fondo del diálogo
                },
            }}
        >
            <DialogTitle id="service-selection-dialog-title" sx={{ textAlign: 'center', fontWeight: 'bold', color: 'black' }}>
                Selecciona un Servicio/Paquete
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ p: 1, backgroundColor: '#F0F0F0', borderRadius: '8px' }}> {/* Contenedor de las opciones */}
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
                            {services.filter(s => s.tipo === 'individual').map((service) => (
                                <FormControlLabel
                                    key={`individual-${service.id}`} // Mejorar key para evitar posibles duplicados con paquetes
                                    value={service.id}
                                    control={<Radio size="small" sx={{ color: '#D4AF37', '&.Mui-checked': { color: '#D4AF37' } }} />} // Radio dorado
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
                            {services.filter(s => s.tipo === 'paquete').map((service) => (
                                <FormControlLabel
                                    key={`paquete-${service.id}`} // Mejorar key para evitar posibles duplicados con individuales
                                    value={service.id}
                                    control={<Radio size="small" sx={{ color: '#D4AF37', '&.Mui-checked': { color: '#D4AF37' } }} />} // Radio dorado
                                    label={`${service.nombre} (${service.descripcion}) - $${service.precio}`} 
                                    sx={{ color: 'black' }}
                                />
                            ))}
                        </RadioGroup>
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'space-around', p: 2 }}>
                <Button 
                    variant="outlined" 
                    onClick={onClose} 
                    sx={{ flexGrow: 1, mx: 1, borderColor: '#D4AF37', color: '#D4AF37', '&:hover': { borderColor: '#C39F37', color: '#C39F37', backgroundColor: 'rgba(212, 175, 55, 0.08)' } }}
                >
                    Cancelar
                </Button>
                <Button 
                    variant="contained" 
                    onClick={handleConfirm} 
                    disabled={!selectedServiceId} 
                    sx={{ flexGrow: 1, mx: 1, backgroundColor: '#D4AF37', '&:hover': { backgroundColor: '#C39F37' }, color: 'black' }}
                >
                    Confirmar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ServiceSelectionDialog;