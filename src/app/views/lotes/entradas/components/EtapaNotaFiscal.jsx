import React, { useState, useEffect } from "react";
import { Grid, TextField, Button, Typography, Divider, Paper, Box } from "@mui/material";
import HeaderFormTitle from '../../../../components/HeeaderFormTitle';
import { MaskedDecimalInput } from '../../../../components/Maske/MaskedDecimalInput';
import { Snackbar, Alert } from "@mui/material";

// Etapa 2 - Nota Fiscal
export function EtapaNotaFiscal({ data, setData, onNext, onBack }) {
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: '',
        mensagem: ''
    });
    const [form, setForm] = useState({
        chaveAcesso: '',
        numeroNota: '',
        serie: '',
        dataEmissao: '',
        valorProdutos: 0,
        valorFrete: 0,
        valorICMS: 0,
        valorIPI: 0,
        transportadora: '',
        qtdVolumes: 0,
        pesoBruto: 0
    });

    useEffect(() => {
        if (data) {
            setForm(prev => ({ ...prev, ...data }));
        }
    }, [data]);

    const handleImportarXML = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parser = new DOMParser();
                const xml = parser.parseFromString(event.target.result, "text/xml");

                const infNFe = xml.querySelector("infNFe");
                const ide = infNFe?.querySelector("ide");
                const transp = infNFe?.querySelector("transp");
                const total = infNFe?.querySelector("ICMSTot");
                const vol = xml.querySelector("vol");
                const emit = infNFe?.querySelector("emit");

                const transportadora =
                    transp?.querySelector("xNome")?.textContent?.trim() ||
                    emit?.querySelector("xNome")?.textContent?.trim() ||
                    "";

                const dadosExtraidos = {
                    chaveAcesso: infNFe?.getAttribute("Id")?.replace("NFe", "") || "",
                    numeroNota: ide?.querySelector("nNF")?.textContent || "",
                    serie: ide?.querySelector("serie")?.textContent || "",
                    dataEmissao: ide?.querySelector("dhEmi")?.textContent?.split("T")[0] || "",
                    valorProdutos: parseFloat(total?.querySelector("vProd")?.textContent || 0),
                    valorFrete: parseFloat(total?.querySelector("vFrete")?.textContent || 0),
                    valorICMS: parseFloat(total?.querySelector("vICMS")?.textContent || 0),
                    valorIPI: parseFloat(total?.querySelector("vIPI")?.textContent || 0),
                    transportadora,
                    qtdVolumes: vol?.querySelector("qVol")?.textContent || 0,
                    pesoBruto: parseFloat(vol?.querySelector("pesoB")?.textContent || 0)
                };

                setForm(prev => ({ ...prev, ...dadosExtraidos }));
                setSnackbar({
                    open: true,
                    message: data.mensagem || 'XML extraido com sucesso!',
                    severity: 'success',
                    mensagem: 'XML extraido com sucesso!'
                });
            } catch (err) {
                setSnackbar({
                    open: true,
                    message: data.mensagem || 'Erro ao extrair o XML!',
                    severity: 'error',
                    mensagem: 'Erro ao extrair o XML!'
                });
            }
        };

        reader.readAsText(file);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (["chaveAcesso", "numeroNota", "serie", "qtdVolumes"].includes(name)) {
            const somenteNumeros = value.replace(/\D/g, '');
            setForm(prev => ({ ...prev, [name]: somenteNumeros }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleDecimalChange = (name, value) => {
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const getValidDecimal = (val) => typeof val === 'number' ? val : 0;

    const handleAvancar = () => {
        if (!form.chaveAcesso || !form.numeroNota || !form.valorProdutos) {
            setSnackbar({
                open: true,
                message: 'Preencha os campos obrigatórios: Chave de Acesso, Número da Nota e Valor dos Produtos.',
                severity: 'warning',
                mensagem: 'Preencha os campos obrigatórios: Chave de Acesso, Número da Nota e Valor dos Produtos.'
            });
            return;
        }

        setData(form);
        onNext();
    };

    return (
        <>
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

            <HeaderFormTitle
                titulo="Informações Fiscais"
                subtitulo="Informe os dados fiscais do registro."
            />

            <Box sx={{ marginBottom: '30px', width: '100%', display: 'flex', justifyContent: 'flex-end', }}>
                <Grid item xs={12}>
                    <Button variant="outlined" component="label">
                        Carregar XML da NF-e
                        <input type="file" accept=".xml" hidden onChange={handleImportarXML} />
                    </Button>
                </Grid>
            </Box>

            <Paper elevation={1} sx={{ p: 3, backgroundColor: '#fafafa', mb: 4 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Identificação da Nota</Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Chave de Acesso"
                            name="chaveAcesso"
                            value={form.chaveAcesso}
                            onChange={handleChange}
                            fullWidth
                            slotProps={{
                                input: {
                                    inputMode: 'numeric',
                                    pattern: '[0-9]*',
                                    maxLength: 44
                                }
                            }}
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <TextField
                            label="Número da Nota"
                            name="numeroNota"
                            value={form.numeroNota}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <TextField
                            label="Série"
                            name="serie"
                            value={form.serie}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <TextField
                            label="Data de Emissão"
                            name="dataEmissao"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={form.dataEmissao}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                </Grid>

                <Typography variant="subtitle2" sx={{ mt: 4, mb: 1 }}>Valores da Nota</Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <MaskedDecimalInput
                            label="Valor Total dos Produtos"
                            name="valorProdutos"
                            value={getValidDecimal(form.valorProdutos)}
                            onChange={handleDecimalChange}
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <MaskedDecimalInput
                            label="Valor do Frete"
                            name="valorFrete"
                            value={getValidDecimal(form.valorFrete)}
                            onChange={handleDecimalChange}
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <MaskedDecimalInput
                            label="Valor do ICMS"
                            name="valorICMS"
                            value={getValidDecimal(form.valorICMS)}
                            onChange={handleDecimalChange}
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <MaskedDecimalInput
                            label="Valor do IPI"
                            name="valorIPI"
                            value={getValidDecimal(form.valorIPI)}
                            onChange={handleDecimalChange}
                        />
                    </Grid>
                </Grid>

                <Typography variant="subtitle2" sx={{ mt: 4, mb: 1 }}>Transportadora</Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <TextField
                            label="Nome da Transportadora"
                            name="transportadora"
                            value={form.transportadora}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <TextField
                            label="Qtd. de Volumes"
                            name="qtdVolumes"
                            value={form.qtdVolumes}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <MaskedDecimalInput
                            label="Peso Bruto"
                            name="pesoBruto"
                            value={getValidDecimal(form.pesoBruto)}
                            onChange={handleDecimalChange}
                        />
                    </Grid>
                </Grid>

                <Grid container justifyContent="space-between" mt={4}>
                    <Button variant="outlined" onClick={onBack}>Voltar</Button>
                    <Button variant="contained" onClick={handleAvancar}>Próximo</Button>
                </Grid>
            </Paper>
        </>
    );
}
