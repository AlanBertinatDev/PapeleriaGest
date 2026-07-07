package dev.alanbertinat.papeleriagest.web.dto;

import jakarta.validation.constraints.NotNull;

public record CambiarNivelRequest(@NotNull Long nivelId) {
}
