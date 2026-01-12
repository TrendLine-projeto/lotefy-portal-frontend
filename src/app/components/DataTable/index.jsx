import React from 'react';
import {
    Table, TableHead, TableBody, TableRow, TableCell,
    TablePagination, CircularProgress, Box, Typography
} from '@mui/material';

const DataTable = ({
    columns = [],
    rows = [],
    loading = false,
    pagination,
    onPageChange,
    onRowsPerPageChange,
    dense = false,
    keepHeaderOnEmpty = false,
    emptyMessage = 'Nenhum resultado encontrado.'
}) => {
    const safeColumns = Array.isArray(columns) ? columns : [];
    const safeRows = Array.isArray(rows) ? rows : [];
    const cellMaxWidth = 180;
    const cellPaddingY = dense ? 0.75 : 1.5;
    const cellPaddingX = dense ? 1 : 2;
    const showEmptyMessage = safeRows.length === 0 && !keepHeaderOnEmpty;

    return (
        <Box>
            {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                </Box>
            ) : showEmptyMessage ? (
                <Typography variant="body2" align="center" sx={{ py: 4 }}>
                    {emptyMessage}
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
                                            px: cellPaddingX,
                                            py: cellPaddingY
                                        }}
                                    >
                                        {col.headerName}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {safeRows.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={Math.max(safeColumns.length, 1)}
                                        sx={{
                                            px: cellPaddingX,
                                            py: dense ? 2 : 4,
                                            textAlign: 'center',
                                            color: '#64748b'
                                        }}
                                    >
                                        {emptyMessage}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                safeRows.map((row, idx) => (
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
                                                        px: cellPaddingX,
                                                        py: cellPaddingY,
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
                                ))
                            )}
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
