package dev.alanbertinat.papeleriagest.repository;

import dev.alanbertinat.papeleriagest.domain.Documento;
import dev.alanbertinat.papeleriagest.web.dto.UsuarioConteoResponse;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface DocumentoRepository extends JpaRepository<Documento, Long> {

    List<Documento> findByActivoTrueOrderByFechaIngresoDesc();

    List<Documento> findByActivoTrueAndUsuarioIdOrderByFechaIngresoDesc(Long usuarioId);

    List<Documento> findByActivoTrueAndCursoIdOrderByFechaIngresoDesc(Long cursoId);

    long countByActivoTrueAndEstado(dev.alanbertinat.papeleriagest.domain.EstadoDocumento estado);

    long countByFechaIngresoBetween(LocalDate desde, LocalDate hasta);

    @Query("""
            SELECT new dev.alanbertinat.papeleriagest.web.dto.UsuarioConteoResponse(
                d.usuario.id, d.usuario.nombre, COUNT(d))
            FROM Documento d
            WHERE d.fechaIngreso BETWEEN :desde AND :hasta
            GROUP BY d.usuario.id, d.usuario.nombre
            ORDER BY COUNT(d) DESC
            """)
    List<UsuarioConteoResponse> usuariosConMasDocumentos(LocalDate desde, LocalDate hasta, Pageable pageable);
}
