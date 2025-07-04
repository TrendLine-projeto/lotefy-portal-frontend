import { Box, Tooltip } from '@mui/material';

/**
 * Gera colunas com truncamento + tooltip automático
 * @param {Array} columns - array de objetos com { field, headerName }
 * @param {Array} fieldsWithTooltip - opcional: campos que devem ter tooltip (senão aplica em todos)
 */
export const buildColumnsWithEllipsis = (columns, fieldsWithTooltip = null) =>
    columns.map((col) => {
        const applyTooltip = !fieldsWithTooltip || fieldsWithTooltip.includes(col.field);

        if (!applyTooltip) return col;

        return {
            ...col,
            renderCell: (row) => (
                <Tooltip title={row[col.field] || ''}>
                    <Box
                        sx={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: 160
                        }}
                    >
                        {row[col.field]}
                    </Box>
                </Tooltip>
            )
        };
    });