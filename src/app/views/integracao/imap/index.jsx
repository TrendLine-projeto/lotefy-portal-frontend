import React, { useEffect, useMemo, useState } from 'react';
import { Breadcrumb } from "app/components";
import { Alert, Snackbar } from "@mui/material";
import { MdEmail } from "react-icons/md";
import ExpandableFilterPanel from '../../../components/HeaderFilterContainer/index';
import ConfirmDialog from '../../../components/Dialogs/ConfirmDialog';
import Loading from '../../../components/MatxLoading';
import DataTable from '../../../components/DataTable';
import IntegracaoImapForm from '../../../components/Forms/IntegracaoImapForm';
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

const defaultFormValues = {
    host: '',
    port: 0,
    secure: true,
    user_email: '',
    password_encrypted: '',
    mailbox: '',
    since_days: 0,
    unseen_only: true,
    mark_seen: true,
    from_filter: '',
    subject_contains: '',
    max_results: 0,
    parse_timeout_ms: 0,
    store_password: false,
    ativo: true,
};

const normalizeNumber = (value) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
};

const normalizeText = (value) => {
    if (value === null || value === undefined) return undefined;
    const trimmed = String(value).trim();
    return trimmed === '' ? undefined : trimmed;
};

const normalizeOptionalText = (value) => {
    if (value === null || value === undefined) return null;
    const trimmed = String(value).trim();
    return trimmed === '' ? null : trimmed;
};

const applyFilters = (rows, filtros) => {
    const host = (filtros.host || '').toLowerCase();
    const userEmail = (filtros.user_email || '').toLowerCase();
    const mailbox = (filtros.mailbox || '').toLowerCase();
    const fromFilter = (filtros.from_filter || '').toLowerCase();
    const subject = (filtros.subject_contains || '').toLowerCase();
    const ativo = filtros.ativo === true;

    return rows.filter((row) => {
        if (host && !String(row.host || '').toLowerCase().includes(host)) return false;
        if (userEmail && !String(row.user_email || '').toLowerCase().includes(userEmail)) return false;
        if (mailbox && !String(row.mailbox || '').toLowerCase().includes(mailbox)) return false;
        if (fromFilter && !String(row.from_filter || '').toLowerCase().includes(fromFilter)) return false;
        if (subject && !String(row.subject_contains || '').toLowerCase().includes(subject)) return false;
        if (ativo && !row.ativo) return false;
        return true;
    });
};

export default function IntegracaoImapMain() {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [idCliente] = useState(() => getIdClienteFromToken());
    const [filters, setFilters] = useState({});
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, perPage: 10, total: 0 });
    const [loading, setLoading] = useState(false);
    const [painelExpandido, setPainelExpandido] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [formValues, setFormValues] = useState(defaultFormValues);
    const [actionLoading, setActionLoading] = useState(false);
    const [importarTodas, setImportarTodas] = useState(false);
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

    const showSnackbar = (message, severity, mensagem) => {
        setSnackbar({ open: true, message, severity, mensagem });
    };

    const buildPayload = (values, includePassword) => {
        const payload = {
            cliente_id: idCliente,
            host: normalizeText(values.host),
            port: normalizeNumber(values.port),
            secure: Boolean(values.secure),
            user_email: normalizeText(values.user_email),
            mailbox: normalizeText(values.mailbox),
            since_days: normalizeNumber(values.since_days),
            unseen_only: Boolean(values.unseen_only),
            mark_seen: Boolean(values.mark_seen),
            from_filter: normalizeOptionalText(values.from_filter),
            subject_contains: normalizeOptionalText(values.subject_contains),
            max_results: normalizeNumber(values.max_results),
            parse_timeout_ms: normalizeNumber(values.parse_timeout_ms),
            store_password: Boolean(values.store_password),
            ativo: Boolean(values.ativo),
        };

        if (includePassword) {
            payload.password_encrypted = normalizeText(values.password_encrypted);
        }

        return Object.fromEntries(
            Object.entries(payload).filter(([, value]) => value !== undefined)
        );
    };

    const fetchData = async () => {
        if (!idCliente) {
            showSnackbar('Cliente nao encontrado no token.', 'warning', 'Cliente nao encontrado');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}/integration/imap/buscar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cliente_id: idCliente })
            });

            const result = await res.json();

            if (!res.ok) {
                showSnackbar(result?.mensagem || 'Erro ao buscar configuracoes.', 'error', 'Erro ao buscar');
                setData([]);
                setFilteredData([]);
                return;
            }

            const configs = Array.isArray(result.configuracoes) ? result.configuracoes : [];
            setData(configs);
            const filtered = Object.keys(filters).length ? applyFilters(configs, filters) : configs;
            setFilteredData(filtered);
            setPagination((prev) => ({
                ...prev,
                page: 1,
                total: filtered.length
            }));
        } catch (error) {
            console.error('Erro ao buscar configuracoes IMAP:', error);
            showSnackbar('Erro ao buscar configuracoes IMAP.', 'error', 'Erro ao buscar');
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = () => {
        const filtered = applyFilters(data, filters);
        setFilteredData(filtered);
        setPagination((prev) => ({ ...prev, page: 1, total: filtered.length }));
    };

    const handleChange = (name, value) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleClear = () => {
        setFilters({});
        setFilteredData(data);
        setPagination((prev) => ({ ...prev, page: 1, total: data.length }));
    };

    const handleSelect = async (id) => {
        try {
            const res = await fetch(`${apiUrl}/integration/imap/${id}`);
            const result = await res.json();

            if (!res.ok) {
                showSnackbar(result?.mensagem || 'Erro ao selecionar configuracao.', 'error', 'Erro ao selecionar');
                return;
            }

            const config = result?.configuracao || {};
            setFormValues({
                ...defaultFormValues,
                ...config,
            });
            setModoEdicao(true);
            setPainelExpandido(false);
            showSnackbar(result?.mensagem || 'Configuracao selecionada.', 'info', 'Selecionado');
        } catch (error) {
            console.error('Erro ao selecionar configuracao IMAP:', error);
            showSnackbar('Erro ao selecionar configuracao.', 'error', 'Erro ao selecionar');
        }
    };

    const handleCadastrar = async (values) => {
        const payload = buildPayload(values, true);

        if (!payload.host || !payload.user_email || !payload.password_encrypted) {
            showSnackbar('Preencha host, email e senha.', 'warning', 'Campos obrigatorios');
            return;
        }

        setActionLoading(true);
        try {
            const response = await fetch(`${apiUrl}/integration/imap`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                showSnackbar(result?.mensagem || 'Configuracao criada.', 'success', 'Configuracao criada');
                setFormValues(defaultFormValues);
                setModoEdicao(false);
                fetchData();
            } else {
                showSnackbar(result?.mensagem || 'Erro ao criar configuracao.', 'error', 'Erro ao criar');
            }
        } catch (error) {
            console.error('Erro ao criar configuracao IMAP:', error);
            showSnackbar('Erro ao criar configuracao.', 'error', 'Erro ao criar');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAtualizar = async (values) => {
        if (!values?.id) {
            showSnackbar('Selecione uma configuracao para editar.', 'warning', 'Selecione uma configuracao');
            return;
        }

        const payload = buildPayload(values, Boolean(values.password_encrypted));
        if (!values.password_encrypted) {
            delete payload.password_encrypted;
        }

        setActionLoading(true);
        try {
            const response = await fetch(`${apiUrl}/integration/imap/alterar/${values.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                showSnackbar(result?.mensagem || 'Configuracao atualizada.', 'success', 'Configuracao atualizada');
                setFormValues((prev) => ({ ...prev, password_encrypted: '' }));
                setModoEdicao(true);
                fetchData();
            } else {
                showSnackbar(result?.mensagem || 'Erro ao atualizar configuracao.', 'error', 'Erro ao atualizar');
            }
        } catch (error) {
            console.error('Erro ao atualizar configuracao IMAP:', error);
            showSnackbar('Erro ao atualizar configuracao.', 'error', 'Erro ao atualizar');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeletar = async (values) => {
        if (!values?.id) {
            showSnackbar('Selecione uma configuracao para excluir.', 'warning', 'Selecione uma configuracao');
            return;
        }

        setActionLoading(true);
        try {
            const response = await fetch(`${apiUrl}/integration/imap/deletar/${values.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            const result = await response.json();

            if (response.ok) {
                showSnackbar(result?.mensagem || 'Configuracao removida.', 'success', 'Configuracao removida');
                setFormValues(defaultFormValues);
                setModoEdicao(false);
                fetchData();
            } else {
                showSnackbar(result?.mensagem || 'Erro ao remover configuracao.', 'error', 'Erro ao remover');
            }
        } catch (error) {
            console.error('Erro ao remover configuracao IMAP:', error);
            showSnackbar('Erro ao remover configuracao.', 'error', 'Erro ao remover');
        } finally {
            setActionLoading(false);
        }
    };

    const handleImportar = async (values) => {
        if (!importarTodas && !values?.id) {
            showSnackbar('Selecione uma configuracao para importar.', 'warning', 'Selecione uma configuracao');
            return;
        }

        setActionLoading(true);
        try {
            const response = await fetch(`${apiUrl}/integration/gmail/importar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cliente_id: idCliente,
                    config_id: values?.id,
                    todas: importarTodas
                })
            });

            const result = await response.json();

            if (response.ok) {
                const resumo = result?.resumo;
                const resumoTexto = resumo
                    ? `Processadas ${resumo.processadas || 0}, novas ${resumo.novas || 0}, duplicadas ${resumo.duplicadas || 0}`
                    : 'Importacao concluida';
                showSnackbar(result?.mensagem || 'Importacao concluida.', 'success', resumoTexto);
            } else {
                showSnackbar(result?.mensagem || 'Erro ao importar.', 'error', 'Erro ao importar');
            }
        } catch (error) {
            console.error('Erro ao importar:', error);
            showSnackbar('Erro ao importar.', 'error', 'Erro ao importar');
        } finally {
            setActionLoading(false);
        }
    };

    const handleTestarConexao = async (values) => {
        if (!idCliente) {
            showSnackbar('Cliente nao encontrado no token.', 'warning', 'Cliente nao encontrado');
            return;
        }

        const payload = buildPayload(values, Boolean(values.password_encrypted));
        if (values?.id) {
            payload.config_id = values.id;
        }

        if (!payload.host || !payload.user_email) {
            showSnackbar('Preencha host e email para testar.', 'warning', 'Campos obrigatorios');
            return;
        }

        setActionLoading(true);
        try {
            const response = await fetch(`${apiUrl}/integration/imap/testar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                showSnackbar(result?.mensagem || 'Conexao OK.', 'success', 'Conexao OK');
            } else {
                showSnackbar(result?.mensagem || 'Erro ao testar conexao.', 'error', 'Erro ao testar');
            }
        } catch (error) {
            console.error('Erro ao testar conexao IMAP:', error);
            showSnackbar('Erro ao testar conexao.', 'error', 'Erro ao testar');
        } finally {
            setActionLoading(false);
        }
    };

    const abrirDialogCadastrar = (values) => {
        setDialog({
            open: true,
            title: 'Confirmar cadastro',
            description: 'Deseja cadastrar esta configuracao IMAP?',
            confirmText: 'Cadastrar',
            cancelText: 'Cancelar',
            confirmColor: 'success',
            onConfirm: () => handleCadastrar(values)
        });
    };

    const abrirDialogEditar = (values) => {
        setDialog({
            open: true,
            title: 'Confirmar edicao',
            description: 'Deseja salvar as alteracoes desta configuracao?',
            confirmText: 'Salvar',
            cancelText: 'Cancelar',
            confirmColor: 'primary',
            onConfirm: () => handleAtualizar(values)
        });
    };

    const abrirDialogExcluir = (values) => {
        if (!values?.id) {
            showSnackbar('Selecione uma configuracao para excluir.', 'warning', 'Selecione uma configuracao');
            return;
        }
        setDialog({
            open: true,
            title: 'Confirmar exclusao',
            description: 'Deseja excluir esta configuracao IMAP?',
            confirmText: 'Excluir',
            cancelText: 'Cancelar',
            confirmColor: 'error',
            onConfirm: () => handleDeletar(values)
        });
    };

    const abrirDialogImportar = (values) => {
        if (!importarTodas && !values?.id) {
            showSnackbar('Selecione uma configuracao para importar.', 'warning', 'Selecione uma configuracao');
            return;
        }
        setDialog({
            open: true,
            title: 'Confirmar importacao',
            description: importarTodas
                ? 'Deseja importar todas as configuracoes ativas?'
                : 'Deseja iniciar a importacao agora?',
            confirmText: 'Importar',
            cancelText: 'Cancelar',
            confirmColor: 'primary',
            onConfirm: () => handleImportar(values)
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fields = [
        { name: 'host', label: 'Host', type: 'text', placeholder: 'imap.gmail.com' },
        { name: 'user_email', label: 'Email da caixa', type: 'text', placeholder: 'email@dominio.com' },
        { name: 'mailbox', label: 'Mailbox', type: 'text', placeholder: 'INBOX' },
        { name: 'from_filter', label: 'Remetente (from)', type: 'text', placeholder: 'cliente@dominio.com' },
        { name: 'subject_contains', label: 'Assunto', type: 'text', placeholder: 'NF XML' },
        { name: 'ativo', label: 'Ativo', type: 'checkbox' },
    ];

    const columns = useMemo(() => ([
        { field: 'host', headerName: 'Host' },
        { field: 'user_email', headerName: 'Email' },
        { field: 'mailbox', headerName: 'Mailbox' },
        {
            field: 'unseen_only',
            headerName: 'Unseen',
            renderCell: (row) => (row.unseen_only ? 'Sim' : 'Nao')
        },
        {
            field: 'mark_seen',
            headerName: 'Mark seen',
            renderCell: (row) => (row.mark_seen ? 'Sim' : 'Nao')
        },
        {
            field: 'ativo',
            headerName: 'Ativa',
            renderCell: (row) => (row.ativo ? 'Sim' : 'Nao')
        },
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
    ]), []);

    const paginatedData = useMemo(() => {
        const start = (pagination.page - 1) * pagination.perPage;
        const end = start + pagination.perPage;
        return filteredData.slice(start, end);
    }, [filteredData, pagination.page, pagination.perPage]);

    return (
        <Container>
            <Box className="breadcrumb">
                <Breadcrumb
                    routeSegments={[
                        { name: "Integracoes", path: "/integracao" },
                        {
                            name: (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <MdEmail style={{ marginRight: 6 }} />
                                    IMAP
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
                title="Filtros de integracao IMAP"
                expanded={painelExpandido}
                onToggle={(event, isExpanded) => setPainelExpandido(isExpanded)}
            >
                {loading ? (
                    <Loading />
                ) : (
                    <DataTable
                        columns={columns}
                        rows={paginatedData}
                        pagination={pagination}
                        onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
                        onRowsPerPageChange={(perPage) =>
                            setPagination((prev) => ({ ...prev, perPage, page: 1 }))
                        }
                        emptyMessage="Nenhuma configuracao encontrada."
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

            <IntegracaoImapForm
                valores={formValues}
                modoEdicao={modoEdicao}
                onChange={(name, value) => setFormValues((prev) => ({ ...prev, [name]: value }))}
                onRequestSubmit={(values) =>
                    modoEdicao ? abrirDialogEditar(values) : abrirDialogCadastrar(values)
                }
                onRequestDelete={(values) => abrirDialogExcluir(values)}
                onRequestImport={(values) => abrirDialogImportar(values)}
                onRequestTest={(values) => handleTestarConexao(values)}
                importarTodas={importarTodas}
                onToggleImportarTodas={setImportarTodas}
                onClearAll={() => {
                    setFormValues(defaultFormValues);
                    setModoEdicao(false);
                }}
            />

            <ConfirmDialog
                open={dialog.open}
                title={dialog.title}
                description={dialog.description}
                confirmText={dialog.confirmText}
                cancelText={dialog.cancelText}
                confirmColor={dialog.confirmColor}
                loading={actionLoading}
                onConfirm={() => {
                    dialog.onConfirm?.();
                    setDialog((prev) => ({ ...prev, open: false }));
                }}
                onClose={() => setDialog((prev) => ({ ...prev, open: false }))}
            />
        </Container>
    );
}
