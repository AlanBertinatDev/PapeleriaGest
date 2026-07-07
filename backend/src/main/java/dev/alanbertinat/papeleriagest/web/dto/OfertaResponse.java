package dev.alanbertinat.papeleriagest.web.dto;

import dev.alanbertinat.papeleriagest.domain.Oferta;
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
        Long usuarioId,
        String usuarioNombre,
        List<String> imagenesUrls,
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
                oferta.getUsuario().getId(),
                oferta.getUsuario().getNombre(),
                oferta.getImagenes().stream().map(dev.alanbertinat.papeleriagest.domain.Imagen::getUrl).toList(),
                oferta.getProductos().stream()
                        .map(ProductoResponse::from)
                        .sorted(Comparator.comparing(ProductoResponse::nombre))
                        .toList());
    }
}
