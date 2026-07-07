package dev.alanbertinat.papeleriagest.web.dto;

import dev.alanbertinat.papeleriagest.domain.EstadoPedido;
import jakarta.validation.constraints.NotNull;

public record CambiarEstadoPedidoRequest(@NotNull EstadoPedido estado) {
}
