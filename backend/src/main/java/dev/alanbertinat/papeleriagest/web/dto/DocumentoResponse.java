package dev.alanbertinat.papeleriagest.web.dto;

import dev.alanbertinat.papeleriagest.domain.Documento;
import java.math.BigDecimal;
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
        int cantidadCopias,
        LocalDate fechaIngreso,
        boolean activo,
        String nombreArchivoOriginal,
        boolean esImagen,
        String estado,
        BigDecimal precio,
        Long usuarioId,
        String usuarioNombre,
        Long pedidoId,
        String tamanio,
        String tipoPapel,
        String modoColor,
        String paginasPorCara,
        String orientacion,
        String terminacion) {

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
                documento.getCantidadCopias(),
                documento.getFechaIngreso(),
                documento.isActivo(),
                documento.getNombreArchivoOriginal(),
                documento.isEsImagen(),
                documento.getEstado().name(),
                documento.getPrecio(),
                documento.getUsuario().getId(),
                documento.getUsuario().getNombre(),
                documento.getPedido() != null ? documento.getPedido().getId() : null,
                documento.getTamanio(),
                documento.getTipoPapel(),
                documento.getModoColor(),
                documento.getPaginasPorCara(),
                documento.getOrientacion(),
                documento.getTerminacion());
    }
}
