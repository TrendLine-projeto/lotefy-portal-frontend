import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Badge from "@mui/material/Badge";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import styled from "@mui/material/styles/styled";
import IconButton from "@mui/material/IconButton";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import Notifications from "@mui/icons-material/Notifications";
import Clear from "@mui/icons-material/Clear";

import useSettings from "app/hooks/useSettings";
import useNotification from "app/hooks/useNotification";
import { getTimeDifference } from "app/utils/utils.js";
import { sideNavWidth, topBarHeight } from "app/utils/constant";
import { themeShadows } from "../MatxTheme/themeColors";
import { Paragraph, Small } from "../Typography";

const Notification = styled("div")(() => ({
  padding: "16px",
  marginBottom: "16px",
  display: "flex",
  alignItems: "center",
  height: topBarHeight,
  boxShadow: themeShadows[6],
  "& h5": {
    marginLeft: "8px",
    marginTop: 0,
    marginBottom: 0,
    fontWeight: "500"
  }
}));

const NotificationCard = styled(Box)(({ theme }) => ({
  position: "relative",
  "&:hover": {
    "& .messageTime": { display: "none" },
    "& .deleteButton": { opacity: "1" }
  },
  "& .messageTime": { color: theme.palette.text.secondary },
  "& .icon": { fontSize: "1.25rem" }
}));

const DeleteButton = styled(IconButton)(() => ({
  opacity: "0",
  position: "absolute",
  right: 5,
  marginTop: 9,
  marginRight: "24px",
  background: "rgba(0, 0, 0, 0.01)"
}));

const CardLeftContent = styled("div")(({ theme }) => ({
  padding: "12px 8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: "rgba(0, 0, 0, 0.01)",
  "& small": {
    fontWeight: "500",
    marginLeft: "16px",
    color: theme.palette.text.secondary
  }
}));

const Heading = styled("span")(({ theme }) => ({
  fontWeight: "500",
  marginLeft: "16px",
  color: theme.palette.text.secondary
}));

export default function NotificationBar({ container }) {
  const { settings } = useSettings();
  const [panelOpen, setPanelOpen] = useState(false);
  const {
    deleteNotification,
    clearNotifications,
    notifications,
    getNotifications,
    total,
    quantidadePorPagina,
    loading
  } = useNotification();
  const [page, setPage] = useState(1);
  const perPage = quantidadePorPagina || 10;

  const handleDrawerToggle = () => setPanelOpen(!panelOpen);

  useEffect(() => {
    if (panelOpen) {
      setPage(1);
      getNotifications(1, perPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelOpen]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    getNotifications(next, perPage, true);
  };

  const badgeCount = total || notifications?.length || 0;
  const hasMore = (notifications?.length || 0) < (total || 0);

  return (
    <Fragment>
      <IconButton onClick={handleDrawerToggle}>
        <Badge color="secondary" badgeContent={badgeCount} max={99}>
          <Notifications sx={{ color: "text.primary" }} />
        </Badge>
      </IconButton>

      <ThemeProvider theme={settings.themes[settings.activeTheme]}>
        <Drawer
          width={"100px"}
          container={container}
          variant="temporary"
          anchor={"right"}
          open={panelOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}>
          <Box sx={{ width: sideNavWidth }}>
            <Notification>
              <Notifications color="primary" />
              <h5>Notificacoes</h5>
            </Notification>

            <Box p={2} pt={0} sx={{ maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}>
              {loading && <Paragraph sx={{ px: 1, py: 1 }}>Carregando...</Paragraph>}

              {!loading && (!notifications || notifications.length === 0) && (
                <Paragraph sx={{ px: 1, py: 1 }} color="text.secondary">
                  Nenhuma notificacao encontrada.
                </Paragraph>
              )}

              {notifications?.map((item) => (
                <NotificationCard key={item.id}>
                  <Card elevation={6} sx={{ mb: 2 }}>
                    <CardLeftContent>
                      <Box display="flex" alignItems="center">
                        <Icon className="icon" color="primary">
                          notifications
                        </Icon>
                        <Heading>{item.tipo || "Notificacao"}</Heading>
                      </Box>

                      <Small className="messageTime">
                        {item.dataCriacao ? getTimeDifference(new Date(item.dataCriacao)) : ""}
                      </Small>
                    </CardLeftContent>

                    <Box p={2} pr={6}>
                      <Paragraph sx={{ mb: 1, fontWeight: 500 }}>{item.descricao}</Paragraph>
                    </Box>

                    <DeleteButton
                      className="deleteButton"
                      onClick={() => deleteNotification(item.id)}
                      size="small"
                      aria-label="Remover notificacao"
                    >
                      <Clear fontSize="small" />
                    </DeleteButton>
                  </Card>
                </NotificationCard>
              ))}

              {hasMore && (
                <Button fullWidth onClick={handleLoadMore} disabled={loading}>
                  Carregar mais
                </Button>
              )}
            </Box>

            {!!notifications?.length && (
              <Button fullWidth onClick={clearNotifications}>
                Marcar como lidas
              </Button>
            )}
          </Box>
        </Drawer>
      </ThemeProvider>
    </Fragment>
  );
}
