import React, { useState } from "react";
import { Grid, TextField, Button, Box } from "@mui/material";
import HeaderFormTitle from '../../../../components/HeeaderFormTitle';
import { Snackbar, Alert } from "@mui/material";

export function EtapaInformacoesLote({ data, setData, onNext }) {
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: '',
        mensagem: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData({ ...data, [name]: value });
    };

    const handleAvancar = () => {
        if (!data.numeroIdentificador || !data.nomeEntregador || !data.nomeRecebedor) {
            setSnackbar({
                open: true,
                message: 'Preencha os campos obrigatórios: Número de Identificação, Nome do Entregador e Nome do Recebedor.',
                severity: 'warning',
                mensagem: 'Preencha os campos obrigatórios: Número de Identificação, Nome do Entregador e Nome do Recebedor.'
            });
            return;
        }

        onNext(); // Se os campos estiverem preenchidos, avança normalmente
    };

    return (
        <>
            <HeaderFormTitle
                titulo="Informações iniciais do Lote"
                subtitulo="Dados iniciais do lote."
            />
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                message={snackbar.message}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
                    {snackbar.mensagem}
                </Alert>
            </Snackbar>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Número de identificação"
                        name="numeroIdentificador"
                        value={data.numeroIdentificador || ''}
                        onChange={handleChange}
                        fullWidth
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Nome do entregador"
                        name="nomeEntregador"
                        value={data.nomeEntregador || ''}
                        onChange={handleChange}
                        fullWidth
                    />
                </Grid>

                <Grid item xs={12} sm={12}>
                    <TextField
                        label="Nome do recebedor"
                        name="nomeRecebedor"
                        value={data.nomeRecebedor || ''}
                        onChange={handleChange}
                        fullWidth
                    />
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Button
                        variant="contained"
                        onClick={handleAvancar}
                        sx={{ mt: 3, marginLeft: '15px' }}
                    >
                        Próximo
                    </Button>
                </Box>
            </Grid>
        </>
    );
}

