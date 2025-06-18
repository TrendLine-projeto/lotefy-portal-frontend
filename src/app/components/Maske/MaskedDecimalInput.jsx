import React, { useState, useEffect } from 'react';
import { TextField } from '@mui/material';

export const MaskedDecimalInput = ({
    label,
    name,
    value,
    onChange,
    readOnly = false,
    placeholder = '0.00',
    decimalPlaces = 2,
    ...rest
}) => {
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (value === '' || value === null || isNaN(value)) {
            setInputValue('');
        } else {
            setInputValue(Number(value).toFixed(decimalPlaces));
        }
    }, [value, decimalPlaces]);

    const handleInputChange = (e) => {
        const raw = e.target.value;

        // Limpa tudo que não for número ou vírgula/ponto
        const clean = raw.replace(/[^0-9]/g, '');

        // Se nada foi digitado, zera
        if (!clean) {
            setInputValue('');
            onChange(name, null);
            return;
        }

        const int = clean.slice(0, clean.length - decimalPlaces) || '0';
        const dec = clean.slice(-decimalPlaces).padStart(decimalPlaces, '0');
        const masked = `${int}.${dec}`;

        setInputValue(masked);
        onChange(name, parseFloat(masked));
    };

    return (
        <TextField
            fullWidth
            label={label}
            name={name}
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            inputProps={{ inputMode: 'decimal' }}
            InputProps={{ readOnly }}
            {...rest}
        />
    );
};
