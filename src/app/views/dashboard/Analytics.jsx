import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ReactEcharts from "echarts-for-react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Grid from "@mui/material/Grid2";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { alpha, styled, useTheme } from "@mui/material/styles";
import BuildRounded from "@mui/icons-material/BuildRounded";
import Inventory2Rounded from "@mui/icons-material/Inventory2Rounded";
import LocalShippingRounded from "@mui/icons-material/LocalShippingRounded";
import FactCheckRounded from "@mui/icons-material/FactCheckRounded";
import NotificationsActiveRounded from "@mui/icons-material/NotificationsActiveRounded";
import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";

import useAuth from "app/hooks/useAuth";
import { getIdClienteFromToken } from "app/utils/authToken";

// STYLED COMPONENTS
const ContentBox = styled("div")(({ theme }) => ({
  margin: "2rem",
  [theme.breakpoints.down("sm")]: { margin: "1rem" }
}));

const formatCurrency = (value) => {
  const number = Number(value) || 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(number);
};

const formatNumber = (value) => new Intl.NumberFormat("pt-BR").format(Number(value) || 0);

const formatMes = (value) => {
  if (!value || typeof value !== "string") return "-";
  const [ano, mes] = value.split("-");
  if (!ano || !mes) return value;
  return `${mes}/${ano}`;
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const parsed = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) return String(value);
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(parsed);
};

const truncateText = (value, max = 60) => {
  if (!value) return "-";
  const text = String(value);
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3)}...`;
};

const normalizeFiltroDate = (value, boundary) => {
  if (!value) return "";
  return `${value} ${boundary === "end" ? "23:59:59" : "00:00:00"}`;
};

const defaultCardIds = [
  "valorRecebido",
  "valorEmProducao",
  "valorAReceber",
  "lotesEmProducao",
  "lotesFinalizados"
];

export default function Analytics() {
  const theme = useTheme();
  const { user } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [fornecedores, setFornecedores] = useState([]);
  const [fornecedorId, setFornecedorId] = useState("");
  const [cards, setCards] = useState(null);
  const [serieMensal, setSerieMensal] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [cardsModalOpen, setCardsModalOpen] = useState(false);
  const [selectedCardIds, setSelectedCardIds] = useState(defaultCardIds);
  const [draftCardIds, setDraftCardIds] = useState(defaultCardIds);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [notificacoes, setNotificacoes] = useState([]);
  const [loadingNotificacoes, setLoadingNotificacoes] = useState(false);
  const [erroNotificacoes, setErroNotificacoes] = useState("");
  const [operacao, setOperacao] = useState(null);
  const [operacaoFiltros, setOperacaoFiltros] = useState(null);
  const [loadingOperacao, setLoadingOperacao] = useState(false);
  const [erroOperacao, setErroOperacao] = useState("");

  const idCliente = user?.cliente?.id ?? getIdClienteFromToken();

  useEffect(() => {
    const saved = localStorage.getItem("dashboardFornecedorId");
    if (saved) setFornecedorId(saved);
  }, []);

  useEffect(() => {
    const savedInicio = localStorage.getItem("dashboardDataEntradaDe");
    const savedFim = localStorage.getItem("dashboardDataEntradaAte");
    if (savedInicio) setDataInicio(savedInicio);
    if (savedFim) setDataFim(savedFim);
  }, []);

  useEffect(() => {
    if (fornecedorId) {
      localStorage.setItem("dashboardFornecedorId", fornecedorId);
    }
  }, [fornecedorId]);

  useEffect(() => {
    if (dataInicio) {
      localStorage.setItem("dashboardDataEntradaDe", dataInicio);
    } else {
      localStorage.removeItem("dashboardDataEntradaDe");
    }

    if (dataFim) {
      localStorage.setItem("dashboardDataEntradaAte", dataFim);
    } else {
      localStorage.removeItem("dashboardDataEntradaAte");
    }
  }, [dataInicio, dataFim]);

  useEffect(() => {
    if (!idCliente || !apiUrl) return;

    const carregarFornecedores = async () => {
      try {
        const response = await fetch(`${apiUrl}/fornecedorProd/fornecedores_producao/lista_simples`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cliente_id: idCliente })
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.mensagem || "Falha ao buscar fornecedores");
        }

        const lista = data.fornecedores || [];
        setFornecedores(lista);

        if (!fornecedorId && lista.length > 0) {
          setFornecedorId(String(lista[0].id));
        }
      } catch (error) {
        setErro(error?.message || "Erro ao carregar fornecedores");
      }
    };

    carregarFornecedores();
  }, [idCliente, apiUrl]);

  useEffect(() => {
    if (!fornecedorId || !apiUrl) return;

    const carregarDashboard = async () => {
      setLoading(true);
      setErro("");

      try {
        const params = new URLSearchParams();
        params.set("idFornecedor_producao", fornecedorId);
        if (dataInicio) params.set("dataEntradaDe", dataInicio);
        if (dataFim) params.set("dataEntradaAte", dataFim);

        const serieParams = new URLSearchParams(params);
        if (!dataInicio && !dataFim) {
          serieParams.set("meses", "6");
        }

        const [cardsRes, serieRes] = await Promise.all([
          fetch(`${apiUrl}/dashboard/cards?${params.toString()}`),
          fetch(`${apiUrl}/dashboard/serie-mensal?${serieParams.toString()}`)
        ]);

        const cardsData = await cardsRes.json().catch(() => ({}));
        const serieData = await serieRes.json().catch(() => ({}));

        if (!cardsRes.ok) {
          throw new Error(cardsData.mensagem || "Erro ao buscar cards");
        }
        if (!serieRes.ok) {
          throw new Error(serieData.mensagem || "Erro ao buscar serie mensal");
        }

        setCards(cardsData.cards || null);
        setSerieMensal(serieData.serie || []);
      } catch (error) {
        setErro(error?.message || "Erro ao carregar dashboard");
      } finally {
        setLoading(false);
      }
    };

    carregarDashboard();
  }, [fornecedorId, apiUrl, dataInicio, dataFim]);

  useEffect(() => {
    if (!idCliente || !apiUrl) return;

    const carregarNotificacoes = async () => {
      setLoadingNotificacoes(true);
      setErroNotificacoes("");

      try {
        const params = new URLSearchParams();
        params.set("pagina", "1");
        params.set("quantidadePorPagina", "10");
        params.set("idCliente", String(idCliente));
        if (dataInicio) params.set("dataCriacaoDe", normalizeFiltroDate(dataInicio, "start"));
        if (dataFim) params.set("dataCriacaoAte", normalizeFiltroDate(dataFim, "end"));

        const response = await fetch(`${apiUrl}/notificacoes?${params.toString()}`);
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.mensagem || "Erro ao buscar notificacoes");
        }

        setNotificacoes(data.itens || []);
      } catch (error) {
        setErroNotificacoes(error?.message || "Erro ao carregar notificacoes");
      } finally {
        setLoadingNotificacoes(false);
      }
    };

    carregarNotificacoes();
  }, [idCliente, apiUrl, dataInicio, dataFim]);

  useEffect(() => {
    if (!idCliente || !apiUrl) return;

    const carregarOperacao = async () => {
      setLoadingOperacao(true);
      setErroOperacao("");

      try {
        const params = new URLSearchParams();
        params.set("idCliente", String(idCliente));
        if (dataInicio) params.set("dataEntradaDe", dataInicio);
        if (dataFim) params.set("dataEntradaAte", dataFim);

        const response = await fetch(`${apiUrl}/dashboard/operacao-alertas?${params.toString()}`);
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.mensagem || "Erro ao buscar indicadores de operacao");
        }

        setOperacao(data);
        setOperacaoFiltros(data.filtros || null);
      } catch (error) {
        setErroOperacao(error?.message || "Erro ao carregar operacao");
      } finally {
        setLoadingOperacao(false);
      }
    };

    carregarOperacao();
  }, [idCliente, apiUrl, dataInicio, dataFim]);

  const cardsInfo = cards || {
    totalLotes: 0,
    lotesIniciados: 0,
    lotesNaoIniciados: 0,
    lotesEmProducao: 0,
    lotesFinalizados: 0,
    valorTotal: 0,
    valorRecebido: 0,
    valorEmProducao: 0,
    valorAReceber: 0
  };

  const cardItems = useMemo(() => ([
    {
      id: "valorRecebido",
      label: "Valor recebido",
      value: formatCurrency(cardsInfo.valorRecebido),
      helper: "Lotes finalizados",
      color: theme.palette.success.main
    },
    {
      id: "valorEmProducao",
      label: "Valor em producao",
      value: formatCurrency(cardsInfo.valorEmProducao),
      helper: "Lotes iniciados",
      color: theme.palette.info.main
    },
    {
      id: "valorAReceber",
      label: "Valor a receber",
      value: formatCurrency(cardsInfo.valorAReceber),
      helper: "Lotes nao iniciados",
      color: theme.palette.warning.main
    },
    {
      id: "lotesEmProducao",
      label: "Lotes em producao",
      value: formatNumber(cardsInfo.lotesEmProducao),
      helper: "Em andamento",
      color: theme.palette.primary.main
    },
    {
      id: "lotesFinalizados",
      label: "Lotes finalizados",
      value: formatNumber(cardsInfo.lotesFinalizados),
      helper: "Concluidos",
      color: theme.palette.success.dark
    },
    {
      id: "lotesNaoIniciados",
      label: "Aguardando inicio",
      value: formatNumber(cardsInfo.lotesNaoIniciados),
      helper: "Fila de entrada",
      color: theme.palette.secondary.main
    },
    {
      id: "totalLotes",
      label: "Total de lotes",
      value: formatNumber(cardsInfo.totalLotes),
      helper: "Base geral",
      color: theme.palette.text.primary
    }
  ]), [cardsInfo, theme]);

  const allCardIds = cardItems.map((item) => item.id);

  useEffect(() => {
    const stored = localStorage.getItem("dashboardCardsSelecionados");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const valid = Array.isArray(parsed)
          ? parsed.filter((id) => allCardIds.includes(id))
          : [];
        if (valid.length > 0) {
          setSelectedCardIds(valid);
          return;
        }
      } catch (_) {
        // ignora dados invalidos no localStorage
      }
    }
    setSelectedCardIds(defaultCardIds.filter((id) => allCardIds.includes(id)));
  }, [allCardIds]);

  const visibleCards = cardItems.filter((item) => selectedCardIds.includes(item.id));

  const handleOpenCardsModal = () => {
    setDraftCardIds(selectedCardIds);
    setCardsModalOpen(true);
  };

  const handleToggleCard = (id) => {
    setDraftCardIds((prev) => (
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    ));
  };

  const handleSaveCards = () => {
    setSelectedCardIds(draftCardIds);
    localStorage.setItem("dashboardCardsSelecionados", JSON.stringify(draftCardIds));
    setCardsModalOpen(false);
  };

  const serieLabels = serieMensal.map((item) => formatMes(item.mes));
  const serieLotes = serieMensal.map((item) => Number(item.totalLotes) || 0);
  const serieValores = serieMensal.map((item) => Number(item.valorTotal) || 0);
  const serieEmProducao = serieMensal.map((item) => Number(item.valorEmProducao) || 0);

  const serieOption = useMemo(() => {
    return {
      tooltip: { trigger: "axis" },
      legend: {
        bottom: 0,
        data: ["Lotes", "Valor total", "Valor em producao"],
        textStyle: { color: theme.palette.text.secondary, fontFamily: "roboto", fontSize: 12 }
      },
      grid: { left: "3%", right: "3%", bottom: "18%", top: "10%", containLabel: true },
      xAxis: {
        type: "category",
        data: serieLabels,
        axisLine: { lineStyle: { color: theme.palette.divider } },
        axisLabel: { color: theme.palette.text.secondary }
      },
      yAxis: [
        {
          type: "value",
          name: "Lotes",
          axisLine: { lineStyle: { color: theme.palette.divider } },
          axisLabel: { color: theme.palette.text.secondary }
        },
        {
          type: "value",
          name: "Valor (R$)",
          position: "right",
          axisLine: { lineStyle: { color: theme.palette.divider } },
          axisLabel: { color: theme.palette.text.secondary }
        }
      ],
      series: [
        {
          name: "Lotes",
          type: "bar",
          data: serieLotes,
          itemStyle: { color: theme.palette.primary.main }
        },
        {
          name: "Valor total",
          type: "line",
          yAxisIndex: 1,
          data: serieValores,
          smooth: true,
          itemStyle: { color: theme.palette.warning.main }
        },
        {
          name: "Valor em producao",
          type: "line",
          yAxisIndex: 1,
          data: serieEmProducao,
          smooth: true,
          itemStyle: { color: theme.palette.info.main }
        }
      ]
    };
  }, [serieLabels, serieLotes, serieValores, serieEmProducao, theme]);

  const statusOption = useMemo(() => {
    const data = [
      { value: cardsInfo.lotesFinalizados, name: "Finalizados" },
      { value: cardsInfo.lotesEmProducao, name: "Em producao" },
      { value: cardsInfo.lotesNaoIniciados, name: "Nao iniciados" }
    ];

    return {
      tooltip: { trigger: "item" },
      legend: {
        bottom: 0,
        itemGap: 16,
        icon: "circle",
        textStyle: { color: theme.palette.text.secondary, fontFamily: "roboto", fontSize: 12 }
      },
      series: [
        {
          name: "Status",
          type: "pie",
          radius: ["45%", "70%"],
          center: ["50%", "45%"],
          labelLine: { show: false },
          label: { show: false },
          data,
          emphasis: {
            label: {
              show: true,
              fontSize: 13,
              formatter: "{b}: {c}"
            }
          }
        }
      ]
    };
  }, [cardsInfo, theme]);

  const getNotificacaoVisual = (tipo) => {
    const label = String(tipo || "").toLowerCase();
    if (label.includes("manut")) {
      return { icon: BuildRounded, color: theme.palette.warning.main };
    }
    if (label.includes("estoque") || label.includes("insumo")) {
      return { icon: Inventory2Rounded, color: theme.palette.info.main };
    }
    if (label.includes("lote") || label.includes("producao")) {
      return { icon: LocalShippingRounded, color: theme.palette.primary.main };
    }
    if (label.includes("qualidade") || label.includes("conferencia")) {
      return { icon: FactCheckRounded, color: theme.palette.success.main };
    }
    if (label.includes("alerta") || label.includes("erro")) {
      return { icon: WarningAmberRounded, color: theme.palette.error.main };
    }
    return { icon: NotificationsActiveRounded, color: theme.palette.secondary.main };
  };

  const periodoTexto = dataInicio || dataFim
    ? `Periodo (data de entrada): ${dataInicio || "inicio"} a ${dataFim || "hoje"}`
    : "Lotes e valores estimados dos ultimos 6 meses";
  const periodoNotificacoes = dataInicio || dataFim
    ? `Filtrado por data de criacao: ${dataInicio || "inicio"} a ${dataFim || "hoje"}`
    : "Ultimas 10 notificacoes do cliente";
  const operacaoInfo = operacao?.operacao || {};
  const alertasInfo = operacao?.alertas || {};
  const lotesPorFilial = operacaoInfo.lotesPorFilial || [];
  const lotesPorFornecedor = operacaoInfo.lotesPorFornecedor || [];
  const lotesRiscoAtraso = alertasInfo.lotesRiscoAtraso || [];
  const lotesRiscoLimitados = lotesRiscoAtraso.slice(0, 10);
  const notificacoesLimitadas = (notificacoes || []).slice(0, 10);

  return (
    <ContentBox className="analytics">
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Dashboard de lotes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Numeros principais da operacao
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
          <TextField
            select
            label="Fornecedor"
            value={fornecedorId}
            onChange={(event) => setFornecedorId(event.target.value)}
            sx={{ minWidth: 240 }}
            size="small"
          >
            {fornecedores.length === 0 && (
              <MenuItem value="">Sem fornecedores</MenuItem>
            )}
            {fornecedores.map((fornecedor) => (
              <MenuItem key={fornecedor.id} value={String(fornecedor.id)}>
                {fornecedor.razaoSocial}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="De"
            type="date"
            value={dataInicio}
            onChange={(event) => setDataInicio(event.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />
          <TextField
            label="Ate"
            type="date"
            value={dataFim}
            onChange={(event) => setDataFim(event.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />
          <Button variant="outlined" onClick={handleOpenCardsModal}>
            Configurar cards
          </Button>
        </Stack>
      </Stack>

      <Divider sx={{ my: 3 }} />

      {erro && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {erro}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && (
        <Stack spacing={3}>
          <Grid container spacing={4}>
            {visibleCards.length === 0 ? (
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" color="text.secondary">
                  Nenhum card selecionado. Use "Configurar cards" para exibir os dados.
                </Typography>
              </Grid>
            ) : (
              visibleCards.map((item) => (
                <Grid key={item.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <Card
                    sx={{
                      height: "100%",
                      border: `1px solid ${alpha(item.color, 0.25)}`,
                      backgroundColor: alpha(item.color, 0.08)
                    }}
                  >
                    <CardContent>
                      <Typography variant="overline" color="text.secondary">
                        {item.label}
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: item.color }}>
                        {item.value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.helper}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Evolucao mensal
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {periodoTexto}
                  </Typography>
                  {serieMensal.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Nenhum dado encontrado para este periodo.
                    </Typography>
                  ) : (
                    <ReactEcharts style={{ height: 320 }} option={serieOption} />
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Status dos lotes
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Distribuicao por etapa
                  </Typography>
                  <ReactEcharts style={{ height: 320 }} option={statusOption} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Lotes por filial
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Distribuicao por unidade
                  </Typography>
                  {loadingOperacao ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                      <CircularProgress size={22} />
                    </Box>
                  ) : erroOperacao ? (
                    <Alert severity="error">{erroOperacao}</Alert>
                  ) : lotesPorFilial.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Nenhum lote encontrado no periodo.
                    </Typography>
                  ) : (
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Filial</TableCell>
                          <TableCell align="right">Total</TableCell>
                          <TableCell align="right">Em producao</TableCell>
                          <TableCell align="right">Finalizados</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {lotesPorFilial.map((item) => (
                          <TableRow key={item.idFilial} hover>
                            <TableCell>{item.nomeFilial || `Filial ${item.idFilial}`}</TableCell>
                            <TableCell align="right">{formatNumber(item.totalLotes)}</TableCell>
                            <TableCell align="right">{formatNumber(item.lotesEmProducao)}</TableCell>
                            <TableCell align="right">{formatNumber(item.lotesFinalizados)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Lotes por fornecedor
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Top fornecedores no periodo
                  </Typography>
                  {loadingOperacao ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                      <CircularProgress size={22} />
                    </Box>
                  ) : erroOperacao ? (
                    <Alert severity="error">{erroOperacao}</Alert>
                  ) : lotesPorFornecedor.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Nenhum fornecedor encontrado no periodo.
                    </Typography>
                  ) : (
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Fornecedor</TableCell>
                          <TableCell align="right">Total</TableCell>
                          <TableCell align="right">Em producao</TableCell>
                          <TableCell align="right">Finalizados</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {lotesPorFornecedor.map((item) => (
                          <TableRow key={item.idFornecedor || item.nomeFornecedor} hover>
                            <TableCell>{item.nomeFornecedor}</TableCell>
                            <TableCell align="right">{formatNumber(item.totalLotes)}</TableCell>
                            <TableCell align="right">{formatNumber(item.lotesEmProducao)}</TableCell>
                            <TableCell align="right">{formatNumber(item.lotesFinalizados)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    justifyContent="space-between"
                    spacing={1}
                    sx={{ mb: 2 }}
                  >
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Alertas de prazo
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Lotes com risco ou atraso no periodo
                      </Typography>
                    </Box>
                    <Chip
                      label={`${lotesRiscoLimitados.length} itens`}
                      size="small"
                      sx={{ backgroundColor: alpha(theme.palette.error.main, 0.1) }}
                    />
                  </Stack>

                  {loadingOperacao ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                      <CircularProgress size={22} />
                    </Box>
                  ) : erroOperacao ? (
                    <Alert severity="error">{erroOperacao}</Alert>
                  ) : lotesRiscoLimitados.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Nenhum lote em risco ou atraso no periodo.
                    </Typography>
                  ) : (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Lote</TableCell>
                            <TableCell>Filial</TableCell>
                            <TableCell>Fornecedor</TableCell>
                            <TableCell>Previsto</TableCell>
                            <TableCell align="right">Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {lotesRiscoLimitados.map((item) => {
                            const statusColor =
                              item.status === "atrasado" ? theme.palette.error.main : theme.palette.warning.main;
                            return (
                              <TableRow key={item.id} hover sx={{ height: 52 }}>
                                <TableCell sx={{ maxWidth: 200 }}>
                                  <Typography
                                    component={Link}
                                    to={"/lotes/lotesacompanhamento"}
                                    color="text.primary"
                                    sx={{
                                      textDecoration: "none",
                                      fontWeight: 600,
                                      "&:hover": { textDecoration: "underline" },
                                      display: "block",
                                      maxWidth: 200,
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis"
                                    }}
                                  >
                                    {truncateText(item.numeroIdentificador, 40)}
                                  </Typography>
                                </TableCell>
                                <TableCell sx={{ maxWidth: 160 }}>
                                  <Typography
                                    sx={{
                                      display: "block",
                                      maxWidth: 160,
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis"
                                    }}
                                  >
                                    {truncateText(item.nomeFilial || "-", 30)}
                                  </Typography>
                                </TableCell>
                                <TableCell sx={{ maxWidth: 200 }}>
                                  <Typography
                                    sx={{
                                      display: "block",
                                      maxWidth: 200,
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis"
                                    }}
                                  >
                                    {truncateText(item.nomeFornecedor || "-", 36)}
                                  </Typography>
                                </TableCell>
                                <TableCell>{formatDateTime(item.dataPrevistaSaida)}</TableCell>
                                <TableCell align="right">
                                  <Chip
                                    size="small"
                                    label={item.status === "atrasado" ? "Atrasado" : "Risco"}
                                    sx={{
                                      backgroundColor: alpha(statusColor, 0.15),
                                      color: statusColor,
                                      fontWeight: 600
                                    }}
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    justifyContent="space-between"
                    spacing={1}
                    sx={{ mb: 2 }}
                  >
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Ultimas notificacoes
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {periodoNotificacoes}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${notificacoesLimitadas.length} itens`}
                      size="small"
                      sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}
                    />
                  </Stack>

                  {erroNotificacoes && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {erroNotificacoes}
                    </Alert>
                  )}

                  {loadingNotificacoes ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                      <CircularProgress size={22} />
                    </Box>
                  ) : notificacoesLimitadas.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Nenhuma notificacao encontrada para o periodo selecionado.
                    </Typography>
                  ) : (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ width: 56 }} />
                            <TableCell>Descricao</TableCell>
                            <TableCell>Tipo</TableCell>
                            <TableCell>Data</TableCell>
                            <TableCell align="right">Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {notificacoesLimitadas.map((item) => {
                            const visual = getNotificacaoVisual(item.tipo);
                            const Icon = visual.icon;
                            return (
                              <TableRow key={item.id} hover sx={{ height: 52 }}>
                                <TableCell>
                                  <Box
                                    sx={{
                                      width: 36,
                                      height: 36,
                                      borderRadius: "50%",
                                      backgroundColor: alpha(visual.color, 0.15),
                                      color: visual.color,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center"
                                    }}
                                  >
                                    <Icon fontSize="small" />
                                  </Box>
                                </TableCell>
                                <TableCell sx={{ maxWidth: 320 }}>
                                  <Typography
                                    component={Link}
                                    to={item.url || "#"}
                                    color="text.primary"
                                    sx={{
                                      textDecoration: "none",
                                      fontWeight: 600,
                                      "&:hover": { textDecoration: "underline" },
                                      display: "block",
                                      maxWidth: 320,
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis"
                                    }}
                                  >
                                    {truncateText(item.descricao, 60)}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                      display: "block",
                                      maxWidth: 320,
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis"
                                    }}
                                  >
                                    {truncateText(item.url || "-", 50)}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    size="small"
                                    label={item.tipo || "Geral"}
                                    sx={{
                                      backgroundColor: alpha(visual.color, 0.1),
                                      color: visual.color,
                                      fontWeight: 600
                                    }}
                                  />
                                </TableCell>
                                <TableCell>{formatDateTime(item.dataCriacao)}</TableCell>
                                <TableCell align="right">
                                  <Chip
                                    size="small"
                                    label={Number(item.lido) === 1 ? "Lido" : "Novo"}
                                    color={Number(item.lido) === 1 ? "success" : "warning"}
                                    variant={Number(item.lido) === 1 ? "outlined" : "filled"}
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Stack>
      )}

      <Dialog open={cardsModalOpen} onClose={() => setCardsModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Escolha os cards</DialogTitle>
        <DialogContent>
          <FormGroup>
            {cardItems.map((item) => (
              <FormControlLabel
                key={item.id}
                control={
                  <Checkbox
                    checked={draftCardIds.includes(item.id)}
                    onChange={() => handleToggleCard(item.id)}
                  />
                }
                label={item.label}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCardsModalOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveCards}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </ContentBox>
  );
}
