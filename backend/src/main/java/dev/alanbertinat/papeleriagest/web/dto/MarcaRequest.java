package dev.alanbertinat.papeleriagest.web.dto;

import jakarta.validation.constraints.NotBlank;

public record MarcaRequest(@NotBlank String nombre) {
}
