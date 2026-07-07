package dev.alanbertinat.papeleriagest.repository;

import dev.alanbertinat.papeleriagest.domain.Nivel;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NivelRepository extends JpaRepository<Nivel, Long> {

    Optional<Nivel> findByEstandarTrueAndActivoTrue();
}
