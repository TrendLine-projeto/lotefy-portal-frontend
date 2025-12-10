import { memo, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import styled from "@mui/material/styles/styled";
import useTheme from "@mui/material/styles/useTheme";
import useMediaQuery from "@mui/material/useMediaQuery";
import Home from "@mui/icons-material/Home";
import Menu from "@mui/icons-material/Menu";
import Person from "@mui/icons-material/Person";
import Star from "@mui/icons-material/Star";
import Settings from "@mui/icons-material/Settings";
import WebAsset from "@mui/icons-material/WebAsset";
import MailOutline from "@mui/icons-material/MailOutline";
import StarOutline from "@mui/icons-material/StarOutline";
import PowerSettingsNew from "@mui/icons-material/PowerSettingsNew";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import useAuth from "app/hooks/useAuth";
import useSettings from "app/hooks/useSettings";
import { NotificationProvider } from "app/contexts/NotificationContext";

import { Span } from "app/components/Typography";
import ShoppingCart from "app/components/ShoppingCart";
import { MatxMenu, MatxSearchBox } from "app/components";
import { NotificationBar } from "app/components/NotificationBar";
import { themeShadows } from "app/components/MatxTheme/themeColors";
import { topBarHeight } from "app/utils/constant";

// STYLED COMPONENTS
const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.primary
}));

const TopbarRoot = styled("div")({
  top: 0,
  zIndex: 96,
  height: topBarHeight,
  boxShadow: themeShadows[8],
  transition: "all 0.3s ease"
});

const TopbarContainer = styled("div")(({ theme }) => ({
  padding: "8px",
  paddingLeft: 18,
  paddingRight: 20,
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: theme.palette.primary.main,
  [theme.breakpoints.down("sm")]: { paddingLeft: 16, paddingRight: 16 },
  [theme.breakpoints.down("xs")]: { paddingLeft: 14, paddingRight: 16 }
}));

const UserMenu = styled("div")({
  padding: 4,
  display: "flex",
  borderRadius: 24,
  cursor: "pointer",
  alignItems: "center",
  "& span": { margin: "0 8px" }
});

const StyledItem = styled(MenuItem)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  minWidth: 185,
  "& a": {
    width: "100%",
    display: "flex",
    alignItems: "center",
    textDecoration: "none"
  },
  "& span": { marginRight: "10px", color: theme.palette.text.primary }
}));

const IconBox = styled("div")(({ theme }) => ({
  display: "inherit",
  [theme.breakpoints.down("md")]: { display: "none !important" }
}));

const Layout1Topbar = () => {
  const theme = useTheme();
  const { settings, updateSettings } = useSettings();
  const { logout, user } = useAuth();
  const isMdScreen = useMediaQuery(theme.breakpoints.down("md"));
  const apiUrl = import.meta.env.VITE_API_URL;
  const location = useLocation();

  const [isFavorito, setIsFavorito] = useState(false);
  const [favoritoId, setFavoritoId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  useEffect(() => {
    if (user?.favoritos?.length) {
      const atual = user.favoritos.find((f) => f.url === location.pathname);
      if (atual) {
        setIsFavorito(true);
        setFavoritoId(atual.id);
      } else {
        setIsFavorito(false);
        setFavoritoId(null);
      }
    } else {
      setIsFavorito(false);
      setFavoritoId(null);
    }
  }, [user?.favoritos, location.pathname]);

  const updateSidebarMode = (sidebarSettings) => {
    updateSettings({ layout1Settings: { leftSidebar: { ...sidebarSettings } } });
  };

  const handleSidebarToggle = () => {
    let { layout1Settings } = settings;
    let mode;
    if (isMdScreen) {
      mode = layout1Settings.leftSidebar.mode === "close" ? "mobile" : "close";
    } else {
      mode = layout1Settings.leftSidebar.mode === "full" ? "close" : "full";
    }
    updateSidebarMode({ mode });
  };

  const saveFavoritosLocal = (favoritosList) => {
    try {
      localStorage.setItem("favoritos", JSON.stringify(favoritosList || []));
    } catch (err) {
      console.warn("Nao foi possivel salvar favoritos no localStorage", err);
    }
  };

  const handleToggleFavorito = async () => {
    const token = localStorage.getItem("authToken");
    const idUsuario = user?.id || localStorage.getItem("user");
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    if (!idUsuario) {
      setSnackbar({
        open: true,
        message: "Usuário não encontrado para favoritar.",
        severity: "error"
      });
      return;
    }

    try {
      if (isFavorito && favoritoId) {
        const response = await fetch(`${apiUrl}/usuarios/favoritos/${favoritoId}`, {
          method: "DELETE",
          headers
        });
        const data = await response.json();
        if (response.ok) {
          setIsFavorito(false);
          setFavoritoId(null);
          const stored = JSON.parse(localStorage.getItem("favoritos") || "[]");
          const nextFavoritos = stored.filter((f) => f.id !== Number(favoritoId));
          saveFavoritosLocal(nextFavoritos);
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
      } else {
        const response = await fetch(`${apiUrl}/usuarios/favoritos`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            url: location.pathname,
            idUsuario
          })
        });
        const data = await response.json();
        if (response.ok) {
          setIsFavorito(true);
          const newId = data.favorito?.id || null;
          setFavoritoId(newId);
          const stored = JSON.parse(localStorage.getItem("favoritos") || "[]");
          const newFav = {
            id: newId ?? Date.now(),
            url: location.pathname,
            idUsuario: Number(idUsuario)
          };
          const nextFavoritos = [...stored.filter((f) => f.url !== newFav.url), newFav];
          saveFavoritosLocal(nextFavoritos);
          setSnackbar({
            open: true,
            message: data.mensagem || "Favorito salvo com sucesso!",
            severity: "success"
          });
        } else {
          setSnackbar({
            open: true,
            message: data.mensagem || "Erro ao salvar favorito.",
            severity: "error"
          });
        }
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Erro ao salvar/remover favorito.",
        severity: "error"
      });
    }
  };

  return (
    <>
      <TopbarRoot>
        <TopbarContainer>
          <Box display="flex">
            <StyledIconButton onClick={handleSidebarToggle}>
              <Menu />
            </StyledIconButton>

            <IconBox>
              <StyledIconButton>
                <MailOutline />
              </StyledIconButton>

              <StyledIconButton onClick={handleToggleFavorito}>
                <StarOutline sx={{ color: isFavorito ? "#fbc02d" : "inherit" }} />
              </StyledIconButton>
            </IconBox>
          </Box>

          <Box display="flex" alignItems="center">
            <MatxSearchBox />

            <NotificationProvider>
              <NotificationBar />
            </NotificationProvider>

            <MatxMenu
              menuButton={
                <UserMenu>
                  <Span>
                    Bem vindo <strong>{user.username}</strong>
                  </Span>

                  <Avatar src={user.avatar} sx={{ cursor: "pointer" }} />
                </UserMenu>
              }>
              <StyledItem>
                <Link to="/">
                  <Home />
                  <Span sx={{ marginInlineStart: 1 }}>Dashboard</Span>
                </Link>
              </StyledItem>

              <StyledItem>
                <Link to="/page-layouts/user-profile">
                  <Person />
                  <Span sx={{ marginInlineStart: 1 }}>Perfil</Span>
                </Link>
              </StyledItem>

              <StyledItem>
                <Settings />
                <Span sx={{ marginInlineStart: 1 }}>Configurações</Span>
              </StyledItem>

              <StyledItem>
                <Link to="/favoritos">
                  <Star />
                  <Span sx={{ marginInlineStart: 1 }}>Favoritos</Span>
                </Link>
              </StyledItem>

              <StyledItem onClick={logout}>
                <PowerSettingsNew />
                <Span sx={{ marginInlineStart: 1 }}>Sair</Span>
              </StyledItem>
            </MatxMenu>
          </Box>
        </TopbarContainer>
      </TopbarRoot>

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
    </>
  );
};

export default memo(Layout1Topbar);
