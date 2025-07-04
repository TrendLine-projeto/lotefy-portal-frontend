// src/components/Dialogs/ConfirmDialog.jsx
import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    CircularProgress,
    useTheme
} from '@mui/material';

const ConfirmDialog = ({
    open,
    title = 'Confirmação',
    description = 'Você tem certeza que deseja continuar?',
    onClose,
    onConfirm,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    confirmColor = 'primary',
    loading = false
}) => {
    const theme = useTheme();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
            PaperProps={{
                elevation: 3,
                sx: {
                    borderRadius: 2,
                    minWidth: 360,
                    maxWidth: 480,
                },
            }}
        >
            <DialogTitle
                id="confirm-dialog-title"
                sx={{ fontWeight: 600, fontSize: '1.25rem', color: theme.palette.text.primary }}
            >
                {title}
            </DialogTitle>

            <DialogContent>
                <DialogContentText
                    id="confirm-dialog-description"
                    sx={{ fontSize: '1rem', color: theme.palette.text.secondary }}
                >
                    {description}
                </DialogContentText>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} color="inherit" variant="outlined">
                    {cancelText}
                </Button>

                <Button
                    onClick={onConfirm}
                    color={confirmColor}
                    variant="contained"
                    autoFocus
                    disabled={loading}
                    sx={{ minWidth: 100 }}
                >
                    {loading ? <CircularProgress size={20} color="inherit" /> : confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;
