package dev.alanbertinat.papeleriagest.web.dto;

import jakarta.validation.constraints.Positive;

public record CotizarImpresionRequest(
        @Positive int cantidadCopias,
        String modoColor,
        String tamanio,
        String tipoPapel,
        String terminacion) {
}
