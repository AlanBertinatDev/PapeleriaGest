package dev.alanbertinat.papeleriagest.repository;

import dev.alanbertinat.papeleriagest.domain.Producto;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    List<Producto> findByActivoTrueOrderByCodigoProducto();

    List<Producto> findByActivoFalseOrderByCodigoProducto();

    List<Producto> findByActivoTrueAndCategoriaIdOrderByCodigoProducto(Long categoriaId);

    @Query("SELECT p FROM Producto p WHERE p.activo = true AND p.cantidad <= p.stockMinimo ORDER BY p.codigoProducto")
    List<Producto> findConStockBajo();
}
