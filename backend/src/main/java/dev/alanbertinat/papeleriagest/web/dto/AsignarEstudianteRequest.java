package dev.alanbertinat.papeleriagest.web.dto;

import jakarta.validation.constraints.NotNull;

public record AsignarEstudianteRequest(@NotNull Long estudianteId) {
}
