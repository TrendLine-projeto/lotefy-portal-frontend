import React, { useState, useEffect } from 'react';
import { Breadcrumb } from "app/components";
import { Snackbar, Alert, Typography } from "@mui/material";
import { GoPackageDependencies } from "react-icons/go";
import ExpandableFilterPanel from '../../../components/HeaderFilterContainer/index';
import Loading from '../../../components/MatxLoading';
import DataTable from '../../../components/DataTable';
import styled from "@mui/material/styles/styled";
import Box from "@mui/material/Box";
import CardLote from './components/CardLote';

const Container = styled("div")(({ theme }) => ({
    margin: "30px",
    [theme.breakpoints.down("sm")]: { margin: "16px" },
    "& .breadcrumb": {
        marginBottom: "30px",
        [theme.breakpoints.down("sm")]: { marginBottom: "16px" }
    }
}));

export default function ConferenciaQualidadeMain() {
    const apiUrl = import.meta.env.VITE_API_URL;
    const simulateError = new URLSearchParams(window.location.search).get('simulateError') === '1';
    const [filters, setFilters] = useState({});
    const [dadosSelecionado, setDadosSelecionado] = useState(null);
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, perPage: 5, total: 0 });
    const [loading, setLoading] = useState(false);
    const [hasFiltered, setHasFiltered] = useState(true);
    const [filterNonce, setFilterNonce] = useState(0);
    const [painelExpandido, setPainelExpandido] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: '',
        mensagem: ''
    });

    const handleFilter = () => {
        setPagination((prev) => ({ ...prev, page: 1 }));
        setHasFiltered(true);
        setFilterNonce((prev) => prev + 1);
        setHasError(false);
    };

    const handleChange = (name, value) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleClear = () => {
        setFilters({});
        setPagination((prev) => ({ ...prev, page: 1 }));
        setDadosSelecionado(null);
        setHasFiltered(true);
        setFilterNonce((prev) => prev + 1);
        setHasError(false);
    };

    const formatarDataHora = (isoString) => {
        const date = new Date(isoString);
        if (Number.isNaN(date.getTime())) return '-';
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
            if (simulateError) {
                setHasError(true);
                setData([]);
                setPagination((prev) => ({ ...prev, page: 1, total: 0 }));
                setSnackbar({
                    open: true,
                    message: 'Erro simulado ao buscar lotes.',
                    severity: 'error',
                    mensagem: 'Erro simulado ao buscar lotes.'
                });
                return;
            }
            const res = await fetch(`${apiUrl}/lotes/entrada_lotes/buscar`, {
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

            if (!res.ok && result?.mensagem !== "Nenhum Lote encontrado para essa filial.") {
                setHasError(true);
                setData([]);
                setPagination(prev => ({
                    ...prev,
                    page: 1,
                    perPage: prev.perPage,
                    total: 0
                }));
                setSnackbar({
                    open: true,
                    message: result?.mensagem || 'Erro ao buscar lotes.',
                    severity: 'error',
                    mensagem: result?.mensagem || 'Erro ao buscar lotes.'
                });
                return;
            }

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
                    mensagem: 'Nenhum lote encontrado'
                });
            } else {
                setHasError(false);
                setData(result.lotes.map(f => ({
                    ...f,
                    dataEntrada: formatarDataHora(f.dataEntrada),
                    dataPrevistaSaida: formatarDataHora(f.dataPrevistaSaida),
                    loteIniciado: f.loteIniciado === 1 ? 'Sim' : 'Nao'
                })));
                setPagination({
                    page: result.paginaAtual,
                    perPage: result.quantidadePorPagina,
                    total: result.totalRegistros
                });
            }
        } catch (error) {
            console.error('Erro ao buscar o lote:', error);
            setHasError(true);
            setSnackbar({
                open: true,
                message: 'Erro ao buscar lotes.',
                severity: 'error',
                mensagem: 'Erro ao buscar lotes.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = async (id) => {
        try {
            const res = await fetch(`${apiUrl}/lotes/entrada_lotes/${id}`);
            const result = await res.json();
            setDadosSelecionado(result.lote);

            if (res.ok) {
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
                    message: data.mensagem || 'Erro ao selecionar um fornecedor de produto!',
                    severity: 'error',
                    mensagem: 'Erro ao selecionar um fornecedor de produto!'
                });
            }
        } catch (err) {
            setSnackbar({
                open: true,
                message: data.mensagem || 'Erro ao selecionar o fornecedor de produto!',
                severity: 'error',
                mensagem: 'Erro ao selecionar o fornecedor de produto!'
            });
        }
    };

    const refreshLoteSelecionado = async () => {
        if (!dadosSelecionado?.id) return false;
        try {
            const res = await fetch(`${apiUrl}/lotes/entrada_lotes/${dadosSelecionado.id}`);
            const result = await res.json();
            if (!res.ok) {
                setSnackbar({
                    open: true,
                    message: result.mensagem || 'Erro ao atualizar lote selecionado.',
                    severity: 'error',
                    mensagem: result.mensagem || 'Erro ao atualizar lote selecionado.'
                });
                return false;
            }
            setDadosSelecionado(result.lote);
            return true;
        } catch (err) {
            setSnackbar({
                open: true,
                message: 'Erro ao atualizar lote selecionado.',
                severity: 'error',
                mensagem: 'Erro ao atualizar lote selecionado.'
            });
            return false;
        }
    };

    useEffect(() => {
        if (!hasFiltered) {
            return;
        }

        fetchData();
    }, [hasFiltered, filterNonce, pagination.page, pagination.perPage]);

    const fields = [
        { name: 'numeroIdentificador', label: 'Numero de identificacao', type: 'text', placeholder: '' },
        { name: 'identificadorConferencia', label: 'Identificador da conferencia', type: 'text', placeholder: '' },
        { name: 'dataEntrada', label: 'Data de entrada', type: 'date', placeholder: '' },
        { name: 'dataPrevistaSaida', label: 'Data de saida', type: 'date', placeholder: '' },
        { name: 'valorEstimado', label: 'Valor', type: 'text', placeholder: 'R$' },
        { name: 'loteIniciado', label: 'Iniciado / Finalizado', type: 'checkbox' }
    ];

    const columns = [
        { field: 'numeroIdentificador', headerName: 'Numero de identificacao' },
        { field: 'dataEntrada', headerName: 'Data de entrada' },
        { field: 'dataPrevistaSaida', headerName: 'Data prevista de saida' },
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
                                    Conferencia de qualidade
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
                title="Filtros de lotes"
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
                        keepHeaderOnEmpty
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

            {loading && !dadosSelecionado && (
                <Box
                    sx={{
                        mt: 4,
                        display: 'flex',
                        justifyContent: 'center'
                    }}
                >
                    <Loading />
                </Box>
            )}

            {!dadosSelecionado && !loading && (
                <Box
                    sx={{
                        mt: 4,
                        p: 4,
                        borderRadius: 3,
                        border: '1px dashed #cbd5e1',
                        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                        textAlign: 'center'
                    }}
                >
                    <Box sx={{ maxWidth: 520, mx: 'auto' }}>
                        {hasError ? (
                            <svg
                                viewBox="0 0 640 360"
                                width="100%"
                                height="220"
                                role="img"
                                aria-label="Erro ao buscar lotes"
                            >
                                <defs>
                                    <linearGradient id="erro-bg" x1="0" x2="1" y1="0" y2="1">
                                        <stop offset="0%" stopColor="#fee2e2" />
                                        <stop offset="100%" stopColor="#fff7ed" />
                                    </linearGradient>
                                </defs>
                                <rect x="40" y="40" width="560" height="280" rx="26" fill="url(#erro-bg)" />
                                <rect x="80" y="90" width="480" height="180" rx="20" fill="#ffffff" stroke="#fecaca" />
                                <circle cx="160" cy="180" r="38" fill="#fee2e2" />
                                <path d="M160 158 L160 192" stroke="#dc2626" strokeWidth="8" strokeLinecap="round" />
                                <circle cx="160" cy="212" r="5" fill="#dc2626" />
                                <rect x="230" y="150" width="240" height="10" rx="5" fill="#fca5a5" />
                                <rect x="230" y="175" width="200" height="10" rx="5" fill="#fecaca" />
                                <rect x="230" y="200" width="260" height="10" rx="5" fill="#fee2e2" />
                            </svg>
                        ) : (
                            <svg
                                viewBox="0 0 640 360"
                                width="100%"
                                height="220"
                                role="img"
                                aria-label="Selecione o lote acima"
                            >
                                <defs>
                                    <linearGradient id="lote-bg" x1="0" x2="1" y1="0" y2="1">
                                        <stop offset="0%" stopColor="#e2f2ff" />
                                        <stop offset="100%" stopColor="#fef3c7" />
                                    </linearGradient>
                                    <linearGradient id="lote-card" x1="0" x2="1">
                                        <stop offset="0%" stopColor="#ffffff" />
                                        <stop offset="100%" stopColor="#f8fafc" />
                                    </linearGradient>
                                </defs>
                                <rect x="40" y="40" width="560" height="280" rx="26" fill="url(#lote-bg)" />
                                <rect x="80" y="80" width="480" height="70" rx="16" fill="url(#lote-card)" stroke="#e2e8f0" />
                                <rect x="110" y="105" width="120" height="8" rx="4" fill="#cbd5e1" />
                                <rect x="250" y="105" width="200" height="8" rx="4" fill="#cbd5e1" />
                                <rect x="80" y="170" width="480" height="110" rx="20" fill="#ffffff" stroke="#e2e8f0" />
                                <rect x="110" y="195" width="150" height="10" rx="5" fill="#94a3b8" />
                                <rect x="110" y="220" width="210" height="10" rx="5" fill="#cbd5e1" />
                                <rect x="110" y="245" width="170" height="10" rx="5" fill="#cbd5e1" />
                                <rect x="360" y="195" width="160" height="30" rx="8" fill="#e2e8f0" />
                                <rect x="360" y="235" width="160" height="30" rx="8" fill="#f1f5f9" />
                                <path
                                    d="M320 310 L320 250 M320 250 L300 270 M320 250 L340 270"
                                    stroke="#64748b"
                                    strokeWidth="6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <circle cx="320" cy="230" r="10" fill="#0ea5e9" />
                            </svg>
                        )}
                    </Box>
                    <Typography variant="h6" sx={{ mt: 2, color: '#334155', fontWeight: 600 }}>
                        {hasError ? 'Algo deu errado' : 'Selecione o lote acima'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                        {hasError
                            ? 'Tente recarregar a tela ou aguarde um momento e tente novamente.'
                            : 'Use os filtros para listar lotes e escolher um para continuar.'}
                    </Typography>
                </Box>
            )}

            {dadosSelecionado && (
                <CardLote lote={dadosSelecionado} onRefreshLote={refreshLoteSelecionado} />
            )}
        </Container>
    );
}
