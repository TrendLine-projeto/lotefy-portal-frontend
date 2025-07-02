
import React, { useState, useEffect } from 'react';
import { Breadcrumb } from "app/components";
import { Snackbar, Alert } from "@mui/material";
import { GoPackageDependencies } from "react-icons/go";
import ExpandableFilterPanel from '../../../components/HeaderFilterContainer/index';
import ConfirmDialog from '../../../components/Dialogs/ConfirmDialog';
import Loading from '../../../components/MatxLoading';
import DataTable from '../../../components/DataTable';
import styled from "@mui/material/styles/styled";
import Box from "@mui/material/Box";

const Container = styled("div")(({ theme }) => ({
    margin: "30px",
    [theme.breakpoints.down("sm")]: { margin: "16px" },
    "& .breadcrumb": {
        marginBottom: "30px",
        [theme.breakpoints.down("sm")]: { marginBottom: "16px" }
    }
}));

export default function LoteCompanhamentoMain() {
    const [filters, setFilters] = useState({});
    const [dadosSelecionado, setDadosSelecionado] = useState(null);
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, perPage: 10, total: 0 });
    const [loading, setLoading] = useState(false);
    const [painelExpandido, setPainelExpandido] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: '',
        mensagem: ''
    });

    const [dialog, setDialog] = useState({
        open: false,
        title: '',
        description: '',
        confirmText: '',
        cancelText: 'Cancelar',
        onConfirm: null,
        confirmColor: 'primary'
    });

    const handleFilter = () => {
        setPagination((prev) => ({ ...prev, page: 1 }));
        fetchData();
    };

    const handleChange = (name, value) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleClear = () => {
        setFilters({});
        setFornecedorSelecionado(null);
        setPagination((prev) => ({ ...prev, page: 1 }));
        fetchData();
    };

    const formatarDataHora = (isoString) => {
        const date = new Date(isoString);
        const dia = String(date.getDate()).padStart(2, '0');
        const mes = String(date.getMonth() + 1).padStart(2, '0');
        const ano = date.getFullYear();
        const horas = String(date.getHours()).padStart(2, '0');
        const minutos = String(date.getMinutes()).padStart(2, '0');
        return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3450/lotes/entrada_lotes/buscar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...filters,
                    idFilial: 1,
                    pagina: pagination.page,
                    quantidadePorPagina: pagination.perPage
                })
            });
            const result = await res.json();

            if (result.mensagem === "Nenhum Lote encontrado para essa filial.") {
                setData([]);
                setPagination(prev => ({
                    ...prev,
                    page: 1,
                    perPage: prev.perPage,
                    total: 0
                }));
                setSnackbar({
                    open: true,
                    message: result.mensagem,
                    severity: 'info',
                    mensagem: 'Nenhum Lote encontrado'
                });
            } else {
                setData(result.lotes.map(f => ({
                    ...f,
                    dataEntrada: formatarDataHora(f.dataEntrada),
                    dataPrevistaSaida: formatarDataHora(f.dataPrevistaSaida),
                    loteIniciado: f.loteIniciado === 1 ? 'Sim' : 'Não'
                })));
                setPagination({
                    page: result.paginaAtual,
                    perPage: result.quantidadePorPagina,
                    total: result.totalRegistros
                });
            }
        } catch (error) {
            console.error('Erro ao buscar o Lote:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = async (id) => {
        try {
            const res = await fetch(`http://localhost:3450/lotes/entrada_lotes/${id}`);
            const result = await res.json();
            setDadosSelecionado(result.lote);

            if (res.ok) {
                setDadosSelecionado(result.lote);
                setModoEdicao(true);
                setPainelExpandido(false);
                setSnackbar({
                    open: true,
                    message: result.mensagem,
                    severity: 'info',
                    mensagem: 'Selecionado'
                });
            } else {
                setSnackbar({
                    open: true,
                    message: data.mensagem || 'Erro ao selecionar um Fornecedor de produto!',
                    severity: 'error',
                    mensagem: 'Erro ao selecionar um Fornecedor de produto!'
                });
            }
        } catch (err) {
            setSnackbar({
                open: true,
                message: data.mensagem || 'Erro ao selecionar o Fornecedor de produto!',
                severity: 'error',
                mensagem: 'Erro ao selecionar o Fornecedor de produto!'
            });
        }
    };

    useEffect(() => {
        fetchData();
    }, [pagination.page, pagination.perPage]);

    const fields = [
        { name: 'numeroIdentificador', label: 'Numero de identificação', type: 'text', placeholder: '' },
        { name: 'dataEntrada', label: 'Data de entrada', type: 'date', placeholder: '' },
        { name: 'dataPrevistaSaida', label: 'Data de saída', type: 'date', placeholder: '' },
        { name: 'valorEstimado', label: 'Valor', type: 'text', placeholder: 'R$' },
        { name: 'loteIniciado', label: 'Iniciado / Finalizado', type: 'checkbox' }
    ];

    const columns = [
        { field: 'numeroIdentificador', headerName: 'Numero de indentificação' },
        { field: 'dataEntrada', headerName: 'Data de entrada' },
        { field: 'dataPrevistaSaida', headerName: 'Data prevista de saída' },
        { field: 'valorEstimado', headerName: 'Valor total' },
        { field: 'loteIniciado', headerName: 'Iniciado' },
        {
            field: 'selecionar',
            headerName: 'Selecionar',
            renderCell: (row) => (
                <button
                    onClick={() => handleSelect(row.id)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#1976d2',
                        cursor: 'pointer',
                        padding: 0,
                        fontSize: '0.8rem',
                        fontWeight: 500
                    }}
                    onMouseOver={(e) => (e.target.style.textDecoration = 'underline')}
                    onMouseOut={(e) => (e.target.style.textDecoration = 'none')}
                >
                    Selecionar
                </button>
            )
        }
    ];

    return (
        <Container>
            <Box className="breadcrumb">
                <Breadcrumb
                    routeSegments={[
                        { name: "Lotes", path: "/material" },
                        {
                            name: (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <GoPackageDependencies style={{ marginRight: 6 }} />
                                    Acompanhamento
                                </Box>
                            )
                        }
                    ]}
                />
            </Box>

            <ExpandableFilterPanel
                fields={fields}
                values={filters}
                onChange={handleChange}
                onFilter={handleFilter}
                onClear={handleClear}
                title="Filtros de Lotes"
                expanded={painelExpandido}
                onToggle={(event, isExpanded) => setPainelExpandido(isExpanded)}
            >
                {loading ? (
                    <Loading />
                ) : (
                    <DataTable
                        columns={columns}
                        rows={data}
                        pagination={pagination}
                        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                        onRowsPerPageChange={(perPage) =>
                            setPagination(prev => ({ ...prev, perPage, page: 1 }))
                        }
                    />
                )}
            </ExpandableFilterPanel>

            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                message={snackbar.message}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
                    {snackbar.mensagem}
                </Alert>
            </Snackbar>


            <ConfirmDialog
                open={dialog.open}
                title={dialog.title}
                description={dialog.description}
                confirmText={dialog.confirmText}
                cancelText={dialog.cancelText}
                confirmColor={dialog.confirmColor}
                onConfirm={() => {
                    dialog.onConfirm?.();
                    setDialog({ ...dialog, open: false });
                }}
                onClose={() => setDialog({ ...dialog, open: false })}
            />
        </Container>
    )
}