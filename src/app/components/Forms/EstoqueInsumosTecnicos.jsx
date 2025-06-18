import React, { useEffect, useState } from 'react';
import { MdOutlineRecycling } from "react-icons/md";
import { FaIdCard, FaBuilding, FaMapMarkedAlt, FaEllipsisH } from 'react-icons/fa';
import { FaTrash } from "react-icons/fa6";
import { MenuItem, InputAdornment, IconButton, Autocomplete } from '@mui/material';
import { FaSave } from "react-icons/fa";
import { MaskedDecimalInput } from '../Maske/MaskedDecimalInput';
import { opcoesUnidade } from '../../utils/constant';
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
    id: "",                          // bigint
    tipo: "",                        // varchar(50)
    nome: "",                        // varchar(100)
    descricao: "",                   // text
    unidade: "",                     // varchar(10)
    quantidade: 0,                   // decimal(10,2)
    estoqueMinimo: 0,                // decimal(10,2)
    largura: 0,                      // decimal(10,2)
    comprimento: null,               // decimal(10,2)
    gramatura: 0,                    // decimal(10,2)
    cor: "",                         // varchar(50)
    marca: "",                       // varchar(50)
    localArmazenamento: "",          // varchar(100)
    codigoBarras: "",                // varchar(30)
    precoUnitario: 0,                // decimal(10,2)
    fornecedor: "",                  // varchar(100)
    dataUltimaEntrada: "",           // date (pode manter string YYYY-MM-DD)
    observacoes: "",                 // text
    criadoEm: "",                    // timestamp
    atualizadoEm: "",                // timestamp
    idCliente: null,                 // bigint (FK)
    idFornecedor_suprimentos: null,  // bigint (FK)
    fornecedorNome: "",              // auxiliar de join
    fornecedorAtivo: false           // boolean auxiliar
};

const camposComMascaraDecimal = [
    'quantidade',
    'estoqueMinimo',
    'largura',
    'comprimento',
    'gramatura',
    'precoUnitario'
];

const camposIgnorados = ['id', 'fornecedorNome', 'fornecedorAtivo'];

export const EstoqueInsumosTecnicos = ({ materiais, onClearAll, modoEdicao, onEditClick, onRequestSubmit, onRequestDelete, fornecedores, tiposProduto }) => {
    const [formData, setFormData] = useState(camposPadrao);
    const [abaSelecionada, setAbaSelecionada] = useState(0);
    const tipoSelecionado = !!formData.tipo?.trim();

    const handleClearFields = () => {
        setFormData(camposPadrao);
        onClearAll && onClearAll();
    };

    useEffect(() => {
        if (materiais) {
            setFormData({
                ...camposPadrao,
                ...materiais,
                fornecedorAtivo: materiais.fornecedorAtivo === 1 || materiais.fornecedorAtivo === true,
                dataUltimaEntrada: materiais.dataUltimaEntrada
                    ? materiais.dataUltimaEntrada.slice(0, 10)
                    : ''
            });
        } else {
            setFormData(camposPadrao);
        }
    }, [materiais]);

    const handleFieldChange = (campo, valor) => {
        setFormData((prev) => ({
            ...prev,
            [campo]: valor
        }));
    };

    const isNovoCadastro = !materiais;
    const podeEditar = isNovoCadastro || modoEdicao;

    const abas = [
        {
            label: 'Geral',
            icon: <FaIdCard size={18} style={{ marginRight: 6 }} />,
            campos: [
                { campo: 'tipo', label: 'Tipo de Insumo Técnico' },
                { campo: 'nome', label: 'Nome do Produto' },
                { campo: 'descricao', label: 'Descrição' },
                { campo: 'cor', label: 'Cor' },
                { campo: 'marca', label: 'Marca' }
            ]
        },
        {
            label: 'Estoque',
            icon: <MdOutlineRecycling size={18} style={{ marginRight: 6 }} />,
            campos: [
                { campo: 'quantidade', label: 'Quantidade em Estoque' },
                { campo: 'unidade', label: 'Unidade de Medida' },
                { campo: 'estoqueMinimo', label: 'Estoque Mínimo' },
                { campo: 'largura', label: 'Largura' },
                { campo: 'gramatura', label: 'Gramatura (g/m²)' },
                { campo: 'comprimento', label: 'Comprimento' }
            ]
        },
        {
            label: 'Armazenamento',
            icon: <FaMapMarkedAlt size={18} style={{ marginRight: 6 }} />,
            campos: [
                { campo: 'localArmazenamento', label: 'Local de Armazenamento' },
                { campo: 'codigoBarras', label: 'Código de Barras' },
                { campo: 'precoUnitario', label: 'Preço Unitário (R$)' }
            ]
        },
        {
            label: 'Fornecedor',
            icon: <FaBuilding size={18} style={{ marginRight: 6 }} />,
            campos: [
                { campo: 'fornecedorNome', label: 'Fornecedor' },
                { campo: 'idFornecedor_suprimentos', label: 'Fornecedor' },
                { campo: 'fornecedorAtivo', label: 'Fornecedor Ativo' }
            ]
        },
        {
            label: 'Outros',
            icon: <FaEllipsisH size={18} style={{ marginRight: 6 }} />,
            campos: [
                { campo: 'dataUltimaEntrada', label: 'Data da Última Entrada' },
                { campo: 'observacoes', label: 'Observações' }
            ]
        }
    ];

    return (
        <Paper elevation={0} className="p-6 mt-6" sx={{ marginTop: '25px', padding: 3 }}>
            <div style={{ marginBottom: 20 }}>
                <Typography variant="h5" component="h2" fontWeight={600}>
                    {isNovoCadastro ? 'Insumo Técnico' : 'Insumo Técnico Selecionada'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {isNovoCadastro
                        ? 'Preencha os dados abaixo para cadastrar um novo Insumo Técnico.'
                        : 'Informações detalhadas do Insumo Técnico.'}
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
                    .filter(([campo]) =>
                        abas[abaSelecionada].campos.some((c) => c.campo === campo)
                    )
                    .filter(([campo]) => !camposIgnorados.includes(campo))
                    .map(([campo, valor]) => {
                        const campoDefinido = abas[abaSelecionada].campos.find((c) => c.campo === campo);
                        const labelPersonalizado = campoDefinido?.label || campo;

                        if (campo === 'tipo') {
                            return (
                                <Grid item xs={12} sm={6} md={4} key={campo}>
                                    <Autocomplete
                                        options={tiposProduto || []}
                                        getOptionLabel={(option) => option.nome}
                                        filterSelectedOptions
                                        onChange={(e, newValue) =>
                                            podeEditar && handleFieldChange('tipo', newValue?.nome || '')
                                        }
                                        value={tiposProduto?.find((tipo) => tipo.nome === valor) || null}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Tipo de Produto"
                                                variant="outlined"
                                                InputProps={{
                                                    ...params.InputProps,
                                                    readOnly: !podeEditar
                                                }}
                                            />
                                        )}
                                        disableClearable
                                        noOptionsText="Nenhum tipo encontrado"
                                        ListboxProps={{
                                            style: {
                                                maxHeight: '200px' // Limita visualmente a 5 itens aprox.
                                            }
                                        }}
                                    />
                                </Grid>
                            );
                        }

                        if (campo === 'cor') {
                            return (
                                <Grid item xs={12} sm={6} md={4} key={campo}>
                                    <TextField
                                        fullWidth
                                        label={labelPersonalizado}
                                        name={campo}
                                        value={valor || '#000000'}
                                        onChange={(e) => podeEditar && handleFieldChange(campo, e.target.value)}
                                        InputProps={{
                                            readOnly: !podeEditar || !tipoSelecionado,
                                            endAdornment: podeEditar && (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        component="label"
                                                        sx={{ padding: 0, width: 32, height: 32 }}
                                                    >
                                                        <input
                                                            type="color"
                                                            value={valor || '#000000'}
                                                            onChange={(e) => handleFieldChange(campo, e.target.value)}
                                                            style={{
                                                                opacity: 0,
                                                                width: '100%',
                                                                height: '100%',
                                                                cursor: 'pointer',
                                                                position: 'absolute'
                                                            }}
                                                        />
                                                        <Box
                                                            sx={{
                                                                width: 24,
                                                                height: 24,
                                                                borderRadius: '4px',
                                                                backgroundColor: valor || '#000000',
                                                                border: '1px solid #ccc'
                                                            }}
                                                        />
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                        variant="outlined"
                                    />
                                </Grid>
                            );
                        }

                        if (campo === 'unidade') {
                            return (
                                <Grid item xs={12} sm={6} md={4} key={campo}>
                                    <TextField
                                        select
                                        fullWidth
                                        label={labelPersonalizado}
                                        name={campo}
                                        value={valor}
                                        onChange={(e) => handleFieldChange(campo, e.target.value)}
                                        readOnly={!podeEditar || !tipoSelecionado}
                                        variant="outlined"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: '#bdbdbd' },
                                                '&:hover fieldset': { borderColor: '#9e9e9e' },
                                                '&.Mui-focused fieldset': { borderColor: '#757575' }
                                            },
                                            '& .MuiInputLabel-root.Mui-focused': { color: '#757575' }
                                        }}
                                    >
                                        {opcoesUnidade.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            );
                        }

                        if (campo === 'idFornecedor_suprimentos') {
                            return (
                                <Grid item xs={12} sm={6} md={4} key={campo}>
                                    <TextField
                                        select
                                        fullWidth
                                        label={labelPersonalizado}
                                        value={valor || ''}
                                        onChange={(e) => {
                                            const idSelecionado = e.target.value;
                                            const fornecedorSelecionado = fornecedores.find(f => f.id === idSelecionado);
                                            handleFieldChange('idFornecedor_suprimentos', idSelecionado);
                                            handleFieldChange('fornecedorNome', fornecedorSelecionado?.razaoSocial || '');
                                        }}
                                        SelectProps={{ native: true }}
                                        disabled={!podeEditar || !tipoSelecionado}
                                        variant="outlined"
                                    >
                                        <option value=""></option>
                                        {fornecedores.map((f) => (
                                            <option key={f.id} value={f.id}>
                                                {f.razaoSocial}
                                            </option>
                                        ))}
                                    </TextField>
                                </Grid>
                            );
                        }

                        if (camposComMascaraDecimal.includes(campo)) {
                            return (
                                <Grid item xs={12} sm={6} md={4} key={campo}>
                                    <MaskedDecimalInput
                                        label={labelPersonalizado}
                                        name={campo}
                                        value={valor}
                                        onChange={handleFieldChange}
                                        readOnly={!podeEditar || !tipoSelecionado}
                                    />
                                </Grid>
                            );
                        }

                        if (campo === 'fornecedorAtivo') {
                            return (
                                <Grid item xs={12} sm={6} md={4} key={campo}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={valor}
                                                disabled={!podeEditar || !tipoSelecionado}
                                                onChange={(e) => handleFieldChange(campo, e.target.checked)}
                                            />
                                        }
                                        label={labelPersonalizado}
                                    />
                                </Grid>
                            );
                        }

                        if (campo === 'dataUltimaEntrada') {
                            return (
                                <Grid item xs={12} sm={6} md={4} key={campo}>
                                    <TextField
                                        fullWidth
                                        label={labelPersonalizado}
                                        type="date"
                                        value={valor || ''}
                                        onChange={(e) => podeEditar && handleFieldChange(campo, e.target.value)}
                                        InputProps={{ readOnly: !podeEditar || !tipoSelecionado }}
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
                                    label={labelPersonalizado}
                                    name={campo}
                                    value={valor || ''}
                                    onChange={(e) => podeEditar && handleFieldChange(campo, e.target.value)}
                                    InputProps={{ readOnly: !podeEditar || !tipoSelecionado }}
                                    disabled={!tipoSelecionado}
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
                            onClick={() => onRequestDelete && onRequestDelete(materiais)}
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