package dev.alanbertinat.papeleriagest.web.dto;

import dev.alanbertinat.papeleriagest.domain.PedidoItem;
import java.math.BigDecimal;

public record PedidoItemResponse(
        Long productoId, String productoNombre, int cantidad, BigDecimal precioUnitario, BigDecimal subtotal) {

    public static PedidoItemResponse from(PedidoItem item) {
        BigDecimal precioUnitario = item.getProducto().getPrecioVenta();
        return new PedidoItemResponse(
                item.getProducto().getCodigoProducto(),
                item.getProducto().getNombre(),
                item.getCantidad(),
                precioUnitario,
                precioUnitario.multiply(BigDecimal.valueOf(item.getCantidad())));
    }
}
