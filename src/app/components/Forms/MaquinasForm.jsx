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
    Box
} from '@mui/material';
import { GiSewingMachine } from "react-icons/gi";
import { FaIdCard, FaMapMarkedAlt, FaMoneyBillWave } from "react-icons/fa";
import { MdOutlineBuild, MdOutlineManageHistory } from "react-icons/md";

const statusOptions = [
    { label: 'Ativa', value: 'ativa' },
    { label: 'Em manutencao', value: 'em_manutencao' },
    { label: 'Inativa', value: 'inativa' }
];

export default function MaquinasForm({
    valores = {},
    modoEdicao,
    onChange,
    onRequestSubmit,
    onRequestDelete,
    onClearAll
}) {
    const [abaSelecionada, setAbaSelecionada] = useState(0);

    const abas = [
        {
            label: 'Geral',
            icon: <FaIdCard size={16} style={{ marginRight: 6 }} />,
            campos: [
                { name: 'codigo_interno', label: 'Codigo interno', required: true },
                { name: 'nome', label: 'Nome', required: true },
                { name: 'numero_serie', label: 'Numero de serie', required: true },
                { name: 'descricao', label: 'Descricao', multiline: true }
            ]
        },
        {
            label: 'Especificacoes',
            icon: <MdOutlineBuild size={18} style={{ marginRight: 6 }} />,
            campos: [
                { name: 'tipo', label: 'Tipo' },
                { name: 'fabricante', label: 'Fabricante' },
                { name: 'modelo', label: 'Modelo' },
                { name: 'status', label: 'Status', type: 'select', options: statusOptions },
                { name: 'ano_fabricacao', label: 'Ano de fabricacao', type: 'number' }
            ]
        },
        {
            label: 'Localizacao',
            icon: <FaMapMarkedAlt size={16} style={{ marginRight: 6 }} />,
            campos: [
                { name: 'setor', label: 'Setor' },
                { name: 'localizacao', label: 'Localizacao' }
            ]
        },
        {
            label: 'Manutencao',
            icon: <MdOutlineManageHistory size={18} style={{ marginRight: 6 }} />,
            campos: [
                { name: 'proxima_manutencao', label: 'Proxima manutencao', type: 'date' },
                { name: 'ultima_manutencao', label: 'Ultima manutencao', type: 'date' },
                { name: 'mtbf', label: 'MTBF', type: 'number' },
                { name: 'mttr', label: 'MTTR', type: 'number' }
            ]
        },
        {
            label: 'Financeiro',
            icon: <FaMoneyBillWave size={16} style={{ marginRight: 6 }} />,
            campos: [
                { name: 'valor_aquisicao', label: 'Valor de aquisicao', type: 'number' },
                { name: 'data_aquisicao', label: 'Data de aquisicao', type: 'date' }
            ]
        }
    ];

    const handleInput = (event) => {
        const { name, value } = event.target;
        onChange(name, value);
    };

    const renderCampo = (campo) => {
        const value = valores[campo.name] || '';
        if (campo.type === 'select') {
            return (
                <TextField
                    select
                    fullWidth
                    label={campo.label}
                    name={campo.name}
                    value={value}
                    onChange={handleInput}
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
                minRows={campo.multiline ? 2 : undefined}
                InputLabelProps={campo.type === 'date' ? { shrink: true } : undefined}
            />
        );
    };

    return (
        <Paper elevation={0} className="p-6 mt-6" sx={{ marginTop: '25px', padding: 3 }}>
            <div style={{ marginBottom: 20 }}>
                <Typography variant="h5" component="h2" fontWeight={600}>
                    {valores?.id ? 'Maquina selecionada' : 'Maquina'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {valores?.id
                        ? 'Edite os dados da maquina selecionada.'
                        : 'Preencha os dados abaixo para cadastrar uma nova maquina.'}
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

            <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
                {valores.id && (
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() => onRequestDelete(valores)}
                    >
                        Excluir
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
