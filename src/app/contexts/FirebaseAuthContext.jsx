import { createContext, useEffect, useReducer } from "react";
import Loading from "app/components/MatxLoading";

const initialAuthState = {
  user: null,
  isInitialized: false,
  isAuthenticated: false,
  token: null
};

const reducer = (state, action) => {
  switch (action.type) {
    case "AUTH_STATE_CHANGED":
      return {
        ...state,
        isAuthenticated: action.payload.isAuthenticated,
        isInitialized: true,
        user: action.payload.user,
        token: action.payload.token
      };

    case "LOGOUT":
      return { ...initialAuthState, isInitialized: true };

    default:
      return state;
  }
};

const AuthContext = createContext({ ...initialAuthState });

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialAuthState);

  const loginComApi = async (email, senha) => {
    const response = await fetch("http://localhost:3450/usuarios/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email, senha })
    });

    if (!response.ok) throw new Error("Falha no login");

    const data = await response.json();

    localStorage.setItem("authToken", data.token);

    dispatch({
      type: "AUTH_STATE_CHANGED",
      payload: {
        isAuthenticated: true,
        user: data.usuario,
        token: data.token
      }
    });

    return data;
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    dispatch({ type: "LOGOUT" });
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (token) {
      fetch("http://localhost:3450/usuarios/validartoken", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => {
          if (!res.ok) throw new Error("Token inválido");
          return res.json();
        })
        .then((data) => {
          dispatch({
            type: "AUTH_STATE_CHANGED",
            payload: {
              isAuthenticated: true,
              user: data.usuario,
              token
            }
          });
        })
        .catch(() => {
          localStorage.removeItem("authToken");
          dispatch({
            type: "AUTH_STATE_CHANGED",
            payload: {
              isAuthenticated: false,
              user: null,
              token: null
            }
          });
        });
    } else {
      dispatch({
        type: "AUTH_STATE_CHANGED",
        payload: {
          isAuthenticated: false,
          user: null,
          token: null
        }
      });
    }
  }, []);

  if (!state.isInitialized) return <Loading />;

  return (
    <AuthContext.Provider
      value={{
        ...state,
        loginComApi,
        logout,
        method: "API"
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
