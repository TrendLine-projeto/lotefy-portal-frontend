import React, { useEffect, useState } from 'react';
import { MdOutlineRecycling } from "react-icons/md";
import { FaIdCard, FaBuilding, FaMapMarkedAlt, FaEllipsisH } from 'react-icons/fa';
import { FaTrash } from "react-icons/fa6";
import { FaSave } from "react-icons/fa";
import {
    TextField,
    Checkbox,
    Grid,
    Typography,
    Paper,
    FormControlLabel,
    Box,
    Button,
    Tabs,
    Tab
} from '@mui/material';

const camposPadrao = {
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    inscricaoEstadual: '',
    email: '',
    telefone: '',
    celular: '',
    responsavel: '',
    site: '',
    tipoFornecedor: '',
    categoria: '',
    endereco: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    pais: '',
    observacoes: '',
    dataCadastro: '',
    ativo: false
};

const camposIgnorados = ['id', 'cliente_id'];

export const FornecedorForm = ({ fornecedor, onClearAll, modoEdicao, onEditClick, onRequestSubmit, onRequestDelete }) => {
    const [formData, setFormData] = useState(camposPadrao);
    const [abaSelecionada, setAbaSelecionada] = useState(0);

    const handleClearFields = () => {
        setFormData(camposPadrao);
        onClearAll && onClearAll();
    };

    useEffect(() => {
        if (fornecedor) {
            setFormData({
                ...camposPadrao,
                ...fornecedor,
                ativo: fornecedor.ativo === 1 || fornecedor.ativo === true,
                dataCadastro: fornecedor.dataCadastro
                    ? fornecedor.dataCadastro.slice(0, 10)
                    : ''
            });
        } else {
            setFormData(camposPadrao);
        }
    }, [fornecedor]);

    const handleFieldChange = (campo, valor) => {
        setFormData((prev) => ({
            ...prev,
            [campo]: valor
        }));
    };

    const isNovoCadastro = !fornecedor;
    const podeEditar = isNovoCadastro || modoEdicao;

    const abas = [
        {
            label: 'Cadastral',
            icon: <FaIdCard size={18} style={{ marginRight: 6 }} />,
            campos: ['razaoSocial', 'nomeFantasia', 'cnpj', 'inscricaoEstadual', 'dataCadastro']
        },
        {
            label: 'Comercial',
            icon: <FaBuilding size={18} style={{ marginRight: 6 }} />,
            campos: ['responsavel', 'telefone', 'celular', 'email', 'site']
        },
        {
            label: 'Endereço',
            icon: <FaMapMarkedAlt size={18} style={{ marginRight: 6 }} />,
            campos: ['endereco', 'bairro', 'cidade', 'estado', 'cep', 'pais']
        },
        {
            label: 'Outros',
            icon: <FaEllipsisH size={18} style={{ marginRight: 6 }} />,
            campos: ['tipoFornecedor', 'categoria', 'observacoes', 'ativo']
        }
    ];

    return (
        <Paper elevation={0} className="p-6 mt-6" sx={{ marginTop: '25px', padding: 3 }}>
            <div style={{ marginBottom: 20 }}>
                <Typography variant="h5" component="h2" fontWeight={600}>
                    {isNovoCadastro ? 'Fornecedor' : 'Fornecedor Selecionado'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {isNovoCadastro
                        ? 'Preencha os dados abaixo para cadastrar um novo fornecedor de suprimentos'
                        : 'Informações detalhadas do fornecedor selecionado.'}
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
                {Object.entries(formData)
                    .filter(([campo]) => !camposIgnorados.includes(campo))
                    .filter(([campo]) => abas[abaSelecionada].campos.includes(campo))
                    .map(([campo, valor]) => {
                        if (campo === 'ativo') {
                            return (
                                <Grid item xs={12} sm={6} md={4} key={campo}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={valor}
                                                disabled={!podeEditar}
                                                onChange={(e) => handleFieldChange(campo, e.target.checked)}
                                            />
                                        }
                                        label="Ativo"
                                    />
                                </Grid>
                            );
                        }

                        if (campo === 'dataCadastro') {
                            return (
                                <Grid item xs={12} sm={6} md={4} key={campo}>
                                    <TextField
                                        fullWidth
                                        label="Data de Cadastro"
                                        type="date"
                                        value={valor || ''}
                                        onChange={(e) => podeEditar && handleFieldChange(campo, e.target.value)}
                                        InputProps={{ readOnly: !podeEditar }}
                                        InputLabelProps={{ shrink: true }}
                                        variant="outlined"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: '#bdbdbd' },
                                                '&:hover fieldset': { borderColor: '#9e9e9e' },
                                                '&.Mui-focused fieldset': { borderColor: '#757575' }
                                            },
                                            '& .MuiInputLabel-root.Mui-focused': { color: '#757575' }
                                        }}
                                    />
                                </Grid>
                            );
                        }

                        return (
                            <Grid item xs={12} sm={6} md={4} key={campo}>
                                <TextField
                                    fullWidth
                                    label={campo
                                        .replace(/([A-Z])/g, ' $1')
                                        .replace(/^./, (str) => str.toUpperCase())}
                                    name={campo}
                                    value={valor || ''}
                                    onChange={(e) => podeEditar && handleFieldChange(campo, e.target.value)}
                                    InputProps={{ readOnly: !podeEditar }}
                                    variant="outlined"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': { borderColor: '#bdbdbd' },
                                            '&:hover fieldset': { borderColor: '#9e9e9e' },
                                            '&.Mui-focused fieldset': { borderColor: '#757575' }
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': { color: '#757575' }
                                    }}
                                />
                            </Grid>
                        );
                    })}
            </Grid>

            <Box mt={4} display="flex" justifyContent="flex-end">
                {podeEditar ? (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() => onRequestDelete && onRequestDelete(fornecedor)}
                            sx={{
                                minWidth: 120,
                                padding: '6px 12px',
                                fontSize: '0.85rem',
                                borderRadius: '8px',
                                boxShadow: 'none',
                                textTransform: 'none',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                '&:hover': {
                                    boxShadow: 'none',
                                    opacity: 0.9
                                }
                            }}
                        >
                            <FaTrash size={16} />
                            Excluir
                        </Button>

                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleClearFields}
                            sx={{
                                minWidth: 120,
                                padding: '6px 12px',
                                fontSize: '0.85rem',
                                borderRadius: '8px',
                                boxShadow: 'none',
                                textTransform: 'none',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                '&:hover': {
                                    boxShadow: 'none',
                                    opacity: 0.9
                                }
                            }}
                        >
                            <MdOutlineRecycling size={16} />
                            Limpar
                        </Button>

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => onRequestSubmit && onRequestSubmit(formData)}
                            sx={{
                                minWidth: 120,
                                padding: '6px 12px',
                                fontSize: '0.85rem',
                                borderRadius: '8px',
                                boxShadow: 'none',
                                textTransform: 'none',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                '&:hover': {
                                    boxShadow: 'none',
                                    opacity: 0.9
                                }
                            }}
                        >
                            <FaSave size={16} />
                            Salvar
                        </Button>
                    </Box>
                ) : (
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={onEditClick}
                        sx={{
                            minWidth: 120,
                            padding: '6px 12px',
                            fontSize: '0.85rem',
                            borderRadius: '8px',
                            boxShadow: 'none',
                            textTransform: 'none',
                            fontWeight: 500,
                            '&:hover': {
                                boxShadow: 'none',
                                opacity: 0.9
                            }
                        }}
                    >
                        Editar
                    </Button>
                )}
            </Box>
        </Paper>
    );
};