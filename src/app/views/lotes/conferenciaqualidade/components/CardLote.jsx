import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControlLabel,
    Checkbox,
    Snackbar,
    Alert,
    Chip
} from '@mui/material';
import DataTable from '../../../../components/DataTable';
import { buildColumnsWithEllipsis } from '../../../../utils/buildColumns';

const formatDateTimeLocal = (date = new Date()) => {
    const pad = (value) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
        `T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const buildInitialForm = (produto) => ({
    dataConferencia: formatDateTimeLocal(new Date()),
    status: '',
    qtdInspecionada: produto?.quantidadeProduto ?? '',
    qtdAprovada: '',
    qtdReprovada: '',
    observacaoGeral: '',
    requerReinspecao: false,
    finalizada: false
});

const buildInitialDefeitoForm = () => ({
    tipoDefeito: '',
    observacaoDefeito: ''
});

const toOptionalNumber = (value) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : undefined;
};

const escapeHtml = (value) =>
    String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const buildEtiquetaHtml = ({ lote, produto, conferencia, defeito }) => {
    const loteRef = lote?.numeroIdentificador || lote?.id || '-';
    const produtoRef = produto?.nomeProduto || produto?.numeroIdentificador || '-';
    const conferenciaId = conferencia?.id || '-';
    const conferenciaIdentificador = conferencia?.identificador || '-';
    const tipoDefeito = defeito?.tipoDefeito || '-';
    const quantidade = defeito?.quantidade ?? '-';
    const observacao = defeito?.observacao || '-';

    return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Etiqueta defeito</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Arial, sans-serif; color: #0f172a; }
    .label {
      width: 58mm;
      padding: 6mm;
      border: 1px dashed #0f172a;
      font-size: 11px;
      line-height: 1.2;
    }
    .title { font-weight: 700; font-size: 12px; margin-bottom: 4px; }
    .row { margin-bottom: 2px; }
    .muted { color: #475569; font-size: 10px; }
  </style>
</head>
<body>
  <div class="label">
    <div class="title">Etiqueta defeito</div>
    <div class="row"><strong>Lote:</strong> ${escapeHtml(loteRef)}</div>
    <div class="row"><strong>Produto:</strong> ${escapeHtml(produtoRef)}</div>
    <div class="row"><strong>Conferencia:</strong> ${escapeHtml(conferenciaId)}</div>
    <div class="row"><strong>Identificador:</strong> ${escapeHtml(conferenciaIdentificador)}</div>
    <div class="row"><strong>Defeito:</strong> ${escapeHtml(tipoDefeito)}</div>
    <div class="row"><strong>Qtd:</strong> ${escapeHtml(quantidade)}</div>
    <div class="row"><strong>Obs:</strong> ${escapeHtml(observacao)}</div>
    <div class="muted">Impressao etiqueta</div>
  </div>
</body>
</html>`;
};

const buildFileName = (value) =>
    String(value ?? '')
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/g, '-')
        .replace(/(^-|-$)+/g, '');

const CardLote = ({ lote, onRefreshLote }) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [produtoSelecionado, setProdutoSelecionado] = useState(null);
    const [modalAberto, setModalAberto] = useState(false);
    const [form, setForm] = useState(() => buildInitialForm(null));
    const [defeitoForm, setDefeitoForm] = useState(() => buildInitialDefeitoForm());
    const [salvando, setSalvando] = useState(false);
    const [conferenciasCriadas, setConferenciasCriadas] = useState({});
    const [conferenciaCriadaId, setConferenciaCriadaId] = useState(null);
    const [produtoExpandidoId, setProdutoExpandidoId] = useState(null);
    const [finalizadasPorProduto, setFinalizadasPorProduto] = useState({});
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
        mensagem: ''
    });

    const produtos = Array.isArray(lote?.produtos) ? lote.produtos : [];
    const isProdutoAtivo = (produto) => {
        const ativo = produto?.ativo;
        if (ativo === undefined || ativo === null) return true;
        return !(ativo === 0 || ativo === false || ativo === '0');
    };

    useEffect(() => {
        setConferenciasCriadas({});
        setModalAberto(false);
        setProdutoSelecionado(null);
        setForm(buildInitialForm(null));
        setDefeitoForm(buildInitialDefeitoForm());
        setConferenciaCriadaId(null);
        setProdutoExpandidoId(null);
        setFinalizadasPorProduto({});
    }, [lote?.id]);

    const abrirModal = (produto) => {
        setProdutoSelecionado(produto);
        setForm(buildInitialForm(produto));
        setDefeitoForm(buildInitialDefeitoForm());
        setConferenciaCriadaId(null);
        setModalAberto(true);
    };

    const fecharModal = () => {
        setModalAberto(false);
        setProdutoSelecionado(null);
        setForm(buildInitialForm(null));
        setDefeitoForm(buildInitialDefeitoForm());
        setConferenciaCriadaId(null);
    };

    const handleChange = (name, value) => {
        const maxQuantidade = Number(produtoSelecionado?.quantidadeProduto);
        const maxValido = Number.isFinite(maxQuantidade);
        const camposQuantidade = ['qtdInspecionada', 'qtdAprovada', 'qtdReprovada'];

        if (maxValido && camposQuantidade.includes(name)) {
            if (value !== '') {
                const valorNumero = Number(value);
                if (Number.isFinite(valorNumero) && valorNumero > maxQuantidade) {
                    setSnackbar({
                        open: true,
                        message: 'Quantidade informada maior que a quantidade do produto.',
                        severity: 'error',
                        mensagem: 'Quantidade informada maior que a quantidade do produto.'
                    });
                    return;
                }

                if (name === 'qtdAprovada' || name === 'qtdReprovada') {
                    const qtdAprovada = name === 'qtdAprovada'
                        ? (Number.isFinite(valorNumero) ? valorNumero : 0)
                        : Number(form.qtdAprovada || 0);
                    const qtdReprovada = name === 'qtdReprovada'
                        ? (Number.isFinite(valorNumero) ? valorNumero : 0)
                        : Number(form.qtdReprovada || 0);

                    if (qtdAprovada + qtdReprovada > maxQuantidade) {
                        setSnackbar({
                            open: true,
                            message: 'A soma de aprovadas e reprovadas nao pode ultrapassar a quantidade do produto.',
                            severity: 'error',
                            mensagem: 'A soma de aprovadas e reprovadas nao pode ultrapassar a quantidade do produto.'
                        });
                        return;
                    }
                }
            }
        }

        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleDefeitoChange = (name, value) => {
        setDefeitoForm((prev) => ({ ...prev, [name]: value }));
    };

    const formatDateTime = (valor) => {
        if (!valor) return '-';
        const date = new Date(valor);
        if (Number.isNaN(date.getTime())) return String(valor);
        const pad = (n) => String(n).padStart(2, '0');
        return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ` +
            `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const formatFlag = (valor) => {
        if (valor === 1 || valor === true || valor === '1') return 'Sim';
        return 'Nao';
    };
    const isFlagTrue = (valor) => valor === 1 || valor === true || valor === '1';

    const renderConferencias = (produto) => {
        const conferencias = Array.isArray(produto?.conferencias) ? produto.conferencias : [];
        if (!conferencias.length) {
            return (
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Nenhuma conferencia registrada.
                </Typography>
            );
        }

        return (
            <Box sx={{ display: 'grid', gap: 1.5 }}>
                {conferencias.map((conferencia) => {
                    const defeitos = Array.isArray(conferencia?.defeitos) ? conferencia.defeitos : [];
                    return (
                        <Box
                            key={conferencia.id}
                            sx={{
                                p: 1.5,
                                borderRadius: 2,
                                border: '1px solid #e2e8f0',
                                backgroundColor: '#fff'
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 1
                                }}
                            >
                                <Typography variant="subtitle2" sx={{ color: '#0f172a' }}>
                                    Conferencia #{conferencia.id}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748b' }}>
                                    {formatDateTime(conferencia.dataConferencia)}
                                </Typography>
                            </Box>

                            <Box
                                sx={{
                                    mt: 1,
                                    display: 'grid',
                                    gap: 0.5,
                                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                                    color: '#334155'
                                }}
                            >
                                <Typography variant="caption">
                                    Identificador: {conferencia.identificador || '-'}
                                </Typography>
                                <Typography variant="caption">
                                    Inspecionada: {conferencia.qtdInspecionada ?? 0}
                                </Typography>
                                <Typography variant="caption">
                                    Aprovada: {conferencia.qtdAprovada ?? 0}
                                </Typography>
                                <Typography variant="caption">
                                    Reprovada: {conferencia.qtdReprovada ?? 0}
                                </Typography>
                                <Typography variant="caption">
                                    Reinspecao: {formatFlag(conferencia.requerReinspecao)}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Typography variant="caption">Finalizada:</Typography>
                                    <Chip
                                        size="small"
                                        color={isFlagTrue(conferencia.finalizada) ? 'success' : 'error'}
                                        label={formatFlag(conferencia.finalizada)}
                                        sx={{ fontWeight: 600 }}
                                    />
                                </Box>
                                <Typography variant="caption">
                                    Status: {conferencia.status || '-'}
                                </Typography>
                            </Box>

                            {conferencia.observacaoGeral && (
                                <Typography variant="caption" sx={{ mt: 1, color: '#475569', display: 'block' }}>
                                    Observacao: {conferencia.observacaoGeral}
                                </Typography>
                            )}

                            <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: '#0f172a' }}>
                                    Defeitos
                                </Typography>
                                {defeitos.length ? (
                                    <Box sx={{ mt: 0.5, display: 'grid', gap: 0.5 }}>
                                        {defeitos.map((defeito) => (
                                            <Box
                                                key={defeito.id}
                                                sx={{
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    gap: 1,
                                                    color: '#334155'
                                                }}
                                            >
                                                <Typography variant="caption">#{defeito.id}</Typography>
                                                <Typography variant="caption">
                                                    Tipo: {defeito.tipoDefeito || '-'}
                                                </Typography>
                                                <Typography variant="caption">
                                                    Qtd: {defeito.quantidade ?? 0}
                                                </Typography>
                                                {defeito.observacao && (
                                                    <Typography variant="caption">
                                                        Observacao: {defeito.observacao}
                                                    </Typography>
                                                )}
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        const html = buildEtiquetaHtml({
                                                            lote,
                                                            produto,
                                                            conferencia,
                                                            defeito
                                                        });
                                                        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
                                                        const identificador = conferencia?.identificador || `conf-${conferencia?.id}`;
                                                        const fileName = `etiqueta-${buildFileName(identificador)}-defeito-${defeito?.id || 'x'}.html`;
                                                        const link = document.createElement('a');
                                                        link.href = URL.createObjectURL(blob);
                                                        link.download = fileName;
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        URL.revokeObjectURL(link.href);
                                                        link.remove();
                                                    }}
                                                    sx={{ textTransform: 'none', fontSize: '0.7rem', lineHeight: 1.1 }}
                                                >
                                                    Baixar etiqueta
                                                </Button>
                                            </Box>
                                        ))}
                                    </Box>
                                ) : (
                                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
                                        Nenhum defeito registrado.
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        );
    };
    const produtoTemFinalizada = (produto) => {
        if (!produto?.id) return false;
        if (finalizadasPorProduto[produto.id]) return true;
        const conferencias = Array.isArray(produto?.conferencias) ? produto.conferencias : [];
        return conferencias.some((conferencia) => isFlagTrue(conferencia.finalizada));
    };

    const obterProximoIdDefeito = async () => {
        try {
            const res = await fetch(
                `${apiUrl}/qualidade/conferencia_qualidade_defeitos?pagina=1&quantidadePorPagina=1`
            );
            const result = await res.json().catch(() => ({}));
            if (!res.ok) {
                return Math.floor(Date.now() / 1000);
            }
            const ultimo = Array.isArray(result.itens) && result.itens.length
                ? Number(result.itens[0].id)
                : 0;
            if (Number.isFinite(ultimo) && ultimo > 0) {
                return ultimo + 1;
            }
            return 1;
        } catch (error) {
            return Math.floor(Date.now() / 1000);
        }
    };

    const criarDefeito = async (idConferenciaQualidade, quantidade) => {
        if (!idConferenciaQualidade) {
            setSnackbar({
                open: true,
                message: 'Conferencia nao encontrada para registrar defeito.',
                severity: 'error',
                mensagem: 'Conferencia nao encontrada para registrar defeito.'
            });
            return false;
        }

        const id = await obterProximoIdDefeito();
        const payload = {
            id,
            idConferenciaQualidade,
            tipoDefeito: defeitoForm.tipoDefeito?.trim() || null,
            quantidade,
            observacao: defeitoForm.observacaoDefeito?.trim() || null
        };

        try {
            const res = await fetch(`${apiUrl}/qualidade/conferencia_qualidade_defeitos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await res.json().catch(() => ({}));

            if (!res.ok) {
                setSnackbar({
                    open: true,
                    message: result.mensagem || 'Erro ao registrar defeito.',
                    severity: 'error',
                    mensagem: result.mensagem || 'Erro ao registrar defeito.'
                });
                return false;
            }

            return true;
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Erro ao registrar defeito.',
                severity: 'error',
                mensagem: 'Erro ao registrar defeito.'
            });
            return false;
        }
    };

    const handleSalvarConferencia = async () => {
        if (!produtoSelecionado?.id) {
            setSnackbar({
                open: true,
                message: 'Produto invalido.',
                severity: 'error',
                mensagem: 'Produto invalido.'
            });
            return;
        }
        if (produtoTemFinalizada(produtoSelecionado)) {
            setSnackbar({
                open: true,
                message: 'Este produto ja possui conferencia finalizada.',
                severity: 'error',
                mensagem: 'Este produto ja possui conferencia finalizada.'
            });
            return;
        }

        const qtdReprovadaNumero = Number(form.qtdReprovada);
        const precisaDefeito = Number.isFinite(qtdReprovadaNumero) && qtdReprovadaNumero > 0;
        const quantidadeMaxima = Number(produtoSelecionado?.quantidadeProduto);
        if (Number.isFinite(quantidadeMaxima)) {
            const qtdAprovadaNumero = Number(form.qtdAprovada) || 0;
            const qtdInspecionadaNumero = Number(form.qtdInspecionada) || 0;
            if (qtdInspecionadaNumero > quantidadeMaxima) {
                setSnackbar({
                    open: true,
                    message: 'Qtd inspecionada nao pode ser maior que a quantidade do produto.',
                    severity: 'error',
                    mensagem: 'Qtd inspecionada nao pode ser maior que a quantidade do produto.'
                });
                return;
            }
            if (qtdAprovadaNumero + qtdReprovadaNumero > quantidadeMaxima) {
                setSnackbar({
                    open: true,
                    message: 'Qtd aprovada + reprovada nao pode ser maior que a quantidade do produto.',
                    severity: 'error',
                    mensagem: 'Qtd aprovada + reprovada nao pode ser maior que a quantidade do produto.'
                });
                return;
            }
        }

        if (precisaDefeito && !defeitoForm.tipoDefeito?.trim()) {
            setSnackbar({
                open: true,
                message: 'Informe o tipo de defeito.',
                severity: 'error',
                mensagem: 'Informe o tipo de defeito.'
            });
            return;
        }

        const payload = {
            idProdutoProducao: produtoSelecionado.id,
            dataConferencia: form.dataConferencia || undefined,
            status: form.status?.trim() || null,
            qtdInspecionada: toOptionalNumber(form.qtdInspecionada),
            qtdAprovada: toOptionalNumber(form.qtdAprovada),
            qtdReprovada: toOptionalNumber(form.qtdReprovada),
            observacaoGeral: form.observacaoGeral?.trim() || null,
            requerReinspecao: form.requerReinspecao ? 1 : 0,
            finalizada: form.finalizada ? 1 : 0
        };

        setSalvando(true);
        try {
            let conferenciaId = conferenciaCriadaId;
            let mensagemSucesso = 'Conferencia gerada com sucesso!';

            if (!conferenciaId) {
                const res = await fetch(`${apiUrl}/qualidade/conferencias_qualidade`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const result = await res.json().catch(() => ({}));

                if (!res.ok) {
                    setSnackbar({
                        open: true,
                        message: result.mensagem || 'Erro ao gerar conferencia.',
                        severity: 'error',
                        mensagem: result.mensagem || 'Erro ao gerar conferencia.'
                    });
                    return;
                }

                conferenciaId = result?.criado?.id;
                mensagemSucesso = result?.mensagem || mensagemSucesso;

                if (!conferenciaId) {
                    setSnackbar({
                        open: true,
                        message: 'Conferencia criada, mas sem identificador retornado.',
                        severity: 'error',
                        mensagem: 'Conferencia criada, mas sem identificador retornado.'
                    });
                    return;
                }

                setConferenciaCriadaId(conferenciaId);
            }

            if (precisaDefeito) {
                const okDefeito = await criarDefeito(conferenciaId, qtdReprovadaNumero);
                if (!okDefeito) {
                    return;
                }
                mensagemSucesso = 'Conferencia e defeito registrados com sucesso!';
            }

            setConferenciasCriadas((prev) => ({
                ...prev,
                [produtoSelecionado.id]: true
            }));
            if (form.finalizada) {
                setFinalizadasPorProduto((prev) => ({
                    ...prev,
                    [produtoSelecionado.id]: true
                }));
            }
            setModalAberto(false);
            setConferenciaCriadaId(null);
            setForm(buildInitialForm(produtoSelecionado));
            setDefeitoForm(buildInitialDefeitoForm());

            setSnackbar({
                open: true,
                message: mensagemSucesso,
                severity: 'success',
                mensagem: mensagemSucesso
            });

            await onRefreshLote?.();
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Erro ao gerar conferencia.',
                severity: 'error',
                mensagem: 'Erro ao gerar conferencia.'
            });
        } finally {
            setSalvando(false);
        }
    };

    const colunasProdutos = buildColumnsWithEllipsis([
        { field: 'numeroIdentificador', headerName: 'Identificador' },
        { field: 'nomeProduto', headerName: 'Produto' },
        { field: 'tipoEstilo', headerName: 'Estilo' },
        { field: 'tamanho', headerName: 'Tamanho' },
        { field: 'corPrimaria', headerName: 'Cor primaria' },
        { field: 'corSecundaria', headerName: 'Cor secundaria' },
        { field: 'quantidadeProduto', headerName: 'Qtd' },
        {
            field: 'ativoStatus',
            headerName: 'Status',
            renderCell: (row) => (
                <Chip
                    size="small"
                    color={isProdutoAtivo(row) ? 'success' : 'error'}
                    label={isProdutoAtivo(row) ? 'Ativo' : 'Inativo'}
                    sx={{ fontWeight: 600 }}
                />
            )
        },
        {
            field: 'totalConferencias',
            headerName: 'Conferencias',
            renderCell: (row) => {
                const total = Array.isArray(row?.conferencias) ? row.conferencias.length : 0;
                return total;
            }
        },
        {
            field: 'finalizadaStatus',
            headerName: 'Finalizado',
            renderCell: (row) => (
                <Chip
                    size="small"
                    color={produtoTemFinalizada(row) ? 'success' : 'warning'}
                    label={produtoTemFinalizada(row) ? 'Finalizado' : 'Pendente'}
                    sx={{ fontWeight: 600 }}
                />
            )
        },
        {
            field: 'conferencia',
            headerName: 'Conferencia',
            renderCell: (row) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', rowGap: 0.5 }}>
                    <Button
                        size="small"
                        variant="contained"
                        disabled={produtoTemFinalizada(row) || !isProdutoAtivo(row)}
                        onClick={(event) => {
                            event.stopPropagation();
                            abrirModal(row);
                        }}
                        sx={{
                            minWidth: 'auto',
                            px: 1.5,
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            lineHeight: 1.2,
                            whiteSpace: 'nowrap'
                        }}
                    >
                        Gerar conferencia
                    </Button>
                </Box>
            )
        }
    ]);

    const quantidadeMaxima = (() => {
        const valor = Number(produtoSelecionado?.quantidadeProduto);
        return Number.isFinite(valor) ? valor : undefined;
    })();
    const qtdReprovadaNumero = Number(form.qtdReprovada);
    const precisaDefeito = Number.isFinite(qtdReprovadaNumero) && qtdReprovadaNumero > 0;

    return (
        <Box
            sx={{
                mt: 4,
                p: 3,
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                background: '#fff',
                boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)'
            }}
        >
            <Box sx={{ mb: 3 }}>
                <Typography variant="overline" sx={{ color: '#64748b', letterSpacing: 1 }}>
                    Lote selecionado
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    #{lote?.numeroIdentificador || lote?.id}
                </Typography>
                <Typography variant="body2" sx={{ color: '#475569' }}>
                    {lote?.fornecedor?.razaoSocial
                        ? `Fornecedor: ${lote.fornecedor.razaoSocial}`
                        : 'Fornecedor nao informado'}
                </Typography>
                <Box
                    sx={{
                        mt: 2,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 2,
                        color: '#475569'
                    }}
                >
                    <Typography variant="caption">
                        Produtos: {produtos.length}
                    </Typography>
                    <Typography variant="caption">
                        Entrada: {lote?.dataEntrada || '-'}
                    </Typography>
                    <Typography variant="caption">
                        Saida prevista: {lote?.dataPrevistaSaida || '-'}
                    </Typography>
                </Box>
            </Box>

            <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                    Produtos do lote
                </Typography>
                <DataTable
                    columns={colunasProdutos}
                    rows={produtos}
                    pagination={false}
                    dense
                    getRowId={(row) => row.id}
                    onRowClick={(row) => {
                        if (!row?.id) return;
                        setProdutoExpandidoId((prev) => (prev === row.id ? null : row.id));
                    }}
                    expandedRowId={produtoExpandidoId}
                    renderExpandedRow={renderConferencias}
                    emptyMessage="Nenhum produto encontrado para este lote."
                />
            </Box>

            <Dialog
                open={modalAberto}
                onClose={fecharModal}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>Gerar conferencia de qualidade</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
                        <Box>
                            <Typography variant="subtitle2" sx={{ color: '#0f172a' }}>
                                {produtoSelecionado?.nomeProduto || 'Produto'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                                Qtd do produto: {produtoSelecionado?.quantidadeProduto ?? '-'}
                            </Typography>
                        </Box>

                        <TextField
                            label="Data da conferencia"
                            type="datetime-local"
                            value={form.dataConferencia}
                            onChange={(e) => handleChange('dataConferencia', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            fullWidth
                        />

                        <TextField
                            label="Status"
                            value={form.status}
                            onChange={(e) => handleChange('status', e.target.value)}
                            size="small"
                            fullWidth
                        />

                        <Box
                            sx={{
                                display: 'grid',
                                gap: 2,
                                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }
                            }}
                        >
                            <TextField
                                label="Qtd inspecionada"
                                type="number"
                                value={form.qtdInspecionada}
                                onChange={(e) => handleChange('qtdInspecionada', e.target.value)}
                                inputProps={{ min: 0, max: quantidadeMaxima, step: 1 }}
                                size="small"
                            />
                            <TextField
                                label="Qtd aprovada"
                                type="number"
                                value={form.qtdAprovada}
                                onChange={(e) => handleChange('qtdAprovada', e.target.value)}
                                inputProps={{ min: 0, max: quantidadeMaxima, step: 1 }}
                                size="small"
                            />
                            <TextField
                                label="Qtd reprovada"
                                type="number"
                                value={form.qtdReprovada}
                                onChange={(e) => handleChange('qtdReprovada', e.target.value)}
                                inputProps={{ min: 0, max: quantidadeMaxima, step: 1 }}
                                size="small"
                            />
                        </Box>

                        <TextField
                            label="Observacao geral"
                            value={form.observacaoGeral}
                            onChange={(e) => handleChange('observacaoGeral', e.target.value)}
                            multiline
                            rows={3}
                            fullWidth
                        />

                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={form.requerReinspecao}
                                        onChange={(e) => handleChange('requerReinspecao', e.target.checked)}
                                    />
                                }
                                label="Requer reinspecao"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={form.finalizada}
                                        onChange={(e) => handleChange('finalizada', e.target.checked)}
                                    />
                                }
                                label="Finalizada"
                            />
                        </Box>

                        {precisaDefeito && (
                            <Box sx={{ mt: 1, p: 2, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                                <Typography variant="subtitle2" sx={{ color: '#0f172a', mb: 1 }}>
                                    Detalhes do defeito
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1 }}>
                                    Quantidade com defeito: {qtdReprovadaNumero}
                                </Typography>
                                <TextField
                                    label="Tipo de defeito"
                                    value={defeitoForm.tipoDefeito}
                                    onChange={(e) => handleDefeitoChange('tipoDefeito', e.target.value)}
                                    size="small"
                                    fullWidth
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    label="Observacao do defeito"
                                    value={defeitoForm.observacaoDefeito}
                                    onChange={(e) => handleDefeitoChange('observacaoDefeito', e.target.value)}
                                    multiline
                                    rows={3}
                                    fullWidth
                                />
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={fecharModal} disabled={salvando}>
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSalvarConferencia}
                        disabled={salvando}
                    >
                        {salvando ? 'Salvando...' : 'Gerar conferencia'}
                    </Button>
                </DialogActions>
            </Dialog>

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
        </Box>
    );
};

export default CardLote;
