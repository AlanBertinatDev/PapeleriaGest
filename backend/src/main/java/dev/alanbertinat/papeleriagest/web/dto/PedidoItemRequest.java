package dev.alanbertinat.papeleriagest.web.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record PedidoItemRequest(@NotNull Long productoId, @Positive int cantidad) {
}
