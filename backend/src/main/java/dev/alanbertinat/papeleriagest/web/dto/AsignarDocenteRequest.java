package dev.alanbertinat.papeleriagest.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AsignarDocenteRequest(@NotNull Long docenteId, @NotBlank String materia) {
}
