import React, { useState, useEffect } from 'react';
import { Breadcrumb } from "app/components";
import { Snackbar, Alert } from "@mui/material";
import { GiSewingMachine } from "react-icons/gi";
import ExpandableFilterPanel from '../../../components/HeaderFilterContainer/index';
import ConfirmDialog from '../../../components/Dialogs/ConfirmDialog';
import Loading from '../../../components/MatxLoading';
import DataTable from '../../../components/DataTable';
import styled from "@mui/material/styles/styled";
import Box from "@mui/material/Box";
import MaquinasForm from "../../../components/Forms/MaquinasForm";
import { getIdClienteFromToken } from "../../../utils/authToken";

const Container = styled("div")(({ theme }) => ({
    margin: "30px",
    [theme.breakpoints.down("sm")]: { margin: "16px" },
    "& .breadcrumb": {
        marginBottom: "30px",
        [theme.breakpoints.down("sm")]: { marginBottom: "16px" }
    }
}));

const initialFormData = {
    id: null,
    idCliente: null,
    codigo_interno: '',
    nome: '',
    descricao: '',
    tipo: '',
    setor: '',
    fabricante: '',
    modelo: '',
    numero_serie: '',
    status: '',
    localizacao: '',
    ano_fabricacao: '',
    data_aquisicao: '',
    proxima_manutencao: '',
    ultima_manutencao: '',
    valor_aquisicao: '',
    mtbf: '',
    mttr: ''
};

const dateFields = ['data_aquisicao', 'proxima_manutencao', 'ultima_manutencao', 'garantia_ate'];

const normalizeDateValue = (value) => {
    if (!value) return value;
    if (typeof value === 'string') {
        if (value.includes('T')) return value.split('T')[0];
        return value;
    }
    if (value instanceof Date && !isNaN(value.getTime())) {
        return value.toISOString().slice(0, 10);
    }
    return value;
};

const normalizeDates = (obj) => {
    if (!obj) return obj;
    const clone = { ...obj };
    dateFields.forEach((campo) => {
        clone[campo] = normalizeDateValue(obj[campo]);
    });
    return clone;
};

const cleanPayload = (obj) => {
    return Object.entries(obj).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
            acc[key] = dateFields.includes(key) ? normalizeDateValue(value) : value;
        }
        return acc;
    }, {});
};

export default function MaquinasMain() {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [idCliente, setIdCliente] = useState(() => getIdClienteFromToken());
    const [filters, setFilters] = useState({});
    const [formData, setFormData] = useState({ ...initialFormData, idCliente: getIdClienteFromToken() || null });
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

    const setFormField = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFilter = () => {
        setPagination((prev) => ({ ...prev, page: 1 }));
        fetchData(1, pagination.perPage, filters);
    };

    const handleChange = (name, value) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleClear = () => {
        setFilters({});
        setPagination((prev) => ({ ...prev, page: 1 }));
        fetchData(1, pagination.perPage, {});
    };

    const fetchData = async (page = pagination.page, perPage = pagination.perPage, currentFilters = filters) => {
        setLoading(true);
        const resolvedIdCliente = idCliente ?? getIdClienteFromToken() ?? formData.idCliente;
        try {
            const params = new URLSearchParams();
            params.set('pagina', page);
            params.set('quantidadePorPagina', perPage);

            Object.entries(currentFilters).forEach(([key, value]) => {
                if (value !== '' && value !== null && value !== undefined) {
                    params.set(key, value);
                }
            });
            if (resolvedIdCliente) params.set('idCliente', resolvedIdCliente);

            const res = await fetch(`${apiUrl}/maquinas?${params.toString()}`);
            const result = await res.json();

            if (!res.ok) {
                throw new Error(result?.mensagem || 'Erro ao buscar maquinas');
            }

            const itens = result.itens || [];
            setData(itens);
            setPagination({
                page: result.pagina || page,
                perPage: result.quantidadePorPagina || perPage,
                total: result.total || 0
            });

            if ((result.total || 0) === 0) {
                setSnackbar({
                    open: true,
                    message: 'Nenhum registro encontrado.',
                    severity: 'info',
                    mensagem: 'Nenhum registro encontrado.'
                });
            }
        } catch (error) {
            console.error('Erro ao buscar maquinas:', error);
            setSnackbar({
                open: true,
                message: 'Erro ao buscar maquinas.',
                severity: 'error',
                mensagem: 'Erro ao buscar maquinas.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = async (id) => {
        try {
            const clientId = idCliente ?? getIdClienteFromToken();
            const url = clientId ? `${apiUrl}/maquinas/${id}?idCliente=${clientId}` : `${apiUrl}/maquinas/${id}`;
            const res = await fetch(url);
            const result = await res.json();

            if (res.ok) {
                setFormData({ ...initialFormData, ...normalizeDates(result), idCliente: clientId ?? null });
                setModoEdicao(true);
                setPainelExpandido(false);
                setSnackbar({
                    open: true,
                    message: result.mensagem || 'Registro selecionado.',
                    severity: 'info',
                    mensagem: 'Selecionado'
                });
            } else {
                setSnackbar({
                    open: true,
                    message: result.mensagem || 'Erro ao selecionar o registro!',
                    severity: 'error',
                    mensagem: 'Erro ao selecionar o registro!'
                });
            }
        } catch (err) {
            setSnackbar({
                open: true,
                message: 'Erro ao selecionar o registro!',
                severity: 'error',
                mensagem: 'Erro ao selecionar o registro!'
            });
        }
    };

    const handleCadastrar = async (form) => {
        const clientId = Number(idCliente ?? getIdClienteFromToken() ?? form.idCliente);
        if (!clientId) {
            setSnackbar({
                open: true,
                message: 'idCliente não encontrado no token.',
                severity: 'error',
                mensagem: 'idCliente não encontrado.'
            });
            return;
        }
        try {
            const payload = cleanPayload({ ...form, id: undefined, idCliente: clientId });
            const response = await fetch(`${apiUrl}/maquinas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                setFormData({ ...initialFormData, idCliente: clientId });
                setModoEdicao(false);
                fetchData();
                setSnackbar({
                    open: true,
                    message: data.mensagem || 'Registro cadastrado com sucesso!',
                    severity: 'success',
                    mensagem: 'Cadastrado com sucesso!'
                });
            } else {
                setSnackbar({
                    open: true,
                    message: data.mensagem || 'Erro ao cadastrar o registro!',
                    severity: 'error',
                    mensagem: 'Erro ao cadastrar o registro!'
                });
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Erro ao cadastrar o registro!',
                severity: 'error',
                mensagem: 'Erro ao cadastrar o registro!'
            });
        }
    };

    const handleAtualizar = async (form) => {
        if (!form.id) {
            setSnackbar({
                open: true,
                message: 'Selecione um registro para editar.',
                severity: 'warning',
                mensagem: 'Selecione um registro para editar.'
            });
            return;
        }

        if (!idCliente) {
            setSnackbar({
                open: true,
                message: 'idCliente não encontrado no token.',
                severity: 'error',
                mensagem: 'idCliente não encontrado.'
            });
            return;
        }

        try {
            const payload = cleanPayload({ ...form, id: undefined, idCliente });
            const response = await fetch(`${apiUrl}/maquinas/${form.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                setSnackbar({
                    open: true,
                    message: data.mensagem || 'Registro atualizado com sucesso!',
                    severity: 'success',
                    mensagem: 'Registro atualizado com sucesso!'
                });
                setFormData({ ...initialFormData, ...normalizeDates(data.atualizado || form), idCliente });
                setModoEdicao(false);
                fetchData();
            } else {
                setSnackbar({
                    open: true,
                    message: data.mensagem || 'Erro ao atualizar o registro.',
                    severity: 'error',
                    mensagem: 'Erro ao atualizar o registro.'
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
        if (!id) {
            setSnackbar({
                open: true,
                message: 'Selecione um registro antes de excluir.',
                severity: 'warning',
                mensagem: 'Selecione um registro antes de excluir.'
            });
            return;
        }

        try {
            const url = idCliente ? `${apiUrl}/maquinas/${id}?idCliente=${idCliente}` : `${apiUrl}/maquinas/${id}`;
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                setSnackbar({
                    open: true,
                    message: data.mensagem || 'Registro excluido com sucesso!',
                    severity: 'success',
                    mensagem: 'Registro excluido com sucesso!'
                });
                setFormData(initialFormData);
                setModoEdicao(false);
                fetchData();
            } else {
                setSnackbar({
                    open: true,
                    message: data.mensagem || 'Erro ao excluir o registro.',
                    severity: 'error',
                    mensagem: 'Erro ao excluir o registro.'
                });
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Erro ao excluir o registro.',
                severity: 'error',
                mensagem: 'Erro ao excluir o registro.'
            });
        }
    };

    const abrirDialogCadastrar = (form) => {
        setDialog({
            open: true,
            title: 'Confirmar Cadastro',
            description: `Deseja realmente cadastrar "${form.nome || ''}"?`,
            confirmText: 'Cadastrar',
            cancelText: 'Cancelar',
            confirmColor: 'success',
            onConfirm: () => handleCadastrar({ ...form, idCliente })
        });
    };

    const abrirDialogEditar = (form) => {
        setDialog({
            open: true,
            title: 'Confirmar Edicao',
            description: `Deseja salvar as alteracoes para "${form.nome || ''}"?`,
            confirmText: 'Salvar',
            cancelText: 'Cancelar',
            confirmColor: 'primary',
            onConfirm: () => handleAtualizar({ ...form, idCliente })
        });
    };

    const abrirDialogExcluir = (registro) => {
        if (!registro || !registro.id) {
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
            title: 'Confirmar Exclusao',
            description: `Deseja realmente excluir o registro "${registro.nome || registro.codigo_interno || ''}"?`,
            confirmText: 'Excluir',
            cancelText: 'Cancelar',
            confirmColor: 'error',
            onConfirm: () => handleDeletar(registro.id)
        });
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.page, pagination.perPage]);

    const fields = [
        { name: 'busca', label: 'Busca geral', type: 'text', placeholder: 'Nome, codigo, modelo, numero de serie' },
        { name: 'setor', label: 'Setor', type: 'text', placeholder: 'Ex: Producao' },
        { name: 'tipo', label: 'Tipo', type: 'text', placeholder: 'Ex: Corte, Montagem' },
        { name: 'status', label: 'Status', type: 'text', placeholder: 'Ex: ativa, em_manutencao' },
        { name: 'fabricante', label: 'Fabricante', type: 'text', placeholder: 'Ex: ACME' },
        { name: 'modelo', label: 'Modelo', type: 'text', placeholder: 'Ex: X200' },
        { name: 'localizacao', label: 'Localizacao', type: 'text', placeholder: 'Ex: Galpao A' },
        { name: 'ano_fabricacao_de', label: 'Ano fab. de', type: 'number', placeholder: 'Ex: 2020' },
        { name: 'ano_fabricacao_ate', label: 'Ano fab. ate', type: 'number', placeholder: 'Ex: 2024' },
        { name: 'data_aquisicao_de', label: 'Aquisicao de', type: 'date' },
        { name: 'data_aquisicao_ate', label: 'Aquisicao ate', type: 'date' },
        { name: 'proxima_manutencao_ate', label: 'Proxima manutencao ate', type: 'date' }
    ];

    const columns = [
        { field: 'codigo_interno', headerName: 'Codigo', width: 140 },
        { field: 'nome', headerName: 'Nome', flex: 1 },
        { field: 'tipo', headerName: 'Tipo', width: 120 },
        { field: 'setor', headerName: 'Setor', width: 140 },
        { field: 'fabricante', headerName: 'Fabricante', width: 140 },
        { field: 'modelo', headerName: 'Modelo', width: 130 },
        { field: 'status', headerName: 'Status', width: 140 },
        { field: 'localizacao', headerName: 'Localizacao', width: 180 },
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
                        { name: "Ativos", path: "/maquinas" },
                        {
                            name: (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <GiSewingMachine style={{ marginRight: 6 }} />
                                    Maquinas
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
                title="Filtros de Maquinas"
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

            <MaquinasForm
                valores={formData}
                modoEdicao={modoEdicao}
                onChange={setFormField}
                onRequestSubmit={(form) =>
                    modoEdicao
                        ? abrirDialogEditar(form)
                        : abrirDialogCadastrar(form)
                }
                onRequestDelete={() => abrirDialogExcluir(formData)}
                onClearAll={() => {
                    setModoEdicao(false);
                    setFormData({ ...initialFormData, idCliente });
                }}
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
    );
}
