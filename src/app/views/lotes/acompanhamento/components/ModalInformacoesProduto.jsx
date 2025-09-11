import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Button, Grid, TextField } from '@mui/material';
import { FaEdit, FaCubes, FaDollarSign, FaPowerOff } from 'react-icons/fa';
import { Checkbox, FormControlLabel, Chip } from '@mui/material';
import { useState, useEffect } from 'react';
import { MaskedDecimalInput } from '../../../../components/Maske/MaskedDecimalInput';

const abaStyle = (ativa) => ({
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

const ModalInformacoesProduto = ({ open, onClose, produto, onSave, children }) => {
    const [abaSelecionada, setAbaSelecionada] = useState('detalhes');
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (produto) setFormData(produto);
    }, [produto]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSalvar = () => {
        if (onSave) onSave(formData);
        onClose();
    };

    const getValidDecimal = (val) => {
        const num = parseFloat(val);
        return isNaN(num) ? 0 : num;
    };

    const handleDecimalChange = (name, value) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const formatarDataHora = (isoString) => {
        if (!isoString) return '—';
        const date = new Date(isoString);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    useEffect(() => {
        const qtd = parseFloat(formData.quantidadeProduto) || 0;
        const valorUnit = parseFloat(formData.valorPorPeca) || 0;
        const total = qtd * valorUnit;
        setFormData((prev) => ({ ...prev, someValorTotalProduto: total.toFixed(2) }));
    }, [formData.quantidadeProduto, formData.valorPorPeca]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            PaperProps={{ sx: { borderRadius: 2, boxShadow: 3 } }}
        >
            <DialogTitle sx={{ pb: 0, mt: 2, mb: 2, fontSize: '15px' }}>
                Detalhes do Produto
            </DialogTitle>

            <Box sx={{ display: 'flex', gap: 2, px: 3, pt: 2 }}>
                <Box sx={abaStyle(abaSelecionada === 'detalhes')} onClick={() => setAbaSelecionada('detalhes')}>
                    <FaEdit size={14} style={{ marginRight: 6 }} />
                    Detalhes
                </Box>
                <Box sx={abaStyle(abaSelecionada === 'operacao')} onClick={() => setAbaSelecionada('operacao')}>
                    <FaPowerOff size={14} style={{ marginRight: 6 }} />
                    Operação
                </Box>
                <Box sx={abaStyle(abaSelecionada === 'valores')} onClick={() => setAbaSelecionada('valores')}>
                    <FaDollarSign size={14} style={{ marginRight: 6 }} />
                    Valores
                </Box>
            </Box>

            <DialogContent sx={{ mt: '20px', }}>
                {abaSelecionada === 'detalhes' && (
                    <Grid container spacing={2} rowSpacing={4}>
                        {[
                            ['nomeProduto', 'Produto'],
                            ['tipoEstilo', 'Estilo'],
                            ['tamanho', 'Tamanho'],
                            ['quantidadeProduto', 'Quantidade'],
                            ['corPrimaria', 'Cor Primária'],
                            ['corSecundaria', 'Cor Secundária']
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
                                value={formatarDataHora(produto.dataEntrada)}
                                disabled
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                label="Previsão de Saída"
                                value={formatarDataHora(produto.dataPrevistaSaida)}
                                disabled
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                label="Data Saída"
                                value={formatarDataHora(produto.dataSaida)}
                                disabled
                                fullWidth
                                size="small"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <FormControlLabel
                                control={<Checkbox checked={produto.iniciado === 1} disabled />}
                                label="Produto Iniciado"
                            />
                        </Grid>
                    </Grid>
                )}

                {abaSelecionada === 'valores' && (
                    <Grid container spacing={2} rowSpacing={4}>
                        <Grid item xs={12} sm={6} md={4}>
                            <MaskedDecimalInput
                                label="Valor Unitário"
                                name="valorPorPeca"
                                value={getValidDecimal(formData.valorPorPeca)}
                                onChange={handleDecimalChange}
                                size="small"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                label="Valor Total"
                                value={formData.someValorTotalProduto || ''}
                                disabled
                                fullWidth
                                size="small"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                label="Identificador"
                                value={formData.numeroIdentificador || ''}
                                onChange={(e) => handleChange('numeroIdentificador', e.target.value)}
                                fullWidth
                                size="small"
                            />
                        </Grid>
                    </Grid>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} variant="outlined">Fechar</Button>
                <Button onClick={handleSalvar} variant="contained">Salvar</Button>
            </DialogActions>

            {children}
        </Dialog>
    );
};

export default ModalInformacoesProduto;