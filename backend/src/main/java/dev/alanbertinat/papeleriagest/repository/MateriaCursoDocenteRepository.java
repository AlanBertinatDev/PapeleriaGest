package dev.alanbertinat.papeleriagest.repository;

import dev.alanbertinat.papeleriagest.domain.MateriaCursoDocente;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MateriaCursoDocenteRepository extends JpaRepository<MateriaCursoDocente, Long> {

    boolean existsByCursoIdAndDocenteIdAndMateria(Long cursoId, Long docenteId, String materia);

    List<MateriaCursoDocente> findByDocenteId(Long docenteId);

    List<MateriaCursoDocente> findByCursoId(Long cursoId);
}
