import React, { useState, useEffect } from 'react';
import { Breadcrumb } from 'app/components';
import { Snackbar, Alert } from '@mui/material';
import { MdAssignmentTurnedIn } from 'react-icons/md';
import ExpandableFilterPanel from '../../../components/HeaderFilterContainer';
import ConfirmDialog from '../../../components/Dialogs/ConfirmDialog';
import Loading from '../../../components/MatxLoading';
import DataTable from '../../../components/DataTable';
import styled from '@mui/material/styles/styled';
import Box from '@mui/material/Box';
import OrdemServicoForm from '../../../components/Forms/OrdemServicoForm';
import { getIdClienteFromToken } from '../../../utils/authToken';
import { jsPDF } from 'jspdf';

const Container = styled('div')(({ theme }) => ({
  margin: '30px',
  [theme.breakpoints.down('sm')]: { margin: '16px' },
  '& .breadcrumb': {
    marginBottom: '30px',
    [theme.breakpoints.down('sm')]: { marginBottom: '16px' },
  },
}));

const initialFormData = {
  id: null,
  idCliente: null,
  descricao: '',
  descricaoAtivo: '',
  numeroOrdem: '',
  dataAbertura: '',
  ordemManual: 1,
  finalizado: 0,
  dataFinalizado: '',
  descricaoFinalizado: '',
};

const dateTimeFields = ['dataAbertura', 'dataFinalizado'];

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
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      acc[key] = dateTimeFields.includes(key) ? formatDateTimeLocal(value) : value;
    }
    return acc;
  }, {});
};

export default function OrdemServicoMain() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [idCliente, setIdCliente] = useState(() => getIdClienteFromToken());
  const [filters, setFilters] = useState({});
  const [formData, setFormData] = useState({
    ...initialFormData,
    idCliente: getIdClienteFromToken() || null,
  });
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, perPage: 10, total: 0 });
  const [loading, setLoading] = useState(false);
  const [painelExpandido, setPainelExpandido] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: '',
    mensagem: '',
  });
  const [dialog, setDialog] = useState({
    open: false,
    title: '',
    description: '',
    confirmText: '',
    cancelText: 'Cancelar',
    onConfirm: null,
    confirmColor: 'primary',
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

      const res = await fetch(`${apiUrl}/ordensServico?${params.toString()}`);
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.mensagem || 'Erro ao buscar ordens de servico');
      }

      const itens = result.itens || [];
      setData(itens);
      setPagination({
        page: result.pagina || page,
        perPage: result.quantidadePorPagina || perPage,
        total: result.total || 0,
      });

      if ((result.total || 0) === 0) {
        setSnackbar({
          open: true,
          message: 'Nenhum registro encontrado.',
          severity: 'info',
          mensagem: 'Nenhum registro encontrado.',
        });
      }
    } catch (error) {
      console.error('Erro ao buscar ordens de servico:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao buscar ordens de servico.',
        severity: 'error',
        mensagem: 'Erro ao buscar ordens de servico.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (id) => {
    try {
      const clientId = idCliente ?? getIdClienteFromToken();
      const res = await fetch(`${apiUrl}/ordensServico/${id}`);
      const result = await res.json();

      if (res.ok) {
        setFormData({ ...initialFormData, ...normalizeDates(result), idCliente: clientId ?? null });
        setModoEdicao(true);
        setPainelExpandido(false);
        setSnackbar({
          open: true,
          message: result.mensagem || 'Registro selecionado.',
          severity: 'info',
          mensagem: 'Selecionado',
        });
      } else {
        setSnackbar({
          open: true,
          message: result.mensagem || 'Erro ao selecionar o registro!',
          severity: 'error',
          mensagem: 'Erro ao selecionar o registro!',
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Erro ao selecionar o registro!',
        severity: 'error',
        mensagem: 'Erro ao selecionar o registro!',
      });
    }
  };

  const handleCadastrar = async (form) => {
    const clientId = Number(idCliente ?? getIdClienteFromToken() ?? form.idCliente);
    if (!clientId) {
      setSnackbar({
        open: true,
        message: 'idCliente nao encontrado no token.',
        severity: 'error',
        mensagem: 'idCliente nao encontrado.',
      });
      return;
    }
    try {
      const payload = cleanPayload({
        ...form,
        id: undefined,
        idCliente: clientId,
        ordemManual: form.ordemManual ?? 1,
        finalizado: form.finalizado ?? 0,
      });
      const response = await fetch(`${apiUrl}/ordensServico`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const dataRes = await response.json();

      if (response.ok) {
        setFormData({ ...initialFormData, idCliente: clientId, ordemManual: 1, finalizado: 0 });
        setModoEdicao(false);
        fetchData();
        setSnackbar({
          open: true,
          message: dataRes.mensagem || 'Registro cadastrado com sucesso!',
          severity: 'success',
          mensagem: 'Cadastrado com sucesso!',
        });
      } else {
        setSnackbar({
          open: true,
          message: dataRes.mensagem || 'Erro ao cadastrar o registro!',
          severity: 'error',
          mensagem: 'Erro ao cadastrar o registro!',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao cadastrar o registro!',
        severity: 'error',
        mensagem: 'Erro ao cadastrar o registro!',
      });
    }
  };

  const handleAtualizar = async (form) => {
    if (!form.id) {
      setSnackbar({
        open: true,
        message: 'Selecione um registro para editar.',
        severity: 'warning',
        mensagem: 'Selecione um registro para editar.',
      });
      return;
    }

    const clientId = Number(idCliente ?? getIdClienteFromToken() ?? form.idCliente);
    if (!clientId) {
      setSnackbar({
        open: true,
        message: 'idCliente nao encontrado no token.',
        severity: 'error',
        mensagem: 'idCliente nao encontrado.',
      });
      return;
    }

    try {
      const payload = cleanPayload({
        ...form,
        id: undefined,
        idCliente: clientId,
      });
      const response = await fetch(`${apiUrl}/ordensServico/${form.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const dataRes = await response.json();

      if (response.ok) {
        setSnackbar({
          open: true,
          message: dataRes.mensagem || 'Registro atualizado com sucesso!',
          severity: 'success',
          mensagem: 'Registro atualizado com sucesso!',
        });
        setFormData({
          ...initialFormData,
          ...normalizeDates(dataRes.atualizado || form),
          idCliente: clientId,
        });
        setModoEdicao(false);
        fetchData();
      } else {
        setSnackbar({
          open: true,
          message: dataRes.mensagem || 'Erro ao atualizar o registro.',
          severity: 'error',
          mensagem: 'Erro ao atualizar o registro.',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao atualizar o registro.',
        severity: 'error',
      });
    }
  };

  const handleDeletar = async (id) => {
    if (!id) {
      setSnackbar({
        open: true,
        message: 'Selecione um registro antes de excluir.',
        severity: 'warning',
        mensagem: 'Selecione um registro antes de excluir.',
      });
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/ordensServico/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const dataRes = await response.json();

      if (response.ok) {
        setSnackbar({
          open: true,
          message: dataRes.mensagem || 'Registro excluido com sucesso!',
          severity: 'success',
          mensagem: 'Registro excluido com sucesso!',
        });
        setFormData({ ...initialFormData, idCliente });
        setModoEdicao(false);
        fetchData();
      } else {
        setSnackbar({
          open: true,
          message: dataRes.mensagem || 'Erro ao excluir o registro.',
          severity: 'error',
          mensagem: 'Erro ao excluir o registro.',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao excluir o registro.',
        severity: 'error',
        mensagem: 'Erro ao excluir o registro.',
      });
    }
  };

  const fmt = (v) => (v ? String(v) : '');
  const fmtDateTime = (v) => (v ? String(v).slice(0, 16).replace('T', ' ') : '');

  const buildPdf = (os, manutencao, maquina) => {
    const doc = new jsPDF();
    const lineHeight = 8;
    let y = 10;

    doc.setFontSize(16);
    doc.text(`Ordem de Servico ${fmt(os.numeroOrdem)}`, 10, y);
    y += lineHeight + 2;

    doc.setFontSize(11);
    const addField = (label, value) => {
      doc.setFont(undefined, 'bold');
      doc.text(label, 10, y);
      doc.setFont(undefined, 'normal');
      const wrapped = doc.splitTextToSize(fmt(value), 180);
      doc.text(wrapped, 60, y);
      y += lineHeight * Math.max(1, wrapped.length);
    };

    addField('Descricao', os.descricao);
    addField('Ativo', os.descricaoAtivo);
    addField('Data abertura', fmtDateTime(os.dataAbertura));
    addField('Finalizado', Number(os.finalizado) ? 'Sim' : 'Nao');
    addField('Data finalizacao', fmtDateTime(os.dataFinalizado));
    addField('Descricao finalizacao', os.descricaoFinalizado);
    addField('Ordem manual', Number(os.ordemManual) ? 'Sim' : 'Nao');
    addField('Cliente', os.idCliente);

    if (manutencao) {
      y += lineHeight;
      doc.setFontSize(13);
      doc.setFont(undefined, 'bold');
      doc.text('Manutencao relacionada', 10, y);
      y += lineHeight;
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');

      addField('ID manutencao', manutencao.id);
      addField('Tipo', manutencao.tipo);
      addField('Status', manutencao.status);
      addField('Responsavel', manutencao.responsavel);
      addField('Data execucao', fmtDateTime(manutencao.data_execucao));
      addField('Proxima prevista', fmtDateTime(manutencao.proxima_prevista));
      addField('Custo', manutencao.custo);
      addField('Observacoes', manutencao.observacoes);
    }

    if (maquina) {
      y += lineHeight;
      doc.setFontSize(13);
      doc.setFont(undefined, 'bold');
      doc.text('Maquina', 10, y);
      y += lineHeight;
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');

      addField('Codigo interno', maquina.codigo_interno);
      addField('Nome', maquina.nome);
      addField('Numero de serie', maquina.numero_serie);
      addField('Status', maquina.status);
      addField('Setor', maquina.setor);
      addField('Localizacao', maquina.localizacao);
      addField('Descricao', maquina.descricao);
    }

    return doc;
  };

  const handleImprimir = async (osForm) => {
    if (!osForm?.id) {
      setSnackbar({
        open: true,
        message: 'Selecione uma ordem para imprimir.',
        severity: 'warning',
        mensagem: 'Selecione uma ordem para imprimir.',
      });
      return;
    }

    try {
      const osRes = await fetch(`${apiUrl}/ordensServico/${osForm.id}`);
      const osData = await osRes.json();
      if (!osRes.ok) throw new Error(osData?.mensagem || 'Erro ao buscar OS');

      let manutencao = null;
      let maquina = null;

      const pdf = buildPdf(osData, manutencao, maquina);
      pdf.save(`ordem_servico_${fmt(osData.numeroOrdem) || osForm.id}.pdf`);
    } catch (err) {
      console.error('Erro ao imprimir:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao preparar a impressao.',
        severity: 'error',
        mensagem: 'Erro ao preparar a impressao.',
      });
    }
  };

  const handleFinalizar = async (form) => {
    if (!form.id) {
      setSnackbar({
        open: true,
        message: 'Selecione uma ordem antes de finalizar.',
        severity: 'warning',
        mensagem: 'Selecione uma ordem antes de finalizar.',
      });
      return;
    }
    if (!form.descricaoFinalizado) {
      setSnackbar({
        open: true,
        message: 'Informe a descricao de finalizacao.',
        severity: 'warning',
        mensagem: 'Informe a descricao de finalizacao.',
      });
      return;
    }
    try {
      const payload = cleanPayload({
        descricaoFinalizado: form.descricaoFinalizado,
        finalizado: 1,
        dataFinalizado: form.dataFinalizado || nowDateTimeLocal(),
      });
      const response = await fetch(`${apiUrl}/ordensServico/${form.id}/finalizar`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const dataRes = await response.json();
      if (response.ok) {
        setSnackbar({
          open: true,
          message: dataRes.mensagem || 'Ordem finalizada com sucesso!',
          severity: 'success',
          mensagem: 'Ordem finalizada com sucesso!',
        });
        const finalizado = dataRes.finalizado || form;
        setFormData({
          ...initialFormData,
          ...normalizeDates(finalizado),
          idCliente: idCliente ?? getIdClienteFromToken(),
        });
        setModoEdicao(false);
        fetchData();
      } else {
        setSnackbar({
          open: true,
          message: dataRes.mensagem || 'Erro ao finalizar a ordem.',
          severity: 'error',
          mensagem: 'Erro ao finalizar a ordem.',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao finalizar a ordem.',
        severity: 'error',
        mensagem: 'Erro ao finalizar a ordem.',
      });
    }
  };

  const abrirDialogCadastrar = (form) => {
    setDialog({
      open: true,
      title: 'Confirmar cadastro',
      description: `Deseja realmente cadastrar a OS "${form.numeroOrdem || ''}"?`,
      confirmText: 'Cadastrar',
      cancelText: 'Cancelar',
      confirmColor: 'success',
      onConfirm: () => handleCadastrar({ ...form, idCliente }),
    });
  };

  const abrirDialogEditar = (form) => {
    setDialog({
      open: true,
      title: 'Confirmar edicao',
      description: `Deseja salvar as alteracoes para a OS "${form.numeroOrdem || ''}"?`,
      confirmText: 'Salvar',
      cancelText: 'Cancelar',
      confirmColor: 'primary',
      onConfirm: () => handleAtualizar({ ...form, idCliente }),
    });
  };

  const abrirDialogExcluir = (registro) => {
    if (!registro || !registro.id) {
      setSnackbar({
        open: true,
        message: 'Selecione um registro antes de excluir.',
        severity: 'warning',
        mensagem: 'Selecione um registro antes de excluir.',
      });
      return;
    }
    setDialog({
      open: true,
      title: 'Confirmar exclusao',
      description: `Deseja realmente excluir a OS "${registro.numeroOrdem || ''}"?`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      confirmColor: 'error',
      onConfirm: () => handleDeletar(registro.id),
    });
  };

  const abrirDialogFinalizar = (form) => {
    setDialog({
      open: true,
      title: 'Confirmar finalizacao',
      description: `Deseja finalizar a OS "${form.numeroOrdem || ''}"?`,
      confirmText: 'Finalizar',
      cancelText: 'Cancelar',
      confirmColor: 'success',
      onConfirm: () => handleFinalizar(form),
    });
  };

  useEffect(() => {
    fetchData();
  }, [pagination.page, pagination.perPage]);

  const fields = [
    { name: 'busca', label: 'Descricao/Ativo', type: 'text', placeholder: 'Descricao ou ativo' },
    { name: 'numeroOrdem', label: 'Numero da ordem', type: 'text' },
    { name: 'finalizado', label: 'Finalizado', type: 'select', options: [{ label: 'Nao', value: 0 }, { label: 'Sim', value: 1 }] },
    { name: 'ordemManual', label: 'Ordem manual', type: 'select', options: [{ label: 'Nao', value: 0 }, { label: 'Sim', value: 1 }] },
    { name: 'dataAberturaDe', label: 'Abertura de', type: 'date' },
    { name: 'dataAberturaAte', label: 'Abertura ate', type: 'date' },
  ];

  const columns = [
    { field: 'numeroOrdem', headerName: 'Numero', width: 160 },
    { field: 'descricao', headerName: 'Descricao', flex: 1 },
    { field: 'descricaoAtivo', headerName: 'Ativo', width: 180 },
    {
      field: 'dataAbertura',
      headerName: 'Abertura',
      width: 160,
      renderCell: (row) => fmtDateTime(row.dataAbertura),
    },
    {
      field: 'finalizado',
      headerName: 'Finalizado',
      width: 120,
      renderCell: (row) => (Number(row.finalizado) ? 'Sim' : 'Nao'),
    },
    {
      field: 'dataFinalizado',
      headerName: 'Finalizado em',
      width: 180,
      renderCell: (row) => fmtDateTime(row.dataFinalizado),
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
            fontWeight: 500,
          }}
          onMouseOver={(e) => (e.target.style.textDecoration = 'underline')}
          onMouseOut={(e) => (e.target.style.textDecoration = 'none')}
        >
          Selecionar
        </button>
      ),
    },
  ];

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: 'Ativos', path: '/ativos/os' },
            {
              name: (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <MdAssignmentTurnedIn style={{ marginRight: 6 }} />
                  Ordens de servico
                </Box>
              ),
            },
          ]}
        />
      </Box>

      <ExpandableFilterPanel
        fields={fields}
        values={filters}
        onChange={handleChange}
        onFilter={handleFilter}
        onClear={handleClear}
        title="Filtros de Ordens de Servico"
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
            onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            onRowsPerPageChange={(perPage) =>
              setPagination((prev) => ({ ...prev, perPage, page: 1 }))
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

      <OrdemServicoForm
        valores={formData}
        modoEdicao={modoEdicao}
        onChange={setFormField}
        onRequestSubmit={(form) =>
          modoEdicao ? abrirDialogEditar(form) : abrirDialogCadastrar(form)
        }
        onRequestDelete={() => abrirDialogExcluir(formData)}
        onRequestFinalizar={() => abrirDialogFinalizar(formData)}
        onRequestPrint={() => handleImprimir(formData)}
        onClearAll={() => {
          setModoEdicao(false);
          const clientId = getIdClienteFromToken();
          setIdCliente(clientId);
          setFormData({ ...initialFormData, idCliente: clientId, ordemManual: 1, finalizado: 0 });
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
