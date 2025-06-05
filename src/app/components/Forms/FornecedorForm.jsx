import React, { useEffect, useState } from 'react';
import { MdOutlineRecycling } from "react-icons/md";
import { FaSave } from "react-icons/fa";
import {
    TextField,
    Checkbox,
    Grid,
    Typography,
    Paper,
    FormControlLabel,
    Box,
    Button
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

export const FornecedorForm = ({ fornecedor, onSubmit, onClearAll, modoEdicao, onEditClick }) => {
    const [formData, setFormData] = useState(camposPadrao);

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

    return (
        <Paper elevation={0} className="p-6 mt-6" sx={{ marginTop: '25px', padding: 3 }}>
            <div style={{ marginBottom: 20 }}>
                <Typography variant="h5" component="h2" fontWeight={600}>
                    {isNovoCadastro ? 'Fornecedor' : 'Fornecedor Selecionado'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {isNovoCadastro
                        ? 'Preencha os dados abaixo para cadastrar um novo fornecedor.'
                        : 'Informações detalhadas do fornecedor selecionado.'}
                </Typography>
            </div>

            <Grid container spacing={2}>
                {Object.entries(formData)
                    .filter(([campo]) => !camposIgnorados.includes(campo))
                    .map(([campo, valor]) => {
                        if (campo === 'ativo') {
                            return (
                                <Grid item xs={12} sm={6} md={4} key={campo}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={valor}
                                                disabled={!podeEditar}
                                                onChange={(e) =>
                                                    (isNovoCadastro || modoEdicao) && handleFieldChange(campo, e.target.value)
                                                }
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
                                        onChange={(e) =>
                                            (isNovoCadastro || modoEdicao) && handleFieldChange(campo, e.target.value)
                                        }
                                        InputProps={{ readOnly: !podeEditar }}
                                        InputLabelProps={{ shrink: true }}
                                        variant="outlined"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: '#bdbdbd'
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: '#9e9e9e'
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#757575'
                                                }
                                            },
                                            '& .MuiInputLabel-root.Mui-focused': {
                                                color: '#757575'
                                            }
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
                                    onChange={(e) =>
                                        (isNovoCadastro || modoEdicao) && handleFieldChange(campo, e.target.value)
                                    }
                                    InputProps={{ readOnly: !podeEditar }}
                                    variant="outlined"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#bdbdbd'
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#9e9e9e'
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#757575'
                                            }
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: '#757575'
                                        }
                                    }}
                                />
                            </Grid>
                        );
                    })}
            </Grid>

            <Box mt={4} display="flex" justifyContent="flex-end">
                {podeEditar ? (
                    <Box sx={{ display: 'flex', gap: 2, }}>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleClearFields}
                            sx={{ minWidth: 140, display: 'flex', gap: 1, }}
                        >
                            <MdOutlineRecycling size={18} />
                            Limpar
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => onSubmit && onSubmit(formData)}
                            sx={{ minWidth: 140, display: 'flex', gap: 1, }}
                        >
                            <FaSave size={18} />
                            Salvar
                        </Button>
                    </Box>
                ) : (
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={onEditClick}
                        sx={{ minWidth: 140 }}
                    >
                        Editar
                    </Button>
                )}
            </Box>
        </Paper>
    );
};