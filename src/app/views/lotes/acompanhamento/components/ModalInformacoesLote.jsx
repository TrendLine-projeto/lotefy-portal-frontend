import {
    Dialog, DialogTitle, DialogContent, DialogActions, Box, Button, Grid,
    TextField, Checkbox, FormControlLabel
} from '@mui/material';
import { useState, useEffect } from 'react';
import { FaEdit, FaPowerOff, FaDollarSign } from 'react-icons/fa';
import { MaskedDecimalInput } from '../../../../components/Maske/MaskedDecimalInput';

const abaStyleLote = (ativa) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '10px 40px',
    borderRadius: '8px 8px 0 0',
    cursor: 'pointer',
    fontWeight: 200,
    backgroundColor: ativa ? '#fff' : '#f6f6f6',
    borderBottom: ativa ? '2px solid transparent' : '2px solid #ddd',
    border: ativa ? '1px solid #ddd' : '1px solid transparent',
    color: '#444',
    fontSize: '14px'
});

const formatarDataHora = (isoString) => {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const toDateTimeLocal = (value) => {
    if (!value) return '';
    if (typeof value === 'string') {
        if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(value)) {
            return value.replace(' ', 'T').slice(0, 16);
        }
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
            return value.slice(0, 16);
        }
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const ModalInformacoesLote = ({ open, onClose, lote, onSave }) => {
    const [abaSelecionada, setAbaSelecionada] = useState('detalhes');
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (lote) setFormData(lote);
    }, [lote]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleDecimalChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSalvar = () => {
        if (onSave) onSave(formData);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            PaperProps={{ sx: { borderRadius: 2, boxShadow: 3 } }}
        >
            <DialogTitle sx={{ pb: 0, mt: 2, mb: 2, fontSize: '15px' }}>
                Informações do Lote
            </DialogTitle>

            {/* Abas */}
            <Box sx={{ display: 'flex', gap: 2, px: 3, pt: 2 }}>
                <Box sx={abaStyleLote(abaSelecionada === 'detalhes')} onClick={() => setAbaSelecionada('detalhes')}>
                    <FaEdit size={14} style={{ marginRight: 6 }} />
                    Detalhes
                </Box>
                <Box sx={abaStyleLote(abaSelecionada === 'operacao')} onClick={() => setAbaSelecionada('operacao')}>
                    <FaPowerOff size={14} style={{ marginRight: 6 }} />
                    Operação
                </Box>
                {/*<Box sx={abaStyleLote(abaSelecionada === 'valores')} onClick={() => setAbaSelecionada('valores')}>
                    <FaDollarSign size={14} style={{ marginRight: 6 }} />
                    Valores
                </Box> */}
            </Box>

            <DialogContent sx={{ mt: '20px' }}>
                {abaSelecionada === 'detalhes' && (
                    <Grid container spacing={2} rowSpacing={4}>
                        {[
                            ['numeroIdentificador', 'Identificador'],
                            ['nomeEntregador', 'Entregador'],
                            ['nomeRecebedor', 'Recebedor']
                        ].map(([field, label]) => (
                            <Grid key={field} item xs={12} sm={6} md={4}>
                                <TextField
                                    label={label}
                                    value={formData[field] || ''}
                                    onChange={(e) => handleChange(field, e.target.value)}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}

                {abaSelecionada === 'operacao' && (
                    <Grid container spacing={2} rowSpacing={4}>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                label="Data de Entrada"
                                value={toDateTimeLocal(formData.dataEntrada)}
                                disabled
                                fullWidth
                                size="small"
                                type="datetime-local"
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                label="Previsão de Saída"
                                value={toDateTimeLocal(formData.dataPrevistaSaida)}
                                onChange={(e) => handleChange('dataPrevistaSaida', e.target.value)}
                                fullWidth
                                size="small"
                                type="datetime-local"
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                label="Data de Início"
                                value={toDateTimeLocal(formData.dataInicio)}
                                onChange={(e) => handleChange('dataInicio', e.target.value)}
                                fullWidth
                                size="small"
                                type="datetime-local"
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                label="Data de Saída"
                                value={toDateTimeLocal(formData.dataSaida)}
                                onChange={(e) => handleChange('dataSaida', e.target.value)}
                                fullWidth
                                size="small"
                                type="datetime-local"
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <FormControlLabel
                                control={<Checkbox checked={formData.loteIniciado === 1 || formData.loteIniciado === true} disabled />}
                                label="Lote Iniciado"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <FormControlLabel
                                control={<Checkbox checked={formData.loteFinalizado === 1 || formData.loteFinalizado === true} disabled />}
                                label="Lote Finalizado"
                            />
                        </Grid>
                    </Grid>
                )}

                {/*                 {abaSelecionada === 'valores' && (
                    <Grid container spacing={2} rowSpacing={4}>
                        <Grid item xs={12} sm={6} md={4}>
                            <MaskedDecimalInput
                                label="Valor Estimado"
                                name="valorEstimado"
                                value={parseFloat(formData.valorEstimado) || 0}
                                onChange={handleDecimalChange}
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <MaskedDecimalInput
                                label="Valor Hora Estimado"
                                name="valorHoraEstimado"
                                value={parseFloat(formData.valorHoraEstimado) || 0}
                                onChange={handleDecimalChange}
                                size="small"
                            />
                        </Grid>
                    </Grid>
                )} */}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} variant="outlined">Fechar</Button>
                <Button onClick={handleSalvar} variant="contained">Salvar</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalInformacoesLote;
