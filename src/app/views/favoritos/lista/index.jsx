import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Breadcrumb } from "app/components";
import { Snackbar, Alert, IconButton, Tooltip } from "@mui/material";
import styled from "@mui/material/styles/styled";
import Box from "@mui/material/Box";
import Loading from "app/components/MatxLoading";
import DataTable from "app/components/DataTable";
import Star from "@mui/icons-material/Star";
import LaunchIcon from "@mui/icons-material/Launch";

const Container = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" },
  "& .breadcrumb": {
    marginBottom: "30px",
    [theme.breakpoints.down("sm")]: { marginBottom: "16px" }
  }
}));

export default function FavoritosMain() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });

  const syncFavoritos = (list) => {
    setFavoritos(list);
    try {
      localStorage.setItem("favoritos", JSON.stringify(list));
    } catch (err) {
      console.warn("Nao foi possivel salvar favoritos no localStorage", err);
    }
  };

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("favoritos") || "[]");
      setFavoritos(Array.isArray(stored) ? stored : []);
    } catch (err) {
      setFavoritos([]);
    }
  }, []);

  const handleRemover = async (fav) => {
    const token = localStorage.getItem("authToken");
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    if (!fav?.id) {
      setSnackbar({
        open: true,
        message: "Favorito sem id para remover.",
        severity: "warning"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/usuarios/favoritos/${fav.id}`, {
        method: "DELETE",
        headers
      });
      const data = await response.json();
      if (response.ok) {
        const next = favoritos.filter((f) => f.id !== fav.id);
        syncFavoritos(next);
        setSnackbar({
          open: true,
          message: data.mensagem || "Favorito removido.",
          severity: "success"
        });
      } else {
        setSnackbar({
          open: true,
          message: data.mensagem || "Erro ao remover favorito.",
          severity: "error"
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Erro ao remover favorito.",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: "url", headerName: "Rota" },
    {
      field: "acao",
      headerName: "Acao",
      renderCell: (row) => (
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Tooltip title="Abrir">
            <IconButton size="small" onClick={() => navigate(row.url)}>
              <LaunchIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remover favorito">
            <IconButton size="small" color="warning" onClick={() => handleRemover(row)}>
              <Star fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: "Favoritos", path: "/favoritos" },
            { name: "Lista" }
          ]}
        />
      </Box>

      {loading ? (
        <Loading />
      ) : (
        <DataTable columns={columns} rows={favoritos} pagination={false} />
      )}

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
