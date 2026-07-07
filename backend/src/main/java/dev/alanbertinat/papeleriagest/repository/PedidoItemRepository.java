package dev.alanbertinat.papeleriagest.repository;

import dev.alanbertinat.papeleriagest.domain.PedidoItem;
import dev.alanbertinat.papeleriagest.web.dto.ProductoMasVendidoResponse;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PedidoItemRepository extends JpaRepository<PedidoItem, Long> {

    @Query("""
            SELECT new dev.alanbertinat.papeleriagest.web.dto.ProductoMasVendidoResponse(
                i.producto.codigoProducto, i.producto.nombre, SUM(i.cantidad))
            FROM PedidoItem i
            WHERE i.pedido.fechaPedido BETWEEN :desde AND :hasta
                AND i.pedido.estado <> dev.alanbertinat.papeleriagest.domain.EstadoPedido.CANCELADO
            GROUP BY i.producto.codigoProducto, i.producto.nombre
            ORDER BY SUM(i.cantidad) DESC
            """)
    List<ProductoMasVendidoResponse> productosMasVendidos(LocalDateTime desde, LocalDateTime hasta, Pageable pageable);
}
