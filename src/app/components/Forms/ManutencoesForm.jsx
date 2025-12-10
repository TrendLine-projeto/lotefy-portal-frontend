import React, { useState } from 'react';
import {
    TextField,
    Grid,
    Button,
    MenuItem,
    Paper,
    Tabs,
    Tab,
    Typography,
    Box,
    Checkbox,
    FormControlLabel
} from '@mui/material';
import { FaIdCard, FaCalendarAlt, FaMoneyBillWave, FaStickyNote } from "react-icons/fa";

const statusOptions = [
    { label: 'Planejada', value: 'planejada' },
    { label: 'Em execucao', value: 'em_execucao' },
    { label: 'Concluida', value: 'concluida' },
    { label: 'Cancelada', value: 'cancelada' }
];

const tipoOptions = [
    { label: 'Preventiva', value: 'preventiva' },
    { label: 'Corretiva', value: 'corretiva' },
    { label: 'Calibracao', value: 'calibracao' }
];

export default function ManutencoesForm({
    valores = {},
    modoEdicao,
    onChange,
    onRequestSubmit,
    onRequestDelete,
    onRequestFechar,
    onClearAll,
    maquinasOptions = []
}) {
    const [abaSelecionada, setAbaSelecionada] = useState(0);

    const abas = [
        {
            label: 'Geral',
            icon: <FaIdCard size={16} style={{ marginRight: 6 }} />,
            campos: [
                { name: 'tipo', label: 'Tipo', type: 'select', options: tipoOptions, required: true },
                { name: 'status', label: 'Status', type: 'select', options: statusOptions },
                { name: 'responsavel', label: 'Responsavel' },
                { name: 'idMaquina', label: 'Maquina', type: 'select-maquina', required: true },
                { name: 'gerar_ordem_servico_auto', label: 'Gerar ordem de serviço automática', type: 'checkbox', disabled: true }
            ]
        },
        {
            label: 'Datas',
            icon: <FaCalendarAlt size={16} style={{ marginRight: 6 }} />,
            campos: [
                { name: 'data_execucao', label: 'Data de execucao', type: 'date' },
                { name: 'proxima_prevista', label: 'Proxima prevista', type: 'date' }
            ]
        },
        {
            label: 'Financeiro',
            icon: <FaMoneyBillWave size={16} style={{ marginRight: 6 }} />,
            campos: [
                { name: 'custo', label: 'Custo', type: 'number' }
            ]
        },
        {
            label: 'Observacoes',
            icon: <FaStickyNote size={16} style={{ marginRight: 6 }} />,
            campos: [
                { name: 'observacoes', label: 'Observacoes', multiline: true }
            ]
        }
    ];

    const handleInput = (event) => {
        const { name, value } = event.target;
        onChange(name, value);
    };

    const renderCampo = (campo) => {
        const value = valores[campo.name] ?? '';

        if (campo.type === 'select-maquina') {
            return (
                <TextField
                    select
                    fullWidth
                    label={campo.label}
                    name={campo.name}
                    value={value}
                    onChange={handleInput}
                    required={campo.required}
                >
                    <MenuItem value="">Selecionar</MenuItem>
                    {maquinasOptions.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </MenuItem>
                    ))}
                </TextField>
            );
        }

        if (campo.type === 'select') {
            return (
                <TextField
                    select
                    fullWidth
                    label={campo.label}
                    name={campo.name}
                    value={value}
                    onChange={handleInput}
                    required={campo.required}
                >
                    <MenuItem value="">Selecionar</MenuItem>
                    {(campo.options || []).map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </MenuItem>
                    ))}
                </TextField>
            );
        }

        if (campo.type === 'checkbox') {
            return (
                <FormControlLabel
                    control={
                        <Checkbox
                            name={campo.name}
                            checked={!!valores[campo.name]}
                            onChange={handleInput}
                            disabled={campo.disabled}
                        />
                    }
                    label={campo.label}
                />
            );
        }

        return (
            <TextField
                fullWidth
                label={campo.label}
                name={campo.name}
                value={value}
                onChange={handleInput}
                required={campo.required}
                type={campo.type || 'text'}
                multiline={campo.multiline}
                minRows={campo.multiline ? 3 : undefined}
                InputLabelProps={campo.type === 'date' ? { shrink: true } : undefined}
            />
        );
    };

    return (
        <Paper elevation={0} className="p-6 mt-6" sx={{ marginTop: '25px', padding: 3 }}>
            <div style={{ marginBottom: 20 }}>
                <Typography variant="h5" component="h2" fontWeight={600}>
                    {valores?.id ? 'Manutencao selecionada' : 'Plano de manutencao'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {valores?.id
                        ? 'Edite os dados da manutencao selecionada.'
                        : 'Preencha os dados abaixo para cadastrar uma nova manutencao.'}
                </Typography>
            </div>

            <Tabs
                value={abaSelecionada}
                onChange={(e, novaAba) => setAbaSelecionada(novaAba)}
                indicatorColor="primary"
                textColor="primary"
                variant="scrollable"
                scrollButtons="auto"
                TabIndicatorProps={{
                    style: {
                        backgroundColor: '#bdbdbd',
                        height: '3px',
                        borderRadius: '2px'
                    }
                }}
                sx={{
                    borderBottom: '1px solid #e0e0e0',
                    mb: 3,
                    '.MuiTab-root': {
                        textTransform: 'none',
                        fontSize: 12,
                        fontWeight: 400,
                        gap: 1,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        minHeight: 48
                    },
                    '.Mui-selected': {
                        color: '#424242'
                    }
                }}
            >
                {abas.map((aba, index) => (
                    <Tab
                        key={index}
                        label={
                            <Box display="flex" alignItems="center">
                                {aba.icon}
                                {aba.label}
                            </Box>
                        }
                    />
                ))}
            </Tabs>

            <Grid container spacing={2}>
                {abas[abaSelecionada].campos.map((campo) => (
                    <Grid item xs={12} sm={6} md={4} key={campo.name}>
                        {renderCampo(campo)}
                    </Grid>
                ))}
            </Grid>

            <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                {valores.id && (
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() => onRequestDelete(valores)}
                    >
                        Excluir
                    </Button>
                )}
                {valores.id && onRequestFechar && (
                    <Button
                        variant="outlined"
                        color="success"
                        onClick={() => onRequestFechar(valores)}
                    >
                        Fechar manutencao
                    </Button>
                )}
                <Button variant="text" onClick={onClearAll}>
                    Limpar
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => onRequestSubmit(valores)}
                >
                    {modoEdicao ? 'Salvar' : 'Cadastrar'}
                </Button>
            </Box>
        </Paper>
    );
}
