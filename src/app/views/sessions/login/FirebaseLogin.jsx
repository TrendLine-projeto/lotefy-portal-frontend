import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { Formik } from "formik";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import LoadingButton from "@mui/lab/LoadingButton";
import imgLogo from '../../../assets/img/logo2.jpg'
import useAuth from "app/hooks/useAuth";

const FirebaseRoot = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#1A2038",
  minHeight: "100vh !important",
  "& .card": { maxWidth: 800, margin: "1rem" },
  "& .cardLeft": {
    color: "#fff",
    height: "100%",
    display: "flex",
    padding: "32px 56px",
    flexDirection: "column",
    backgroundSize: "cover",
    background: "#161c37 url(/assets/images/bg-3.png) no-repeat",
    [theme.breakpoints.down("sm")]: { minWidth: 200 },
    "& img": { width: 32, height: 32 }
  },
  "& .mainTitle": {
    fontSize: 18,
    lineHeight: 1.3,
    marginBottom: 24
  },
  "& .item": {
    position: "relative",
    marginBottom: 12,
    paddingLeft: 16,
    "&::after": {
      top: 8,
      left: 0,
      width: 4,
      height: 4,
      content: '""',
      borderRadius: 4,
      position: "absolute",
      backgroundColor: theme.palette.error.main
    }
  }
}));

const initialValues = {
  email: "",
  password: "",
  remember: true
};

export default function FirebaseLogin() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const { loginComApi } = useAuth();

  const handleFormSubmit = async (values) => {
    try {
      const res = await loginComApi(values.email, values.password);
      enqueueSnackbar("Autenticado com sucesso!", { variant: "success" });
      navigate(state?.from || "/");
    } catch (error) {
      enqueueSnackbar("Erro ao autenticar", { variant: "error" });
      console.error(error);
    }
  };

  return (
    <FirebaseRoot>
      <Box
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgcolor="#f5f7fa0"
      >
        <Card
          sx={{
            width: { xs: '90%', sm: '400px' },
            boxShadow: 3,
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            bgcolor="#fff"
            color="#fff"
            py={1}
            px={3}
          >
            <img src={imgLogo} alt="Logo" style={{ width: 220, marginBottom: 16 }} />
            <Typography variant="h6" fontWeight="500" color='#252525'>
              Bem Vindo
            </Typography>
            <Typography variant="body2" color='#252525'>
              Informe suas credencias
            </Typography>
          </Box>

          <Box p={4}>
            <Formik
              onSubmit={handleFormSubmit}
              initialValues={initialValues}
            >
              {({
                values,
                errors,
                touched,
                isSubmitting,
                handleChange,
                handleBlur,
                handleSubmit,
              }) => (
                <form onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Email"
                    name="email"
                    size="small"
                    variant="outlined"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.email}
                    error={Boolean(errors.email && touched.email)}
                    helperText={touched.email && errors.email}
                  />
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Password"
                    name="password"
                    size="small"
                    type="password"
                    variant="outlined"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.password}
                    error={Boolean(errors.password && touched.password)}
                    helperText={touched.password && errors.password}
                  />

                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          name="remember"
                          checked={values.remember}
                          onChange={handleChange}
                        />
                      }
                      label="Lembrar meu login"
                    />
                    <NavLink
                      to="/session/forgot-password"
                      style={{ fontSize: 14, color: '#1976d2', textDecoration: 'none' }}
                    >
                      Esqueceu sua senha
                    </NavLink>
                  </Box>

                  <LoadingButton
                    type="submit"
                    fullWidth
                    variant="contained"
                    loading={isSubmitting}
                    sx={{ mt: 3, mb: 2 }}
                  >
                    Login
                  </LoadingButton>

                  <Typography textAlign="center" variant="body2">
                    Não possui uma conta?{" "}
                    <NavLink to="/session/signup" style={{ color: '#1976d2', textDecoration: 'none' }}>
                      Registrar
                    </NavLink>
                  </Typography>
                </form>
              )}
            </Formik>
          </Box>
        </Card>
      </Box>
    </FirebaseRoot>

  );
}
