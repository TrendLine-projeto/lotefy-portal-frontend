import React from 'react';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Box,
    TextField,
    MenuItem,
    FormControlLabel,
    Checkbox,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const filterButtonStyle = {
    background: '#1976d2',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer'
};

const clearButtonStyle = {
    background: '#f0f0f0',
    color: '#333',
    border: '1px solid #ccc',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer'
};

const ExpandableFilterPanel = ({ fields = [], expanded, onToggle, onChange, onFilter, onClear, title = 'Filtros', children, values = {} }) => {
    const handleInputChange = (e, field) => {
        const value = field.type === 'checkbox' ? e.target.checked : e.target.value;
        onChange(field.name, value);
    };

    return (
        <Accordion expanded={expanded} onChange={onToggle}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="filter-panel-content"
                id="filter-panel-header"
            >
                <Typography fontWeight={500}>{title}</Typography>
            </AccordionSummary>

            <AccordionDetails>
                <Box
                    display="flex"
                    flexWrap="wrap"
                    gap={2}
                    sx={{ backgroundColor: '#fafafa', p: 2, borderRadius: 2 }}
                >
                    {fields.map((field) => {
                        const { name, label, type, placeholder, options } = field;

                        return (
                            <Box
                                key={name}
                                minWidth={220}
                                flex="1 1 220px"
                                display="flex"
                                flexDirection="column"
                            >
                                <Typography variant="body2" fontWeight={500} mb={0.5}>
                                    {label}
                                </Typography>

                                {type === 'select' && Array.isArray(options) ? (
                                    <TextField
                                        select
                                        size="small"
                                        onChange={(e) => handleInputChange(e, field)}
                                        defaultValue=""
                                        value={values[name] ?? ''}
                                    >
                                        <MenuItem value="">Todos</MenuItem>
                                        {options.map((opt) => (
                                            <MenuItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                ) : type === 'checkbox' ? (
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={!!values[name]}
                                                onChange={(e) => handleInputChange(e, field)}
                                            />
                                        }
                                        label="Sim"
                                    />
                                ) : (
                                    <TextField
                                        size="small"
                                        type={type}
                                        value={values[name] ?? ''}
                                        placeholder={placeholder}
                                        onChange={(e) => handleInputChange(e, field)}
                                    />
                                )}
                            </Box>
                        );
                    })}

                    <Box width="100%" display="flex" justifyContent="flex-end" gap={1} mt={2}>
                        <button onClick={onFilter} style={filterButtonStyle}>Filtrar</button>
                        <button onClick={onClear} style={clearButtonStyle}>Limpar</button>
                    </Box>
                </Box>

                {children && (
                    <Box
                        mt={3}
                        p={2}
                        borderRadius={2}
                        sx={{ backgroundColor: '#fafafa' }}
                    >
                        {children}
                    </Box>

                )}
            </AccordionDetails>
        </Accordion>
    );
};

export default ExpandableFilterPanel;
