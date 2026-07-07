package dev.alanbertinat.papeleriagest.web.dto;

import dev.alanbertinat.papeleriagest.domain.AudienciaNotificacion;
import dev.alanbertinat.papeleriagest.domain.TipoOferta;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record OfertaRequest(
        @NotBlank String titulo,
        String descripcion,
        @NotNull @PositiveOrZero BigDecimal precio,
        @NotNull LocalDate fechaDesde,
        @NotNull LocalDate fechaHasta,
        @NotNull TipoOferta tipo,
        @NotNull List<Long> productoIds,
        boolean notificarPorCorreo,
        AudienciaNotificacion audienciaNotificacion) {
}
