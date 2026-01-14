import React, { useState } from 'react';
import { Box, Typography, Grid, Divider, Tooltip, Dialog, DialogTitle, DialogContent, CircularProgress, DialogActions, Button, Chip } from '@mui/material';
import { FaPen, FaBoxOpen, FaFileAlt, FaPowerOff, FaFlagCheckered } from 'react-icons/fa';
import { RiTimerFill } from "react-icons/ri"
import { IconsCardDefault } from '../../../../utils/constant';
import { buildColumnsWithEllipsis } from '../../../../utils/buildColumns';
import { Collapse } from '@mui/material'
import { parseIniciado } from '../../../../utils/parseIniciado';
import { Snackbar, Alert } from "@mui/material";
import InfoHeaderCard from './InforHeaderCard';
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
    '5 - Conferencia de qualidade': <FaPowerOff size={IconsCardDefault} />,
    '6 - Finalizado': <FaFlagCheckered size={IconsCardDefault} />
};
const isConferenciaFinalizada = (valor) =>
    valor === 1 || valor === true || valor == '1' || valor == 'Sim';

const temConferenciaFinalizada = (lote) => {
    const produtos = Array.isArray(lote?.produtos) ? lote.produtos : [];
    return produtos.some((produto) =>
        Array.isArray(produto?.conferencias) &&
        produto.conferencias.some((conferencia) => isConferenciaFinalizada(conferencia?.finalizada))
    );
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
    const [produtoExpandidoId, setProdutoExpandidoId] = useState(null);
    const [modalAberto, setModalAberto] = useState(false);
    const [modalAberto1, setModalAberto1] = useState(false);
    const [detalhesProduto, setDetalhesProduto] = useState(null);
    const [detalhesLote, setDetalhesLote] = useState(null);
    const [salvando, setSalvando] = useState(false);
    const [openModal, setOpenModal] = useState(false);
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
        produtos,
        fechamento
    } = lote;
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: '',
        mensagem: ''
    });

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

    const etapasConcluidas = getEtapasConcluidasFromLote(lote);

    const colunasProdutos = buildColumnsWithEllipsis([
        { field: 'numeroIdentificador', headerName: 'Identificador' },
        { field: 'nomeProduto', headerName: 'Produto' },
        { field: 'tipoEstilo', headerName: 'Estilo' },
        { field: 'tamanho', headerName: 'Tamanho' },
        { field: 'corPrimaria', headerName: 'Cor Primária' },
        { field: 'corSecundaria', headerName: 'Cor Secundária' },
        { field: 'quantidadeProduto', headerName: 'Qtd' },
        { field: 'valorPorPeca', headerName: 'Valor Unitário' },
        { field: 'someValorTotalProduto', headerName: 'Valor Total' },
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
        { field: 'numeroNota', headerName: 'Número' },
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
        { field: 'defeitos', headerName: 'Defeitos' }
    ]);

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
            const [hh, mm] = horario.split(':');
            return new Date(
                Number(ano),
                Number(mes) - 1,
                Number(dia),
                Number(hh || 0),
                Number(mm || 0),
                0,
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
        // Senão, tenta parse nativo (ISO/Date)
        if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(input)) {
            const [data, horario] = input.split(' ');
            const [ano, mes, dia] = data.split('-');
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
        return new Date(input);
    }

    // === flags ===
    const iniciado = parseIniciado(loteIniciado);
    const finalizado = parseIniciado(loteFinalizado);

    const previstaDate = parseDateFlexible(dataPrevistaSaida);
    const previstaTime = previstaDate ? previstaDate.getTime() : NaN;

    const isAtrasado =
        Number.isFinite(previstaTime) &&
        previstaTime < Date.now() &&
        !finalizado;
    const isNaoIniciado = !iniciado && !finalizado;
    const isEmProducao = iniciado && !finalizado && !isAtrasado;
    const produtosLista = Array.isArray(produtos) ? produtos : [];
    const conferencias = produtosLista.flatMap((produto) =>
        Array.isArray(produto?.conferencias) ? produto.conferencias : []
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
        Array.isArray(produto?.conferencias) &&
        produto.conferencias.some((conferencia) => isConferenciaFinalizada(conferencia?.finalizada))
    ).length;
    const conferenciaStatus = (() => {
        if (totalFinalizadas > 0) {
            return { label: 'Conferencia finalizada', bg: '#dcfce7', color: '#166534' };
        }
        if (totalConferencias > 0) {
            return { label: 'Aguardando finalizacao', bg: '#fef9c3', color: '#92400e' };
        }
        return { label: 'Sem conferencias', bg: '#e2e8f0', color: '#475569' };
    })();

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
        <Box sx={{ mt: 5, mb: 4, p: 3, borderRadius: 2, boxShadow: 2, backgroundColor: '#fff', minHeight: '200px' }}>

            {/* Header do Card */}
            <Box sx={{ mb: 3, color: '#5a5a5a' }}>
                <InfoHeaderCard
                    overdue={isAtrasado}
                    notStarted={isNaoIniciado}
                    inProduction={isEmProducao}
                    items={[
                        { label: 'Identificação', value: numeroIdentificador },
                        { label: 'CNPJ', value: fornecedor?.cnpj },
                        { label: 'Razão social', value: fornecedor?.razaoSocial },
                        { label: 'Data de criação', value: dataEntrada ? new Date(dataEntrada).toLocaleString() : '-' },
                        { label: 'Valor Estimado', value: `R$ ${valorEstimado}` },
                        { label: 'Nome do Recebedor', value: nomeRecebedor },
                        { label: 'Início', value: dataInicio ? dataInicio : 'Não iniciado' },
                        { label: 'Data de Saída', value: dataPrevistaSaida }
                    ]}
                />
            </Box>

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

            {/* Timeline visual */}
            <Box sx={{ position: 'relative', mt: 2, mb: 2 }}>
                <Box sx={{
                    position: 'absolute',
                    top: '37px',
                    left: '200px',
                    right: '200px',
                    height: '2px',
                    backgroundColor: '#969696',
                    zIndex: 0
                }}
                />

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        px: 5,
                        position: 'relative',
                        zIndex: 1
                    }}
                >
                    {etapasDefault.map((etapa, index) => {
                        const isConcluida = index < etapasConcluidas;
                        const cor = isConcluida ? '#198754' : '#B5B939';
                        const isAberta = etapaExpandida === etapa;

                        return (
                            <Box key={etapa} sx={{ textAlign: 'center', flex: 1 }}>
                                <Box
                                    sx={{
                                        width: 75,
                                        height: 75,
                                        borderRadius: '50%',
                                        backgroundColor: '#fff',
                                        mx: 'auto',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 2,
                                        cursor: 'pointer',
                                        border: isAberta ? '2px solid #e5ebe8' : '2px solid transparent',
                                        boxShadow: isAberta ? '0 0 6px rgba(255, 255, 255, 0.5)' : 'none',
                                        transition: 'border 0.2s, box-shadow 0.2s'
                                    }}
                                    onClick={() => setEtapaExpandida(isAberta ? null : etapa)}
                                >
                                    <Box
                                        sx={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: '50%',
                                            backgroundColor: cor,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#fff'
                                        }}
                                    >
                                        {icones[etapa]}
                                    </Box>
                                </Box>
                                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                                    {etapa}
                                </Typography>
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
                            Data de início da operação:{' '}
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
                                Iniciar produção manual
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
                    <Typography variant="subtitle2" color="#494949" sx={{ mb: 2 }}>
                        Dados de fechamento
                    </Typography>

                    {fechamento ? (
                        <Box
                            sx={{
                                display: 'grid',
                                gap: 1.5,
                                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }
                            }}
                        >
                            <Box>
                                <Typography variant="caption" color="#6b6b6b">Concluido 100%</Typography>
                                <Typography variant="subtitle2">
                                    {fechamento.concluido100 ? 'Sim' : 'Nao'}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="#6b6b6b">Teve bonus</Typography>
                                <Typography variant="subtitle2">
                                    {fechamento.teveBonus ? 'Sim' : 'Nao'}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="#6b6b6b">Bonus (R$)</Typography>
                                <Typography variant="subtitle2">
                                    {fechamento.bonusValor ?? '-'}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="#6b6b6b">Pecas concluidas</Typography>
                                <Typography variant="subtitle2">
                                    {fechamento.pecasConcluidasSucesso ?? '-'}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="#6b6b6b">Acrescimo entrega (%)</Typography>
                                <Typography variant="subtitle2">
                                    {fechamento.acrescimoEntregaPercent ?? '-'}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="#6b6b6b">Fechado em</Typography>
                                <Typography variant="subtitle2">
                                    {fechamento.fechadoEm ? formatarDataHora(fechamento.fechadoEm) : '-'}
                                </Typography>
                            </Box>
                        </Box>
                    ) : (
                        <Typography variant="body2" color="#6b6b6b">
                            Nenhum fechamento registrado para este lote.
                        </Typography>
                    )}
                </Box>
            </Collapse>
        </Box>
    );
};

export default CardLote;






