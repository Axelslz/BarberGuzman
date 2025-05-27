import React from 'react';
import { Box, Typography, Paper, ButtonBase } from '@mui/material';
import barberPlaceholder from '../assets/barber_placeholder.png'; // Asegúrate de tener esta imagen

function BarberCard({ name, imageUrl, onSelect }) {
  return (
    <ButtonBase onClick={onSelect} sx={{ borderRadius: '50%', p: 1, '&:hover': { opacity: 0.8 } }}>
      <Paper
        elevation={3}
        sx={{
          width: 150,
          height: 150,
          borderRadius: '50%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#E0E0E0', // Gris claro similar al de la imagen
          overflow: 'hidden',
        }}
      >
        <Box
          component="img"
          src={imageUrl || barberPlaceholder} // Usa la URL de la imagen o el placeholder
          alt={`Imagen de ${name}`}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '50%',
          }}
        />
      </Paper>
      <Typography variant="h6" sx={{ mt: 1, color: 'black', fontWeight: 'bold' }}>
        {name}
      </Typography>
    </ButtonBase>
  );
}

export default BarberCard;