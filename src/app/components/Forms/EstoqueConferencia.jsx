import React, { useState, useEffect } from 'react';
import {
    Table, TableHead, TableBody, TableRow, TableCell,
    TablePagination, Typography, Box, Paper, Button
} from '@mui/material';
import { MaskedDecimalInput } from '../Maske/MaskedDecimalInput';
import { BsGraphUpArrow, BsGraphDownArrow } from "react-icons/bs";

const TabelaConferenciaEstoque = ({
    dados = [],
    onSalvarConferencia,
    pagination,
    onPageChange,
    onRowsPerPageChange
}) => {
    const [linhas, setLinhas] = useState([]);
    const pageIndex = Math.max((pagination?.page || 1) - 1, 0);

    useEffect(() => {
        const formatado = dados.map(item => ({
            ...item,
            qtdSistema: parseFloat(item.quantidade) || 0,
            qtdConferida: '',
            divergencia: '-'
        }));
        setLinhas(formatado);
    }, [dados]);

    const handleQtdConferidaChange = (index, value) => {
        const atualizado = [...linhas];
        const original = atualizado[index];

        const qtdSistema = original.qtdSistema;
        const qtdConferida = parseFloat(value);
        const divergencia = isNaN(qtdConferida) ? '-' : qtdConferida - qtdSistema;

        atualizado[index] = {
            ...original,
            qtdConferida: value,
            divergencia: isNaN(qtdConferida) ? '-' : divergencia
        };

        setLinhas(atualizado);
    };

    const handleSalvar = (linha) => {
        if (onSalvarConferencia && typeof onSalvarConferencia === 'function') {
            onSalvarConferencia(linha.id, linha.qtdConferida);
        }
    };

    return (
        <Paper elevation={0} sx={{ padding: 3, marginTop: 4 }}>
            <Box mb={2}>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                    Conferência de Estoque
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Informe a quantidade conferida para cada item do estoque.
                </Typography>
            </Box>

            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell><strong>Produto</strong></TableCell>
                        <TableCell><strong>Unidade</strong></TableCell>
                        <TableCell><strong>Qtd. Sistema</strong></TableCell>
                        <TableCell><strong>Qtd. Conferida</strong></TableCell>
                        <TableCell><strong>Divergência</strong></TableCell>
                        <TableCell align="center"><strong>Ações</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {linhas.map((linha, index) => (
                        <TableRow key={linha.id}>
                            <TableCell>
                                <Typography fontWeight={400}>{linha.nome}</Typography>
                            </TableCell>
                            <TableCell>{linha.unidade || '-'}</TableCell>
                            <TableCell>{linha.qtdSistema}</TableCell>
                            <TableCell>
                                <MaskedDecimalInput
                                    name={`qtdConferida-${linha.id}`}
                                    value={linha.qtdConferida}
                                    onChange={(_, value) => handleQtdConferidaChange(index, value)}
                                    size="small"
                                    variant="outlined"
                                    decimalPlaces={2}
                                    sx={{ width: 100 }}
                                />
                            </TableCell>
                            <TableCell>
                                {linha.divergencia === '-' ? (
                                    '-'
                                ) : (
                                    <Box display="flex" alignItems="center" gap={1}>
                                        {linha.divergencia > 0 && <BsGraphUpArrow color="#2e7d32" size={18} />}
                                        {linha.divergencia < 0 && <BsGraphDownArrow color="#d32f2f" size={18} />}
                                        <Typography
                                            color={linha.divergencia === 0 ? 'success.main' : linha.divergencia > 0 ? 'success.main' : 'error.main'}
                                            fontWeight={500}
                                        >
                                            {linha.divergencia}
                                        </Typography>
                                    </Box>
                                )}
                            </TableCell>
                            <TableCell align="center">
                                <Button
                                    variant="outlined"
                                    size="small"
                                    color="primary"
                                    onClick={() => handleSalvar(linha)}
                                >
                                    Salvar
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {pagination && (
                <TablePagination
                    component="div"
                    count={pagination.total || 0}
                    page={pageIndex}
                    onPageChange={(e, newPage) => {
                        console.log("⬅️ onPageChange:", newPage);
                        if (newPage >= 0) {
                            onPageChange(newPage + 1);
                        }
                    }}
                    rowsPerPage={pagination.perPage || 5}
                    onRowsPerPageChange={(e) =>
                        onRowsPerPageChange(parseInt(e.target.value, 10))
                    }
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    labelRowsPerPage="Linhas por página:"
                />
            )}
        </Paper>
    );
};

export default TabelaConferenciaEstoque;
