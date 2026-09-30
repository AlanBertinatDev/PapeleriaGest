package dev.alanbertinat.papeleriagest.web.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record CrearPedidoRequest(
        LocalDate fechaEntrega,
        String horaEntrega,
        boolean esEnvio,
        String direccion,
        String descripcion,
        @NotNull @Valid List<PedidoItemRequest> items) {
}
