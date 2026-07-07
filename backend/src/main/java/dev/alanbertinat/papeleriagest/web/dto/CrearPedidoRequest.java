package dev.alanbertinat.papeleriagest.web.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.time.LocalDate;
import java.util.List;

public record CrearPedidoRequest(
        LocalDate fechaEntrega,
        String horaEntrega,
        boolean esEnvio,
        String direccion,
        String descripcion,
        @NotEmpty @Valid List<PedidoItemRequest> items) {
}
