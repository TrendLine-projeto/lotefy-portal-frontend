import React, { useState } from 'react';
import { Box, Typography, Grid, Divider, Tooltip, Dialog, DialogTitle, DialogContent, CircularProgress, DialogActions, Button } from '@mui/material';
import { FaPen, FaBoxOpen, FaFileAlt, FaLink, FaPowerOff, FaFlagCheckered, FaHourglassStart } from 'react-icons/fa';
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
import imgIcon from '../../../../assets/img/images.png'
import MatxLoading from "../../../../components/MatxLoading";

const icones = {
    '1 - Lote': <FaPen size={IconsCardDefault} />,
    '2 - Produtos': <FaBoxOpen size={IconsCardDefault} />,
    '3 - NF-e': <FaFileAlt size={IconsCardDefault} />,
    '4 - Integração': <FaLink size={IconsCardDefault} />,
    '5 - Status': <FaPowerOff size={IconsCardDefault} />,
    '6 - Finalizado': <FaFlagCheckered size={IconsCardDefault} />
};

const getEtapasConcluidasFromLote = (lote) => {
    if (!lote) return 0;

    if (lote.loteFinalizado === "Sim" || lote.loteFinalizado === 1) return 6;
    if (lote.loteIniciado === "Não" || lote.loteIniciado === 0) return 4;
    return 5;
};

const CardLote = ({ lote, onIniciarLote, onSalvarProduto, onSalvarLote }) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [etapaExpandida, setEtapaExpandida] = useState(null);
    const [modalAberto, setModalAberto] = useState(false);
    const [modalAberto1, setModalAberto1] = useState(false);
    const [detalhesProduto, setDetalhesProduto] = useState(null);
    const [detalhesLote, setDetalhesLote] = useState(null);
    const [salvando, setSalvando] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const etapasDefault = ['1 - Lote', '2 - Produtos', '3 - NF-e', '4 - Integração', '5 - Status', '6 - Finalizado'];
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
            field: 'blingIdentify',
            headerName: 'Integrado ERP',
            renderCell: (row) => {
                const hasBling = !!row?.blingIdentify;
                return (
                    <img
                        src={imgIcon}
                        alt={hasBling ? 'Integrado' : 'Não integrado'}
                        style={{ opacity: hasBling ? 1 : 0.3, width: '27px', height: '27px', }}
                        title={hasBling ? `ID: ${row.blingIdentify}` : 'Não integrado'}
                    />
                );
            },
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

    const formatarDataHora = (isoString) => {
        const date = new Date(isoString);
        const dia = String(date.getDate()).padStart(2, '0');
        const mes = String(date.getMonth() + 1).padStart(2, '0');
        const ano = date.getFullYear();
        const horas = String(date.getHours()).padStart(2, '0');
        const minutos = String(date.getMinutes()).padStart(2, '0');
        return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
    };

    const isIniciado = parseIniciado(loteIniciado);
    const isFinalizado = parseIniciado(loteFinalizado);
    const prevista = dataPrevistaSaida ? new Date(dataPrevistaSaida) : null;
    const isAtrasado = !!(prevista && !isNaN(prevista) && Date.now() > prevista.getTime() && !isFinalizado);

    return (
        <Box sx={{ mt: 5, mb: 4, p: 3, borderRadius: 2, boxShadow: 2, backgroundColor: '#fff', minHeight: '200px' }}>

            {/* Header do Card */}
            <Box sx={{ mb: 3, color: '#5a5a5a' }}>
                <InfoHeaderCard
                    overdue={isAtrasado}
                    items={[
                        { label: 'Identificação', value: numeroIdentificador },
                        { label: 'CNPJ', value: fornecedor?.cnpj },
                        { label: 'Razão social', value: fornecedor?.razaoSocial },
                        { label: 'Data de criação', value: dataEntrada ? new Date(dataEntrada).toLocaleString() : '-' },
                        { label: 'Valor Estimado', value: `R$ ${valorEstimado}` },
                        { label: 'Nome do Recebedor', value: nomeRecebedor },
                        { label: 'Início', value: isIniciado ? dataInicio : 'Não iniciado' },
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

            <Collapse in={etapaExpandida === '4 - Integração'} timeout={400} unmountOnExit>
                <Box mt={2} p={2} bgcolor="#f5f5f5" borderRadius={2}>
                    <Typography variant="body2" color="text.secondary">
                        Sem integração no momento.
                    </Typography>
                </Box>

            </Collapse>

            <Collapse in={etapaExpandida === '5 - Status'} timeout={400} unmountOnExit>
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
        </Box>
    );
};

export default CardLote;
