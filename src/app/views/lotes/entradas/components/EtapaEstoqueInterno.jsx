import React from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import HeaderFormTitle from '../../../../components/HeeaderFormTitle';

// Etapa 4 - Uso do Estoque Interno
export function EtapaEstoqueInterno({ itens = [], setItens, onNext, onBack }) {
    const handleAddItem = () => {
        setItens(prev => [...prev, { item: '', quantidade: '' }]);
    };

    const handleChange = (index, name, value) => {
        const novos = [...itens];
        novos[index][name] = value;
        setItens(novos);
    };

    return (
        <>
            <HeaderFormTitle
                titulo="Informações de estoque"
                subtitulo="Informações de estoque interno."
            />
            {itens.map((item, idx) => (
                <Grid container spacing={2} key={idx}>
                    <Grid item xs={6}><TextField label="Item do Estoque" value={item.item} onChange={e => handleChange(idx, 'item', e.target.value)} fullWidth /></Grid>
                    <Grid item xs={6}><TextField label="Quantidade a usar" value={item.quantidade} onChange={e => handleChange(idx, 'quantidade', e.target.value)} fullWidth /></Grid>
                </Grid>
            ))}
            <Button onClick={handleAddItem} variant="outlined" sx={{ mt: 2 }}>Adicionar Item</Button>
            <Grid item xs={12} display="flex" justifyContent="space-between" mt={3}>
                <Button variant="outlined" onClick={onBack}>Voltar</Button>
                <Button variant="contained" onClick={onNext}>Próximo</Button>
            </Grid>
        </>
    );
}