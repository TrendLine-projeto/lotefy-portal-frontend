import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { FaIdCard, FaFilter } from 'react-icons/fa';

const abas = [
  {
    label: 'Conexao',
    icon: <FaIdCard size={16} style={{ marginRight: 6 }} />,
    campos: [
      { name: 'host', label: 'Host', required: true },
      { name: 'port', label: 'Porta', type: 'number', required: true },
      { name: 'user_email', label: 'Email da caixa', required: true },
      { name: 'password_encrypted', label: 'Senha', type: 'password' },
      { name: 'mailbox', label: 'Mailbox' },
      { name: 'since_days', label: 'Dias (since)', type: 'number' },
      { name: 'max_results', label: 'Max resultados', type: 'number' },
      { name: 'secure', label: 'SSL', type: 'checkbox' },
    ],
  },
  {
    label: 'Filtros',
    icon: <FaFilter size={16} style={{ marginRight: 6 }} />,
    campos: [
      { name: 'from_filter', label: 'Remetente (from)' },
      { name: 'subject_contains', label: 'Assunto contem' },
      { name: 'parse_timeout_ms', label: 'Parse timeout (ms)', type: 'number' },
      { name: 'unseen_only', label: 'Somente nao lidos', type: 'checkbox' },
      { name: 'mark_seen', label: 'Marcar como lido', type: 'checkbox' },
      { name: 'store_password', label: 'Salvar senha', type: 'checkbox' },
      { name: 'ativo', label: 'Ativa', type: 'checkbox' },
    ],
  },
];

const IntegracaoImapForm = ({
  valores = {},
  modoEdicao,
  onChange,
  onRequestSubmit,
  onRequestDelete,
  onRequestImport,
  onRequestTest,
  importarTodas,
  onToggleImportarTodas,
  onClearAll,
}) => {
  const [abaSelecionada, setAbaSelecionada] = useState(0);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const isUltimaAba = abaSelecionada === abas.length - 1;
  const exibirToggleImportacao = Boolean(onRequestImport);
  const irParaProximaAba = () =>
    setAbaSelecionada((prev) => Math.min(prev + 1, abas.length - 1));

  const handleInput = (event) => {
    const { name, value, type, checked } = event.target;
    if (type === 'checkbox') {
      onChange(name, checked);
    } else {
      onChange(name, value);
    }
  };

  const renderCampo = (campo) => {
    const value = valores[campo.name] ?? (campo.type === 'checkbox' ? false : '');

    if (campo.type === 'checkbox') {
      return (
        <FormControlLabel
          control={
            <Checkbox
              name={campo.name}
              checked={Boolean(value)}
              onChange={handleInput}
            />
          }
          label={campo.label}
        />
      );
    }

    if (campo.type === 'password') {
      return (
        <TextField
          fullWidth
          label={campo.label}
          name={campo.name}
          value={value}
          onChange={handleInput}
          required={campo.required}
          type={mostrarSenha ? 'text' : 'password'}
          size="small"
          sx={{ '.MuiInputBase-root': { minHeight: 48 } }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setMostrarSenha((prev) => !prev)}
                  edge="end"
                  size="small"
                >
                  {mostrarSenha ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      );
    }

    return (
      <TextField
        fullWidth
        label={campo.label}
        name={campo.name}
        value={value}
        onChange={handleInput}
        required={campo.required}
        type={campo.type || 'text'}
        size="small"
        sx={{ '.MuiInputBase-root': { minHeight: 48 } }}
      />
    );
  };

  return (
    <Paper elevation={0} className="p-6 mt-6" sx={{ marginTop: '25px', padding: 3 }}>
      <div style={{ marginBottom: 20 }}>
        <Typography variant="h5" component="h2" fontWeight={600}>
          {valores?.id ? 'Integracao IMAP selecionada' : 'Integracao IMAP'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {valores?.id
            ? 'Edite os dados da configuracao selecionada.'
            : 'Preencha os dados abaixo para cadastrar uma nova configuracao.'}
        </Typography>
      </div>

      <Tabs
        value={abaSelecionada}
        onChange={(e, novaAba) => setAbaSelecionada(novaAba)}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        TabIndicatorProps={{
          style: {
            backgroundColor: '#bdbdbd',
            height: '3px',
            borderRadius: '2px',
          },
        }}
        sx={{
          borderBottom: '1px solid #e0e0e0',
          mb: 3,
          '.MuiTab-root': {
            textTransform: 'none',
            fontSize: 12,
            fontWeight: 400,
            gap: 1,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: 48,
          },
          '.Mui-selected': { color: '#424242' },
        }}
      >
        {abas.map((aba) => (
          <Tab
            key={aba.label}
            label={
              <Box display="flex" alignItems="center">
                {aba.icon}
                {aba.label}
              </Box>
            }
          />
        ))}
      </Tabs>

      <Grid container spacing={2}>
        {abas[abaSelecionada].campos.map((campo) => (
          <Grid
            item
            xs={12}
            sm={campo.type === 'checkbox' ? 12 : 6}
            md={campo.type === 'checkbox' ? 4 : 4}
            key={campo.name}
            display="flex"
            alignItems="stretch"
          >
            <Box width="100%" display="flex" alignItems="center">
              {renderCampo(campo)}
            </Box>
          </Grid>
        ))}
      </Grid>

      {exibirToggleImportacao && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(importarTodas)}
                onChange={(event) => onToggleImportarTodas?.(event.target.checked)}
              />
            }
            label="Importar todas as configuracoes"
          />
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        {valores.id && (
          <Button
            variant="outlined"
            color="error"
            onClick={() => onRequestDelete && onRequestDelete(valores)}
          >
            Excluir
          </Button>
        )}
        {valores.id && (
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => onRequestImport && onRequestImport(valores)}
          >
            Importar agora
          </Button>
        )}
        <Button
          variant="outlined"
          color="primary"
          onClick={() => onRequestTest && onRequestTest(valores)}
        >
          Testar conexao
        </Button>
        <Button variant="text" onClick={onClearAll}>
          Limpar
        </Button>
        {!isUltimaAba && (
          <Button variant="contained" color="primary" onClick={irParaProximaAba}>
            Proximo
          </Button>
        )}
        {isUltimaAba && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => onRequestSubmit && onRequestSubmit(valores)}
          >
            {modoEdicao ? 'Salvar' : 'Cadastrar'}
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default IntegracaoImapForm;
