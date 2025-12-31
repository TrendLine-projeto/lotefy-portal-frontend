
import React, { useState, useEffect } from 'react';
import { Breadcrumb } from "app/components";
import { Snackbar, Alert } from "@mui/material";
import { EstoqueInsumosTecnicos } from '../../../components/Forms/EstoqueInsumosTecnicos';
import { GiWireCoil } from "react-icons/gi";
import ExpandableFilterPanel from '../../../components/HeaderFilterContainer/index';
import ConfirmDialog from '../../../components/Dialogs/ConfirmDialog';
import Loading from '../../../components/MatxLoading';
import DataTable from '../../../components/DataTable';
import styled from "@mui/material/styles/styled";
import Box from "@mui/material/Box";
import { getIdClienteFromToken } from "../../../utils/authToken";

const Container = styled("div")(({ theme }) => ({
    margin: "30px",
    [theme.breakpoints.down("sm")]: { margin: "16px" },
    "& .breadcrumb": {
        marginBottom: "30px",
        [theme.breakpoints.down("sm")]: { marginBottom: "16px" }
    }
}));

export default function SuprimentosTecnicosMain() {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [idCliente] = useState(() => getIdClienteFromToken());
    const [filters, setFilters] = useState({});
    const [dataSelecionado, setDataSelecionado] = useState(null);
    const [data, setData] = useState([]);
    const [tiposProduto, setTiposProduto] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, perPage: 10, total: 0 });
    const [loading, setLoading] = useState(false);
    const [painelExpandido, setPainelExpandido] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(true);
    const [fornecedores, setFornecedores] = useState([]);
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
        setDataSelecionado(null);
        setPagination((prev) => ({ ...prev, page: 1 }));
        fetchData();
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}/estoqueInsumos/estoque_insumo/buscar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...filters,
                    idCliente,
                    pagina: pagination.page,
                    quantidadePorPagina: pagination.perPage
                })
            });
            const result = await res.json();

            if (result.mensagem === "Nenhuma registro encontrado.") {
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
                    mensagem: 'Nenhum registro encontrado'
                });
            } else {
                setData(result.materiais.map(f => ({
                    ...f,
                    ativo: f.ativo === 1 ? 'Sim' : 'Não'
                })));
                setPagination({
                    page: result.paginaAtual,
                    perPage: result.quantidadePorPagina,
                    total: result.totalRegistros
                });
            }
        } catch (error) {
            console.error('Erro ao buscar o registro:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = async (id) => {
        try {
            const res = await fetch(`${apiUrl}/estoqueInsumos/estoque_insumo/${id}`);
            const result = await res.json();
            setDataSelecionado(result.insumoTecnico);

            if (res.ok) {
                setDataSelecionado(result.insumoTecnico);
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
                    message: data.mensagem || 'Erro ao selecionar o registro!',
                    severity: 'error',
                    mensagem: 'Erro ao selecionar o registro!'
                });
            }
        } catch (err) {
            setSnackbar({
                open: true,
                message: data.mensagem || 'Erro ao selecionar o registro!',
                severity: 'error',
                mensagem: 'Erro ao selecionar o registro!'
            });
        }
    };

    const handleCadastrar = async (formData) => {
        try {
            const response = await fetch(`${apiUrl}/estoqueInsumos/estoque_insumo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    idCliente: idCliente || formData.idCliente
                })
            });

            const data = await response.json();

            if (response.ok) {
                setDataSelecionado(null);
                fetchData();
                setSnackbar({
                    open: true,
                    message: data.mensagem || 'Registro cadastrado com sucesso!',
                    severity: 'success',
                    mensagem: 'Cadastrado realizado com sucesso'
                });
            } else {
                setSnackbar({
                    open: true,
                    message: data.mensagem || 'Erro ao cadastrado o registro!',
                    severity: 'error',
                    mensagem: 'Erro ao cadastrado o registro!'
                });
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: data.mensagem || 'Erro ao cadastrado o registro!',
                severity: 'error',
                mensagem: 'Erro ao cadastrado o registro!'
            });
        }
    };

    const handleAtualizar = async (formData) => {
        try {
            const camposIgnorados = ['fornecedorNome', 'fornecedorAtivo', 'criadoEm', 'fornecedorNome', 'fornecedorAtivo'];
            const response = await fetch(`${apiUrl}/estoqueInsumos/estoque_insumo/editar/${formData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...Object.fromEntries(
                        Object.entries(formData).filter(([key]) => !camposIgnorados.includes(key))
                    ),
                    idCliente: idCliente || formData.idCliente || 1
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSnackbar({
                    open: true,
                    message: data.mensagem || 'Registro tualizado com sucesso!',
                    severity: 'success',
                    mensagem: 'Registro atualizado com sucesso!'
                });
                setDataSelecionado(null);
                setModoEdicao(false);
                fetchData();
            } else {
                setSnackbar({
                    open: true,
                    message: data.mensagem || 'Erro ao atualizar o registro.',
                    severity: 'error',
                    mensagem: 'Registro atualizado com sucesso!'
                });
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Erro ao atualizar o registro.',
                severity: 'error'
            });
        }
    };

    const handleDeletar = async (id) => {
        try {
            const response = await fetch(`${apiUrl}/estoqueInsumos/estoque_insumo/deletar/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                setSnackbar({
                    open: true,
                    message: data.mensagem || 'Registro excluído com sucesso!',
                    severity: 'success',
                    mensagem: 'Registro excluído com sucesso!'
                });
                setDataSelecionado(null);
                setModoEdicao(false);
                fetchData();
            } else {
                setSnackbar({
                    open: true,
                    message: data.mensagem || 'Erro ao excluir o Registro.',
                    severity: 'error',
                    mensagem: 'Erro ao excluir o Registro.'
                });
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Erro ao excluir o Registro.',
                severity: 'error',
                mensagem: 'Erro ao excluir o Registro.'
            });
        }
    };

    const abrirDialogCadastrar = (formData) => {
        setDialog({
            open: true,
            title: 'Confirmar Cadastro',
            description: `Deseja realmente cadastrar o registro "${formData.nome}"?`,
            confirmText: 'Cadastrar',
            cancelText: 'Cancelar',
            confirmColor: 'success',
            onConfirm: () => handleCadastrar(formData)
        });
    };

    const abrirDialogEditar = (formData) => {
        setDialog({
            open: true,
            title: 'Confirmar Edição',
            description: `Deseja salvar as alterações para "${formData.nome}"?`,
            confirmText: 'Salvar',
            cancelText: 'Cancelar',
            confirmColor: 'primary',
            onConfirm: () => handleAtualizar(formData)
        });
    };

    const abrirDialogExcluir = (materiais) => {
        if (!materiais || !materiais.id) {
            setSnackbar({
                open: true,
                message: 'Selecione um registro antes de excluir.',
                severity: 'warning',
                mensagem: 'Selecione um registro antes de excluir.'
            });
            return;
        }

        setDialog({
            open: true,
            title: 'Confirmar Exclusão',
            description: `Deseja realmente excluir o registro "${materiais.razaoSocial}"?`,
            confirmText: 'Excluir',
            cancelText: 'Cancelar',
            confirmColor: 'error',
            onConfirm: () => handleDeletar(materiais.id)
        });
    };

    useEffect(() => {
        fetchData();
    }, [pagination.page, pagination.perPage]);

    useEffect(() => {
        const fetchFornecedores = async () => {
            try {
                const response = await fetch(`${apiUrl}/fornecedorSupri/fornecedores_suprimentos/lista_simples`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cliente_id: 1 })
                });

                const data = await response.json();

                if (response.ok) {
                    setFornecedores(data.fornecedores);
                } else {
                    console.error('Erro ao buscar fornecedores:', data.mensagem);
                }
            } catch (err) {
                console.error('Erro ao buscar fornecedores:', err);
            }
        };

        const fetchTiposProduto = async () => {
            try {
                const response = await fetch(`${apiUrl}/tipoProdutos/tipos_produto?categoria=insumo`);
                const data = await response.json();

                if (response.ok) {
                    setTiposProduto(data.tipos || []);
                } else {
                    console.error('Erro ao buscar tipos de produto:', data.mensagem);
                }
            } catch (err) {
                console.error('Erro ao buscar tipos de produto:', err);
            }
        };

        fetchFornecedores();
        fetchTiposProduto();
    }, []);

    const fields = [
        {
            name: 'nome',
            label: 'Nome da Matéria-prima',
            type: 'text',
            placeholder: 'Ex: Tecido Tricoline'
        },
        {
            name: 'tipo',
            label: 'Tipo',
            type: 'text',
            placeholder: 'Ex: tecido, linha, zíper...'
        },
        {
            name: 'marca',
            label: 'Marca',
            type: 'text',
            placeholder: 'Ex: Têxtil Brasil'
        },
        {
            name: 'unidade',
            label: 'Unidade',
            type: 'select',
            options: [
                { label: 'Centímetro (cm)', value: 'CM' },
                { label: 'Metro (m)', value: 'M' },
                { label: 'Milímetro (mm)', value: 'MM' },
                { label: 'Quilômetro (km)', value: 'KM' },
                { label: 'Polegada (in)', value: 'IN' },
                { label: 'Peça (un)', value: 'UN' },
                { label: 'Rolo', value: 'Rolo' },
            ]
        },
        {
            name: 'localArmazenamento',
            label: 'Local de Armazenamento',
            type: 'text',
            placeholder: 'Ex: Prateleira 2A'
        }
    ];

    const columns = [
        { field: 'nome', headerName: 'Nome', flex: 1 },
        { field: 'marca', headerName: 'Marca', flex: 1 },
        { field: 'quantidade', headerName: 'Qtd. Estoque', width: 130 },
        { field: 'unidade', headerName: 'Unidade', width: 100 },
        { field: 'fornecedorNome', headerName: 'Fornecedor', flex: 1 },
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
                        { name: "Estoque", path: "/material" },
                        {
                            name: (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <GiWireCoil style={{ marginRight: 6 }} />
                                    Insumo Técnico
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
                title="Filtros de Insumos Técnicos"
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

            <EstoqueInsumosTecnicos
                materiais={dataSelecionado}
                modoEdicao={modoEdicao}
                fornecedores={fornecedores}
                tiposProduto={tiposProduto}
                onRequestSubmit={(formData) =>
                    modoEdicao
                        ? abrirDialogEditar(formData)
                        : abrirDialogCadastrar(formData)
                }
                onRequestDelete={(formData) => abrirDialogExcluir(formData)}
                onClearAll={() => {
                    setDataSelecionado(null);
                    setModoEdicao(false);
                }}
                onEditClick={() => setModoEdicao(true)}
            />

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
