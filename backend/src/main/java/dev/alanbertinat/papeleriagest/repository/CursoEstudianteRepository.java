package dev.alanbertinat.papeleriagest.repository;

import dev.alanbertinat.papeleriagest.domain.CursoEstudiante;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CursoEstudianteRepository extends JpaRepository<CursoEstudiante, Long> {

    boolean existsByCursoIdAndEstudianteId(Long cursoId, Long estudianteId);

    List<CursoEstudiante> findByCursoId(Long cursoId);

    Optional<CursoEstudiante> findByEstudianteId(Long estudianteId);
}
