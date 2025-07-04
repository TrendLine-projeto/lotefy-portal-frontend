// InfoHeader.jsx
import React from 'react';
import { Box, Divider, Grid, Typography } from '@mui/material';

const InfoHeaderCard = ({ items = [] }) => {
    return (
        <Box sx={{ mb: 2 }}>
            <Grid container spacing={1} sx={{ display: 'flex', width: '700px', }}>
                {items.map((item, index) => (
                    <Grid item xs={12} md={6} key={index}>
                        <Typography variant="subtitle2" sx={{ lineHeight: 1.4, m: 0 }}>
                            <Box component="span" fontWeight="bold">{item.label}:</Box>{' '}
                            <Box component="span" fontWeight={400}>
                                {item.value ?? '-'}
                            </Box>
                        </Typography>
                    </Grid>
                ))}
            </Grid>
            <Divider sx={{ mt: 1.5 }} />
        </Box>
    );
};

export default InfoHeaderCard;
