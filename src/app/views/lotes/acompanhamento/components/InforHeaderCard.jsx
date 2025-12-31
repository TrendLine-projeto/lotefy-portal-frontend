import React from 'react';
import { Box, Divider, Grid, Typography } from '@mui/material';

// CHANGE assinatura
const InfoHeaderCard = ({ items = [], overdue = false }) => {
    const columns = [];
    for (let i = 0; i < items.length; i += 3) {
        columns.push(items.slice(i, i + 3));
    }

    return (
        <Box sx={{ mb: 2, position: 'relative' }}>
            {overdue && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 11,
                        right: -50,     // empurra um pouco para fora
                        width: 95,     // comprimento da faixa
                        height: 24,     // espessura
                        bgcolor: '#d32f2f',
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        lineHeight: '24px',
                        transform: 'rotate(90deg)', // cria o efeito de “\”
                        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                    }}
                >
                    ATRASADO
                </Box>
            )}

            <Grid container spacing={0} sx={{ width: '1200px' }}>
                {columns.map((col, colIndex) => (
                    <Grid item xs={12} md={4} key={colIndex} sx={{ p: 0 }}>
                        {col.map((item, index) => (
                            <Typography
                                key={index}
                                variant="subtitle2"
                                sx={{
                                    lineHeight: 1.4,
                                    ml: 0,
                                    mt: 2,
                                    borderBottom: '1px solid #dddddd',
                                    borderRight: '1px solid #dddddd',
                                }}
                            >
                                <Box component="span" fontWeight="bold" sx={{ ml: 1 }}>
                                    {item.label}:
                                </Box>{' '}
                                <Box component="span" fontWeight={400}>
                                    {item.value ?? '-'}
                                </Box>
                            </Typography>
                        ))}
                    </Grid>
                ))}
            </Grid>
            <Divider sx={{ mt: 1.5 }} />
        </Box>
    );
};


export default InfoHeaderCard;
