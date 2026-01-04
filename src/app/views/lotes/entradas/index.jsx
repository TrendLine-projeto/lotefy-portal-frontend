import React, { useState, useEffect } from 'react';
import { Breadcrumb } from "app/components";
import { GoPackageDependencies } from "react-icons/go";
import { Stepper, Step, StepLabel } from '@mui/material';
import { Paper } from '@mui/material';
import { Snackbar, Alert } from "@mui/material";
import styled from "@mui/material/styles/styled";
import Box from "@mui/material/Box";


// Importação das etapas
import { EtapaFornecedor } from "./components/EtapaFornecedor";
import { EtapaNotaFiscal } from "./components/EtapaNotaFiscal";
import { EtapaProdutos } from "./components/EtapaProdutos";
import { EtapaPreferencias } from "./components/EtapaPreferencias";
import { EtapaInformacoesLote } from "./components/EtapaInformacoesLote";

const Container = styled("div")(({ theme }) => ({
    margin: "30px",
    [theme.breakpoints.down("sm")]: { margin: "16px" },
    "& .breadcrumb": {
        marginBottom: "30px",
        [theme.breakpoints.down("sm")]: { marginBottom: "16px" }
    }
}));

export default function LotesEntradas() {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [etapaAtual, setEtapaAtual] = useState(0);
    const [listaFornecedores, setListaFornecedores] = useState([]);
    const [dados, setDados] = useState({
        fornecedor: {},
        nf: {},
        produtos: [],
        preferencias: { loteIniciado: false }
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: '',
        mensagem: ''
    });

    const etapas = [
        "Informações do Lote",
        "Fornecedor",
        "Nota Fiscal",
        "Produtos",
        "Preferências"
    ];

    useEffect(() => {
        const fetchListaFornecedores = async () => {
            try {
                const resp = await fetch(`${apiUrl}/fornecedorProd/fornecedores_producao/lista_simples`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ cliente_id: 1 }),
                });
                const data = await resp.json();
                setListaFornecedores(data.fornecedores || []);
            } catch (err) {
                console.error("Erro ao buscar lista de fornecedores:", err);
            }
        };
        fetchListaFornecedores();
    }, []);

    const handleSelectFornecedor = async (id) => {
        try {
            const resp = await fetch(`${apiUrl}/fornecedorProd/fornecedores_producao/${id}`);
            const data = await resp.json();

            setDados(prev => ({
                ...prev,
                fornecedor: {
                    ...prev.fornecedor,
                    ...data.fornecedor,
                    fornecedor: id
                }
            }));
        } catch (err) {
            console.error("Erro ao buscar dados do fornecedor:", err);
        }
    };

    const handleSetFornecedor = (fornecedor) => setDados(prev => ({ ...prev, fornecedor }));

    const handleSetNF = (nf) => setDados(prev => ({ ...prev, nf }));

    const handleSetProdutos = (produtos) => setDados(prev => ({ ...prev, produtos }));

    const handleSetPreferencias = (preferenciasAtualizadas) => {
        setDados((prev) => {
            const novasPreferencias = {
                ...prev.preferencias,
                ...preferenciasAtualizadas
            };
            return {
                ...prev,
                preferencias: novasPreferencias
            };
        });
    };

    const renderizarEtapa = () => {
        switch (etapaAtual) {
            case 0:
                return (
                    <EtapaInformacoesLote
                        data={dados.preferencias}
                        setData={handleSetPreferencias}
                        onNext={() => setEtapaAtual(1)}
                    />
                );
            case 1:
                return (
                    <EtapaFornecedor
                        data={dados.fornecedor}
                        setData={handleSetFornecedor}
                        onNext={() => setEtapaAtual(2)}
                        listaFornecedores={listaFornecedores}
                        onSelectFornecedor={handleSelectFornecedor}
                    />
                );
            case 2:
                return (
                    <EtapaNotaFiscal
                        data={dados.nf}
                        setData={handleSetNF}
                        onNext={() => setEtapaAtual(3)}
                        onBack={() => setEtapaAtual(1)}
                    />

                );
            case 3:
                return (
                    <EtapaProdutos
                        produtos={dados.produtos}
                        setProdutos={handleSetProdutos}
                        onNext={() => setEtapaAtual(4)}
                        onBack={() => setEtapaAtual(2)}
                    />
                );
            case 4:
                return (
                    <EtapaPreferencias
                        preferencias={dados.preferencias}
                        setPreferencias={handleSetPreferencias}
                        onBack={() => setEtapaAtual(3)}
                        onFinalizar={enviarLoteParaAPI}
                    />
                );
            default:
                return null;
        }
    };

    const enviarLoteParaAPI = async () => {

        const valorEstimado = dados.produtos.reduce((soma, produto) => {
            const total = parseFloat(produto.someValorTotalProduto);
            return soma + (!isNaN(total) ? total : 0);
        }, 0);

        const payload = {
            numeroIdentificador: dados.preferencias.numeroIdentificador || "",
            nomeEntregador: dados.preferencias.nomeEntregador || "",
            nomeRecebedor: dados.preferencias.nomeRecebedor || "",
            valorEstimado,
            valorHoraEstimado: dados.preferencias.valorHoraEstimado || 0,
            loteIniciado: dados.preferencias.loteIniciado ?? true,
            idFilial: dados.fornecedor?.idFilial || 1,
            idFornecedor_producao: dados.fornecedor?.fornecedor || 1,
            produtos: dados.produtos || [],
            notaFiscal: dados.nf || undefined
        };

        try {
            const resp = await fetch(`${apiUrl}/lotes/entrada_lotes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!resp.ok) {
                throw new Error("Erro ao cadastrar lote.");
            }

            const resultado = await resp.json();
            setSnackbar({
                open: true,
                message: 'Lote cadastrado com sucesso!',
                severity: 'success',
                mensagem: 'Lote cadastrado com sucesso!'
            });
        } catch (err) {
            setSnackbar({
                open: true,
                message: 'Erro ao cadastrar o lote',
                severity: 'error',
                mensagem: 'Erro ao cadastrar o lote'
            });
        }
    };

    return (
        <Container>
            <Box className="breadcrumb">
                <Breadcrumb
                    routeSegments={[
                        { name: "Lotes", path: "/material" },
                        {
                            name: (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <GoPackageDependencies style={{ marginRight: 6 }} />
                                    Entradas
                                </Box>
                            )
                        }
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

            <Box sx={{ mt: 8 }}>
                <Stepper activeStep={etapaAtual} alternativeLabel sx={{ mb: 4 }}>
                    {etapas.map((label, index) => (
                        <Step
                            key={label}
                            completed={index < etapaAtual}
                            onClick={() => setEtapaAtual(index)}
                            sx={{ cursor: 'pointer' }}
                        >
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Box>

            <Paper elevation={0} className="p-6 mt-6" sx={{ marginTop: '25px', padding: 3 }}>
                <Box>{renderizarEtapa()}</Box>
            </Paper>
        </Container>
    );
}