import React, { useState, useEffect } from 'react';
import { Breadcrumb } from "app/components";
import { Snackbar, Alert, Typography } from "@mui/material";
import { GiWireCoil } from "react-icons/gi";
import ExpandableFilterPanel from '../../../components/HeaderFilterContainer/index';
import TabelaConferenciaEstoque from '../../../components/Forms/EstoqueConferencia';
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

const mockData = [
    { id: 1, Tipo: 'Insumos tÃ©cnicos' },
    { id: 2, Tipo: 'MatÃ©ria-prima' },
];

export default function ConferenciaMain() {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [filters, setFilters] = useState({});
    const [dadosConferencia, setDadosConferencia] = useState([]);
    const [tabelaSelecionada, setTabelaSelecionada] = useState(null);
    const [filteredData, setFilteredData] = useState(mockData);
    const [pagination, setPagination] = useState({ page: 1, perPage: 5 });
    const [loading, setLoading] = useState(false);
    const [painelExpandido, setPainelExpandido] = useState(false);
    const [salvandoConferencia, setSalvandoConferencia] = useState(false);
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
        const termo = filters.nome?.toLowerCase() || '';

        const resultado = mockData.filter((item) =>
            item.Tipo.toLowerCase().includes(termo)
        );

        setFilteredData(resultado);
        setPagination((prev) => ({
            ...prev,
            page: 1,
            total: resultado.length
        }));
    };

    const handleChange = (name, value) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleClear = () => {
        setFilters({});
        setFilteredData(mockData);
        setPagination((prev) => ({ ...prev, page: 1, total: mockData.length }));
    };

    const fetchData = async () => {
        if (!tabelaSelecionada) return;

        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}/tipoProdutos/conferencia`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tabela: tabelaSelecionada,
                    idCliente: 1,
                    pagina: pagination.page,
                    quantidadePorPagina: pagination.perPage
                })
            });

            const result = await res.json();

            if (result.mensagem === "Nenhuma registro encontrado.") {
                setDadosConferencia([]);
                setPagination({
                    page: result.paginaAtual,
                    perPage: 5,
                    total: result.totalRegistros
                });
                setSnackbar({
                    open: true,
                    message: result.mensagem,
                    severity: 'info',
                    mensagem: 'Nenhum registro encontrado'
                });
            } else {
                const adaptado = result.dados.map(item => ({
                    ...item,
                    qtdSistema: parseFloat(item.quantidade)
                }));

                setPainelExpandido(false);
                setDadosConferencia(adaptado);
                setPagination(prev => ({
                    ...prev,
                    page: result.paginaAtual || prev.page,
                    total: result.totalRegistros
                }));
            }
        } catch (error) {
            console.error('Erro ao buscar os dados de conferÃªncia:', error);
            setSnackbar({
                open: true,
                message: 'Erro ao buscar os dados',
                severity: 'error',
                mensagem: 'Erro ao buscar os dados'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (idTabela) => {
        setTabelaSelecionada(idTabela);
        setPagination({ ...pagination, page: 1 });
        setPainelExpandido(false);
    };

    const handleSalvarConferencia = async (id, qtdConferida) => {
        try {
            setSalvandoConferencia(true);
            const item = dadosConferencia.find(el => el.id === id);

            if (!item) throw new Error('Item nÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o encontrado');

            const payload = {
                id_produto: item.id,
                quantidade_sistema: parseFloat(item.quantidade),
                quantidade_conferida: parseFloat(qtdConferida),
                tabela_origem: tabelaSelecionada,
                id_cliente: 1
            };

            const response = await fetch(`${apiUrl}/tipoProdutos/conferencia/salvar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                setSnackbar({
                    open: true,
                    message: 'conferÃªncia salva com sucesso!',
                    severity: 'success',
                    mensagem: 'conferÃªncia registrada'
                });
                setDadosConferencia(prev =>
                    prev.map(item =>
                        item.id === id ? { ...item, quantidade: qtdConferida } : item
                    )
                );
            } else {
                throw new Error(data.mensagem || 'Erro ao salvar a conferÃªncia');
            }
        } catch (error) {
            console.error('Erro ao salvar a conferÃªncia:', error);
            setSnackbar({
                open: true,
                message: error.message || 'Erro inesperado',
                severity: 'error',
                mensagem: 'Falha ao salvar'
            });
        } finally {
            setSalvandoConferencia(false);
        }
    };

    const abrirDialogConferencia = (id, qtdConferida) => {
        setDialog({
            open: true,
            title: 'Confirmar conferÃªncia',
            description: `Deseja salvar a quantidade conferida?`,
            confirmText: 'Confirmar',
            cancelText: 'Cancelar',
            confirmColor: 'success',
            onConfirm: () => handleSalvarConferencia(id, qtdConferida)
        });
    };

    useEffect(() => {
        if (tabelaSelecionada !== null && pagination.page && !loading) {
            fetchData();
        }
    }, [tabelaSelecionada, pagination.page, pagination.perPage]);

    const fields = [
        {
            name: 'nome',
            label: 'Nome da MatÃ©ria-prima',
            type: 'text',
            placeholder: 'Ex: Tecido Tricoline'
        }
    ];

    const columns = [
        { field: 'Tipo', headerName: 'Tipo', flex: 1 },
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
                        { name: "Suprimentos", path: "/material" },
                        {
                            name: (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <GiWireCoil style={{ marginRight: 6 }} />
                                    ConferÃªncia
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
                title="Filtros de Insumos TÃ©cnicos"
                expanded={painelExpandido}
                onToggle={(event, isExpanded) => setPainelExpandido(isExpanded)}
            >
                {loading ? (
                    <Loading />
                ) : (
                    <DataTable
                        columns={columns}
                        rows={filteredData}
                        pagination={{
                            page: pagination.page,
                            perPage: pagination.perPage,
                            total: filteredData.length
                        }}
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

            {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                    <Loading />
                </Box>
            ) : tabelaSelecionada === null ? (
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
                        <svg
                            viewBox="0 0 640 360"
                            width="100%"
                            height="220"
                            role="img"
                            aria-label="Selecione o tipo de estoque acima"
                        >
                            <defs>
                                <linearGradient id="lote-bg-conferencia" x1="0" x2="1" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#e2f2ff" />
                                    <stop offset="100%" stopColor="#fef3c7" />
                                </linearGradient>
                                <linearGradient id="lote-card-conferencia" x1="0" x2="1">
                                    <stop offset="0%" stopColor="#ffffff" />
                                    <stop offset="100%" stopColor="#f8fafc" />
                                </linearGradient>
                            </defs>
                            <rect x="40" y="40" width="560" height="280" rx="26" fill="url(#lote-bg-conferencia)" />
                            <rect x="80" y="80" width="480" height="70" rx="16" fill="url(#lote-card-conferencia)" stroke="#e2e8f0" />
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
                    </Box>
                    <Typography variant="h6" sx={{ mt: 2, color: '#334155', fontWeight: 600 }}>
                        Selecione o tipo de estoque acima
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Escolha uma tabela para iniciar a conferencia.
                    </Typography>
                </Box>
            ) : dadosConferencia.length === 0 ? (
                <Typography variant="body2" align="center" sx={{ py: 4 }}>
                    Nenhum registro encontrado para este tipo de estoque.
                </Typography>
            ) : (
                <>
                    <Box position="relative">
                        {salvandoConferencia && (
                            <Box
                                position="absolute"
                                top={0}
                                left={0}
                                right={0}
                                bottom={0}
                                bgcolor="rgba(255, 255, 255, 0.6)"
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                zIndex={2}
                            >
                                <Loading />
                            </Box>
                        )}
                        <TabelaConferenciaEstoque
                            key={pagination.page}
                            dados={dadosConferencia}
                            pagination={pagination}
                            onPageChange={(newPage) => {
                                console.log("Atualizando pagina para:", newPage);
                                setPagination(prev => ({ ...prev, page: newPage }));
                            }}
                            onRowsPerPageChange={(perPage) =>
                                setPagination(prev => ({ ...prev, perPage, page: 1 }))
                            }
                            onSalvarConferencia={(id, qtdConferida) =>
                                abrirDialogConferencia(id, qtdConferida)
                            }
                        />
                    </Box>
                </>
            )}
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

