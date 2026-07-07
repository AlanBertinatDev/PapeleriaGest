package dev.alanbertinat.papeleriagest.web.dto;

import dev.alanbertinat.papeleriagest.domain.AudienciaNotificacion;
import dev.alanbertinat.papeleriagest.domain.Oferta;
import dev.alanbertinat.papeleriagest.domain.TipoOferta;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

public record OfertaResponse(
        Long id,
        String titulo,
        String descripcion,
        BigDecimal precio,
        LocalDate fechaDesde,
        LocalDate fechaHasta,
        boolean activo,
        TipoOferta tipo,
        boolean tieneImagen,
        Long usuarioId,
        String usuarioNombre,
        boolean notificado,
        Integer notificadoCantidad,
        AudienciaNotificacion audienciaNotificacion,
        boolean destacarHome,
        List<ProductoResponse> productos) {

    public static OfertaResponse from(Oferta oferta) {
        return new OfertaResponse(
                oferta.getId(),
                oferta.getTitulo(),
                oferta.getDescripcion(),
                oferta.getPrecio(),
                oferta.getFechaDesde(),
                oferta.getFechaHasta(),
                oferta.isActivo(),
                oferta.getTipo(),
                oferta.getImagenArchivo() != null,
                oferta.getUsuario().getId(),
                oferta.getUsuario().getNombre(),
                oferta.isNotificado(),
                oferta.getNotificadoCantidad(),
                oferta.getAudienciaNotificacion(),
                oferta.isDestacarHome(),
                oferta.getProductos().stream()
                        .map(ProductoResponse::from)
                        .sorted(Comparator.comparing(ProductoResponse::nombre))
                        .toList());
    }
}
