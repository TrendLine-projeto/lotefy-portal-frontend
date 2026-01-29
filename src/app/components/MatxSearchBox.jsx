import { useMemo, useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import styled from "@mui/material/styles/styled";
import { List, ListItemButton, ListItemText, Typography } from "@mui/material";
import { topBarHeight } from "app/utils/constant";
import useAuth from "app/hooks/useAuth";
import routes from "app/routes";

// STYLED COMPONENTS
const SearchContainer = styled("div")(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  zIndex: theme.zIndex.appBar + 10,
  width: "100%",
  display: "flex",
  alignItems: "stretch",
  height: topBarHeight,
  background: theme.palette.primary.main,
  color: theme.palette.text.primary,
  overflow: "visible",
  "&::placeholder": {
    color: theme.palette.text.primary
  }
}));

const SearchBarRow = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
  height: topBarHeight,
  width: "100%"
}));

const SearchInput = styled("input")(({ theme }) => ({
  width: "100%",
  border: "none",
  outline: "none",
  fontSize: "1rem",
  paddingLeft: "20px",
  height: "calc(100% - 5px)",
  background: theme.palette.primary.main,
  color: theme.palette.text.primary,
  "&::placeholder": { color: theme.palette.text.primary }
}));

const SearchResults = styled("div")(({ theme }) => ({
  position: "absolute",
  top: topBarHeight,
  left: 0,
  right: 0,
  background: theme.palette.background.paper,
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.16)",
  borderTop: "1px solid rgba(148, 163, 184, 0.2)",
  maxHeight: "60vh",
  overflowY: "auto"
}));

const MENU_FIXO = [{ name: "Dashboard", path: "/dashboard/default" }];

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const collectRoutePaths = (routesList = [], acc = new Set()) => {
  routesList.forEach((route) => {
    const path = route?.path;
    if (typeof path === "string" && path.startsWith("/") && path !== "/") {
      acc.add(path);
    }
    if (Array.isArray(route?.children)) {
      collectRoutePaths(route.children, acc);
    }
  });
  return acc;
};

const flattenMenus = (menus = [], parentLabel = "") => {
  const items = [];
  menus.forEach((menu) => {
    const name = menu?.nome || menu?.name;
    const path = menu?.link || menu?.path;
    const label = parentLabel && name ? `${parentLabel} / ${name}` : name || parentLabel;

    if (name && path) {
      items.push({ label: label || name, path });
    } else if (name && !path) {
      items.push({ label: label || name, path: "" });
    }

    const children = menu?.submenus || menu?.children || [];
    if (children.length) {
      items.push(...flattenMenus(children, label || name || parentLabel));
    }
  });

  return items;
};

export default function MatxSearchBox() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const allowedPaths = useMemo(() => collectRoutePaths(routes), []);

  const toggle = () => {
    setOpen((prev) => !prev);
    if (open) {
      setQuery("");
    }
  };

  const menuItems = useMemo(() => {
    const apiMenus = Array.isArray(user?.menus) ? user.menus : [];
    const flattened = [
      ...flattenMenus(MENU_FIXO),
      ...flattenMenus(apiMenus)
    ];

    const byPath = new Map();
    flattened.forEach((item) => {
      if (!item?.path || !allowedPaths.has(item.path)) return;
      if (!byPath.has(item.path)) {
        byPath.set(item.path, item);
      }
    });
    return Array.from(byPath.values());
  }, [user?.menus, allowedPaths]);

  const normalizedQuery = normalizeText(query);
  const suggestions = useMemo(() => {
    if (!normalizedQuery) return [];
    return menuItems
      .filter((item) => {
        const label = normalizeText(item.label);
        const path = normalizeText(item.path);
        return label.includes(normalizedQuery) || path.includes(normalizedQuery);
      })
      .slice(0, 8);
  }, [menuItems, normalizedQuery]);

  const handleSelect = (item) => {
    if (!item?.path) return;
    navigate(item.path);
    setOpen(false);
    setQuery("");
  };

  return (
    <Fragment>
      {!open && (
        <IconButton onClick={toggle}>
          <Icon sx={{ color: "text.primary" }}>search</Icon>
        </IconButton>
      )}

      {open && (
        <SearchContainer>
          <SearchBarRow>
            <SearchInput
              type="text"
              placeholder="Pesquise aqui..."
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  toggle();
                }
                if (e.key === "Enter" && suggestions.length) {
                  handleSelect(suggestions[0]);
                }
              }}
            />
            <IconButton onClick={toggle} sx={{ mx: 2, verticalAlign: "middle" }}>
              <Icon sx={{ color: "text.primary" }}>close</Icon>
            </IconButton>
          </SearchBarRow>

          {query.length > 0 && (
            <SearchResults>
              {suggestions.length ? (
                <List disablePadding>
                  {suggestions.map((item) => (
                    <ListItemButton key={item.path} onClick={() => handleSelect(item)}>
                      <ListItemText
                        primary={item.label}
                        secondary={item.path}
                        primaryTypographyProps={{ sx: { fontWeight: 600 } }}
                        secondaryTypographyProps={{ sx: { fontSize: "0.75rem", color: "text.secondary" } }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              ) : (
                <Typography sx={{ px: 2, py: 1.5, color: "text.secondary" }} variant="body2">
                  Nenhum resultado encontrado.
                </Typography>
              )}
            </SearchResults>
          )}
        </SearchContainer>
      )}
    </Fragment>
  );
}
