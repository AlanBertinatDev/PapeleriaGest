package dev.alanbertinat.papeleriagest.web.dto;

import dev.alanbertinat.papeleriagest.domain.Producto;
import java.math.BigDecimal;
import java.time.LocalDate;

public record ProductoResponse(
        Long codigoProducto,
        String nombre,
        BigDecimal precioVenta,
        BigDecimal precioCompra,
        boolean activo,
        CategoriaProductoResponse categoria,
        MarcaResponse marca,
        int cantidad,
        String unidadMedida,
        LocalDate fechaCarga,
        String iva,
        int stockMinimo,
        boolean stockBajo,
        boolean tieneImagen) {

    public static ProductoResponse from(Producto producto) {
        return new ProductoResponse(
                producto.getCodigoProducto(),
                producto.getNombre(),
                producto.getPrecioVenta(),
                producto.getPrecioCompra(),
                producto.isActivo(),
                CategoriaProductoResponse.from(producto.getCategoria()),
                producto.getMarca() != null ? MarcaResponse.from(producto.getMarca()) : null,
                producto.getCantidad(),
                producto.getUnidadMedida(),
                producto.getFechaCarga(),
                producto.getIva(),
                producto.getStockMinimo(),
                producto.getCantidad() <= producto.getStockMinimo(),
                producto.getImagenArchivo() != null);
    }
}
