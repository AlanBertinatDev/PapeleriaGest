package dev.alanbertinat.papeleriagest.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CursoRequest(
        @NotBlank @Pattern(regexp = "[1-6]", message = "El grado debe ser un número del 1 al 6") String grado,
        @NotBlank String grupo) {
}
