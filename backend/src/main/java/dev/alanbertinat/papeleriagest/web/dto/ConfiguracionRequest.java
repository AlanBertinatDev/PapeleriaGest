package dev.alanbertinat.papeleriagest.web.dto;

import jakarta.validation.constraints.NotBlank;

public record ConfiguracionRequest(@NotBlank String nombre, String valor) {
}
