// Utilitários para extrair dados do token salvo em localStorage (JWT ou objeto).

const decodeJwt = (token) => {
    try {
        const [, payload] = token.split('.');
        if (!payload) return null;
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
        const json = atob(padded);
        return JSON.parse(json);
    } catch (_) {
        return null;
    }
};

export const getIdClienteFromToken = () => {
    try {
        const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null;
        if (!raw) return null;
        // se for objeto armazenado
        try {
            const parsedObj = JSON.parse(raw);
            if (parsedObj?.idCliente) return parsedObj.idCliente;
            if (parsedObj?.user?.idCliente) return parsedObj.user.idCliente;
        } catch (_) {
            // não era JSON, tenta como JWT
        }
        const decoded = decodeJwt(raw);
        if (decoded?.idCliente) return decoded.idCliente;
        if (decoded?.id) return decoded.id;
        if (decoded?.user?.idCliente) return decoded.user.idCliente;
        return null;
    } catch (_) {
        return null;
    }
};

export const getUserFromToken = () => {
    try {
        const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null;
        if (!raw) return null;
        try {
            const parsedObj = JSON.parse(raw);
            if (parsedObj?.user) return parsedObj.user;
            return parsedObj;
        } catch (_) {
            return decodeJwt(raw);
        }
    } catch (_) {
        return null;
    }
};
