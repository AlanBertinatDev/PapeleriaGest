package dev.alanbertinat.papeleriagest.repository;

import dev.alanbertinat.papeleriagest.domain.EstadoPedido;
import dev.alanbertinat.papeleriagest.domain.Pedido;
import dev.alanbertinat.papeleriagest.web.dto.UsuarioConteoResponse;
import dev.alanbertinat.papeleriagest.web.dto.UsuarioGastoResponse;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    List<Pedido> findAllByOrderByFechaPedidoDesc(Pageable pageable);

    List<Pedido> findByUsuarioIdOrderByFechaPedidoDesc(Long usuarioId);

    long countByActivoTrueAndEstado(EstadoPedido estado);

    @Query("""
            SELECT COUNT(p)
            FROM Pedido p
            WHERE p.fechaPedido BETWEEN :desde AND :hasta AND p.estado <> dev.alanbertinat.papeleriagest.domain.EstadoPedido.CANCELADO
            """)
    long contarPedidosEnRango(LocalDateTime desde, LocalDateTime hasta);

    @Query("""
            SELECT COALESCE(SUM(p.precio), 0)
            FROM Pedido p
            WHERE p.fechaPedido BETWEEN :desde AND :hasta AND p.estado <> dev.alanbertinat.papeleriagest.domain.EstadoPedido.CANCELADO
            """)
    java.math.BigDecimal sumarIngresosEnRango(LocalDateTime desde, LocalDateTime hasta);

    @Query("""
            SELECT new dev.alanbertinat.papeleriagest.web.dto.UsuarioConteoResponse(
                p.usuario.id, p.usuario.nombre, COUNT(p))
            FROM Pedido p
            WHERE p.fechaPedido BETWEEN :desde AND :hasta AND p.estado <> dev.alanbertinat.papeleriagest.domain.EstadoPedido.CANCELADO
            GROUP BY p.usuario.id, p.usuario.nombre
            ORDER BY COUNT(p) DESC
            """)
    List<UsuarioConteoResponse> usuariosConMasPedidos(LocalDateTime desde, LocalDateTime hasta, Pageable pageable);

    @Query("""
            SELECT new dev.alanbertinat.papeleriagest.web.dto.UsuarioGastoResponse(
                p.usuario.id, p.usuario.nombre, SUM(p.precio))
            FROM Pedido p
            WHERE p.fechaPedido BETWEEN :desde AND :hasta AND p.estado <> dev.alanbertinat.papeleriagest.domain.EstadoPedido.CANCELADO
            GROUP BY p.usuario.id, p.usuario.nombre
            ORDER BY SUM(p.precio) DESC
            """)
    List<UsuarioGastoResponse> usuariosConMasGasto(LocalDateTime desde, LocalDateTime hasta, Pageable pageable);
}
