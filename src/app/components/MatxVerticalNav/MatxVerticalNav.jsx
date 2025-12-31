import { Fragment } from "react";
import { NavLink } from "react-router-dom";
import { Paragraph, Span } from "../Typography";
import { GoInbox } from "react-icons/go";
import { BsPaperclip } from "react-icons/bs";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import useSettings from "app/hooks/useSettings";
import MatxVerticalNavExpansionPanel from "./MatxVerticalNavExpansionPanel";
import styled from "@mui/material/styles/styled";


// Importações manuais de ícones
import { MdDashboard } from "react-icons/md";
import { FaBoxOpen } from "react-icons/fa";
import { BsPeopleFill } from "react-icons/bs";

// Mapeamento manual entre string do banco e componente de ícone
const iconesDisponiveis = {
  MdDashboard: MdDashboard,
  FaBoxOpen: FaBoxOpen,
  BsPeopleFill: BsPeopleFill,
  GoInbox: GoInbox,
  BsPaperclip: BsPaperclip
};

const getDynamicIcon = (iconName) => {
  return iconesDisponiveis[iconName] || null;
};

const ListLabel = styled(Paragraph)(({ theme, mode }) => ({
  fontSize: "12px",
  marginTop: "20px",
  marginLeft: "15px",
  marginBottom: "10px",
  textTransform: "uppercase",
  display: mode === "compact" && "none",
  color: theme.palette.text.secondary
}));

const ExtAndIntCommon = {
  display: "flex",
  overflow: "hidden",
  borderRadius: "4px",
  height: 44,
  whiteSpace: "pre",
  marginBottom: "8px",
  textDecoration: "none",
  justifyContent: "space-between",
  transition: "all 150ms ease-in",
  "&:hover": { background: "rgba(255, 255, 255, 0.08)" },
  "&.compactNavItem": {
    overflow: "hidden",
    justifyContent: "center !important"
  }
};

const ExternalLink = styled("a")(({ theme }) => ({
  ...ExtAndIntCommon,
  color: theme.palette.text.primary
}));

const InternalLink = styled(Box)(({ theme }) => ({
  "& a": {
    ...ExtAndIntCommon,
    color: theme.palette.text.primary
  },
  "& .navItemActive": {
    backgroundColor: "rgba(255, 255, 255, 0.16)"
  }
}));

const StyledText = styled(Span)(({ mode }) => ({
  fontSize: "0.875rem",
  paddingLeft: "0.8rem",
  display: mode === "compact" && "none"
}));

const BulletIcon = styled("div")(({ theme }) => ({
  padding: "2px",
  marginLeft: "24px",
  marginRight: "8px",
  overflow: "hidden",
  borderRadius: "300px",
  background: theme.palette.text.primary
}));

const BadgeValue = styled("div")(() => ({
  padding: "1px 8px",
  overflow: "hidden",
  borderRadius: "300px"
}));

export default function MatxVerticalNav({ items }) {
  const { settings } = useSettings();
  const { mode } = settings.layout1Settings.leftSidebar;

  const renderLevels = (data) => {
    return data.map((item, index) => {
      const DynamicIcon = item.icon ? getDynamicIcon(item.icon) : null;

      if (item.type === "label") {
        return (
          <ListLabel key={index} mode={mode} className="sidenavHoverShow">
            {item.label}
          </ListLabel>
        );
      }

      if (item.children) {
        return (
          <MatxVerticalNavExpansionPanel
            mode={mode}
            item={item}
            key={index}
            iconComponent={getDynamicIcon(item.icon)}
          >
            {renderLevels(item.children)}
          </MatxVerticalNavExpansionPanel>
        );
      } else if (item.type === "extLink") {
        return (
          <ExternalLink
            key={index}
            href={item.path}
            className={`${mode === "compact" && "compactNavItem"}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            <ButtonBase key={item.name} name="child" sx={{ width: "100%" }}>
              {DynamicIcon ? (
                <Box component={DynamicIcon} sx={{ ml: 2, mr: 2, fontSize: 18 }} />
              ) : (
                <span className="item-icon icon-text">{item.iconText}</span>
              )}
              <StyledText mode={mode} className="sidenavHoverShow">
                {item.name}
              </StyledText>
              <Box mx="auto"></Box>
              {item.badge && <BadgeValue>{item.badge.value}</BadgeValue>}
            </ButtonBase>
          </ExternalLink>
        );
      } else {
        return (
          <InternalLink key={index}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? `navItemActive ${mode === "compact" && "compactNavItem"}`
                  : `${mode === "compact" && "compactNavItem"}`
              }
            >
              <ButtonBase key={item.name} name="child" sx={{ width: "100%" }}>
                {DynamicIcon ? (
                  <Box component={DynamicIcon} sx={{ ml: 2, mr: 2, fontSize: 18 }} />
                ) : (
                  <Fragment>
                    <BulletIcon
                      className={`nav-bullet`}
                      sx={{ display: mode === "compact" && "none" }}
                    />
                    <Box
                      className="nav-bullet-text"
                      sx={{
                        ml: "20px",
                        fontSize: "11px",
                        display: mode !== "compact" && "none"
                      }}
                    >
                      {item.iconText}
                    </Box>
                  </Fragment>
                )}

                <StyledText mode={mode} className="sidenavHoverShow">
                  {item.name}
                </StyledText>

                <Box mx="auto" />

                {item.badge && (
                  <BadgeValue className="sidenavHoverShow">{item.badge.value}</BadgeValue>
                )}
              </ButtonBase>
            </NavLink>
          </InternalLink>
        );
      }
    });
  };

  return <div className="navigation">{renderLevels(items)}</div>;
}