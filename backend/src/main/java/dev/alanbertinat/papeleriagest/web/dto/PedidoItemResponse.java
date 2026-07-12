package dev.alanbertinat.papeleriagest.web.dto;

import dev.alanbertinat.papeleriagest.domain.PedidoItem;
import java.math.BigDecimal;

public record PedidoItemResponse(
        Long id,
        Long productoId,
        Long ofertaId,
        String ofertaTipo,
        String nombre,
        int cantidad,
        BigDecimal precioUnitario,
        BigDecimal subtotal,
        Integer stockActual,
        BigDecimal precioActual) {

    public static PedidoItemResponse from(PedidoItem item) {
        boolean esOferta = item.getOferta() != null;
        String nombre = esOferta ? item.getOferta().getTitulo() : item.getProducto().getNombre();
        BigDecimal precioActual = esOferta ? item.getOferta().getPrecio() : item.getProducto().getPrecioVenta();
        Integer stockActual = esOferta ? null : item.getProducto().getCantidad();
        return new PedidoItemResponse(
                item.getId(),
                esOferta ? null : item.getProducto().getCodigoProducto(),
                esOferta ? item.getOferta().getId() : null,
                esOferta ? item.getOferta().getTipo().name() : null,
                nombre,
                item.getCantidad(),
                item.getPrecioUnitario(),
                item.getPrecioUnitario().multiply(BigDecimal.valueOf(item.getCantidad())),
                stockActual,
                precioActual);
    }
}
