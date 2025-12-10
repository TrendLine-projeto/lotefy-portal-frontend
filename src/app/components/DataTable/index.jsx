import React from 'react';
import {
    Table, TableHead, TableBody, TableRow, TableCell,
    TablePagination, CircularProgress, Box, Typography
} from '@mui/material';

const DataTable = ({ columns = [], rows = [], loading = false, pagination, onPageChange, onRowsPerPageChange }) => {
    const safeColumns = Array.isArray(columns) ? columns : [];
    const safeRows = Array.isArray(rows) ? rows : [];
    const cellMaxWidth = 180;

    return (
        <Box>
            {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                </Box>
            ) : safeRows.length === 0 ? (
                <Typography variant="body2" align="center" sx={{ py: 4 }}>
                    Nenhum resultado encontrado.
                </Typography>
            ) : (
                <>
                    <Table size="small" sx={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                                {safeColumns.map((col, index) => (
                                    <TableCell
                                        key={col.field}
                                        sx={{
                                            borderRight: index < safeColumns.length - 1 ? '1px solid #e0e0e0' : 'none',
                                            fontWeight: 600,
                                            px: 2,
                                            py: 1.5
                                        }}
                                    >
                                        {col.headerName}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {safeRows.map((row, idx) => (
                                <TableRow
                                    key={idx}
                                    sx={{
                                        '&:not(:last-child)': { borderBottom: '1px solid #e0e0e0' },
                                        '&:hover': { backgroundColor: '#f9f9f9' }
                                    }}
                                >
                                    {safeColumns.map((col, index) => {
                                        const rawValue = col.renderCell ? col.renderCell(row) : (row[col.field] ?? '');
                                        const isPrimitive = typeof rawValue === 'string' || typeof rawValue === 'number';
                                        const displayValue = col.renderCell ? rawValue : String(rawValue);
                                        const maxWidth = col.maxWidth || cellMaxWidth;
                                        return (
                                            <TableCell
                                                key={col.field}
                                                title={isPrimitive ? String(rawValue) : undefined}
                                                sx={{
                                                    borderRight: index < safeColumns.length - 1 ? '1px solid #f0f0f0' : 'none',
                                                    px: 2,
                                                    py: 1.5,
                                                    maxWidth,
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}
                                            >
                                                {isPrimitive ? (
                                                    <span
                                                        title={String(rawValue)}
                                                        style={{
                                                            display: 'inline-block',
                                                            maxWidth: '100%',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            verticalAlign: 'middle',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        {displayValue}
                                                    </span>
                                                ) : displayValue}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {pagination && (
                        <TablePagination
                            component="div"
                            count={pagination.total || 0}
                            page={(pagination.page || 1) - 1}
                            onPageChange={(e, newPage) => onPageChange(newPage + 1)}
                            rowsPerPage={pagination.perPage || 10}
                            onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            labelRowsPerPage="Linhas por página:"
                        />
                    )}
                </>
            )}
        </Box>
    );
};

export default DataTable;
