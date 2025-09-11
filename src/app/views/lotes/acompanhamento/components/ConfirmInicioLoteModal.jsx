import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from '@mui/material';

/**
 * Modal de confirmação para iniciar um lote manualmente.
 *
 * Props:
 * - open: boolean -> controla abertura do modal
 * - onClose: () => void -> fecha o modal
 * - onConfirm: () => void -> ação de confirmar (vem do pai)
 * - loteId: number -> id do lote (opcional, só para exibir ou passar pro pai)
 * - numeroIdentificador?: string -> opcional, para exibir no texto
 * - titulo?: string -> opcional, título customizado
 */
export default function ConfirmInicioLoteModal({
    open,
    onClose,
    onConfirm,
    loteId,
    numeroIdentificador,
    titulo = 'Confirmar início manual do lote',
}) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{titulo}</DialogTitle>

            <DialogContent dividers>
                <Typography variant="body1" sx={{ mb: 1.5 }}>
                    Tem certeza que deseja <strong>iniciar manualmente</strong> o lote
                    {numeroIdentificador ? (
                        <> <strong> {numeroIdentificador}</strong> </>
                    ) : null}
                    ?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Essa ação definirá o status do lote como <em>iniciado</em>.
                </Typography>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} variant="text">
                    Cancelar
                </Button>
                <Button onClick={() => onConfirm?.(loteId)} variant="contained" color="primary">
                    Confirmar início
                </Button>
            </DialogActions>
        </Dialog>
    );
}