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
        BigDecimal subtotal) {

    public static PedidoItemResponse from(PedidoItem item) {
        boolean esOferta = item.getOferta() != null;
        BigDecimal precioUnitario = esOferta ? item.getOferta().getPrecio() : item.getProducto().getPrecioVenta();
        String nombre = esOferta ? item.getOferta().getTitulo() : item.getProducto().getNombre();
        return new PedidoItemResponse(
                item.getId(),
                esOferta ? null : item.getProducto().getCodigoProducto(),
                esOferta ? item.getOferta().getId() : null,
                esOferta ? item.getOferta().getTipo().name() : null,
                nombre,
                item.getCantidad(),
                precioUnitario,
                precioUnitario.multiply(BigDecimal.valueOf(item.getCantidad())));
    }
}
