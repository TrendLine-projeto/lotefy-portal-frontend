// utils/lotePayload.js
export const toSQLDateTime = (value) => {
    if (!value) return null;
    // já está no formato "YYYY-MM-DD HH:mm:ss"
    if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(value)) return value;

    const d = new Date(value); // aceita ISO, Date, etc.
    if (isNaN(d.getTime())) return null;

    const pad = (n) => String(n).padStart(2, '0');
    const YYYY = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const DD = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    return `${YYYY}-${MM}-${DD} ${hh}:${mm}:${ss}`;
};

export const toNumber = (v) => {
    if (v === null || v === undefined || v === '') return null;
    if (typeof v === 'number') return v;

    const s = String(v).trim();

    // Caso 1: formato BR com milhar e decimal -> 1.234,56
    if (/^\d{1,3}(\.\d{3})+,\d{2}$/.test(s)) {
        const norm = s.replace(/\./g, '').replace(',', '.'); // "1.234,56" -> "1234.56"
        const n = parseFloat(norm);
        return Number.isNaN(n) ? null : n;
    }

    // Caso 2: decimal com vírgula -> 1234,56
    if (/^\d+,\d+$/.test(s)) {
        const n = parseFloat(s.replace(',', '.')); // "1234,56" -> "1234.56"
        return Number.isNaN(n) ? null : n;
    }

    // Caso 3: só ponto (padrão US) -> 1234.56  (NÃO remover ponto)
    if (/^\d+\.\d+$/.test(s)) {
        const n = parseFloat(s); // "2930.40" -> 2930.40
        return Number.isNaN(n) ? null : n;
    }

    // Caso 4: inteiro puro
    if (/^\d+$/.test(s)) {
        const n = parseFloat(s);
        return Number.isNaN(n) ? null : n;
    }

    // Fallback: tenta parseFloat direto
    const n = parseFloat(s.replace(/\s/g, ''));
    return Number.isNaN(n) ? null : n;
};

// Extrai SOMENTE o que a API espera
export const buildLotePayload = (l) => ({
    numeroIdentificador: l?.numeroIdentificador ?? null,
    nomeEntregador: l?.nomeEntregador ?? null,
    nomeRecebedor: l?.nomeRecebedor ?? null,
    valorEstimado: toNumber(l?.valorEstimado),
    valorHoraEstimado: toNumber(l?.valorHoraEstimado),
    dataEntrada: toSQLDateTime(l?.dataEntrada),
    dataPrevistaSaida: toSQLDateTime(l?.dataPrevistaSaida),
    dataInicio: toSQLDateTime(l?.dataInicio),
    dataSaida: toSQLDateTime(l?.dataSaida),
});
