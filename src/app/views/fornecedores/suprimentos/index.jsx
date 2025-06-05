
import React, { useState, useEffect } from 'react';
import { Breadcrumb } from "app/components";
import { Snackbar, IconButton, Alert } from "@mui/material";
import ExpandableFilterPanel from '../../../components/HeaderFilterContainer/index';
import DataTable from '../../../components/DataTable';
import { FornecedorForm } from '../../../components/Forms/FornecedorForm';
import Loading from '../../../components/MatxLoading';
import CloseIcon from "@mui/icons-material/Close";
import styled from "@mui/material/styles/styled";
import Box from "@mui/material/Box";

const Container = styled("div")(({ theme }) => ({
    margin: "30px",
    [theme.breakpoints.down("sm")]: { margin: "16px" },
    "& .breadcrumb": {
        marginBottom: "30px",
        [theme.breakpoints.down("sm")]: { marginBottom: "16px" }
    }
}));

export default function SuprimentosMain() {
    const [filters, setFilters] = useState({});
    const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, perPage: 10, total: 0 });
    const [loading, setLoading] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(true);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: '',
        mensagem: ''
    });

    const handleFilter = () => {
        setPagination((prev) => ({ ...prev, page: 1 }));
        fetchData();
    };

    const handleChange = (name, value) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleClear = () => {
        setFilters({});
        setFornecedorSelecionado(null);
        setPagination((prev) => ({ ...prev, page: 1 }));
        fetchData();
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3450/fornecedorSupri/fornecedores_suprimentos/buscar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...filters,
                    cliente_id: 1,
                    pagina: pagination.page,
                    quantidadePorPagina: pagination.perPage
                })
            });
            const result = await res.json();

            if (result.mensagem === "Nenhum fornecedor encontrado para esse cliente.") {
                setData([]);
                setPagination(prev => ({
                    ...prev,
                    page: 1,
                    perPage: prev.perPage,
                    total: 0
                }));
                setSnackbar({
                    open: true,
                    message: result.mensagem,
                    severity: 'info',
                    mensagem: 'Nenhum fornecedor encontrado'
                });
            } else {
                setData(result.fornecedores.map(f => ({
                    ...f,
                    ativo: f.ativo === 1 ? 'Sim' : 'Não'
                })));
                setPagination({
                    page: result.paginaAtual,
                    perPage: result.quantidadePorPagina,
                    total: result.totalRegistros
                });
            }
        } catch (error) {
            console.error('Erro ao buscar fornecedores:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = async (id) => {
        try {
            const res = await fetch(`http://localhost:3450/fornecedorSupri/fornecedores_suprimentos/${id}`);
            const result = await res.json();
            setFornecedorSelecionado(result.fornecedor);

            if (res.ok) {
                setFornecedorSelecionado(result.fornecedor);
                setModoEdicao(true);
                setSnackbar({
                    open: true,
                    message: result.mensagem,
                    severity: 'info',
                    mensagem: 'Selecionado'
                });
            } else {
                setSnackbar({
                    open: true,
                    message: data.mensagem || '1 Erro ao selecionar um Fornecedor!',
                    severity: 'error',
                    mensagem: '1 Erro ao selecionar um Fornecedor!'
                });
            }
        } catch (err) {
            setSnackbar({
                open: true,
                message: data.mensagem || '2 Erro ao selecionar o Fornecedor!',
                severity: 'error',
                mensagem: '2 Erro ao selecionar o Fornecedor!'
            });
        }
    };

    const handleCadastrar = async (formData) => {
        try {
            const response = await fetch('http://localhost:3450/fornecedorSupri/fornecedores_suprimentos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    ativo: formData.ativo ? true : false,
                    cliente_id: formData.cliente_id || 1
                })
            });

            const data = await response.json();

            if (response.ok) {
                setFornecedorSelecionado(null);
                fetchData();
                setSnackbar({
                    open: true,
                    message: data.mensagem || 'Fornecedor cadastrado com sucesso!',
                    severity: 'success',
                    mensagem: 'Cadastrado realizado com sucesso'
                });
            } else {
                setSnackbar({
                    open: true,
                    message: data.mensagem || 'Erro ao cadastrado um Fornecedor!',
                    severity: 'error',
                    mensagem: 'Erro ao cadastrado um Fornecedor!'
                });
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: data.mensagem || 'Erro ao cadastrado um Fornecedor!',
                severity: 'error',
                mensagem: 'Erro ao cadastrado um Fornecedor!'
            });
        }
    };

    const handleAtualizar = async (formData) => {
        try {
            const response = await fetch(`http://localhost:3450/fornecedorSupri/fornecedores_suprimentos/${formData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    ativo: formData.ativo ? true : false,
                    cliente_id: formData.cliente_id || 1
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSnackbar({
                    open: true,
                    message: data.mensagem || 'Fornecedor atualizado com sucesso!',
                    severity: 'success',
                    mensagem: 'Fornecedor atualizado com sucesso'
                });
                setFornecedorSelecionado(null);
                setModoEdicao(false);
                fetchData();
            } else {
                setSnackbar({
                    open: true,
                    message: data.mensagem || 'Erro ao atualizar fornecedor.',
                    severity: 'error',
                    mensagem: 'Erro ao atualizar fornecedor.'
                });
            }
        } catch (error) {
            console.error('Erro ao atualizar fornecedor:', error);
            setSnackbar({
                open: true,
                message: 'Erro ao atualizar fornecedor.',
                severity: 'error',
                mensagem: 'Erro ao atualizar fornecedor.'
            });
        }
    };

    useEffect(() => {
        fetchData();
    }, [pagination.page, pagination.perPage]);

    const fields = [
        { name: 'razaoSocial', label: 'Razão Social', type: 'text', placeholder: 'Digite a razão social' },
        { name: 'cidade', label: 'Cidade', type: 'text', placeholder: 'Digite a cidade' },
        { name: 'estado', label: 'Estado', type: 'text', placeholder: 'Digite o estado (UF)' },
        {
            name: 'tipoFornecedor',
            label: 'Tipo de Fornecedor',
            type: 'select',
            options: [
                { label: 'Nacional', value: 'Nacional' },
                { label: 'Importado', value: 'Importado' },
            ],
        },
        { name: 'ativo', label: 'Ativo?', type: 'checkbox' }
    ];

    const columns = [
        { field: 'razaoSocial', headerName: 'Razão Social' },
        { field: 'cidade', headerName: 'Cidade' },
        { field: 'estado', headerName: 'UF' },
        { field: 'tipoFornecedor', headerName: 'Tipo' },
        { field: 'ativo', headerName: 'Ativo' },
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
                        fontWeight: 500
                    }}
                    onMouseOver={(e) => (e.target.style.textDecoration = 'underline')}
                    onMouseOut={(e) => (e.target.style.textDecoration = 'none')}
                >
                    Selecionar
                </button>
            )
        }
    ];

    return (
        <Container>
            <Box className="breadcrumb">
                <Breadcrumb
                    routeSegments={[{ name: "Fornecedores", path: "/material" }, { name: "Suprimentos" }]}
                />
            </Box>

            <ExpandableFilterPanel
                fields={fields}
                values={filters}
                onChange={handleChange}
                onFilter={handleFilter}
                onClear={handleClear}
                title="Filtros de Fornecedores"
            >
                {loading ? (
                    <Loading />
                ) : (
                    <DataTable
                        columns={columns}
                        rows={data}
                        pagination={pagination}
                        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                        onRowsPerPageChange={(perPage) =>
                            setPagination(prev => ({ ...prev, perPage, page: 1 }))
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

            <FornecedorForm
                fornecedor={fornecedorSelecionado}
                modoEdicao={modoEdicao}
                onSubmit={modoEdicao ? handleAtualizar : handleCadastrar}
                onClearAll={() => {
                    setFornecedorSelecionado(null);
                    setModoEdicao(false);
                }}
                onEditClick={() => setModoEdicao(true)}
            />
        </Container>
    )
}