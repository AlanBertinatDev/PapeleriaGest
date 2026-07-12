package dev.alanbertinat.papeleriagest.web.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record ActualizarItemsPedidoRequest(@NotEmpty @Valid List<PedidoItemRequest> items) {
}
