package dev.alanbertinat.papeleriagest.repository;

import dev.alanbertinat.papeleriagest.domain.FotoHome;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FotoHomeRepository extends JpaRepository<FotoHome, Long> {

    List<FotoHome> findAllByOrderByFechaCargaDesc();
}
