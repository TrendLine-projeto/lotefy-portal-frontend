// TableWrapper.js
import { Box, Typography, Stack } from '@mui/material';

const TableWrapper = ({ children, total = 0, inicio = 0, fim = 0 }) => (
    <Box
        mt={2}
        sx={{
            '& td': {
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: 150,
                fontSize: '13px'
            }
        }}
    >
        {/* Legenda explicativa de cores */}
        <Box mb={1}>
            <Stack direction="row" spacing={2} alignItems="center">
                <Box display="flex" alignItems="center">
                    <Box sx={{ width: 16, height: 16, backgroundColor: '#d1f2e2', borderRadius: 1, mr: 1 }} />
                    <Typography variant="caption" color="textSecondary">Iniciado</Typography>
                </Box>
                <Box display="flex" alignItems="center">
                    <Box sx={{ width: 16, height: 16, backgroundColor: '#f2f2f2', borderRadius: 1, mr: 1 }} />
                    <Typography variant="caption" color="textSecondary">Não iniciado</Typography>
                </Box>
            </Stack>
        </Box>

        {children}

        {/* Contagem no final da tabela */}
        <Box mt={1}>
            {total > 0 && (
                <Typography variant="caption" color="textSecondary">
                    Exibindo {inicio} até {fim} de {total} registros
                </Typography>
            )}
        </Box>
    </Box>
);

export default TableWrapper;