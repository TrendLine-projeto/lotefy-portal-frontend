import React from 'react';
import { Box, Divider, Grid, Typography, IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

// CHANGE assinatura
const InfoHeaderCard = ({
    items = [],
    overdue = false,
    notStarted = false,
    inProduction = false,
}) => {
    const safeItems = Array.isArray(items) ? items : [];

    const ribbonSx = {
        position: 'absolute',
        top: 11,
        right: -50, // empurra um pouco para fora
        width: 95, // comprimento da faixa
        height: 24, // espessura
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: '24px',
        transform: 'rotate(90deg)', // cria o efeito de "\"
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
    };

    const maxValueLength = 24;
    const copyToClipboard = async (value) => {
        const text = String(value ?? '');
        if (!text) return;
        if (navigator?.clipboard?.writeText) {
            try {
                await navigator.clipboard.writeText(text);
                return;
            } catch {
                // fallback abaixo
            }
        }
        const el = document.createElement('textarea');
        el.value = text;
        el.setAttribute('readonly', 'true');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    };

    return (
        <Box sx={{ mb: 2, position: 'relative' }}>
            {overdue && (
                <Box
                    sx={{
                        ...ribbonSx,
                        bgcolor: '#d32f2f',
                        color: '#fff',
                    }}
                >
                    ATRASADO
                </Box>
            )}
            {!overdue && notStarted && (
                <Box
                    sx={{
                        ...ribbonSx,
                        bgcolor: '#fbc02d',
                        color: '#1a1a1a',
                    }}
                >
                    Não iniciado
                </Box>
            )}
            {!overdue && inProduction && (
                <Box
                    sx={{
                        ...ribbonSx,
                        bgcolor: '#2e7d32',
                        color: '#fff',
                    }}
                >
                    Em produção
                </Box>
            )}

            <Grid container spacing={1.5}>
                {safeItems.map((item, index) => {
                    const valueText =
                        typeof item.value === 'string' || typeof item.value === 'number'
                            ? String(item.value)
                            : null;
                    const shouldTruncate =
                        valueText !== null && valueText.length > maxValueLength;
                    const displayValue =
                        shouldTruncate
                            ? `${valueText.slice(0, maxValueLength)}...`
                            : valueText;

                    return (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Box
                                sx={{
                                    p: 1.25,
                                    borderRadius: 1.5,
                                    border: '1px solid #e2e8f0',
                                    backgroundColor: '#fafafa',
                                    minHeight: 64,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    gap: 0.5
                                }}
                            >
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                                    {item.label}
                                </Typography>
                                <Box component="span" fontWeight={500}>
                                    {valueText === null ? (item.value ?? '-') : (
                                        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                                            <Tooltip title={shouldTruncate ? valueText : ''} disableHoverListener={!shouldTruncate}>
                                                <Box component="span">
                                                    {displayValue}
                                                </Box>
                                            </Tooltip>
                                            {shouldTruncate && (
                                                <Tooltip title="Copiar">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            copyToClipboard(valueText);
                                                        }}
                                                        sx={{ p: 0.25 }}
                                                    >
                                                        <ContentCopyIcon sx={{ fontSize: 14 }} />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
};


export default InfoHeaderCard;
