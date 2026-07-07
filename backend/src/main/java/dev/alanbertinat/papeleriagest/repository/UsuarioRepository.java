package dev.alanbertinat.papeleriagest.repository;

import dev.alanbertinat.papeleriagest.domain.Usuario;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmailAndActivoTrue(String email);

    boolean existsByEmail(String email);

    boolean existsByCedula(String cedula);

    long countByNivel_AdminTrueAndActivoTrue();

    @Query("SELECT u.email FROM Usuario u WHERE u.nivel.estandar = true AND u.activo = true")
    List<String> emailsClientesEstandarActivos();

    @Query("""
            SELECT DISTINCT u.email FROM Usuario u
            WHERE u.nivel.estandar = true AND u.activo = true
            AND u.id IN (
                SELECT i.pedido.usuario.id FROM PedidoItem i
                WHERE i.producto.categoria.id IN :categoriaIds
                  AND i.pedido.estado <> dev.alanbertinat.papeleriagest.domain.EstadoPedido.CANCELADO
            )
            """)
    List<String> emailsClientesQueCompraronCategoria(@Param("categoriaIds") Set<Long> categoriaIds);
}
