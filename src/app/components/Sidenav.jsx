import { Fragment } from "react";
import { MatxVerticalNav } from "app/components";
import Scrollbar from "react-perfect-scrollbar";
import styled from "@mui/material/styles/styled";
import useSettings from "app/hooks/useSettings";
import useAuth from "app/hooks/useAuth";

// Menus fixos com ícone e label
const MENU_FIXO = [
  { label: "DASHBOARD", type: "label" },
  { name: "Dashboard", icon: "MdDashboard", path: "/dashboard/default" },
  { label: "SISTEMA", type: "label" }
];

// Conversão dos menus da API para o formato do MatxVerticalNav
function mapearMenusDoUsuario(menusAPI) {
  return menusAPI.map(menu => ({
    name: menu.nome,
    icon: menu.icone, 
    path: menu.link,
    children: menu.submenus?.map(sub => ({
      name: sub.nome,
      path: sub.link
    }))
  }));
}

const StyledScrollBar = styled(Scrollbar)(() => ({
  paddingLeft: "1rem",
  paddingRight: "1rem",
  position: "relative"
}));

const SideNavMobile = styled("div")(({ theme }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: -1,
  width: "100vw",
  background: "rgba(0, 0, 0, 0.54)",
  [theme.breakpoints.up("lg")]: { display: "none" }
}));

export default function Sidenav({ children }) {
  const { settings, updateSettings } = useSettings();
  const { user } = useAuth();

  // Converte os menus da API
  const menusAPI = user?.menus ? mapearMenusDoUsuario(user.menus) : [];

  // Combina com os menus fixos
  const items = [...MENU_FIXO, ...mapearMenusDoUsuario(user.menus)];

  const updateSidebarMode = (sidebarSettings) => {
    let activeLayoutSettingsName = settings.activeLayout + "Settings";
    let activeLayoutSettings = settings[activeLayoutSettingsName];

    updateSettings({
      ...settings,
      [activeLayoutSettingsName]: {
        ...activeLayoutSettings,
        leftSidebar: { ...activeLayoutSettings.leftSidebar, ...sidebarSettings }
      }
    });
  };

  return (
    <Fragment>
      <StyledScrollBar options={{ suppressScrollX: true }}>
        {children}
        <MatxVerticalNav items={items} />
      </StyledScrollBar>
      <SideNavMobile onClick={() => updateSidebarMode({ mode: "close" })} />
    </Fragment>
  );
}
