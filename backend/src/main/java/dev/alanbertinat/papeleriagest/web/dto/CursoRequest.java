package dev.alanbertinat.papeleriagest.web.dto;

import jakarta.validation.constraints.NotBlank;

public record CursoRequest(@NotBlank String grado, @NotBlank String grupo) {
}
