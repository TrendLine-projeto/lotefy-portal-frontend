import Box from "@mui/material/Box";
import styled from "@mui/material/styles/styled";

import { Span } from "./Typography";
import { MatxLogo } from "app/components";
import logoIcon from '../assets/img/logo3.png'
import useSettings from "app/hooks/useSettings";

// STYLED COMPONENTS
const BrandRoot = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 0px 0px 0px"
}));

const StyledSpan = styled(Span)(({ mode }) => ({
  fontSize: 18,
  color: '#363636',
  fontWeight: '500',
  marginLeft: ".5rem",
  display: mode === "compact" ? "none" : "block"
}));

export default function Brand({ children }) {
  const { settings } = useSettings();
  const leftSidebar = settings.layout1Settings.leftSidebar;
  const { mode } = leftSidebar;

  return (
    <div style={{ backgroundColor: '#fff', marginBottom: '30px', }}>
      <BrandRoot sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', }}>
          <img style={{ width: '120px', }} src={logoIcon} />
        </Box>
      </BrandRoot>
    </div>
  );
}
