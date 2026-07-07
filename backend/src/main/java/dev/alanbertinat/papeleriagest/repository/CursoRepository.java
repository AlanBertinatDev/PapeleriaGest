package dev.alanbertinat.papeleriagest.repository;

import dev.alanbertinat.papeleriagest.domain.Curso;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CursoRepository extends JpaRepository<Curso, Long> {
}
