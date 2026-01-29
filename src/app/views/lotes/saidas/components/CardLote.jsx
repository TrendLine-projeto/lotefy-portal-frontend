import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Divider, Tooltip, Dialog, DialogTitle, DialogContent, CircularProgress, DialogActions, Button, TextField, Checkbox, FormControlLabel, Chip, InputAdornment } from '@mui/material';
import { FaPen, FaBoxOpen, FaFileAlt, FaPowerOff, FaFlagCheckered, FaCheckCircle  } from 'react-icons/fa';
import { RiTimerFill } from "react-icons/ri"
import { IconsCardDefault } from '../../../../utils/constant';
import { buildColumnsWithEllipsis } from '../../../../utils/buildColumns';
import { Collapse } from '@mui/material'
import { parseIniciado } from '../../../../utils/parseIniciado';
import { Snackbar, Alert } from "@mui/material";
import DataTable from '../../../../components/DataTable/index';
import TableWrapper from '../../../../components/DataTable/TableWrapper';
import ModalInformacoesProduto from '../components/ModalInformacoesProduto';
import ConfirmInicioLoteModal from '../components/ConfirmInicioLoteModal';
import ModalInformacoesLote from '../components/ModalInformacoesLote';
import MatxLoading from "../../../../components/MatxLoading";

const icones = {
    '1 - Lote': <FaPen size={IconsCardDefault} />,
    '2 - Produtos': <FaBoxOpen size={IconsCardDefault} />,
    '3 - NF-e': <FaFileAlt size={IconsCardDefault} />,
    '4 - Status': <FaPowerOff size={IconsCardDefault} />,
    '5 - Conferencia de qualidade': <FaCheckCircle size={IconsCardDefault} />,
    '6 - Finalizado': <FaFlagCheckered size={IconsCardDefault} />
};

const isConferenciaFinalizada = (valor) =>
    valor === 1 || valor === true || valor === '1' || valor === 'Sim';

const produtoTemConferenciaFinalizada = (produto) =>
    Array.isArray(produto?.conferencias) &&
    produto.conferencias.some((conferencia) => isConferenciaFinalizada(conferencia?.finalizada));

const isProdutoAtivo = (produto) => {
    const ativo = produto?.ativo;
    if (ativo === undefined || ativo === null) return true;
    return !(ativo === 0 || ativo === false || ativo === '0');
};

const temConferenciaFinalizada = (lote) => {
    const produtos = Array.isArray(lote?.produtos) ? lote.produtos : [];
    if (!produtos.length) return false;
    return produtos.every((produto) => produtoTemConferenciaFinalizada(produto));
};

const getEtapasConcluidasFromLote = (lote) => {
    if (!lote) return 0;

    if (lote.loteFinalizado === "Sim" || lote.loteFinalizado === 1) return 6;
    if (temConferenciaFinalizada(lote)) return 5;
    if (parseIniciado(lote.loteIniciado) === false) return 3;
    return 4;
};

const CardLote = ({ lote, onIniciarLote, onSalvarProduto, onSalvarLote }) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [etapaExpandida, setEtapaExpandida] = useState(null);
    const [modalAberto, setModalAberto] = useState(false);
    const [modalAberto1, setModalAberto1] = useState(false);
    const [detalhesProduto, setDetalhesProduto] = useState(null);
    const [detalhesLote, setDetalhesLote] = useState(null);
    const [salvando, setSalvando] = useState(false);
    const [salvandoFechamento, setSalvandoFechamento] = useState(false);
    const [fechamentoSucesso, setFechamentoSucesso] = useState(false);
    const [quantidadesConcluidas, setQuantidadesConcluidas] = useState({});
    const [openModal, setOpenModal] = useState(false);
    const [produtoExpandidoId, setProdutoExpandidoId] = useState(null);
    const [fechamentoForm, setFechamentoForm] = useState(() => {
        const hoje = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const dataHoje = `${hoje.getFullYear()}-${pad(hoje.getMonth() + 1)}-${pad(hoje.getDate())}`;

        return {
            concluido100: false,
            teveBonus: false,
            bonusValor: '0',
            pecasConcluidasSucesso: '0',
            acrescimoEntregaPercent: '0',
            fechadoEm: dataHoje
        };
    });
    const etapasDefault = ['1 - Lote', '2 - Produtos', '3 - NF-e', '4 - Status', '5 - Conferencia de qualidade', '6 - Finalizado'];
    const {
        id: loteId,
        numeroIdentificador,
        nomeEntregador,
        nomeRecebedor,
        valorEstimado,
        valorHoraEstimado,
        dataEntrada,
        dataPrevistaSaida,
        dataInicio,
        loteIniciado,
        loteFinalizado,
        idFilial,
        idFornecedor_producao,
        fornecedor,
        notasFiscais,
        produtos
    } = lote;
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: '',
        mensagem: ''
    });

    useEffect(() => {
        if (!Array.isArray(produtos)) return;
        setQuantidadesConcluidas((prev) => {
            const next = { ...prev };
            let changed = false;

            produtos.forEach((produto) => {
                if (next[produto.id] === undefined) {
                    next[produto.id] = '';
                    changed = true;
                }
            });

            return changed ? next : prev;
        });
    }, [produtos]);

    const handleAbrirDetalhes = async (id) => {
        try {
            const res = await fetch(`${apiUrl}/produtorProducao/produtos_producao/${id}`);
            const result = await res.json();

            setDetalhesProduto(result.produtoProducao);
            setModalAberto(true);
        } catch (error) {
            console.error('Erro ao buscar detalhes do produto:', error);
        }
    };

    const handleAbrirDetalhesLote = async (id) => {
        try {
            const res = await fetch(`${apiUrl}/lotes/entrada_lotes/${id}`);
            const result = await res.json();

            setDetalhesLote(result.lote);
            setModalAberto1(true);
        } catch (error) {
            console.error('Erro ao buscar detalhes do lote:', error);
        }
    };

    const handleFecharModal = () => {
        setModalAberto(false);
        setDetalhesProduto(null);
    };

    const handleFecharModal1 = () => {
        setModalAberto1(false);
        setDetalhesLote(null);
    };

    const handleFechamentoChange = (name, value) => {
        setFechamentoForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleQuantidadeConcluida = (produtoId, value) => {
        const lista = Array.isArray(produtos) ? produtos : [];
        const produto = lista.find((item) => item?.id === produtoId);
        const maxQtd = produto?.quantidadeProduto;

        if (value === '') {
            setQuantidadesConcluidas((prev) => ({ ...prev, [produtoId]: value }));
            return;
        }

        let numeric = Number(value);
        if (!Number.isFinite(numeric)) {
            return;
        }
        if (numeric < 0) numeric = 0;

        if (maxQtd !== null && maxQtd !== undefined && Number.isFinite(Number(maxQtd)) && numeric > Number(maxQtd)) {
            numeric = Number(maxQtd);
            setSnackbar({
                open: true,
                message: 'Quantidade concluida nao pode ser maior que a quantidade do produto.',
                severity: 'warning',
                mensagem: 'Quantidade concluida nao pode ser maior que a quantidade do produto.'
            });
        }

        setQuantidadesConcluidas((prev) => ({ ...prev, [produtoId]: numeric }));
    };

    const handleSalvarFechamento = async () => {
        if (!loteId) {
            setSnackbar({
                open: true,
                message: 'ID do lote ausente.',
                severity: 'error',
                mensagem: 'ID do lote ausente.'
            });
            return;
        }

        if (temConferenciaPendente) {
            setSnackbar({
                open: true,
                message: 'Existe produto sem conferencia finalizada. Finalize antes de encerrar o lote.',
                severity: 'warning',
                mensagem: 'Existe produto sem conferencia finalizada. Finalize antes de encerrar o lote.'
            });
            return;
        }

        const produtosAtivos = Array.isArray(produtos)
            ? produtos.filter((produto) => isProdutoAtivo(produto))
            : [];
        const totalConcluido = produtosAtivos.reduce((acc, produto) => {
                const valor = Number(quantidadesConcluidas[produto.id]);
                return acc + (Number.isFinite(valor) ? valor : 0);
            }, 0);
        const totalQuantidadeOriginal = produtosAtivos.reduce((acc, produto) => {
            const qtd = Number(produto?.quantidadeProduto);
            return acc + (Number.isFinite(qtd) ? qtd : 0);
        }, 0);

        if (totalConcluido > totalQuantidadeOriginal) {
            setSnackbar({
                open: true,
                message: 'Quantidade concluida nao pode ser maior que a quantidade total do lote.',
                severity: 'warning',
                mensagem: 'Quantidade concluida nao pode ser maior que a quantidade total do lote.'
            });
            setSalvandoFechamento(false);
            return;
        }

        setSalvandoFechamento(true);
        try {
            const fecharEmIso = fechamentoForm.fechadoEm
                ? new Date(`${fechamentoForm.fechadoEm}T00:00:00`).toISOString()
                : new Date().toISOString();

            const payload = {
                id_entrada_lote: loteId,
                concluido100: fechamentoForm.concluido100 ? 1 : 0,
                teveBonus: fechamentoForm.teveBonus ? 1 : 0,
                bonusValor: fechamentoForm.teveBonus ? Number(fechamentoForm.bonusValor || 0) : 0,
                pecasConcluidasSucesso: fechamentoForm.concluido100 ? null : totalConcluido,
                acrescimoEntregaPercent: Number(fechamentoForm.acrescimoEntregaPercent || 0),
                fechadoEm: fecharEmIso
            };

            const res = await fetch(`${apiUrl}/lotes/lotes_fechamento`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await res.json().catch(() => ({}));

            if (!res.ok) {
                setSnackbar({
                    open: true,
                    message: result.mensagem || 'Erro ao encerrar o lote.',
                    severity: 'error',
                    mensagem: result.mensagem || 'Erro ao encerrar o lote.'
                });
                return;
            }

            setSnackbar({
                open: true,
                message: result.mensagem || 'Fechamento criado com sucesso!',
                severity: 'success',
                mensagem: result.mensagem || 'Fechamento criado com sucesso!'
            });
            setFechamentoSucesso(true);
            setEtapaExpandida(null);
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Erro ao encerrar o lote.',
                severity: 'error',
                mensagem: 'Erro ao encerrar o lote.'
            });
        } finally {
            setSalvandoFechamento(false);
        }
    };


    const colunasProdutos = buildColumnsWithEllipsis([
        { field: 'numeroIdentificador', headerName: 'Identificador' },
        { field: 'nomeProduto', headerName: 'Produto' },
        { field: 'tipoEstilo', headerName: 'Estilo' },
        { field: 'tamanho', headerName: 'Tamanho' },
        { field: 'corPrimaria', headerName: 'Cor PrimÃ¡ria' },
        { field: 'corSecundaria', headerName: 'Cor SecundÃ¡ria' },
        { field: 'quantidadeProduto', headerName: 'Qtd' },
        { field: 'valorPorPeca', headerName: 'Valor Unitário' },
        { field: 'someValorTotalProduto', headerName: 'Valor Total' },
        {
            field: 'ativoStatus',
            headerName: 'Status',
            renderCell: (row) => (
                row?.ativo === 0 || row?.ativo === '0' || row?.ativo === false ? (
                    <Chip
                        label="Inativo"
                        size="small"
                        variant="outlined"
                        sx={{ color: '#b91c1c', borderColor: '#fecaca', fontWeight: 600, backgroundColor: '#fef2f2' }}
                    />
                ) : (
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>-</Typography>
                )
            )
        },
        {
            field: 'detalhes',
            headerName: 'Detalhes',
            renderCell: (row) => (
                <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleAbrirDetalhes(row.id)}
                >
                    Detalhes
                </Button>
            )
        }
    ]);

    const colunasNotas = buildColumnsWithEllipsis([
        { field: 'numeroNota', headerName: 'Numero' },
        { field: 'serie', headerName: 'Série' },
        { field: 'dataEmissao', headerName: 'Data Emissão' },
        { field: 'valorProdutos', headerName: 'Valor Produtos' },
        { field: 'valorFrete', headerName: 'Valor Frete' },
        { field: 'valorICMS', headerName: 'ICMS' },
        { field: 'valorIPI', headerName: 'IPI' },
        { field: 'transportadora', headerName: 'Transportadora' },
        { field: 'qtdVolumes', headerName: 'Volumes' },
        { field: 'pesoBruto', headerName: 'Peso Bruto' }
    ]);

    const colunasLote = buildColumnsWithEllipsis([
        { field: 'numeroIdentificador', headerName: 'Identificação' },
        { field: 'nomeEntregador', headerName: 'Entregador' },
        { field: 'nomeRecebedor', headerName: 'Recebedor' },
        { field: 'valorEstimado', headerName: 'Valor Estimado' },
        { field: 'valorHoraEstimado', headerName: 'Valor Hora' },
        { field: 'dataEntrada', headerName: 'Entrada' },
        { field: 'dataPrevistaSaida', headerName: 'Saída Prevista' },
        {
            field: 'detalhes',
            headerName: 'Detalhes',
            renderCell: (row) => (
                <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleAbrirDetalhesLote(row.id)}
                >
                    Detalhes
                </Button>
            )
        }
    ]);

    const colunasResumoConferencias = buildColumnsWithEllipsis([
        { field: 'numeroIdentificador', headerName: 'Produto' },
        { field: 'nomeProduto', headerName: 'Descricao' },
        { field: 'totalConferencias', headerName: 'Conferencias' },
        { field: 'finalizadas', headerName: 'Finalizadas' },
        { field: 'pendentes', headerName: 'Pendentes' },
        {
            field: 'finalizadaStatus',
            headerName: 'Finalizado',
            renderCell: (row) => (
                <Chip
                    size="small"
                    color={row.finalizadas > 0 ? 'success' : 'warning'}
                    label={row.finalizadas > 0 ? 'Finalizado' : 'Pendente'}
                    sx={{ fontWeight: 600 }}
                />
            )
        },
        { field: 'defeitos', headerName: 'Defeitos' }
    ]);

    const getConferenciaStatusProduto = (produto) => {
        const conferenciasProduto = Array.isArray(produto?.conferencias) ? produto.conferencias : [];
        if (conferenciasProduto.length === 0) {
            return { label: 'Sem conferencia', color: 'default' };
        }
        if (produtoTemConferenciaFinalizada(produto)) {
            return { label: 'Finalizada', color: 'success' };
        }
        return { label: 'Em aberto', color: 'warning' };
    };

    const colunasProdutosFechamento = [
        { field: 'numeroIdentificador', headerName: 'Identificador' },
        { field: 'nomeProduto', headerName: 'Produto' },
        { field: 'quantidadeProduto', headerName: 'Qtd original' },
        {
            field: 'conferenciaStatus',
            headerName: 'Conferencia',
            renderCell: (row) => {
                const status = getConferenciaStatusProduto(row);
                return (
                    <Chip
                        size="small"
                        color={status.color}
                        label={status.label}
                        sx={{ fontWeight: 600 }}
                    />
                );
            }
        },
        {
            field: 'quantidadeConcluida',
            headerName: 'Qtd concluida',
            renderCell: (row) => (
                <TextField
                    type="number"
                    size="small"
                    value={quantidadesConcluidas[row.id] ?? ''}
                    onChange={(e) => handleQuantidadeConcluida(row.id, e.target.value)}
                    inputProps={{
                        min: 0,
                        max: row.quantidadeProduto ?? undefined,
                        step: 1
                    }}
                    disabled={pecasBloqueadas}
                />
            )
        }
    ];

    const getRowStyles = (dados = [], campoStatus = 'iniciado') => {
        const styles = {};

        dados.forEach((item, index) => {
            const valorBruto = item[campoStatus];

            const isOk =
                valorBruto === 1 ||
                valorBruto === true ||
                valorBruto === '1' ||
                valorBruto === 'true' ||
                valorBruto === 'Sim';

            const bgColor = isOk ? '#d1f2e2' : '#f2f2f2';
            const textColor = isOk ? '#3fffa6' : '#555';

            styles[`& tbody tr:nth-of-type(${index + 1})`] = {
                backgroundColor: bgColor,
                color: textColor
            };
        });

        return styles;
    };

    const formatarDataHora = (valor) => {
        const date = parseDateFlexible(valor);
        if (!date || Number.isNaN(date.getTime())) {
            return '-';
        }
        const dia = String(date.getDate()).padStart(2, '0');
        const mes = String(date.getMonth() + 1).padStart(2, '0');
        const ano = date.getFullYear();
        const horas = String(date.getHours()).padStart(2, '0');
        const minutos = String(date.getMinutes()).padStart(2, '0');
        const segundos = String(date.getSeconds()).padStart(2, '0');
        return `${dia}/${mes}/${ano} ${horas}:${minutos}:${segundos}`;
    };

    // === utils de data ===
    function parseBrDateTime(s) {
        // Aceita "DD/MM/YYYY HH:mm" ou "DD/MM/YYYY"
        const [dia, mes, resto] = s.split('/');
        const [ano, horario] = (resto || '').split(' ');
        if (!dia || !mes || !ano) return new Date(NaN);

        if (horario) {
            const [hh, mm, ss] = horario.split(':');
            return new Date(
                Number(ano),
                Number(mes) - 1,
                Number(dia),
                Number(hh || 0),
                Number(mm || 0),
                Number(ss || 0),
                0
            );
        }

        return new Date(Number(ano), Number(mes) - 1, Number(dia));
    }

    function parseDateFlexible(input) {
        if (!input) return null;
        // Se vier string BR (DD/MM/YYYY...), parseia manualmente
        if (typeof input === 'string' && /\d{2}\/\d{2}\/\d{4}/.test(input)) {
            return parseBrDateTime(input);
        }
        // Sessão, tenta parse nativo (ISO/Date)
        return new Date(input);
    }

    // === flags ===
    const iniciado = parseIniciado(loteIniciado);
    const finalizado = parseIniciado(loteFinalizado);
    const finalizadoLocal = finalizado || fechamentoSucesso;

    const previstaDate = parseDateFlexible(dataPrevistaSaida);
    const previstaTime = previstaDate ? previstaDate.getTime() : NaN;

    const isAtrasado =
        Number.isFinite(previstaTime) &&
        previstaTime < Date.now() &&
        !finalizadoLocal;
    const isNaoIniciado = !iniciado && !finalizadoLocal;
    const isEmProducao = iniciado && !finalizadoLocal && !isAtrasado;
    const produtosLista = Array.isArray(produtos) ? produtos : [];
    const produtosAtivos = produtosLista.filter((produto) => isProdutoAtivo(produto));
    const conferencias = produtosLista.flatMap((produto) =>
        Array.isArray(produto?.conferencias) ? produto.conferencias : []
    );
    const temConferenciaPendente = produtosAtivos.some(
        (produto) => !produtoTemConferenciaFinalizada(produto)
    );
    const totalConferencias = conferencias.length;
    const totalFinalizadas = conferencias.filter((conferencia) =>
        isConferenciaFinalizada(conferencia?.finalizada)
    ).length;
    const totalPendentes = Math.max(totalConferencias - totalFinalizadas, 0);
    const totalDefeitos = conferencias.reduce((acc, conferencia) => {
        const defeitos = Array.isArray(conferencia?.defeitos) ? conferencia.defeitos : [];
        return acc + defeitos.length;
    }, 0);
    const produtosComConferencia = produtosLista.filter((produto) =>
        Array.isArray(produto?.conferencias) && produto.conferencias.length > 0
    ).length;
    const produtosComFinalizada = produtosLista.filter((produto) =>
        produtoTemConferenciaFinalizada(produto)
    ).length;
    const conferenciaStatus = (() => {
        if (produtosLista.length > 0 && produtosComFinalizada === produtosLista.length) {
            return { label: 'Conferencia finalizada', bg: '#dcfce7', color: '#166534' };
        }
        if (totalConferencias > 0) {
            return { label: 'Aguardando finalizacao', bg: '#fef9c3', color: '#92400e' };
        }
        return { label: 'Sem conferencias', bg: '#e2e8f0', color: '#475569' };
    })();
    const fechamentoBloqueado = finalizadoLocal;
    const pecasBloqueadas = fechamentoForm.concluido100;
    const totalConcluido = produtosAtivos.reduce((acc, produto) => {
        const valor = Number(quantidadesConcluidas[produto.id]);
        return acc + (Number.isFinite(valor) ? valor : 0);
    }, 0);

    const statusTag = (() => {
        if (finalizadoLocal) {
            return { label: 'Finalizado', bg: '#dbeafe', color: '#1e3a8a' };
        }
        if (isAtrasado) {
            return { label: 'Atrasado', bg: '#fee2e2', color: '#b91c1c' };
        }
        if (isNaoIniciado) {
            return { label: 'Nao iniciado', bg: '#fef3c7', color: '#92400e' };
        }
        return { label: 'Em producao', bg: '#dcfce7', color: '#166534' };
    })();

    const etapasConcluidas = finalizadoLocal ? 6 : getEtapasConcluidasFromLote(lote);

    const displayDate = (value) => {
        if (!value) return '-';
        const formatado = formatarDataHora(value);
        if (formatado !== '-') return formatado;
        return typeof value === 'string' ? value : '-';
    };

    const resumoItens = [
        { label: 'Recebedor', value: nomeRecebedor || '-' },
        { label: 'Valor estimado', value: valorEstimado !== null && valorEstimado !== undefined ? `R$ ${valorEstimado}` : '-' },
        { label: 'Entrada', value: displayDate(dataEntrada) },
        { label: 'Saida prevista', value: displayDate(dataPrevistaSaida) },
        { label: 'Inicio', value: displayDate(dataInicio) },
        { label: 'Produtos', value: produtosLista.length },
        { label: 'Notas', value: notasFiscais?.length ?? 0 },
        { label: 'Filial', value: idFilial ?? '-' }
    ];

    const produtosResumo = produtosLista.map((produto) => {
        const confs = Array.isArray(produto?.conferencias) ? produto.conferencias : [];
        const finalizadas = confs.filter((conferencia) => isConferenciaFinalizada(conferencia?.finalizada)).length;
        const defeitos = confs.reduce((acc, conferencia) => {
            const itens = Array.isArray(conferencia?.defeitos) ? conferencia.defeitos : [];
            return acc + itens.length;
        }, 0);
        return {
            ...produto,
            totalConferencias: confs.length,
            finalizadas,
            pendentes: Math.max(confs.length - finalizadas, 0),
            defeitos
        };
    });

    const renderDetalhesConferencia = (produto) => {
        const confs = Array.isArray(produto?.conferencias) ? produto.conferencias : [];
        if (!confs.length) {
            return (
                <Typography variant="body2" color="#6b6b6b">
                    Nenhuma conferencia registrada para este produto.
                </Typography>
            );
        }

        return (
            <Box sx={{ display: 'grid', gap: 1.5 }}>
                {confs.map((conferencia) => {
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
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                                <Typography variant="subtitle2" color="#0f172a">
                                    Conferencia #{conferencia.id}
                                </Typography>
                                <Typography variant="caption" color="#64748b">
                                    {conferencia.dataConferencia ? formatarDataHora(conferencia.dataConferencia) : '-'}
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
                                    Status: {conferencia.status || '-'}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Typography variant="caption">Finalizada:</Typography>
                                    <Chip
                                        size="small"
                                        color={isConferenciaFinalizada(conferencia.finalizada) ? 'success' : 'error'}
                                        label={isConferenciaFinalizada(conferencia.finalizada) ? 'Sim' : 'Nao'}
                                        sx={{ fontWeight: 600 }}
                                    />
                                </Box>
                            </Box>

                            {conferencia.observacaoGeral && (
                                <Typography variant="caption" color="#475569" sx={{ mt: 1, display: 'block' }}>
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
                                            <Box key={defeito.id} sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
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
                                            </Box>
                                        ))}
                                    </Box>
                                ) : (
                                    <Typography variant="caption" color="#6b6b6b" sx={{ display: 'block', mt: 0.5 }}>
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

    return (
        <Box
            sx={{
                mt: 5,
                mb: 4,
                p: 3,
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                
                boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
                minHeight: '200px',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box
                sx={{
                    mb: 3,
                    p: 2.5,
                    borderRadius: 2.5,
                    background: '#f3f3f3',
                    border: '1px solid #f1f5f9',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 2
                    }}
                >
                    <Box>
                        <Typography variant="overline" sx={{ letterSpacing: 1, color: '#8a6b2d' }}>
                            Lote
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1f2937' }}>
                            #{numeroIdentificador || loteId}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            {fornecedor?.razaoSocial ? `Fornecedor: ${fornecedor.razaoSocial}` : 'Fornecedor nao informado'}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Box
                            sx={{
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 999,
                                fontSize: 12,
                                fontWeight: 700,
                                backgroundColor: statusTag.bg,
                                color: statusTag.color
                            }}
                        >
                            {statusTag.label}
                        </Box>
                        <Box
                            sx={{
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 999,
                                fontSize: 12,
                                fontWeight: 600,
                                backgroundColor: '#fff',
                                color: '#0f172a',
                                border: '1px solid #e5e7eb'
                            }}
                        >
                            CNPJ: {fornecedor?.cnpj || '-'}
                        </Box>
                    </Box>
                </Box>

                <Box
                    sx={{
                        mt: 2,
                        display: 'grid',
                        gap: 1.5,
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }
                    }}
                >
                    {resumoItens.map((item) => (
                        <Box
                            key={item.label}
                            sx={{
                                p: 1.5,
                                borderRadius: 1.5,
                                backgroundColor: '#fff',
                                border: '1px solid #f1f5f9',
                                boxShadow: '0 4px 10px rgba(15, 23, 42, 0.06)'
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{ color: '#64748b', letterSpacing: 0.6, textTransform: 'uppercase' }}
                            >
                                {item.label}
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                                {item.value}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>

            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                message={snackbar.message}
                sx={{ mt: 8, zIndex: (theme) => theme.zIndex.modal + 10 }}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
                    {snackbar.mensagem}
                </Alert>
            </Snackbar>

            <ModalInformacoesProduto
                open={modalAberto}
                onClose={handleFecharModal}
                produto={detalhesProduto}
                onSave={async (produtoAtualizado) => {
                    setSalvando(true);
                    const ok = await onSalvarProduto?.(produtoAtualizado);
                    setSalvando(false);
                    if (ok) {
                        setModalAberto(false);
                        setDetalhesProduto(null);
                    }
                }}
            >
                {salvando && (
                    <Box sx={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255,255,255,0.6)',
                        zIndex: 10
                    }}>
                        <MatxLoading />
                    </Box>
                )}
            </ModalInformacoesProduto>

            <ModalInformacoesLote
                open={modalAberto1}
                onClose={handleFecharModal1}
                lote={detalhesLote}
                onSave={async (loteAtualizado) => {
                    setSalvando(true);
                    const ok = await onSalvarLote?.(loteAtualizado);
                    setSalvando(false);
                    if (ok) {
                        setModalAberto1(false);
                        setDetalhesLote(null);
                    }
                }}
            >
                {salvando && (
                    <Box sx={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255,255,255,0.6)',
                        zIndex: 10
                    }}>
                        <MatxLoading />
                    </Box>
                )}
            </ModalInformacoesLote>

            <Divider sx={{ mb: 2, mt: 1 }} />

            <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: '#334155', letterSpacing: 0.4 }}>
                    Etapas do lote
                </Typography>
                <Box
                    sx={{
                        display: 'grid',
                        gap: 1.5,
                        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' }
                    }}
                >
                    {etapasDefault.map((etapa, index) => {
                        const isConcluida = index < etapasConcluidas;
                        const isAberta = etapaExpandida === etapa;
                        const etapaLabel = etapa.replace(/^\d\s-\s/, '');
                        const tone = isAberta
                            ? { bg: '#1f2937b3', border: '#1f2937b3', text: '#fff', iconBg: '#0ea5e9', iconText: '#fff' }
                            : isConcluida
                                ? { bg: '#19875411', border: '#86efac', text: '#14532d', iconBg: '#22c55e', iconText: '#fff' }
                                : { bg: '#ffffff', border: '#e2e8f0', text: '#0f172a', iconBg: '#e2e8f0', iconText: '#0f172a' };

                        return (
                            <Box
                                key={etapa}
                                onClick={() => setEtapaExpandida(isAberta ? null : etapa)}
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: tone.border,
                                    backgroundColor: tone.bg,
                                    color: tone.text,
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                    boxShadow: isAberta
                                        ? '0 12px 20px rgba(15, 23, 42, 0.14)'
                                        : '0 6px 14px rgba(15, 23, 42, 0.08)',
                                    '&:hover': { transform: 'translateY(-2px)' }
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box
                                        sx={{
                                            width: 34,
                                            height: 34,
                                            borderRadius: '50%',
                                            backgroundColor: tone.iconBg,
                                            color: tone.iconText,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {icones[etapa]}
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ display: 'block', fontWeight: 700 }}>
                                            {etapaLabel}
                                        </Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                            {isConcluida ? 'Concluido' : isAberta ? 'Aberto' : 'Pendente'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            </Box>

            <Collapse in={etapaExpandida === '1 - Lote'} timeout={400} unmountOnExit>
                <TableWrapper
                    // Contados de registros abaixo da tabela
                    total={produtos?.length || 0}
                    inicio={1}
                    fim={produtos?.length || 0}
                >
                    <Box sx={getRowStyles([lote], 'loteIniciado')}>
                        <DataTable
                            columns={colunasLote}
                            rows={[{
                                id: lote.id,
                                numeroIdentificador: lote.numeroIdentificador,
                                nomeEntregador: lote.nomeEntregador,
                                nomeRecebedor: lote.nomeRecebedor,
                                valorEstimado: lote.valorEstimado,
                                valorHoraEstimado: lote.valorHoraEstimado,
                                dataEntrada: lote.dataEntrada,
                                dataPrevistaSaida: lote.dataPrevistaSaida,
                                loteIniciado: lote.loteIniciado,
                                loteFinalizado: lote.loteFinalizado
                            }]}
                            pagination={false}
                        />
                    </Box>
                </TableWrapper>
            </Collapse>

            <Collapse in={etapaExpandida === '2 - Produtos'} timeout={400} unmountOnExit>
                <TableWrapper
                    // Contados de registros abaixo da tabela
                    total={produtos?.length || 0}
                    inicio={1}
                    fim={produtos?.length || 0}
                >
                    <Box sx={getRowStyles(produtos, 'iniciado')}>
                        <DataTable
                            columns={colunasProdutos}
                            rows={produtos || []}
                            pagination={false}
                        />
                    </Box>
                </TableWrapper>
            </Collapse>

            <Collapse in={etapaExpandida === '3 - NF-e'} timeout={400} unmountOnExit>
                <TableWrapper
                    // Contados de registros abaixo da tabela
                    total={produtos?.length || 0}
                    inicio={1}
                    fim={produtos?.length || 0}
                >
                    <DataTable
                        columns={colunasNotas}
                        rows={notasFiscais || []}
                        pagination={false}
                    />
                </TableWrapper>
            </Collapse>

            <Collapse in={etapaExpandida === '4 - Status'} timeout={400} unmountOnExit>
                <Box mt={2} p={2} bgcolor="#f5f5f5" borderRadius={2}>
                    <Typography variant="body2" color="#494949">
                        <Typography variant="subtitle2">
                            Data de inicio da operação:{' '}
                            {dataInicio ? formatarDataHora(dataInicio) : 'Ainda não iniciado!'}
                        </Typography>
                    </Typography>

                    {parseIniciado(loteIniciado) === false && (
                        <Box mt={2}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setOpenModal(true)}
                            >
                                Iniciar produção manualmente
                            </Button>
                        </Box>
                    )}
                </Box>

                {/* Modal controlado por estado */}
                <ConfirmInicioLoteModal
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                    onConfirm={async () => {
                        await onIniciarLote?.(loteId);
                        setOpenModal(false);
                    }}
                    loteId={loteId}
                    numeroIdentificador={numeroIdentificador}
                >
                    {salvando && (
                        <Box sx={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(255,255,255,0.6)',
                            zIndex: 10
                        }}>
                            <MatxLoading />
                        </Box>
                    )}
                </ConfirmInicioLoteModal>
            </Collapse>

            <Collapse in={etapaExpandida === '5 - Conferencia de qualidade'} timeout={400} unmountOnExit>
                <Box mt={2} p={2} bgcolor="#f5f5f5" borderRadius={2}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 1,
                            mb: 2
                        }}
                    >
                        <Typography variant="subtitle2" color="#494949">
                            Resumo de conferencias
                        </Typography>
                        <Box
                            sx={{
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 999,
                                fontSize: 12,
                                fontWeight: 600,
                                backgroundColor: conferenciaStatus.bg,
                                color: conferenciaStatus.color
                            }}
                        >
                            {conferenciaStatus.label}
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            display: 'grid',
                            gap: 1.5,
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                            mb: 2
                        }}
                    >
                        <Box>
                            <Typography variant="caption" color="#6b6b6b">Total de conferencias</Typography>
                            <Typography variant="subtitle2">{totalConferencias}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="#6b6b6b">Finalizadas</Typography>
                            <Typography variant="subtitle2">{totalFinalizadas}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="#6b6b6b">Pendentes</Typography>
                            <Typography variant="subtitle2">{totalPendentes}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="#6b6b6b">Produtos conferidos</Typography>
                            <Typography variant="subtitle2">{produtosComConferencia}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="#6b6b6b">Produtos com finalizacao</Typography>
                            <Typography variant="subtitle2">{produtosComFinalizada}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="#6b6b6b">Defeitos registrados</Typography>
                            <Typography variant="subtitle2">{totalDefeitos}</Typography>
                        </Box>
                    </Box>

                    {produtosResumo.length > 0 ? (
                        <Box>
                            <Typography variant="subtitle2" color="#494949" sx={{ mb: 1 }}>
                                Produtos e conferencias
                            </Typography>
                            <Typography variant="caption" color="#6b6b6b" sx={{ display: 'block', mb: 1 }}>
                                Clique na linha para ver detalhes da conferencia e defeitos.
                            </Typography>
                            <DataTable
                                columns={colunasResumoConferencias}
                                rows={produtosResumo}
                                pagination={false}
                                dense
                                getRowId={(row) => row.id}
                                onRowClick={(row) => {
                                    if (!row?.id) return;
                                    setProdutoExpandidoId((prev) => (prev === row.id ? null : row.id));
                                }}
                                expandedRowId={produtoExpandidoId}
                                renderExpandedRow={renderDetalhesConferencia}
                                emptyMessage="Nenhum produto encontrado para este lote."
                            />
                        </Box>
                    ) : (
                        <Typography variant="body2" color="#6b6b6b">
                            Nenhum produto encontrado para este lote.
                        </Typography>
                    )}
                </Box>
            </Collapse>

            <Collapse in={etapaExpandida === '6 - Finalizado'} timeout={400} unmountOnExit>
                <Box mt={2} p={2} bgcolor="#f5f5f5" borderRadius={2}>
                    <Typography variant="subtitle1" color="#2f2f2f" sx={{ mb: 1 }}>
                        Fechamento do lote
                    </Typography>

                    {fechamentoBloqueado && (
                        <Typography variant="body2" color="#666" sx={{ mb: 2 }}>
                            Este lote ja esta finalizado.
                        </Typography>
                    )}

                    {temConferenciaPendente && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            Existem produtos sem conferencia finalizada.
                        </Alert>
                    )}

                    <Box
                        sx={{
                            display: 'grid',
                            gap: 2,
                            gridTemplateColumns: { xs: '1fr', md: '1.1fr 2fr' }
                        }}
                    >
                        <Box
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                backgroundColor: '#fff',
                                border: '1px solid #e2e8f0'
                            }}
                        >
                            <Typography variant="subtitle2" sx={{ mb: 1, color: '#334155' }}>
                                Status
                            </Typography>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={fechamentoForm.concluido100}
                                        onChange={(e) => handleFechamentoChange('concluido100', e.target.checked)}
                                    />
                                }
                                label="Concluido 100%"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={fechamentoForm.teveBonus}
                                        onChange={(e) => handleFechamentoChange('teveBonus', e.target.checked)}
                                    />
                                }
                                label="Teve bonus"
                            />
                            <TextField
                                label="Data do fechamento"
                                type="date"
                                value={fechamentoForm.fechadoEm}
                                onChange={(e) => handleFechamentoChange('fechadoEm', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                size="small"
                                fullWidth
                                sx={{ mt: 1 }}
                            />
                        </Box>

                        <Box
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                backgroundColor: '#fff',
                                border: '1px solid #e2e8f0'
                            }}
                        >
                            <Typography variant="subtitle2" sx={{ mb: 1, color: '#334155' }}>
                                Resultado
                            </Typography>
                            <Box sx={{ display: 'grid', gap: 2 }}>
                                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
                                    <TextField
                                        label="Acrescimo entrega (%)"
                                        type="number"
                                        value={fechamentoForm.acrescimoEntregaPercent}
                                        onChange={(e) => handleFechamentoChange('acrescimoEntregaPercent', e.target.value)}
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">%</InputAdornment>
                                        }}
                                        inputProps={{ min: 0, step: 0.01 }}
                                        size="small"
                                    />
                                    <TextField
                                        label="Bonus (R$)"
                                        type="number"
                                        value={fechamentoForm.bonusValor}
                                        onChange={(e) => handleFechamentoChange('bonusValor', e.target.value)}
                                        inputProps={{ min: 0, step: 0.01 }}
                                        disabled={!fechamentoForm.teveBonus}
                                        size="small"
                                    />
                                </Box>
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="caption" color="#6b6b6b">
                                            Produtos do lote
                                        </Typography>
                                        {pecasBloqueadas && (
                                            <Typography variant="caption" color="#6b6b6b">
                                                Concluido 100% - quantidades bloqueadas
                                            </Typography>
                                        )}
                                    </Box>
                                    <DataTable
                                        columns={colunasProdutosFechamento}
                                        rows={produtosAtivos}
                                        pagination={false}
                                        dense
                                    />
                                    <Typography variant="caption" color="#6b6b6b" sx={{ display: 'block', mt: 1 }}>
                                        Total concluido: {totalConcluido}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSalvarFechamento}
                            disabled={salvandoFechamento || fechamentoBloqueado || temConferenciaPendente}
                        >
                            {salvandoFechamento ? 'Salvando...' : 'Encerrar lote'}
                        </Button>
                        <Typography variant="caption" color="#666">
                            Lote #{numeroIdentificador || loteId}
                        </Typography>
                    </Box>
                </Box>
            </Collapse>
            </Box>
        </Box>
    );
};

export default CardLote;
