import React from "react";
import { Grid, TextField, Button, MenuItem, Box } from "@mui/material";
import HeaderFormTitle from '../../../../components/HeeaderFormTitle';

export function EtapaFornecedor({ data, setData, onNext, listaFornecedores, onSelectFornecedor }) {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));

        if (name === "fornecedor") {
            onSelectFornecedor(value); // faz o fetch com base no ID selecionado
        }
    };

    return (
        <>
            <HeaderFormTitle
                titulo="Informações do Fornecedor"
                subtitulo="Confirme os dados do fornecedor e preencha as informações adicionais do lote."
            />
            <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                    <TextField
                        label="Fornecedor"
                        name="fornecedor"
                        value={data.fornecedor || ''}
                        onChange={handleChange}
                        fullWidth
                        select
                    >
                        {listaFornecedores.map((f) => (
                            <MenuItem key={f.id} value={f.id}>
                                {f.razaoSocial}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid item xs={12} sm={4}><TextField label="CNPJ" name="cnpj" value={data.cnpj || ''} fullWidth disabled /></Grid>
                <Grid item xs={12} sm={4}><TextField label="Razão Social" name="razaoSocial" value={data.razaoSocial || ''} fullWidth disabled /></Grid>
                <Grid item xs={12} sm={6}><TextField label="Inscrição Estadual" name="ie" value={data.ie || ''} fullWidth disabled /></Grid>
                <Grid item xs={12} sm={6}><TextField label="E-mail" name="email" value={data.email || ''} fullWidth disabled /></Grid>
                <Grid item xs={12} sm={12}><TextField label="Telefone" name="telefone" value={data.telefone || ''} fullWidth disabled /></Grid>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', }}>
                    <Button variant="contained" onClick={onNext} sx={{ mt: 3, marginLeft: '15px' }}>Próximo</Button>
                    <p style={{ fontSize: '13px', color: '#303f81', }}>
                        <a href="/fornecedoresprodutos" target="_blank">
                            Não encontrou o fornecedor desejado? Click aqui para cadastrar
                        </a>
                    </p>
                </Box>
            </Grid>
        </>
    );
}
