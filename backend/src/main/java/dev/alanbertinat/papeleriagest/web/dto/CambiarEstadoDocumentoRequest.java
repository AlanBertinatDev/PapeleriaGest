package dev.alanbertinat.papeleriagest.web.dto;

import dev.alanbertinat.papeleriagest.domain.EstadoDocumento;
import jakarta.validation.constraints.NotNull;

public record CambiarEstadoDocumentoRequest(@NotNull EstadoDocumento estado) {
}
