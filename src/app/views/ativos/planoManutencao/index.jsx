import React, { useState, useEffect } from 'react';
import { Breadcrumb } from "app/components";
import { Snackbar, Alert } from "@mui/material";
import { GiGearHammer } from "react-icons/gi";
import ExpandableFilterPanel from '../../../components/HeaderFilterContainer/index';
import ConfirmDialog from '../../../components/Dialogs/ConfirmDialog';
import Loading from '../../../components/MatxLoading';
import DataTable from '../../../components/DataTable';
import styled from "@mui/material/styles/styled";
import Box from "@mui/material/Box";
import ManutencoesForm from "../../../components/Forms/ManutencoesForm";
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
    tipo: '',
    status: '',
    responsavel: '',
    data_execucao: '',
    proxima_prevista: '',
    custo: '',
    observacoes: '',
    idMaquina: '',
    gerar_ordem_servico_auto: true
};

const dateTimeFields = ['data_execucao', 'proxima_prevista'];

const formatDateTimeLocal = (value) => {
    if (!value) return value;
    if (typeof value === 'string') {
        if (value.includes('T')) return value.slice(0, 16);
        return value;
    }
    if (value instanceof Date && !isNaN(value.getTime())) {
        const offsetMs = value.getTimezoneOffset() * 60000;
        return new Date(value.getTime() - offsetMs).toISOString().slice(0, 16);
    }
    return value;
};

const nowDateTimeLocal = () => formatDateTimeLocal(new Date());

const normalizeDates = (obj) => {
    if (!obj) return obj;
    const clone = { ...obj };
    dateTimeFields.forEach((campo) => {
        clone[campo] = formatDateTimeLocal(obj[campo]);
    });
    return clone;
};

const cleanPayload = (obj) => {
    const base = Object.entries(obj).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
            acc[key] = dateTimeFields.includes(key) ? formatDateTimeLocal(value) : value;
        }
        return acc;
    }, {});
    return { ...base, ordemservico: true }; // sempre enviar flag ativa
};

const formatDateTimeBR = (value) => {
    if (!value) return '';
    if (typeof value === 'string' && value.includes('T') && value.length >= 16) {
        const [d, t] = value.split('T');
        const [y, m, day] = d.split('-');
        const [hh, mm] = t.split(':');
        if (y && m && day && hh && mm) return `${day}/${m}/${y} ${hh}:${mm}`;
    }
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
};

export default function PlanoManutencaoMain() {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [idCliente] = useState(() => getIdClienteFromToken());
    const [filters, setFilters] = useState({});
    const [formData, setFormData] = useState({ ...initialFormData, idCliente: getIdClienteFromToken() || null });
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, perPage: 10, total: 0 });
    const [loading, setLoading] = useState(false);
    const [painelExpandido, setPainelExpandido] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [maquinasOptions, setMaquinasOptions] = useState([]);
    const [maquinasMap, setMaquinasMap] = useState({});
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

    const fetchMaquinas = async () => {
        try {
            const cid = idCliente ?? getIdClienteFromToken();
            const query = cid ? `?pagina=1&quantidadePorPagina=200&idCliente=${cid}` : '?pagina=1&quantidadePorPagina=200';
            const res = await fetch(`${apiUrl}/maquinas${query}`);
            const result = await res.json();
            if (!res.ok) return;
            const opts = (result.itens || []).map((m) => ({
                value: m.id,
                label: `${m.codigo_interno || m.id} - ${m.nome || 'Maquina'}`
            }));
            setMaquinasOptions(opts);
            const map = {};
            opts.forEach((o) => { map[o.value] = o.label; });
            setMaquinasMap(map);
        } catch (error) {
            console.error('Erro ao buscar maquinas para select', error);
        }
    };

    const fetchData = async (page = pagination.page, perPage = pagination.perPage, currentFilters = filters) => {
        setLoading(true);
        const cid = idCliente ?? getIdClienteFromToken() ?? formData.idCliente;
        try {
            const params = new URLSearchParams();
            params.set('pagina', page);
            params.set('quantidadePorPagina', perPage);

            Object.entries(currentFilters).forEach(([key, value]) => {
                if (value !== '' && value !== null && value !== undefined) {
                    params.set(key, value);
                }
            });
            if (cid) params.set('idCliente', cid);

            const res = await fetch(`${apiUrl}/manutencoes?${params.toString()}`);
            const result = await res.json();

            if (!res.ok) {
                throw new Error(result?.mensagem || 'Erro ao buscar manutencoes');
            }

            const itens = (result.itens || []).map((m) => ({
                ...m,
                maquinaLabel: maquinasMap[m.idMaquina] || m.idMaquina,
                data_execucao_fmt: formatDateTimeBR(m.data_execucao),
                proxima_prevista_fmt: formatDateTimeBR(m.proxima_prevista)
            }));
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
            console.error('Erro ao buscar manutencoes:', error);
            setSnackbar({
                open: true,
                message: 'Erro ao buscar manutencoes.',
                severity: 'error',
                mensagem: 'Erro ao buscar manutencoes.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = async (id) => {
        try {
            const cid = idCliente ?? getIdClienteFromToken();
            const url = cid ? `${apiUrl}/manutencoes/${id}?idCliente=${cid}` : `${apiUrl}/manutencoes/${id}`;
            const res = await fetch(url);
            const result = await res.json();

            if (res.ok) {
                setFormData({ ...initialFormData, ...normalizeDates(result), gerar_ordem_servico_auto: true, idCliente: cid ?? null });
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
        const cid = idCliente ?? getIdClienteFromToken() ?? form.idCliente;
        if (!cid) {
            setSnackbar({
                open: true,
                message: 'idCliente não encontrado no token.',
                severity: 'error',
                mensagem: 'idCliente não encontrado.'
            });
            return;
        }

        try {
            const payload = cleanPayload({ ...form, id: undefined, idCliente: cid });
            const response = await fetch(`${apiUrl}/manutencoes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                setFormData({ ...initialFormData, idCliente: cid, gerar_ordem_servico_auto: true });
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

        const cid = idCliente ?? getIdClienteFromToken() ?? form.idCliente;
        if (!cid) {
            setSnackbar({
                open: true,
                message: 'idCliente não encontrado no token.',
                severity: 'error',
                mensagem: 'idCliente não encontrado.'
            });
            return;
        }

        try {
            const payload = cleanPayload({ ...form, id: undefined, idCliente: cid });
            const response = await fetch(`${apiUrl}/manutencoes/${form.id}`, {
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
                setFormData({ ...initialFormData, ...normalizeDates(data.atualizado || form), idCliente: cid, gerar_ordem_servico_auto: true });
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
            const response = await fetch(`${apiUrl}/manutencoes/${id}`, {
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

    const handleFechar = async (form) => {
        if (!form.id) {
            setSnackbar({
                open: true,
                message: 'Selecione um registro para fechar.',
                severity: 'warning',
                mensagem: 'Selecione um registro para fechar.'
            });
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/manutencoes/${form.id}/fechar`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();

            if (response.ok) {
                const atualizado = data.manutencao || form;
                setSnackbar({
                    open: true,
                    message: data.mensagem || 'Manutencao concluida e maquina marcada como ativa.',
                    severity: 'success',
                    mensagem: 'Manutencao concluida.'
                });
                setFormData({ ...initialFormData, ...normalizeDates(atualizado) });
                setModoEdicao(false);
                fetchData();
            } else {
                setSnackbar({
                    open: true,
                    message: data.mensagem || 'Erro ao fechar manutencao.',
                    severity: 'error',
                    mensagem: 'Erro ao fechar manutencao.'
                });
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Erro ao fechar manutencao.',
                severity: 'error',
                mensagem: 'Erro ao fechar manutencao.'
            });
        }
    };

    const abrirDialogCadastrar = (form) => {
        setDialog({
            open: true,
            title: 'Confirmar Cadastro',
            description: `Deseja realmente cadastrar a manutencao?`,
            confirmText: 'Cadastrar',
            cancelText: 'Cancelar',
            confirmColor: 'success',
            onConfirm: () => handleCadastrar(form)
        });
    };

    const abrirDialogEditar = (form) => {
        setDialog({
            open: true,
            title: 'Confirmar Edicao',
            description: `Deseja salvar as alteracoes para esta manutencao?`,
            confirmText: 'Salvar',
            cancelText: 'Cancelar',
            confirmColor: 'primary',
            onConfirm: () => handleAtualizar(form)
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
            description: `Deseja realmente excluir a manutencao #${registro.id}?`,
            confirmText: 'Excluir',
            cancelText: 'Cancelar',
            confirmColor: 'error',
            onConfirm: () => handleDeletar(registro.id)
        });
    };

    const abrirDialogFechar = (registro) => {
        if (!registro || !registro.id) {
            setSnackbar({
                open: true,
                message: 'Selecione um registro antes de fechar.',
                severity: 'warning',
                mensagem: 'Selecione um registro antes de fechar.'
            });
            return;
        }

        setDialog({
            open: true,
            title: 'Fechar manutencao',
            description: 'Confirma a conclusao da manutencao e marcacao da maquina como ativa?',
            confirmText: 'Fechar',
            cancelText: 'Cancelar',
            confirmColor: 'success',
            onConfirm: () => handleFechar(registro)
        });
    };

    useEffect(() => {
        fetchMaquinas();
    }, []);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.page, pagination.perPage, maquinasMap]);

    const fields = [
        { name: 'busca', label: 'Busca', type: 'text', placeholder: 'Responsavel ou observacoes' },
        { name: 'tipo', label: 'Tipo', type: 'select', options: [
            { label: 'Preventiva', value: 'preventiva' },
            { label: 'Corretiva', value: 'corretiva' },
            { label: 'Calibracao', value: 'calibracao' }
        ] },
        { name: 'status', label: 'Status', type: 'select', options: [
            { label: 'Planejada', value: 'planejada' },
            { label: 'Em execucao', value: 'em_execucao' },
            { label: 'Concluida', value: 'concluida' },
            { label: 'Cancelada', value: 'cancelada' }
        ] },
        { name: 'idMaquina', label: 'Maquina', type: 'select', options: maquinasOptions.map((m) => ({ label: m.label, value: m.value })) }
    ];

    const columns = [
        { field: 'id', headerName: '#', width: 70 },
        { field: 'tipo', headerName: 'Tipo', width: 120 },
        { field: 'status', headerName: 'Status', width: 130 },
        { field: 'maquinaLabel', headerName: 'Maquina', flex: 1 },
        { field: 'data_execucao_fmt', headerName: 'Execucao', width: 160, maxWidth: 170 },
        { field: 'proxima_prevista_fmt', headerName: 'Proxima prevista', width: 170, maxWidth: 180 },
        { field: 'responsavel', headerName: 'Responsavel', width: 160 },
        { field: 'custo', headerName: 'Custo', width: 100 },
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
                        { name: "Ativos", path: "/ativos/planomanutencao" },
                        {
                            name: (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <GiGearHammer style={{ marginRight: 6 }} />
                                    Plano de Manutencao
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
                title="Filtros de Manutencoes"
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

            <ManutencoesForm
                valores={formData}
                modoEdicao={modoEdicao}
                maquinasOptions={maquinasOptions}
                onChange={setFormField}
                onRequestSubmit={(form) =>
                    modoEdicao
                        ? abrirDialogEditar(form)
                        : abrirDialogCadastrar(form)
                }
                onRequestDelete={() => abrirDialogExcluir(formData)}
                onRequestFechar={() => abrirDialogFechar(formData)}
                onClearAll={() => {
                    setModoEdicao(false);
                    setFormData(initialFormData);
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
