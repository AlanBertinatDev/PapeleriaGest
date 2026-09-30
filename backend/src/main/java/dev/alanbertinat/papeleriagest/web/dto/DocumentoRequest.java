package dev.alanbertinat.papeleriagest.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record DocumentoRequest(
        @NotBlank String nombre,
        String formato,
        boolean esDobleFaz,
        boolean aColor,
        String descripcion,
        boolean esEnvio,
        String direccion,
        @Positive int cantidadCopias,
        boolean esImagen,
        @NotNull Long pedidoId,
        String tamanio,
        String tipoPapel,
        String modoColor,
        String paginasPorCara,
        String orientacion,
        String terminacion) {
}
