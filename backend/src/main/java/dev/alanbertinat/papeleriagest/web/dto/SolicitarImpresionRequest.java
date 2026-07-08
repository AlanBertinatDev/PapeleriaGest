package dev.alanbertinat.papeleriagest.web.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record SolicitarImpresionRequest(
        @NotNull Long documentoOrigenId,
        @NotNull Long pedidoId,
        @Positive int cantidadCopias,
        boolean esDobleFaz,
        boolean aColor,
        String tamanio,
        String tipoPapel,
        String modoColor,
        String paginasPorCara,
        String orientacion,
        String terminacion) {
}
