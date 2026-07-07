package dev.alanbertinat.papeleriagest.web.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public record ProductoRequest(
        @NotNull Long codigoProducto,
        @NotNull String nombre,
        @NotNull @PositiveOrZero BigDecimal precioVenta,
        @NotNull @PositiveOrZero BigDecimal precioCompra,
        @NotNull Long categoriaId,
        Long marcaId,
        @PositiveOrZero int cantidad,
        String unidadMedida,
        String iva,
        @PositiveOrZero int stockMinimo) {
}
