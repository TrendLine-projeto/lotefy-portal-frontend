export const parseIniciado = (v) => {
    if (v === null || v === undefined) return false;
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number') return v === 1;

    const s = String(v)
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, ''); // remove acentos (pega "nao" de "não")

    const truthy = new Set(['1', 'true', 't', 'sim', 's', 'iniciado', 'yes', 'y']);
    return truthy.has(s);
};