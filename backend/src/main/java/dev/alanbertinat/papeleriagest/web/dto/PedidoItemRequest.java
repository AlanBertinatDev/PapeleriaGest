package dev.alanbertinat.papeleriagest.web.dto;

import jakarta.validation.constraints.Positive;

public record PedidoItemRequest(Long productoId, Long ofertaId, @Positive int cantidad) {
}
