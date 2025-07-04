import React, { useState } from "react";
import HeaderFormTitle from "../../../../components/HeeaderFormTitle";
import DataTable from "../../../../components/DataTable";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
    Grid,
    TextField,
    Button,
    Typography,
    Divider,
    Paper,
    Box,
} from "@mui/material";

export function EtapaProdutos({ produtos, setProdutos, onNext, onBack }) {
    const [form, setForm] = useState({
        numeroIdentificador: '',
        nomeProduto: '',
        tipoEstilo: '',
        tamanho: '',
        corPrimaria: '',
        corSecundaria: '',
        valorPorPeca: '',
        quantidadeProduto: '',
        someValorTotalProduto: '',
        dataPrevistaSaida: '',
        imagem: '',
        finalizado: 0,
        idEntrada_lotes: 0,
        idFilial: 1
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "valorPorPeca") {
            const cleanValue = value.replace(/[^\d]/g, '');
            const numeric = parseFloat(cleanValue) / 100;

            setForm(prev => ({
                ...prev,
                [name]: isNaN(numeric) ? '' : numeric
            }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAddProduto = () => {
        if (form.nomeProduto && form.numeroIdentificador) {
            const valor = parseFloat(form.valorPorPeca);
            const quantidade = parseInt(form.quantidadeProduto);

            const totalProduto =
                !isNaN(valor) && !isNaN(quantidade)
                    ? parseFloat((valor * quantidade).toFixed(2))
                    : 0;

            const produtoComTotal = {
                ...form,
                someValorTotalProduto: totalProduto
            };

            setProdutos([...produtos, produtoComTotal]);

            setForm({
                numeroIdentificador: '',
                nomeProduto: '',
                tipoEstilo: '',
                tamanho: '',
                corPrimaria: '',
                corSecundaria: '',
                valorPorPeca: '',
                quantidadeProduto: '',
                someValorTotalProduto: '',
                dataPrevistaSaida: '',
                imagem: '',
                finalizado: 0,
                idEntrada_lotes: 0,
                idFilial: 1
            });
        }
    };

    const handleDeleteProduto = (index) => {
        const novosProdutos = produtos.filter((_, i) => i !== index);
        setProdutos(novosProdutos);
    };

    const primeiraData = produtos
        .map(p => new Date(p.dataPrevistaSaida))
        .filter(d => !isNaN(d))
        .sort((a, b) => a - b)[0];

    const dataMaisProxima = primeiraData
        ? primeiraData.toLocaleDateString('pt-BR')
        : '—';

    const { totalValorGeral, totalPecas } = produtos.reduce(
        (acc, item) => {
            const valor = parseFloat(item.valorPorPeca);
            const quantidade = parseInt(item.quantidadeProduto);

            if (!isNaN(valor) && !isNaN(quantidade)) {
                acc.totalValorGeral += valor * quantidade;
                acc.totalPecas += quantidade;
            }

            return acc;
        },
        { totalValorGeral: 0, totalPecas: 0 }
    );

    const handleDuplicarProduto = (index) => {
        const produtoDuplicado = produtos[index];
        setForm({ ...produtoDuplicado });
    };

    const valorMedio = totalPecas > 0 ? totalValorGeral / totalPecas : 0;

    const columns = [
        { field: 'numeroIdentificador', headerName: 'Identificação' },
        { field: 'nomeProduto', headerName: 'Nome' },
        { field: 'tipoEstilo', headerName: 'Estilo' },
        { field: 'tamanho', headerName: 'Tamanho' },
        {
            field: 'valorPorPeca',
            headerName: 'Valor/Peça',
            renderCell: (row) =>
                typeof row.valorPorPeca === 'number'
                    ? row.valorPorPeca.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                    })
                    : row.valorPorPeca,
        },
        { field: 'quantidadeProduto', headerName: 'Qtd' },
        {
            field: 'someValorTotalProduto',
            headerName: 'Valor Total',
            renderCell: (row) =>
                typeof row.someValorTotalProduto === 'number'
                    ? row.someValorTotalProduto.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                    })
                    : row.someValorTotalProduto,
        },
        { field: 'dataPrevistaSaida', headerName: 'Data Saída' },
        {
            field: 'acoes',
            headerName: 'Ações',
            renderCell: (row) => {
                const index = produtos.indexOf(row);

                return (
                    <>
                        <IconButton
                            color="error"
                            onClick={() => handleDeleteProduto(index)}
                            title="Excluir produto"
                        >
                            <DeleteIcon />
                        </IconButton>
                        <IconButton
                            color="primary"
                            onClick={() => handleDuplicarProduto(index)}
                            title="Duplicar valores"
                        >
                            <ContentCopyIcon />
                        </IconButton>
                    </>
                );
            }
        }
    ];

    return (
        <>
            <HeaderFormTitle
                titulo="Informações de Produtos"
                subtitulo="Cadastre os produtos que compõem o lote."
            />

            <Paper elevation={1} sx={{ p: 3, backgroundColor: '#fafafa', mb: 4 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Identificação e Características</Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                    <Grid item xs={4}>
                        <TextField label="Identificação" name="numeroIdentificador" value={form.numeroIdentificador} onChange={handleChange} fullWidth />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField label="Nome" name="nomeProduto" value={form.nomeProduto} onChange={handleChange} fullWidth />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField label="Estilo" name="tipoEstilo" value={form.tipoEstilo} onChange={handleChange} fullWidth />
                    </Grid>

                    <Grid item xs={3}>
                        <TextField label="Tamanho" name="tamanho" value={form.tamanho} onChange={handleChange} fullWidth />
                    </Grid>
                    <Grid item xs={3}>
                        <TextField label="Cor Primária" name="corPrimaria" value={form.corPrimaria} onChange={handleChange} fullWidth />
                    </Grid>
                    <Grid item xs={3}>
                        <TextField label="Cor Secundária" name="corSecundaria" value={form.corSecundaria} onChange={handleChange} fullWidth />
                    </Grid>
                    <Grid item xs={3}>
                        <TextField
                            label="Valor/Peça"
                            name="valorPorPeca"
                            value={
                                form.valorPorPeca !== '' && !isNaN(form.valorPorPeca)
                                    ? Number(form.valorPorPeca).toLocaleString('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL'
                                    })
                                    : ''
                            }
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                </Grid>

                <Typography variant="subtitle2" sx={{ mt: 4, mb: 1 }}>Estoque e Saída</Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <TextField label="Quantidade" name="quantidadeProduto" value={form.quantidadeProduto} onChange={handleChange} fullWidth />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="Data Prevista de Saída"
                            type="date"
                            name="dataPrevistaSaida"
                            InputLabelProps={{ shrink: true }}
                            value={form.dataPrevistaSaida}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                </Grid>

                <Box mt={3}>
                    <Button onClick={handleAddProduto} variant="outlined">
                        Adicionar Produto
                    </Button>
                </Box>
            </Paper>

            <Grid item xs={12} mt={4}>
                <HeaderFormTitle
                    titulo="Informações de Produtos adicionados"
                    subtitulo="Produtos pré cadastrados ao lote."
                />

                <Box style={{
                    transition: '1s',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    height: '300px'
                }}>
                    <Box
                        sx={{
                            width: '70%',
                            maxHeight: '300px',
                            overflowY: 'auto',
                            '& .MuiTableRow-root': {
                                height: '32px',
                            },
                            '& .MuiTableCell-root': {
                                padding: '4px 8px',
                                fontSize: '0.85rem'
                            }
                        }}
                    >
                        <DataTable
                            columns={columns}
                            rows={produtos}
                            loading={false}
                        />
                    </Box>

                    <Box
                        sx={{
                            border: '1px solid #ccc',
                            borderRadius: '6px',
                            padding: '12px 16px',
                            backgroundColor: '#fafafa',
                            width: '29%',
                            height: '100%',
                        }}
                    >
                        <p><strong>Resumo de produtos</strong></p>
                        <Divider sx={{ mb: 1 }} />
                        <Box mt={2}>
                            <span>Total de Peças: <strong>{totalPecas}</strong></span>
                            <Divider />
                            <span>Total do Lote: R$ <strong>{totalValorGeral.toFixed(2).replace('.', ',')}</strong></span>
                            <Divider />
                            <span>Itens únicos: <strong>{produtos.length}</strong></span>
                            <Divider />
                            <span>Valor Médio (unit.): R$ <strong>{valorMedio.toFixed(2).replace('.', ',')}</strong></span>
                            <Divider />
                            <span>1ª Saída Prevista: <strong>{dataMaisProxima}</strong></span>
                        </Box>
                    </Box>
                </Box>
            </Grid>

            <Grid
                item
                xs={12}
                mt={4}
                sx={{
                    display: "flex",
                    justifyContent: "space-between"
                }}
            >
                <Button variant="outlined" onClick={onBack}>Voltar</Button>
                <Button variant="contained" onClick={onNext}>Próximo</Button>
            </Grid>
        </>
    );
}
