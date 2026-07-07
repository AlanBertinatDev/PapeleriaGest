package dev.alanbertinat.papeleriagest.web.dto;

import dev.alanbertinat.papeleriagest.domain.Documento;
import java.time.LocalDate;

public record DocumentoResponse(
        Long id,
        String nombre,
        String formato,
        boolean esDobleFaz,
        boolean aColor,
        String descripcion,
        boolean esEnvio,
        String direccion,
        String materia,
        int cantidadCopias,
        boolean esPractico,
        int nroPractico,
        LocalDate fechaIngreso,
        boolean activo,
        String nombreArchivoOriginal,
        boolean esImagen,
        String estado,
        Long usuarioId,
        String usuarioNombre,
        Long pedidoId,
        Long cursoId,
        String cursoNombre) {

    public static DocumentoResponse from(Documento documento) {
        return new DocumentoResponse(
                documento.getId(),
                documento.getNombre(),
                documento.getFormato(),
                documento.isEsDobleFaz(),
                documento.isAColor(),
                documento.getDescripcion(),
                documento.isEsEnvio(),
                documento.getDireccion(),
                documento.getMateria(),
                documento.getCantidadCopias(),
                documento.isEsPractico(),
                documento.getNroPractico(),
                documento.getFechaIngreso(),
                documento.isActivo(),
                documento.getNombreArchivoOriginal(),
                documento.isEsImagen(),
                documento.getEstado().name(),
                documento.getUsuario().getId(),
                documento.getUsuario().getNombre(),
                documento.getPedido() != null ? documento.getPedido().getId() : null,
                documento.getCurso() != null ? documento.getCurso().getId() : null,
                documento.getCurso() != null ? documento.getCurso().getGrado() + " " + documento.getCurso().getGrupo() : null);
    }
}
