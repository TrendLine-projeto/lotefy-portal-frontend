import { createContext, useEffect, useReducer } from "react";
import axios from "axios";
import { getIdClienteFromToken } from "app/utils/authToken";

const initialState = {
  notifications: [],
  total: 0,
  pagina: 1,
  quantidadePorPagina: 10,
  loading: false
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_NOTIFICATIONS":
      return {
        ...state,
        notifications: action.notifications ?? [],
        total: action.total ?? state.total,
        pagina: action.pagina ?? state.pagina,
        quantidadePorPagina: action.quantidadePorPagina ?? state.quantidadePorPagina
      };
    case "DELETE_NOTIFICATION":
      return {
        ...state,
        notifications: (state.notifications || []).filter((n) => n.id !== action.id),
        total: Math.max((state.total || 0) - 1, 0)
      };
    case "CLEAR_NOTIFICATIONS":
      return { ...state, notifications: [], total: 0 };
    default:
      return state;
  }
};

const NotificationContext = createContext({
  notifications: [],
  total: 0,
  pagina: 1,
  quantidadePorPagina: 10,
  loading: false,
  deleteNotification: () => {},
  clearNotifications: () => {},
  getNotifications: () => {},
  createNotification: () => {}
});

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const apiUrl = import.meta.env.VITE_API_URL;

  const getNotifications = async (pagina = state.pagina, quantidadePorPagina = state.quantidadePorPagina, append = false) => {
    const idCliente = getIdClienteFromToken();
    if (!idCliente) return;

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const res = await axios.get(`${apiUrl}/notificacoes`, {
        params: { pagina, quantidadePorPagina, idCliente }
      });
      const { itens = [], total = 0 } = res.data || {};
      const merged = append ? [...(state.notifications || []), ...itens] : itens;

      dispatch({
        type: "SET_NOTIFICATIONS",
        notifications: merged,
        total,
        pagina,
        quantidadePorPagina
      });
    } catch (e) {
      console.error("Erro ao carregar notificacoes", e);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const deleteNotification = async (notificationID) => {
    try {
      if (!notificationID) return;
      await axios.delete(`${apiUrl}/notificacoes/${notificationID}`);
      dispatch({ type: "DELETE_NOTIFICATION", id: notificationID });
    } catch (e) {
      console.error(e);
    }
  };

  const clearNotifications = () => {
    dispatch({ type: "CLEAR_NOTIFICATIONS" });
  };

  const createNotification = async (notification) => {
    try {
      const res = await axios.post(`${apiUrl}/notificacoes`, notification);
      const novo = res.data?.criado;
      if (novo) {
        dispatch({
          type: "SET_NOTIFICATIONS",
          notifications: [novo, ...(state.notifications || [])],
          total: (state.total || 0) + 1
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        getNotifications,
        deleteNotification,
        clearNotifications,
        createNotification,
        notifications: state.notifications,
        total: state.total,
        pagina: state.pagina,
        quantidadePorPagina: state.quantidadePorPagina,
        loading: state.loading
      }}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
