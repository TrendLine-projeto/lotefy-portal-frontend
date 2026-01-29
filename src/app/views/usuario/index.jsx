import React from "react";
import { Breadcrumb } from "app/components";
import { Box, Chip, Grid, TextField, Typography } from "@mui/material";
import styled from "@mui/material/styles/styled";
import useAuth from "app/hooks/useAuth";

const Container = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" },
  "& .breadcrumb": {
    marginBottom: "24px",
    [theme.breakpoints.down("sm")]: { marginBottom: "16px" }
  }
}));

const textValue = (value) => (value === null || value === undefined ? "" : String(value));

const formatCnpj = (value) => {
  if (value === null || value === undefined) return "";
  const digits = String(value).replace(/\D/g, "");
  if (digits.length !== 14) return String(value);
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
};

const ReadOnlyField = ({ label, value }) => (
  <TextField
    label={label}
    value={textValue(value)}
    fullWidth
    size="small"
    InputProps={{ readOnly: true }}
    variant="outlined"
  />
);

export default function UsuarioMain() {
  const { user } = useAuth();
  const cliente = user?.cliente || {};
  const filiais = Array.isArray(cliente?.filiais) ? cliente.filiais : [];
  const cardSx = {
    p: 2.5,
    borderRadius: 2,
    border: "1px solid #e2e8f0",
    background: "#f8fafc"
  };

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: "Conta", path: "/usuario" },
            { name: "Usuario" }
          ]}
        />
      </Box>

      <Box
        sx={{
          p: 3,
          borderRadius: 3,
          border: "1px solid #e2e8f0",
          background: "#ffffff",
          boxShadow: "0 14px 30px rgba(15, 23, 42, 0.08)"
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a" }}>
              Perfil do usuario
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Informacoes do usuario autenticado (somente leitura).
            </Typography>
          </Box>
          <Chip label="Somente leitura" color="default" sx={{ fontWeight: 600 }} />
        </Box>

        {!user ? (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="#ef4444">
              Nenhum usuario autenticado encontrado.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ mt: 3, display: "grid", gap: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={cardSx}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#1e293b", mb: 2 }}>
                    Dados do usuario
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <ReadOnlyField label="ID" value={user?.id} />
                    </Grid>
                    <Grid item xs={12} md={9}>
                      <ReadOnlyField label="Username" value={user?.username} />
                    </Grid>
                    <Grid item xs={12}>
                      <ReadOnlyField label="Email" value={user?.email} />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={cardSx}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#1e293b", mb: 2 }}>
                    Cliente
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <ReadOnlyField label="ID cliente" value={cliente?.id} />
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <ReadOnlyField label="CNPJ" value={formatCnpj(cliente?.cnpj)} />
                    </Grid>
                    <Grid item xs={12}>
                      <ReadOnlyField label="Razao social" value={cliente?.razaoSocial} />
                    </Grid>
                    <Grid item xs={12}>
                      <ReadOnlyField label="Nome fantasia" value={cliente?.nomeFantasia} />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>

            <Box sx={cardSx}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#1e293b", mb: 2 }}>
                Filiais
              </Typography>
              {filiais.length === 0 ? (
                <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                  Nenhuma filial cadastrada.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {filiais.map((filial, index) => (
                    <Grid item xs={12} md={6} key={filial?.id || index}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: "1px solid #e2e8f0",
                          background: "#ffffff"
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ mb: 2, color: "#0f172a" }}>
                          {filial?.nomeFilial || `Filial ${index + 1}`}
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={4}>
                            <ReadOnlyField label="ID filial" value={filial?.id} />
                          </Grid>
                          <Grid item xs={12} md={8}>
                            <ReadOnlyField label="Telefone" value={filial?.telefone} />
                          </Grid>
                          <Grid item xs={12}>
                            <ReadOnlyField label="Endereco" value={filial?.endereco} />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <ReadOnlyField label="Cidade" value={filial?.cidade} />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <ReadOnlyField label="Estado" value={filial?.estado} />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <ReadOnlyField label="CEP" value={filial?.cep} />
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
}
