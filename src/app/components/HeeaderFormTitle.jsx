import React from 'react';
import { Box, Typography } from '@mui/material';

export default function HeaderFormTitle({ titulo, subtitulo }) {
    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {titulo}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {subtitulo}
            </Typography>
        </Box>
    );
}