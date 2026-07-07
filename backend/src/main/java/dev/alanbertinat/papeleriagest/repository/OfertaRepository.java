package dev.alanbertinat.papeleriagest.repository;

import dev.alanbertinat.papeleriagest.domain.Oferta;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OfertaRepository extends JpaRepository<Oferta, Long> {

    List<Oferta> findByActivoTrueOrderByFechaDesdeDesc();

    List<Oferta> findByActivoTrueAndFechaDesdeLessThanEqualAndFechaHastaGreaterThanEqualOrderByFechaDesdeDesc(
            LocalDate hoyDesde, LocalDate hoyHasta);
}
