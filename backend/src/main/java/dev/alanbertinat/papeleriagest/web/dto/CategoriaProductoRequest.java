package dev.alanbertinat.papeleriagest.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

public record CategoriaProductoRequest(@NotBlank String nombre, @PositiveOrZero int porcentaje) {
}
