package dev.alanbertinat.papeleriagest.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record DocumentoRequest(
        @NotBlank String nombre,
        String formato,
        boolean esDobleFaz,
        boolean aColor,
        String descripcion,
        boolean esEnvio,
        String direccion,
        String materia,
        String codigo,
        @Positive int cantidadCopias,
        boolean esPractico,
        int nroPractico,
        boolean esImagen,
        boolean esPropio,
        Long pedidoId,
        Long cursoId,
        String tamanio,
        String tipoPapel,
        String modoColor,
        String paginasPorCara,
        String orientacion,
        String terminacion) {
}
