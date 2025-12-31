import React, { useState } from 'react';
import {
    TextField,
    Grid,
    Button,
    Paper,
    Tabs,
    Tab,
    Typography,
    Box,
    FormControlLabel,
    Checkbox,
    MenuItem
} from '@mui/material';
import { FaIdCard } from 'react-icons/fa';
import { FaRegCalendarAlt } from 'react-icons/fa';

const abaConfig = [
    {
        label: 'Geral',
        icon: <FaIdCard size={16} style={{ marginRight: 6 }} />,
        campos: [
            { name: 'descricao', label: 'Descricao', required: true, multiline: true },
            { name: 'descricaoAtivo', label: 'Descricao do ativo', multiline: true },
            { name: 'numeroOrdem', label: 'Numero da ordem', required: true }
        ]
    },
    {
        label: 'Datas e status',
        icon: <FaRegCalendarAlt size={16} style={{ marginRight: 6 }} />,
        campos: [
            { name: 'dataAbertura', label: 'Data de abertura', type: 'datetime-local' },
            { name: 'dataFinalizado', label: 'Data de finalizacao', type: 'datetime-local' },
            { name: 'descricaoFinalizado', label: 'Descricao da finalizacao', multiline: true },
            { name: 'ordemManual', label: 'Ordem manual', type: 'checkbox' },
            { name: 'finalizado', label: 'Finalizado', type: 'checkbox', disabled: true }
        ]
    }
];

const OrdemServicoForm = ({
    valores = {},
    modoEdicao,
    onChange,
    onRequestSubmit,
    onRequestDelete,
    onRequestFinalizar,
    onRequestPrint,
    onClearAll
}) => {
    const [abaSelecionada, setAbaSelecionada] = useState(0);
    const isUltimaAba = abaSelecionada === abaConfig.length - 1;
    const irParaProximaAba = () => setAbaSelecionada((prev) => Math.min(prev + 1, abaConfig.length - 1));

    const handleInput = (event) => {
        const { name, value, type, checked } = event.target;
        if (type === 'checkbox') {
            onChange(name, checked ? 1 : 0);
        } else {
            onChange(name, value);
        }
    };

    const renderCampo = (campo) => {
        const value = valores[campo.name] ?? (campo.type === 'checkbox' ? 0 : '');

        if (campo.type === 'checkbox') {
            return (
                <FormControlLabel
                    control={
                        <Checkbox
                            name={campo.name}
                            checked={!!Number(value)}
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
                minRows={campo.multiline ? 2 : undefined}
                size="small"
                sx={{ '.MuiInputBase-root': { minHeight: 48 } }}
                InputLabelProps={
                    campo.type && campo.type.startsWith('date')
                        ? { shrink: true }
                        : undefined
                }
            />
        );
    };

    return (
        <Paper elevation={0} className="p-6 mt-6" sx={{ marginTop: '25px', padding: 3 }}>
            <div style={{ marginBottom: 20 }}>
                <Typography variant="h5" component="h2" fontWeight={600}>
                    {valores?.id ? 'Ordem de serviço selecionada' : 'Ordem de serviço'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {valores?.id
                        ? 'Edite os dados da ordem de servico selecionada.'
                        : 'Preencha os dados abaixo para cadastrar uma nova ordem de servico.'}
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
                {abaConfig.map((aba, index) => (
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
                {abaConfig[abaSelecionada].campos.map((campo) => (
                    <Grid
                        item
                        xs={12}
                        sm={campo.type === 'checkbox' ? 12 : 6}
                        md={campo.type === 'checkbox' ? 4 : 4}
                        key={campo.name}
                        display="flex"
                        alignItems="stretch"
                    >
                        <Box width="100%" display="flex" alignItems="center">
                            {renderCampo(campo)}
                        </Box>
                    </Grid>
                ))}
            </Grid>

            <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                {valores.id && (
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() => onRequestDelete && onRequestDelete(valores)}
                    >
                        Excluir
                    </Button>
                )}
                {valores.id && !Number(valores.finalizado) && (
                    <Button
                        variant="outlined"
                        color="success"
                        onClick={() => onRequestFinalizar && onRequestFinalizar(valores)}
                    >
                        Finalizar OS
                    </Button>
                )}
                <Button variant="text" onClick={onClearAll}>
                    Limpar
                </Button>
                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => onRequestPrint && onRequestPrint(valores)}
                >
                    Imprimir
                </Button>
                {!isUltimaAba && (
                    <Button variant="contained" color="primary" onClick={irParaProximaAba}>
                        Proximo
                    </Button>
                )}
                {isUltimaAba && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => onRequestSubmit && onRequestSubmit(valores)}
                    >
                        {modoEdicao ? 'Salvar' : 'Cadastrar'}
                    </Button>
                )}
            </Box>
        </Paper>
    );
};

export default OrdemServicoForm;
