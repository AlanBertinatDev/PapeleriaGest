package dev.alanbertinat.papeleriagest.repository;

import dev.alanbertinat.papeleriagest.domain.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    List<Notificacion> findByOrderByFechaDesc(Pageable pageable);

    List<Notificacion> findByLeidaFalseOrderByFechaDesc();

    long countByLeidaFalse();
}
