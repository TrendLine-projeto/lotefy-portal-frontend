import React from "react";
import { Grid, FormControlLabel, Checkbox, Button } from "@mui/material";
import HeaderFormTitle from "../../../../components/HeeaderFormTitle";

export function EtapaPreferencias({ preferencias, setPreferencias, onFinalizar }) {
    const handleChange = (e) => {
        const { name, checked } = e.target;
        setPreferencias({ [name]: checked });
    };

    return (
        <>
            <HeaderFormTitle
                titulo="Preferências"
                subtitulo="Informações de preferências de lote."
            />

            <FormControlLabel
                control={
                    <Checkbox
                        name="loteIniciado"
                        checked={preferencias.loteIniciado || false}
                        onChange={handleChange}
                    />
                }
                label="Lote inicia imediatamente"
            />

            <Grid item xs={12} display="flex" justifyContent="flex-start" mt={3}>
                <Button variant="contained" onClick={onFinalizar}>
                    Finalizar Cadastro
                </Button>
            </Grid>
        </>
    );
}