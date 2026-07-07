package dev.alanbertinat.papeleriagest.repository;

import dev.alanbertinat.papeleriagest.domain.CategoriaProducto;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaProductoRepository extends JpaRepository<CategoriaProducto, Long> {

    List<CategoriaProducto> findByActivoTrue();
}
